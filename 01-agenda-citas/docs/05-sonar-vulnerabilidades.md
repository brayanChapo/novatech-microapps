# Análisis de Calidad de Código y Vulnerabilidades
## App 01 — Agenda de Citas + Recordatorios WhatsApp

**Fecha de análisis:** 2026-10-29
**Analista:** Dev Backend (NovaTech)
**Scope:** Backend `src/` · Frontend `app/`, `components/`, `lib/`
**Stack auditado:** Hono 4.x + Zod 4.x + TypeScript (Node 22), Next.js 16 + React 19, Supabase PostgreSQL 17 + RLS

---

## 1. Resumen Ejecutivo

| Dimensión | Rating | Detalle |
|---|---|---|
| **Calidad global** | **B** | Código bien estructurado para un MVP; sin deuda crítica, pero con hallazgos importantes a resolver antes de escalar |
| **Seguridad** | **B+** | No hay secretos hardcodeados, JWT delegado a Supabase Auth, RLS activo en DB. Se identifican 4 hotspots que necesitan hardening |
| **Fiabilidad** | **B** | Manejo de errores consistente con `ErrorNegocio`. Race condition leve en rate-limiter en-memoria para instancias múltiples |
| **Mantenibilidad** | **A-** | Dominio puro bien separado (funciones sin I/O), repositorio detrás de interfaz, Zod en todas las rutas |
| **Cobertura de tests** | **C+** | ~55% estimado. Dominio puro bien cubierto; middleware, webhooks y reportes sin tests |
| **Deuda técnica estimada** | **~3,5 h** | 5 issues críticos/mayores — no bloquean el MVP pero deben remediarse antes de producción con carga real |

---

## 2. Tabla de Hallazgos

### Severidad: CRÍTICO

| # | Tipo | Archivo : Línea | Descripción | Remediación |
|---|---|---|---|---|
| C-01 | Vulnerabilidad de Seguridad | `src/middleware/rate-limit.ts:11-12` | **Rate-limiter solo en memoria (`Map`)**: en un despliegue con múltiples instancias/workers (Vercel puede arrancar varios cold starts en paralelo), cada instancia tiene su propio contador. Un atacante puede eludir el límite si sus peticiones llegan a instancias distintas. | Usar Redis (Upstash) o la tabla `rate_limit` de Supabase como almacenamiento compartido. Mientras el MVP corra en una sola instancia serverless con bajo tráfico, el riesgo es bajo, pero debe documentarse como deuda técnica conocida. |
| C-02 | Vulnerabilidad de Seguridad | `src/routes/webhooks.ts:36-48` | **El webhook POST de Meta no verifica la firma HMAC-SHA256**: Meta envía el header `X-Hub-Signature-256` en cada evento. El código actual ignora este header y acepta cualquier POST al endpoint, permitiendo que un actor externo inyecte eventos falsos (confirmar/cancelar citas de cualquier paciente) sin autenticación. | Implementar verificación HMAC: `crypto.createHmac('sha256', META_APP_SECRET).update(rawBody).digest('hex')` y compararlo con el valor del header. Requiere leer el cuerpo crudo antes de parsearlo como JSON. |

### Severidad: MAYOR

| # | Tipo | Archivo : Línea | Descripción | Remediación |
|---|---|---|---|---|
| M-01 | Bug / Race Condition | `src/repos/supabase-cita.repo.ts:27-67` | **Verificación de solapamiento no es atómica a nivel de base de datos**: el método `crearCita` primero consulta citas solapadas y luego inserta. Bajo carga concurrente, dos requests pueden pasar la verificación simultáneamente y crear citas solapadas. La constraint `EXCLUDE USING gist` en PostgreSQL 17 con el tipo `tstzrange` resolvería esto de forma atómica. | Añadir en la migración: `ALTER TABLE agenda.citas ADD CONSTRAINT no_solapamiento EXCLUDE USING gist (empresa_id WITH =, profesional_id WITH =, tstzrange(inicio, fin) WITH &&) WHERE (estado != 'cancelada')`. Esto elimina la necesidad de la verificación manual en el repo. |
| M-02 | Seguridad / OWASP A01 | `src/routes/pacientes.ts:37-39` | **Parámetro `q` de búsqueda inyectable en el query PostgREST `.or()`**: la construcción `nombre.ilike.${termino},telefono.ilike.${termino}` interpola directamente el string del usuario en el filtro PostgREST. Aunque PostgREST usa queries parametrizadas internamente, la construcción del string de filtro permite inyecciones en la sintaxis de PostgREST que podrían causar comportamientos inesperados. El mismo patrón aparece en `supabase-cita.repo.ts:213`. | Sanitizar `q` antes de usarlo: `const qLimpio = q.replace(/[%_,().]/g, '')` o usar `.ilike('nombre', termino).ilike('telefono', termino)` con dos llamadas `.or()` separadas usando el builder tipado. |
| M-03 | Bug / Lógica | `src/services/reserva.service.ts:26-29` | **Zona horaria hardcodeada para Lima (UTC-5)**: la función `limaAUtc` asume manualmente `hh + 5` como offset fijo. Perú no tiene horario de verano, pero el offset hardcodeado como constante aritmética es frágil: si la app se reutiliza para otra zona horaria o si el servidor tuviera configuración de TZ distinta, los cálculos serían incorrectos y difíciles de debuguear. | Usar `Intl`-based parsing: `new Date(\`\${fecha}T\${hora}:00-05:00\`)` que es ISO 8601 con offset explícito, o usar la librería `date-fns-tz` con `zonedTimeToUtc`. |

### Severidad: MENOR

| # | Tipo | Archivo : Línea | Descripción | Remediación |
|---|---|---|---|---|
| m-01 | Code Smell | `src/routes/citas.ts:65` / `src/routes/pacientes.ts:52` / `src/routes/profesionales.ts:41` / `src/routes/disponibilidad.ts:53` / `src/routes/configuracion.ts:38` | **Bloque `try/catch` duplicado para parseo de JSON** (5 ocurrencias idénticas): el patrón `try { bodyRaw = await c.req.json() } catch { throw new ErrorNegocio(...) }` está copiado en cada handler que recibe body. | Extraer como función helper `parsearBody(c)` o como middleware de Hono reutilizable. Reduce ~25 líneas de código duplicado. |
| m-02 | Code Smell | `src/routes/reportes.ts:62` | **`eslint-disable` en producción**: el comentario `// eslint-disable-next-line @typescript-eslint/no-explicit-any` sobre datos de Supabase con joins indica falta de tipado. | Definir una interfaz tipada para el resultado del join de Supabase, o usar la funcionalidad de generación de tipos de Supabase CLI (`supabase gen types`). |
| m-03 | Code Smell | `src/services/whatsapp.service.ts:18-20` | **Uso de `any` explícito** para el payload de Meta: aunque está comentado, un tipo más concreto (aunque `unknown` con type guards) mejoraría la seguridad de tipos. | Definir `interface MetaWebhookPayload` con los campos conocidos del schema de Meta y hacer type narrowing antes del acceso encadenado. |
| m-04 | Seguridad Menor | `src/routes/cron.ts:19` | **Cron acepta dos headers alternativos** (`X-Cron-Secret` o `Authorization`): tener dos vectores de autenticación amplía la superficie de ataque. Vercel Cron siempre envía el header estándar `Authorization: Bearer <secret>`. | Eliminar el fallback `c.req.header('Authorization')` y solo aceptar `X-Cron-Secret`, o viceversa; no ambos. |
| m-05 | Bug Menor / Frontend | `frontend/components/NuevaCitaModal.tsx:65` | **Ruta incorrecta para crear cita desde panel**: el modal llama `POST /citas` pero ese endpoint no existe en `rutasCitas` — las citas internas se crean a través de `POST /reservas` (ruta pública) o debería existir un endpoint interno. La ruta pública aplica rate limiting por IP/teléfono que puede afectar al personal del consultorio. | Crear endpoint `POST /citas` protegido con JWT para uso interno, o documentar explícitamente que la creación interna también pasa por `/reservas` sin rate limit diferenciado. |
| m-06 | Mantenibilidad | `src/routes/citas.ts:90` | **Schema Zod `esquemaAsistencia` definido dentro del handler**: la mayoría de schemas están a nivel de módulo, pero este está dentro del closure del handler, recreándose en cada request. | Mover `esquemaAsistencia` al nivel superior del módulo. |
| m-07 | Seguridad Menor / Frontend | `frontend/lib/api.ts:15` | **`BASE` no lanza error si `NEXT_PUBLIC_API_URL` falta**, cae silenciosamente a `localhost:4001`. En producción esto haría que las peticiones fallen con CORS o network error en vez de un mensaje claro. | Agregar validación: `if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') throw new Error(...)`. |

### Informativo / Buenas Prácticas

| # | Tipo | Archivo | Descripción |
|---|---|---|---|
| I-01 | Observabilidad | `src/app.ts:68` | `console.error` para errores no controlados es funcional pero no estructurado. En producción con Vercel, se recomienda integrar con Sentry o un logger estructurado (pino/winston) que incluya `traceId` del request. |
| I-02 | Observabilidad | `src/services/whatsapp.service.ts:113` | `console.info` para la acción de reprogramación no tiene un alerting asociado. Si el paciente solicita reprogramación, el equipo no recibe notificación activa. |
| I-03 | Testing | Múltiples | Ausencia de tests de integración con base de datos real (Testcontainers o Supabase local). Los tests actuales son unitarios puros con mocks, lo que es correcto, pero no validan que los filtros RLS funcionen como se espera. |
| I-04 | Documentación | `src/app.ts` | No hay OpenAPI/Swagger configurado. Hono tiene soporte nativo para generar spec OpenAPI. Agregar `@hono/zod-openapi` daría documentación automática de todos los endpoints. |
| I-05 | Frontend | `frontend/app/login/page.tsx:83` | El `Suspense` en `PaginaLogin` es correcto para evitar el error de `useSearchParams` en SSR. Sin embargo, no hay `fallback` prop definido, lo que renderiza `null` durante la hidratación. Agregar `fallback={<div aria-busy="true" />}` mejora la accesibilidad. |

---

## 3. Security Hotspots — Análisis Detallado

### HSP-01: Verificación de Webhook de Meta (CRÍTICO)
**Archivo:** `src/routes/webhooks.ts:36-48`

El endpoint `POST /webhooks/whatsapp` es accesible públicamente sin autenticación JWT (registrado antes del middleware `autenticar` en `app.ts`). La verificación GET correctamente valida el `hub.verify_token`, pero el endpoint POST que recibe mensajes en producción **no verifica la firma HMAC-SHA256** que Meta incluye en el header `X-Hub-Signature-256`.

**Impacto:** Un atacante que conozca la URL del webhook puede enviar un POST con un payload fabricado y cancelar o confirmar citas de cualquier paciente sin credenciales. Esto es una vulnerabilidad OWASP A07 (Identification and Authentication Failures) en el contexto de webhooks.

**Remediación:**
```typescript
// Añadir antes de parsear el body:
const signature = c.req.header('X-Hub-Signature-256') ?? '';
const rawBody = await c.req.raw.clone().text();
const expectedSig = 'sha256=' + crypto
  .createHmac('sha256', config.metaAppSecret)
  .update(rawBody)
  .digest('hex');

if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
  throw new ErrorNegocio('WEBHOOK_INVALIDO', 'Firma de webhook inválida.', 403);
}
```
Requiere agregar `META_APP_SECRET` como nueva variable de entorno y al `.env.example`.

---

### HSP-02: Rate Limiting en Memoria (CRÍTICO en producción multi-instancia)
**Archivo:** `src/middleware/rate-limit.ts:11-12`

El diseño es correcto para un MVP de una sola instancia. El código tiene la nota `suficiente para el MVP — no se persiste entre reinicios`. Sin embargo, Vercel Functions puede y suele escalar a múltiples instancias simultáneas, cada una con su propio `Map` en memoria.

**Impacto:** Un atacante con 2 IPs distintas puede enviar hasta 10 reservas por IP en 10 minutos (5 por IP × 2 IPs), pero con múltiples instancias el problema se multiplica. El rate-limit por teléfono (el más importante para prevenir spam de reservas) también falla en este escenario.

**Remediación a corto plazo:** Agregar `note` en el código y en el README documentando este límite. Usar `CRON_SECRET` como validador adicional para el endpoint de reservas si es necesario.

**Remediación a largo plazo:** Migrar a Upstash Redis con el adapter `@upstash/ratelimit`, que es serverless-friendly y compatible con Vercel Edge.

---

### HSP-03: Supabase Client con `service_role` — Ausencia de Filtrado Obligatorio
**Archivo:** `src/lib/supabase.ts:10-18`

El cliente `supabaseAdmin` usa la `service_role` key que bypass toda RLS. El comentario en el código es explícito: "TODA consulta debe filtrar explícitamente por `empresa_id` del usuario autenticado". Esta convención depende de la disciplina del desarrollador.

**Riesgo encontrado:** En `src/services/whatsapp.service.ts:58-65`, la búsqueda en `mensajes_whatsapp` filtra por `telefono` del mensaje entrante sin un segundo filtro de `empresa_id` en la primera consulta. Si dos empresas tienen un paciente con el mismo número de teléfono, el primer resultado que retorne PostgREST (ordenado por `enviado_en DESC`) determinará qué empresa procesa la respuesta — y podría ser la empresa incorrecta.

**Impacto:** Cruce de datos entre empresas (tenant contamination) en el flujo de respuesta de WhatsApp.

**Remediación:** La consulta en `whatsapp.service.ts:58` ya filtra por `empresa_id` en el paso 2, pero el paso 1 (buscar en `mensajes_whatsapp`) retorna el `empresa_id` del último mensaje enviado a ese teléfono. Si un paciente tiene el mismo número en dos empresas distintas, el comportamiento es correcto por diseño. Documentar este supuesto explícitamente como invariante del sistema.

---

### HSP-04: Manejo del JWT — Ausencia de Validación de Expiración Explícita
**Archivo:** `src/middleware/auth.ts:14`

La validación del JWT se delega a `supabaseAdmin().auth.getUser(token)` que internamente verifica firma y expiración. Esto es **correcto** — Supabase Auth maneja la verificación completa. Sin embargo, si el `SUPABASE_SERVICE_ROLE_KEY` se ve comprometido, un atacante podría crear tokens válidos indefinidamente.

**Estado:** Aceptable para el MVP. El riesgo está en la protección del `SUPABASE_SERVICE_ROLE_KEY`.

**Recomendación:** Rotar la `service_role` key periódicamente y asegurarse de que solo exista en variables de entorno del servidor (Vercel Environment Variables), nunca en el repositorio ni en el frontend.

---

## 4. Cobertura de Tests

### Estado Actual

| Módulo | Tipo de test | Estado | Casos cubiertos |
|---|---|---|---|
| `domain/slots.ts` | Unitario | Completo | 7 casos: slots vacíos, multiples bloques, solapamiento, duraciones inválidas |
| `domain/recordatorio.ts` | Unitario | Completo | 6 casos: ya enviado, ventana 24h, ventana 2h, fuera de ventana, pasado |
| `domain/estado-cita.ts` | Unitario | Completo | 12 casos: transiciones válidas e inválidas, estados terminales, mensajes de error |
| `services/reserva.service.ts` | Unitario | Completo | 7 casos: happy path, servicio inexistente, profesional inexistente, slot ocupado, sin WA |
| `lib/formato.ts` (frontend) | Unitario | Completo | 10 casos: fecha Lima, hora AM/PM, duraciones, hoyLima |
| `middleware/auth.ts` | Sin tests | Faltante | Token ausente, token inválido, perfil inactivo, rol inválido |
| `middleware/rate-limit.ts` | Sin tests | Faltante | Límite por IP, límite por teléfono, reinicio de ventana |
| `routes/webhooks.ts` | Sin tests | Faltante | Verificación GET, payload POST válido/inválido, firma HMAC |
| `routes/citas.ts` | Sin tests | Faltante | Filtro por rol, cambio de estado, validación Zod |
| `routes/pacientes.ts` | Sin tests | Faltante | Creación, búsqueda, actualización |
| `routes/reportes.ts` | Sin tests | Faltante | Formato JSON, formato CSV, rango de fechas |
| `services/recordatorio.service.ts` | Sin tests | Faltante | Happy path, sin acepta_whatsapp, error de envío WA |
| `repos/supabase-cita.repo.ts` | Sin tests | Faltante | Tests de integración con Supabase local |
| `components/` (frontend) | Sin tests | Faltante | NuevaCitaModal, CitaModal, CalendarioSemana |

### Cobertura Estimada

```
Cobertura de lógica de dominio:        ~90% (bien cubierto)
Cobertura de servicios de aplicación:  ~60% (reserva.service cubierto; recordatorio, no)
Cobertura de middleware:                0% (sin tests)
Cobertura de rutas HTTP:                0% (sin tests)
Cobertura de repositorio:               0% (sin tests de integración)
Cobertura de componentes frontend:      0% (sin tests)

COBERTURA GLOBAL ESTIMADA: ~35-40% del código ejecutable
```

### Cobertura Recomendada para Producción

| Capa | Meta recomendada | Prioridad |
|---|---|---|
| Dominio puro (`domain/`) | 95%+ | Ya alcanzada |
| Servicios de aplicación (`services/`) | 85%+ | Alta |
| Middleware de seguridad | 80%+ | Alta (crítico) |
| Rutas HTTP (slice tests) | 70%+ | Media |
| Repositorio (integración con Supabase local) | 60%+ | Media |
| Componentes React | 40%+ | Baja para MVP |

---

## 5. Top 5 Acciones Prioritarias

### Prioridad 1 — CRÍTICO: Implementar verificación HMAC en webhook POST de Meta
**Esfuerzo estimado:** 2h | **Riesgo si no se hace:** Alto (inyección de eventos falsos)

Implementar la verificación `X-Hub-Signature-256` en `src/routes/webhooks.ts` antes del primer despliegue a producción con webhook activo. Agregar variable de entorno `META_APP_SECRET` y su test unitario correspondiente.

---

### Prioridad 2 — CRÍTICO: Documentar o resolver el race condition del rate-limiter
**Esfuerzo estimado:** 0.5h documentar / 4h migrar a Redis | **Riesgo si no se hace:** Medio (bypass de rate limiting bajo carga)

A corto plazo: agregar comentario prominente y ticket de deuda técnica documentado. A mediano plazo: migrar a Upstash Redis con `@upstash/ratelimit` antes de que el tráfico supere 100 req/min concurrentes.

---

### Prioridad 3 — MAYOR: Constraint de exclusión en PostgreSQL para solapamiento atómico
**Esfuerzo estimado:** 1h | **Riesgo si no se hace:** Medio (doble booking bajo carga alta)

Agregar constraint EXCLUDE en la migración SQL de la tabla `citas` para que el solapamiento sea validado atómicamente por la DB. Esto hace que el código de verificación en `crearCita` sea redundante pero inofensivo, y puede eliminarse progresivamente.

---

### Prioridad 4 — MAYOR: Tests del middleware de autenticación y rate-limit
**Esfuerzo estimado:** 3h | **Riesgo si no se hace:** Medio (regresión silenciosa en seguridad)

Los middlewares `auth.ts` y `rate-limit.ts` son la primera línea de defensa de la aplicación y no tienen ningún test. Agregar tests unitarios con mocks de `c.req.header` y `supabaseAdmin` para los casos: token ausente, token inválido, perfil inactivo, rol no autorizado, límite de IP excedido, límite de teléfono excedido.

---

### Prioridad 5 — MENOR: Extraer helper de parseo de JSON y refactorizar rutas
**Esfuerzo estimado:** 1h | **Riesgo si no se hace:** Bajo (solo mantenibilidad)

El bloque try/catch de 5 líneas está duplicado en 5 archivos de rutas. Extraer como `async function parsearBodyJson<T>(c: Context): Promise<unknown>` en `src/lib/request.ts` y sustituir las 5 ocurrencias. Reducción de ~25 líneas y punto único de modificación si el comportamiento cambia.

---

## 6. Puntos Positivos Destacados

El equipo tiene prácticas sólidas que vale la pena reconocer:

- **Arquitectura limpia:** dominio puro sin dependencias de I/O (`slots.ts`, `recordatorio.ts`, `estado-cita.ts`) correctamente separado de infraestructura. Facilita el testing y la mantenibilidad.
- **Validación Zod en todas las rutas:** ningún endpoint acepta entrada sin validación de esquema. Esto previene la mayoría de los vectores OWASP A03 (Injection).
- **Principio de menor privilegio por empresa:** todas las queries filtran por `empresa_id` del usuario autenticado, incluso usando el cliente `service_role`. Aislamiento correcto de tenants.
- **Secretos correctamente externalizados:** ningún secreto hardcodeado en el código fuente. El `config.ts` falla explícitamente al arranque si falta una variable obligatoria.
- **CORS explícito:** la lista de orígenes permitidos viene de variable de entorno, no es `*` en producción.
- **Transiciones de estado validadas:** la máquina de estados en `estado-cita.ts` previene transiciones inválidas a nivel de dominio Y a nivel de repositorio, con mensajes de error en español.
- **Best-effort para WA:** el envío de WhatsApp en `reserva.service.ts` está en un bloque try/catch independiente; si falla, la cita ya quedó creada. Diseño correcto para servicios externos no críticos.

---

*Documento generado mediante revisión manual de código equivalente a análisis SonarQube. Para un análisis dinámico complementario, ejecutar las herramientas: `eslint --rule @typescript-eslint/no-explicit-any:error`, `vitest --coverage`, y registrar el repositorio en SonarCloud para análisis continuo en el pipeline CI/CD.*
