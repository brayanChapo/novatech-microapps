# Plan de Pruebas — App 01: Agenda de Citas + Recordatorios WhatsApp
## NovaTech MicroApps · Fase 6

**Versión:** 1.0 · **Fecha:** 29 de octubre de 2026
**Autor:** Analista de Negocio — NovaTech Consulting
**Estado:** Listo para ejecución
**Trazado desde:** `02-srst.md` (45 casos de prueba de referencia: CP-01 a CP-45)

---

## 1. Alcance

### 1.1 Qué se prueba

| Area | Detalle |
|---|---|
| **API REST — rutas públicas** | GET /salud, GET /profesionales, GET /servicios, GET /reservas/slots, POST /reservas |
| **API REST — rutas autenticadas** | /citas, /pacientes, /profesionales (CRUD), /servicios (CRUD), /disponibilidad, /bloqueos, /reportes, /configuracion, PATCH /marcaciones-asistencia, GET /cron/recordatorios |
| **Frontend Next.js (PWA)** | Página pública /reservar?empresa=..., flujo completo de reserva en 4 pasos, visualización de hora en zona Lima |
| **Lógica de dominio** | Cálculo de slots disponibles, no solapamiento de citas, ventana de recordatorio (24h / 2h / sin recordatorio), procesamiento de respuestas webhook |
| **Base de datos** | Aislamiento RLS multi-tenant, restricciones de integridad, transacciones concurrentes |
| **Integración WhatsApp** | Envío de plantillas de confirmación y recordatorio, validación de firma HMAC-SHA256 del webhook |
| **Cron de recordatorios** | Lógica de selección de citas, deduplicación, rendimiento con 50 citas |
| **Seguridad** | Autenticación JWT, autorización por rol, rate limiting, SQL injection, XSS, exposición de variables de entorno |
| **Performance** | Tiempos de respuesta bajo carga, concurrencia en el mismo slot, carga Lighthouse de la página pública |

### 1.2 Exclusiones

| Excluido | Justificación |
|---|---|
| Pagos en línea | Fuera del alcance del MVP (SRST §1.3) |
| Historia clínica y datos de salud | Pertenece a la App 14 |
| App móvil nativa | El panel web es responsive — no hay app nativa en el MVP |
| Integración con Google Calendar / Outlook | Fuera del alcance del MVP |
| Recordatorios por SMS o correo al paciente | Fuera del alcance del MVP |
| Encuestas de satisfacción post-cita | Fuera del alcance del MVP |
| Multiidioma | Solo español en el MVP |
| Pruebas de la WhatsApp Business API de Meta | Se prueba la integración del lado de NovaTech; la infraestructura de Meta no es responsabilidad del equipo |

### 1.3 Tipos de prueba incluidos

| Tipo | Herramienta | Capa |
|---|---|---|
| Unitarias de dominio | Vitest | `src/domain/`, `src/services/` |
| Integración de API | Vitest + `app.request` (Hono test client) | Backend |
| E2E (flujo de reserva pública) | Ejecución manual con curl + browser | Frontend + Backend |
| Seguridad | curl, pgTAP, inspección de build | API + DB + Frontend |
| Performance / carga | k6, Lighthouse | API + Frontend |
| Aislamiento de base de datos (RLS) | pgTAP (`database/tests/rls_agenda.test.sql`) | Base de datos |

---

## 2. Casos de Prueba Funcionales

### 2.1 RF-01 — Reserva pública (POST /reservas)

| ID | Tipo | Descripcion | Precondiciones | Pasos | Datos de entrada | Esperado | Real | Estado |
|---|---|---|---|---|---|---|---|---|
| PT-F-01 | Happy Path | Reserva exitosa con todos los datos validos | Slot disponible el 2026-11-09T15:00:00Z para profesional_id=a1a1... y servicio_id=c3c3... | 1. POST /reservas con todos los campos validos | empresa_id: 11111111..., profesional_id: a1a1..., servicio_id: c3c3..., inicio: "2026-11-09T15:00:00Z", nombre_paciente: "Maria Torres", telefono_paciente: "999888777" | HTTP 201. Cita creada en tabla `citas` con estado `pendiente`. Registro en `mensajes_whatsapp` con plantilla `confirmacion_cita`. | | Pendiente |
| PT-F-02 | Negativo | Slot ya ocupado — conflicto de concurrencia | Cita existente para el mismo profesional y horario con estado `pendiente` | 1. POST /reservas con el mismo slot ya reservado | Mismo inicio, mismos profesional_id y empresa_id | HTTP 409. Body: `{"error":{"codigo":"SLOT_NO_DISPONIBLE","mensaje":"Lo sentimos, ese horario acaba de ser tomado. Por favor elige otro."}}`. No se crea nueva cita. | | Pendiente |
| PT-F-03 | Negativo | Nombre del paciente vacio | Ninguna | 1. POST /reservas con nombre_paciente: "" | nombre_paciente: "", telefono: "999888777", resto valido | HTTP 400. Codigo: `VALIDACION`. Mensaje indica que el nombre es requerido. No se crea cita. | | Pendiente |
| PT-F-04 | Negativo | Telefono con formato invalido — menos de 9 digitos | Ninguna | 1. POST /reservas con telefono_paciente: "12345" | nombre_paciente: "Ana Lopez", telefono_paciente: "12345" | HTTP 400. Mensaje indicando formato de telefono invalido. No se crea cita. | | Pendiente |
| PT-F-05 | Negativo | Telefono con letras | Ninguna | 1. POST /reservas con telefono_paciente: "abc12345" | telefono_paciente: "abc12345" | HTTP 400. Validacion de formato rechaza el envio antes del procesamiento. | | Pendiente |
| PT-F-06 | Rate limit | Mas de 5 reservas por IP en 10 minutos | La misma IP ha realizado 5 solicitudes POST /reservas en los ultimos 10 minutos | 1. Enviar la sexta solicitud POST /reservas desde la misma IP | Sexta solicitud identica a las anteriores | HTTP 429. Codigo: `LIMITE_SOLICITUDES`. Mensaje: "Has realizado demasiadas solicitudes. Intenta de nuevo en unos minutos." | | Pendiente |
| PT-F-07 | Rate limit | Mas de 3 reservas por telefono en el dia | El numero "999888777" ya realizo 3 reservas hoy | 1. Enviar cuarta solicitud con telefono: "999888777" | telefono_paciente: "999888777" | HTTP 429. Codigo: `LIMITE_RESERVAS_TELEFONO`. No se crea la cuarta cita. | | Pendiente |

### 2.2 RF-02 — Consulta de slots disponibles (GET /reservas/slots)

| ID | Tipo | Descripcion | Precondiciones | Pasos | Datos de entrada | Esperado | Real | Estado |
|---|---|---|---|---|---|---|---|---|
| PT-F-08 | Happy Path | Slots disponibles para fecha laboral | Profesional con disponibilidad configurada lunes 09:00–13:00, servicio de 30 min. Sin citas el 2026-11-09. | 1. GET /reservas/slots con empresa_id, profesional_id, servicio_id y fecha | empresa_id: 11111111..., profesional_id: a1a1..., servicio_id: c3c3..., fecha: 2026-11-09 | HTTP 200. Array de slots en horario 09:00–13:00 espaciados cada 30 min. Al menos los slots 09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30. | | Pendiente |
| PT-F-09 | Borde | Fin de semana sin disponibilidad configurada | Profesional sin disponibilidad para sabado | 1. GET /reservas/slots con fecha sabado 2026-11-08 | fecha: 2026-11-08 (sabado) | HTTP 200. Array vacio `[]`. No se devuelven slots para dia sin disponibilidad. | | Pendiente |
| PT-F-10 | Negativo | Fecha pasada | Ninguna | 1. GET /reservas/slots con fecha 2026-10-01 (fecha en el pasado) | fecha: 2026-10-01 | HTTP 400 o array vacio. El sistema no ofrece slots en fechas ya vencidas. | | Pendiente |
| PT-F-11 | Borde | Slot dentro de bloqueo activo no aparece | Bloqueo activo para el profesional el 2026-11-10 | 1. GET /reservas/slots con fecha 2026-11-10 | fecha: 2026-11-10, profesional_id: a1a1... | HTTP 200. Array vacio o sin ningun slot que caiga dentro del bloqueo. | | Pendiente |
| PT-F-12 | Negativo | Falta empresa_id en la query | Ninguna | 1. GET /reservas/slots sin parametro empresa_id | Sin empresa_id en la URL | HTTP 400. Mensaje indicando parametro requerido faltante. | | Pendiente |

### 2.3 RF-03 — Recordatorio por WhatsApp (cron GET /cron/recordatorios)

| ID | Tipo | Descripcion | Precondiciones | Pasos | Datos de entrada | Esperado | Real | Estado |
|---|---|---|---|---|---|---|---|---|
| PT-F-13 | Happy Path | Recordatorio 24h antes — cita creada con mas de 24h de anticipacion | Cita para 2026-11-09T15:00:00Z creada el 2026-11-07T15:00:00Z. `recordatorio_enviado=false`. | 1. GET /cron/recordatorios ejecutado el 2026-11-08T15:30:00Z | Ejecucion del endpoint de cron | HTTP 200. Plantilla `recordatorio_cita` enviada. `recordatorio_enviado=true` en la cita. Registro en `mensajes_whatsapp` con estado `enviado`. | | Pendiente |
| PT-F-14 | Borde | Recordatorio 2h antes — cita creada con menos de 24h de anticipacion | Cita creada el 2026-11-09T12:00:00Z para el 2026-11-09T20:00:00Z. `recordatorio_enviado=false`. | 1. GET /cron/recordatorios ejecutado el 2026-11-09T17:30:00Z | Ejecucion del endpoint de cron | HTTP 200. Recordatorio enviado con ventana de 2 horas. `recordatorio_enviado=true`. | | Pendiente |
| PT-F-15 | Borde | Sin recordatorio — cita en menos de 2h | Cita para 2026-11-09T16:00:00Z creada el 2026-11-09T15:30:00Z (30 min antes). | 1. GET /cron/recordatorios ejecutado el 2026-11-09T15:45:00Z | Ejecucion del endpoint de cron | No se envia recordatorio. Segun RN-02, si quedan menos de 2 horas, no se envia recordatorio. | | Pendiente |
| PT-F-16 | Borde | Sin recordatorio duplicado | Cita con `recordatorio_enviado=true` | 1. GET /cron/recordatorios ejecutado dos veces | Segunda ejecucion del cron dentro del mismo ciclo | La cita ya procesada no recibe un segundo recordatorio. La tabla `mensajes_whatsapp` tiene un solo registro de recordatorio para esa cita. | | Pendiente |
| PT-F-17 | Borde | Cita cancelada no recibe recordatorio | Cita con `estado=cancelada` y `recordatorio_enviado=false` | 1. GET /cron/recordatorios ejecutado | Ejecucion del cron con cita cancelada en ventana | La cita cancelada no es procesada. No se crea registro en `mensajes_whatsapp` para esa cita. | | Pendiente |

### 2.4 RF-04 — Panel autenticado: login, citas, cambio de estado

| ID | Tipo | Descripcion | Precondiciones | Pasos | Datos de entrada | Esperado | Real | Estado |
|---|---|---|---|---|---|---|---|---|
| PT-F-18 | Happy Path | Login de admin y acceso al panel | Usuario admin registrado en Supabase Auth para empresa 11111111... | 1. POST /auth/login (Supabase Auth) con credenciales validas. 2. Usar JWT para GET /citas | email: admin@clinica-demo.com, password: valido | HTTP 200 en login. JWT retornado. GET /citas retorna la lista de citas de la empresa. | | Pendiente |
| PT-F-19 | Happy Path | Listado de citas filtrado por empresa | Admin de empresa 11111111... autenticado | 1. GET /citas con JWT valido | Authorization: Bearer <JWT admin empresa 11111111...> | HTTP 200. Lista de citas que pertenecen exclusivamente a empresa_id 11111111.... No aparecen citas de otras empresas. | | Pendiente |
| PT-F-20 | Happy Path | Cambio de estado de cita — recepcionista reprograma | Cita con estado `solicitud_reprogramacion`. Slot nuevo disponible: 2026-11-10T16:00:00Z. | 1. PATCH /citas/{id} con nuevo inicio | inicio: "2026-11-10T16:00:00Z", JWT de rol `recepcion` | HTTP 200. Estado de la cita cambia a `pendiente` con el nuevo horario. Slot anterior liberado. | | Pendiente |
| PT-F-21 | Happy Path | Marcar asistencia — paciente asistio | Cita confirmada cuya hora de inicio ya paso. Usuario con rol `profesional`. | 1. PATCH /marcaciones-asistencia con cita_id y estado `asistio` | cita_id: UUID, estado: "asistio", JWT de profesional | HTTP 200. Estado de la cita = `asistio`. Visible en reporte mensual. | | Pendiente |
| PT-F-22 | Negativo | Marcar asistencia antes de la hora de la cita | Cita para las 10:00. Hora actual: 09:30. | 1. PATCH /marcaciones-asistencia con cita futura | cita_id: UUID, estado: "asistio", hora actual < hora de la cita | HTTP 400. Codigo: `CITA_NO_INICIADA`. Mensaje: "No puedes marcar asistencia antes de la hora de la cita." Estado no cambia. | | Pendiente |
| PT-F-23 | Negativo | Marcar asistencia en cita cancelada | Cita con estado `cancelada` | 1. PATCH /marcaciones-asistencia con cita cancelada | estado: "asistio", cita con estado `cancelada` | HTTP 400. Mensaje: "No se puede marcar asistencia en una cita cancelada." Estado permanece `cancelada`. | | Pendiente |

### 2.5 RF-05 — Multi-tenancy: empresa A no ve datos de empresa B

| ID | Tipo | Descripcion | Precondiciones | Pasos | Datos de entrada | Esperado | Real | Estado |
|---|---|---|---|---|---|---|---|---|
| PT-F-24 | Seguridad — Aislamiento | Admin de empresa A no ve citas de empresa B via API | Empresa A (11111111...) y empresa B (22222222...) tienen citas activas. Admin de empresa A autenticado. | 1. GET /citas con JWT de empresa A intentando forzar empresa_id de empresa B | GET /citas?empresa_id=22222222... con JWT de empresa A | HTTP 200 con lista vacia O HTTP 403. Bajo ningun escenario se devuelven citas de empresa B. | | Pendiente |
| PT-F-25 | Seguridad — Aislamiento | Admin de empresa A no ve pacientes de empresa B via API | Empresa A y B tienen pacientes registrados. Admin de empresa A autenticado. | 1. GET /pacientes con JWT de empresa A | JWT de empresa A en Authorization | HTTP 200 con solo los pacientes de empresa A. 0 registros de empresa B en la respuesta. | | Pendiente |
| PT-F-26 | Seguridad — Aislamiento | Servicios de empresa A no son visibles para empresa B en pagina publica | Empresa A tiene servicio "Consulta General". Empresa B hace GET /servicios. | 1. GET /servicios?empresa_id=11111111... sin autenticacion | empresa_id: 11111111... | HTTP 200. Solo devuelve servicios de empresa 11111111.... No devuelve servicios de otras empresas. | | Pendiente |
| PT-F-27 | Seguridad — Aislamiento | Reporte mensual solo contiene datos de la empresa del admin autenticado | Empresa A tiene 5 citas en noviembre. Empresa B tiene 10 citas. Admin de empresa A autenticado. | 1. GET /reportes/asistencia?mes=2026-11 con JWT de empresa A | JWT de empresa A | HTTP 200. Reporte contiene exactamente 5 citas. No aparecen las 10 citas de empresa B. Total en el reporte = 5, no 15. | | Pendiente |

---

## 3. Casos de Prueba de Seguridad

| ID | Tipo | Descripcion | Pasos | Datos | Esperado | Real | Estado |
|---|---|---|---|---|---|---|---|
| PT-S-01 | Autenticacion | Acceso sin JWT a ruta autenticada | 1. GET /citas sin header Authorization | Sin header Authorization | HTTP 401. Body con mensaje de autenticacion requerida. No se devuelven datos. | | Pendiente |
| PT-S-02 | Autenticacion | JWT invalido en ruta autenticada | 1. GET /citas con JWT malformado | Authorization: Bearer "eyJinvalido.token.falso" | HTTP 401. No se devuelven datos. | | Pendiente |
| PT-S-03 | Autenticacion | JWT expirado en ruta autenticada | 1. GET /citas con JWT con fecha de expiracion en el pasado | JWT valido pero expirado (generado hace mas de 1 hora) | HTTP 401. Codigo: `TOKEN_EXPIRADO`. Mensaje: "Tu sesion ha expirado. Vuelve a iniciar sesion." | | Pendiente |
| PT-S-04 | Autorizacion | Usuario de empresa A intenta acceder a datos de empresa B | 1. GET /citas?empresa_id=empresa-b-uuid con JWT de empresa A. 2. POST /pacientes con empresa_id de empresa B en el body | JWT de empresa A, empresa_id de empresa B en la solicitud | HTTP 403 o respuesta vacia. Bajo ningun escenario se devuelven o modifican datos de empresa B. | | Pendiente |
| PT-S-05 | Autorizacion | Profesional intenta ejecutar acciones de admin | 1. POST /servicios con JWT de rol `profesional`. 2. POST /bloqueos con JWT de rol `profesional`. 3. GET /reportes/asistencia con JWT de rol `profesional`. | JWT con rol `profesional` para los tres endpoints | HTTP 403 en los tres casos. Ningun recurso es creado o retornado. | | Pendiente |
| PT-S-06 | Autorizacion | Profesional intenta ver agenda de otro profesional | 1. GET /citas?profesional_id=UUID_OTRO con JWT del Dr. Mendoza (profesional distinto) | JWT de Dr. Mendoza (a1a1...), profesional_id de otro profesional en la query | HTTP 403. Mensaje: "No tienes permiso para ver la agenda de otro profesional." No se devuelven citas ajenas. | | Pendiente |
| PT-S-07 | Rate limiting | Mas de 5 reservas por IP en 10 minutos | 1. Enviar 6 solicitudes POST /reservas desde la misma IP en menos de 10 minutos | 6 solicitudes identicas desde la misma IP | Solicitudes 1–5: HTTP 201 (si hay slots). Solicitud 6: HTTP 429. Codigo `LIMITE_SOLICITUDES`. | | Pendiente |
| PT-S-08 | Inyeccion SQL | SQL injection en parametro empresa_id de query | 1. GET /profesionales?empresa_id=11111111-1111-4111-8111-111111111111' OR '1'='1 | empresa_id con payload de inyeccion SQL en la URL | HTTP 400 o HTTP 200 con datos solo de la empresa solicitada. Bajo ningun escenario devuelve datos de todas las empresas. Sin error 500 que exponga informacion interna. | | Pendiente |
| PT-S-09 | Inyeccion SQL | SQL injection en nombre_paciente del POST /reservas | 1. POST /reservas con nombre_paciente conteniendo payload SQL | nombre_paciente: "'; DROP TABLE citas; --", resto de campos validos | HTTP 201 (nombre se guarda como texto literal) o HTTP 400 por validacion. La tabla `citas` permanece intacta. Zod sanitiza la entrada antes de llegar a la DB. | | Pendiente |
| PT-S-10 | XSS | Datos maliciosos en nombre_paciente — script injection | 1. POST /reservas con nombre_paciente conteniendo script. 2. GET /citas desde el panel y verificar que el nombre se renderiza sin ejecutar el script. | nombre_paciente: "<script>alert('xss')</script>", telefono: "999888777" | El nombre se almacena como texto literal. El panel lo muestra como texto escapado. No se ejecuta ningun script en el navegador. | | Pendiente |
| PT-S-11 | Webhook — HMAC | Webhook sin header X-Hub-Signature-256 | 1. POST /webhooks/whatsapp sin el header de firma | Sin header X-Hub-Signature-256 en el request | HTTP 401. No se procesa el webhook ni se modifica ningun estado en la BD. | | Pendiente |
| PT-S-12 | Webhook — HMAC | Webhook con firma HMAC incorrecta | 1. POST /webhooks/whatsapp con firma de un secret diferente | Header X-Hub-Signature-256 con valor calculado con un secret incorrecto | HTTP 401. No se procesa el webhook ni se modifica ningun estado en la BD. | | Pendiente |
| PT-S-13 | Webhook — HMAC | Webhook con body modificado despues de firmar | 1. Firmar el body original. 2. Modificar el body antes de enviar. 3. Enviar con la firma del body original. | Body modificado post-firma, firma del body original | HTTP 401. La firma ya no corresponde al body. No se procesa el webhook. | | Pendiente |
| PT-S-14 | Exposicion de variables | SERVICE_ROLE_KEY no aparece en el build de produccion del frontend | 1. npm run build en el directorio frontend. 2. grep -rn "service_role" .next/static/ | Build del frontend en modo produccion | El grep no devuelve ningun resultado con el valor real de la key. Las keys sensibles solo existen en las variables de entorno del servidor, no en el bundle. | | Pendiente |
| PT-S-15 | Aislamiento RLS | Suite pgTAP de aislamiento multi-tenant | 1. npm run db:test desde el directorio database/ | Suite `database/tests/rls_agenda.test.sql` — SELECT, INSERT, UPDATE, DELETE en tablas citas, pacientes, profesionales, servicios, disponibilidad, mensajes_whatsapp simulando empresa A accediendo a datos de empresa B | 0 pruebas pgTAP fallando. 100% de los casos de aislamiento en verde. | | Pendiente |

---

## 4. Casos de Prueba de Performance

| ID | Tipo | Descripcion | Pasos | Datos | Esperado | Real | Estado |
|---|---|---|---|---|---|---|---|
| PT-P-01 | Carga — slots | GET /reservas/slots < 200ms en condicion normal | 1. k6: 50 VUs durante 60 segundos contra GET /reservas/slots | empresa_id: 11111111..., profesional_id: a1a1..., servicio_id: c3c3..., fecha: 2026-11-09 | p95 < 200 ms. Sin errores 5xx. | | Pendiente |
| PT-P-02 | Carga — reserva | POST /reservas < 500ms incluyendo escritura en DB | 1. k6: 20 VUs durante 60 segundos con slots distintos (sin conflicto de concurrencia) | 20 reservas en slots diferentes del mismo dia | p95 < 500 ms. Las 20 citas creadas en BD. Sin duplicados. | | Pendiente |
| PT-P-03 | Carga sostenida | API responde con p95 < 1s bajo 50 usuarios concurrentes durante 1 minuto | 1. k6 con 50 VUs, 60 segundos. Endpoints: GET /reservas/slots, POST /reservas, GET /citas. | Mix de los tres endpoints | p95 < 1000 ms. p99 < 2000 ms. Tasa de errores < 1%. | | Pendiente |
| PT-P-04 | Concurrencia | 2 usuarios intentando reservar el mismo slot — solo 1 debe tener exito | 1. Lanzar 2 (o 10) solicitudes simultaneas de POST /reservas al mismo slot con Promises paralelas o k6. | profesional_id: a1a1..., inicio: "2026-11-09T15:00:00Z" (mismo slot para todos) | Exactamente 1 HTTP 201. Las demas (1 o 9) reciben HTTP 409. Tabla `citas` tiene exactamente 1 cita para ese slot. Sin duplicados. | | Pendiente |
| PT-P-05 | Cron masivo | Cron de recordatorios procesa 50 citas en < 30 segundos | 1. Insertar 50 citas con `recordatorio_enviado=false` en ventana de 24h. Mockear API de WhatsApp. 2. GET /cron/recordatorios. Medir tiempo total. | 50 citas en ventana, API WA mockeada con respuesta en 200 ms | Tiempo total del cron < 30 segundos. 50 registros en `mensajes_whatsapp` con estado `enviado`. 50 citas con `recordatorio_enviado=true`. | | Pendiente |
| PT-P-06 | Lighthouse mobile | Pagina publica /reservar carga en < 2s en 4G | 1. Ejecutar Lighthouse en http://localhost:3001/reservar?empresa=11111111... con perfil mobile y throttling 4G lento. | URL publica de la empresa demo en localhost:3001 | First Contentful Paint < 2 s. Time to Interactive < 3 s. Performance Score >= 70. | | Pendiente |

---

## 5. Comandos de Prueba Listos para Ejecutar

### 5.1 Endpoint de salud (sin autenticacion)

```bash
curl -s http://localhost:4001/salud | jq .
# Esperado: {"status":"ok"} con HTTP 200
```

### 5.2 Listar profesionales de la empresa demo

```bash
curl -s "http://localhost:4001/profesionales?empresa_id=11111111-1111-4111-8111-111111111111" | jq .
# Esperado: array con Dr. Carlos Mendoza activo
```

### 5.3 Listar servicios de la empresa demo

```bash
curl -s "http://localhost:4001/servicios?empresa_id=11111111-1111-4111-8111-111111111111" | jq .
# Esperado: array con "Consulta General" de 30 min
```

### 5.4 Consultar slots disponibles

```bash
curl -s "http://localhost:4001/reservas/slots?empresa_id=11111111-1111-4111-8111-111111111111&profesional_id=a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1&servicio_id=c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3&fecha=2026-11-09" | jq .
# Esperado: array de slots disponibles en el horario configurado para el lunes
```

### 5.5 Crear una reserva exitosa (happy path)

```bash
curl -s -X POST http://localhost:4001/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": "11111111-1111-4111-8111-111111111111",
    "profesional_id": "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1",
    "servicio_id": "c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3",
    "inicio": "2026-11-09T15:00:00Z",
    "nombre_paciente": "Maria Torres",
    "telefono_paciente": "999888777"
  }' | jq .
# Esperado: HTTP 201, cita creada con estado pendiente
```

### 5.6 Intentar reservar el mismo slot (conflicto — debe dar 409)

```bash
# Ejecutar inmediatamente despues del 5.5 (slot ya tomado)
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4001/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": "11111111-1111-4111-8111-111111111111",
    "profesional_id": "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1",
    "servicio_id": "c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3",
    "inicio": "2026-11-09T15:00:00Z",
    "nombre_paciente": "Juan Perez",
    "telefono_paciente": "988777666"
  }'
# Esperado: 409
```

### 5.7 Reserva con telefono invalido (debe dar 400)

```bash
curl -s -X POST http://localhost:4001/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": "11111111-1111-4111-8111-111111111111",
    "profesional_id": "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1",
    "servicio_id": "c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3",
    "inicio": "2026-11-09T16:00:00Z",
    "nombre_paciente": "Test Invalido",
    "telefono_paciente": "12345"
  }' | jq .
# Esperado: HTTP 400, mensaje de validacion de telefono
```

### 5.8 Reserva con nombre vacio (debe dar 400)

```bash
curl -s -X POST http://localhost:4001/reservas \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": "11111111-1111-4111-8111-111111111111",
    "profesional_id": "a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1",
    "servicio_id": "c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3",
    "inicio": "2026-11-09T16:00:00Z",
    "nombre_paciente": "",
    "telefono_paciente": "999888777"
  }' | jq .
# Esperado: HTTP 400, nombre requerido
```

### 5.9 Acceso sin JWT a ruta autenticada (debe dar 401)

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4001/citas
# Esperado: 401
```

### 5.10 Acceso con JWT expirado (debe dar 401)

```bash
# Sustituir <JWT_EXPIRADO> por un token real expirado
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer <JWT_EXPIRADO>" \
  http://localhost:4001/citas
# Esperado: 401, codigo TOKEN_EXPIRADO
```

### 5.11 Obtener un JWT valido via Supabase Auth (login)

```bash
curl -s -X POST "http://localhost:54321/auth/v1/token?grant_type=password" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica-demo.com","password":"<PASSWORD>"}' | jq '.access_token'
# Guardar el token para los comandos siguientes como $JWT
```

### 5.12 Listar citas autenticadas como admin

```bash
curl -s -H "Authorization: Bearer $JWT" \
  "http://localhost:4001/citas" | jq .
# Esperado: lista de citas de empresa 11111111... solamente
```

### 5.13 Consultar slots en fin de semana (debe devolver array vacio)

```bash
curl -s "http://localhost:4001/reservas/slots?empresa_id=11111111-1111-4111-8111-111111111111&profesional_id=a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1&servicio_id=c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3&fecha=2026-11-08" | jq .
# Esperado: [] — sabado sin disponibilidad configurada
```

### 5.14 Ejecutar el cron de recordatorios

```bash
curl -s -X GET "http://localhost:4001/cron/recordatorios" | jq .
# Esperado: informe de cuantos recordatorios fueron procesados
```

### 5.15 Simular webhook de WhatsApp — respuesta "1" (confirmar) con firma valida

```bash
# El secret debe coincidir con WHATSAPP_WEBHOOK_SECRET del .env del backend
SECRET="<WHATSAPP_WEBHOOK_SECRET>"
BODY='{"entry":[{"changes":[{"value":{"messages":[{"from":"51999888777","type":"text","text":{"body":"1"}}]}}]}]}'
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print "sha256="$2}')

curl -s -X POST http://localhost:4001/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: $SIGNATURE" \
  -d "$BODY" | jq .
# Esperado: HTTP 200, estado de la cita cambia a confirmada
```

### 5.16 Simular webhook sin firma (debe dar 401)

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4001/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"entry":[]}'
# Esperado: 401
```

### 5.17 SQL injection en empresa_id (verificar que no hay data leak)

```bash
curl -s "http://localhost:4001/profesionales?empresa_id=11111111-1111-4111-8111-111111111111' OR '1'='1" | jq .
# Esperado: HTTP 400 (validacion Zod rechaza UUID invalido) o resultado solo de la empresa solicitada
```

### 5.18 Prueba de concurrencia — 2 requests al mismo slot en paralelo

```bash
# Ejecutar los dos comandos en paralelo con &
curl -s -X POST http://localhost:4001/reservas \
  -H "Content-Type: application/json" \
  -d '{"empresa_id":"11111111-1111-4111-8111-111111111111","profesional_id":"a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1","servicio_id":"c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3","inicio":"2026-11-09T17:00:00Z","nombre_paciente":"Usuario A","telefono_paciente":"999111222"}' &

curl -s -X POST http://localhost:4001/reservas \
  -H "Content-Type: application/json" \
  -d '{"empresa_id":"11111111-1111-4111-8111-111111111111","profesional_id":"a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1","servicio_id":"c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3","inicio":"2026-11-09T17:00:00Z","nombre_paciente":"Usuario B","telefono_paciente":"999333444"}' &

wait
# Esperado: exactamente 1 HTTP 201 y 1 HTTP 409. Verificar en la BD que hay solo 1 cita para ese slot.
```

### 5.19 Rate limit — 6 reservas en menos de 10 minutos (la sexta debe dar 429)

```bash
for i in {1..6}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4001/reservas \
    -H "Content-Type: application/json" \
    -d "{\"empresa_id\":\"11111111-1111-4111-8111-111111111111\",\"profesional_id\":\"a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1\",\"servicio_id\":\"c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3\",\"inicio\":\"2026-11-09T1${i}:00:00Z\",\"nombre_paciente\":\"Test $i\",\"telefono_paciente\":\"99988877$i\"}")
  echo "Solicitud $i: HTTP $STATUS"
done
# Esperado: solicitudes 1-5 con 201/409 (segun disponibilidad). Solicitud 6: 429.
```

### 5.20 Buscar claves sensibles en el build del frontend

```bash
cd "D:\modulo agentico\MicroApps\microapps\01-agenda-citas\frontend"
npm run build
grep -r "service_role" .next/static/ 2>/dev/null && echo "ALERTA: key expuesta" || echo "OK: no se encontro service_role en el bundle"
grep -r "WHATSAPP_TOKEN" .next/static/ 2>/dev/null && echo "ALERTA: token expuesto" || echo "OK: no se encontro WHATSAPP_TOKEN en el bundle"
```

### 5.21 Ejecutar suite de pruebas RLS con pgTAP

```bash
cd "D:\modulo agentico\MicroApps\microapps\01-agenda-citas"
npm run db:test
# Esperado: 0 pruebas fallando. Todas las pruebas de aislamiento en verde.
```

### 5.22 Ejecutar pruebas unitarias con Vitest

```bash
cd "D:\modulo agentico\MicroApps\microapps\01-agenda-citas\backend"
npm test
# Esperado: todos los tests en verde. Cobertura >= 80% en src/domain/ y src/services/
```

---

## 6. Criterios de Aceptacion

### 6.1 Umbrales minimos para aprobar el paso a produccion

| Categoria | Umbral minimo | Criterio de fallo |
|---|---|---|
| **Casos funcionales (PT-F)** | >= 95% de los 27 casos en estado Aprobado | Mas de 1 caso funcional critico (prioridad Alta) fallando bloquea el despliegue |
| **Casos de seguridad (PT-S)** | 100% de los 15 casos en estado Aprobado | Cualquier caso de seguridad fallando bloquea el despliegue sin excepcion |
| **Casos de performance (PT-P)** | >= 80% de los 6 casos dentro del umbral | El caso PT-P-04 (concurrencia de slots) es bloqueante: debe pasar al 100% |
| **Pruebas unitarias (Vitest)** | 100% en verde. Cobertura >= 80% en src/domain/ y src/services/ | Cualquier test en rojo bloquea el despliegue |
| **Pruebas RLS (pgTAP)** | 0 pruebas fallando | Cualquier fallo de aislamiento multi-tenant bloquea el despliegue |
| **TypeScript** | npm run typecheck sin errores | Errores de tipos bloquean el despliegue |
| **Build** | npm run build sin errores en backend y frontend | Build roto bloquea el despliegue |

### 6.2 Clasificacion de severidad de defectos

| Severidad | Definicion | Efecto en el despliegue |
|---|---|---|
| **Critico** | Perdida o corrupcion de datos, brecha de seguridad multi-tenant, reserva duplicada en el mismo slot, fallo del cron sin recuperacion | Bloquea el despliegue. No se libera hasta que el defecto se cierra. |
| **Alto** | Rate limit no funciona, JWT expirado acepta acceso, WhatsApp envia mensajes duplicados, error 500 en flujo de reserva publica | Bloquea el despliegue si afecta un flujo principal. Se puede negociar una fecha de correccion urgente. |
| **Medio** | Formato de hora incorrecto en el panel, error de validacion con mensaje confuso, reporte con calculo incorrecto | No bloquea el despliegue si hay workaround documentado. Debe corregirse en el siguiente sprint. |
| **Bajo** | Textos de UI con errores ortograficos, estilos visuales incorrectos, mensajes de error no optimizados | No bloquea el despliegue. Se programa para correcciones cosmeticas. |

### 6.3 Checklist de aceptacion del cliente (UAT)

Basado en los criterios de aceptacion del cliente definidos en el SRST §7.2:

- [ ] El admin puede acceder al panel con su correo y contraseña
- [ ] El admin puede configurar al menos un profesional, un servicio y un horario sin asistencia tecnica
- [ ] Un paciente puede completar la reserva desde el celular en menos de 2 minutos usando http://localhost:3001/reservar?empresa=11111111-1111-4111-8111-111111111111
- [ ] El paciente recibe el WhatsApp de confirmacion en menos de 1 minuto tras confirmar la reserva
- [ ] El paciente recibe el WhatsApp de recordatorio (demostrado con cita de corto plazo en ambiente de prueba)
- [ ] Al responder "1" al recordatorio, el estado de la cita cambia a "confirmada" en el panel sin intervencion manual
- [ ] El profesional puede ver su agenda del dia y marcar asistencia desde el panel
- [ ] El admin puede exportar el reporte mensual a CSV y abrirlo en Excel sin problemas de formato
- [ ] Al intentar reservar un slot ya tomado, la segunda reserva es rechazada con mensaje claro
- [ ] Al bloquear un dia festivo, ese dia no muestra slots en la pagina publica de reservas

### 6.4 Definicion de Done (DoD) — alineada con SRST §7.1

Antes de considerar cualquier funcionalidad como terminada, debe cumplir todos estos puntos:

- [ ] Criterios de aceptacion del requerimiento funcional correspondiente cumplidos (SRST seccion 3)
- [ ] Pruebas unitarias de logica de dominio: cobertura >= 80% en src/domain/ y src/services/ (Vitest)
- [ ] Si toca la BD: migracion SQL en database/migrations/ y al menos una prueba pgTAP de aislamiento por empresa_id
- [ ] npm run typecheck sin errores en backend y frontend
- [ ] npm test en verde (todos los tests de Vitest pasan)
- [ ] npm run build en verde en backend y frontend
- [ ] Pagina publica funciona en viewport 360px (Chrome DevTools)
- [ ] Mensajes de error al usuario en espanol claro, sin tecnicismos
- [ ] docs/04-api.md actualizado para nuevos endpoints
- [ ] Codigo revisado por al menos otra persona del equipo
- [ ] Checklist de seguridad revisado y aplicado

---

## 7. Trazabilidad de Casos de Prueba con el SRST

| ID Plan de Pruebas | ID SRST de referencia | RF / RNF trazado |
|---|---|---|
| PT-F-01 | CP-01 | RF-04, RF-05 |
| PT-F-02 | CP-02 | RF-04, RN-01 |
| PT-F-03 | CP-22 | RF-04 |
| PT-F-04 | CP-23 | RF-04 |
| PT-F-05 | CP-23 | RF-04 |
| PT-F-06 | CP-03 | RF-04, RNF-09 |
| PT-F-07 | CP-04 | RF-04, RNF-09 |
| PT-F-08 | CP-07 | RF-03, RF-04 |
| PT-F-09 | — | RF-03, RF-04 |
| PT-F-10 | — | RF-04 |
| PT-F-11 | CP-09 | RF-03, RF-04 |
| PT-F-12 | — | RF-04 |
| PT-F-13 | CP-10 | RF-05, RN-02 |
| PT-F-14 | CP-11 | RF-05, RN-02 |
| PT-F-15 | CP-11 | RF-05, RN-02 |
| PT-F-16 | CP-12 | RF-05 |
| PT-F-17 | CP-29 | RF-05 |
| PT-F-18 | — | RF-01 |
| PT-F-19 | CP-19 | RF-08, RNF-01 |
| PT-F-20 | CP-26 | RF-01, RF-06 |
| PT-F-21 | CP-16 | RF-07 |
| PT-F-22 | CP-17 | RF-07 |
| PT-F-23 | CP-31 | RF-07 |
| PT-F-24 | CP-37 | RNF-01 |
| PT-F-25 | CP-37 | RNF-01, RNF-10 |
| PT-F-26 | CP-19 | RF-02, RNF-01 |
| PT-F-27 | CP-19 | RF-08, RNF-01 |
| PT-S-01 | CP-39 | RNF-02 |
| PT-S-02 | CP-39 | RNF-02 |
| PT-S-03 | CP-39 | RNF-02 |
| PT-S-04 | CP-37 | RNF-01 |
| PT-S-05 | CP-25, CP-36 | RNF-01, RF-08 |
| PT-S-06 | CP-24 | RF-01, RNF-01 |
| PT-S-07 | CP-03 | RNF-09 |
| PT-S-08 | — | RNF-02 |
| PT-S-09 | — | RNF-02 |
| PT-S-10 | — | RNF-02, RNF-07 |
| PT-S-11 | CP-38 | RF-06, RNF-02 |
| PT-S-12 | CP-38 | RF-06, RNF-02 |
| PT-S-13 | CP-38 | RF-06, RNF-02 |
| PT-S-14 | CP-45 | RNF-02 |
| PT-S-15 | CP-44 | RNF-01, RNF-10 |
| PT-P-01 | CP-40 | RNF-04 |
| PT-P-02 | CP-41 | RNF-04 |
| PT-P-03 | CR-01 | RNF-04 |
| PT-P-04 | CR-02, CP-02 | RN-01, RNF-04 |
| PT-P-05 | CP-42, CR-03 | RF-05, RNF-04 |
| PT-P-06 | CP-43 | RF-04, RNF-08 |

---

## 8. Historial de Cambios

| Version | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 2026-10-29 | NovaTech BA | Version inicial. 48 casos de prueba (27 funcionales, 15 de seguridad, 6 de performance). 22 comandos curl listos para ejecutar. Criterios de aceptacion con umbrales por categoria. Trazabilidad completa con SRST CP-01 a CP-45. |
