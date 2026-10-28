# 01 · Requerimientos — Asistencia

**Versión:** 1.0 · **Fecha:** 8 de octubre de 2026 · **Responsable:** Gerencia de Proyectos

## 1. Objetivo

Que cada colaborador registre su entrada y salida **desde su celular, solo si está físicamente en el local que le corresponde**, y que la empresa vea **en tiempo real** quién llegó, quién llegó tarde y quién falta, **por cada local**.

## 2. Actores

| Actor | Qué hace | Dónde |
|---|---|---|
| **Colaborador** | Marca entrada y salida; consulta su historial | App móvil |
| **Supervisor** | Ve el dashboard y reportes **solo de los locales que supervisa** | Web |
| **Administrador** | Todo lo anterior para todos los locales + gestiona locales, geocercas, horarios, usuarios y asignaciones | Web |
| **NovaTech (soporte)** | Alta de la empresa cliente, configuración inicial | Supabase / scripts |

## 3. Requerimientos funcionales (Fase 1)

### Marcación (app móvil)

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | El colaborador inicia sesión con correo y contraseña. | Alta | Credenciales inválidas muestran "Correo o contraseña incorrectos." La sesión persiste al cerrar la app. |
| RF-02 | La app muestra el local asignado, su horario y la hora del servidor. | Alta | Datos coinciden con la asignación vigente del día. |
| RF-03 | La app obtiene la ubicación **en tiempo real** (cada ~2 s o cada 1 m de movimiento) mientras la pantalla está abierta. | Alta | La distancia al local se actualiza en pantalla al moverse. |
| RF-04 | La app muestra la **distancia al local** y si está **dentro o fuera de la geocerca** (verde/rojo). | Alta | Con radio 100 m, a 80 m muestra verde; a 150 m muestra rojo. |
| RF-05 | El botón "Marcar entrada/salida" solo se habilita si: hay señal GPS con precisión suficiente, no hay ubicación simulada y está dentro de la geocerca (o la empresa permite marcar fuera como "observada"). | Alta | Botón deshabilitado fuera del radio con política "rechazar". |
| RF-06 | Al marcar, la app envía lat, lng, precisión, indicador de ubicación simulada y datos del dispositivo. **El servidor valida todo de nuevo** y registra con la **hora del servidor**. | Alta | Cambiar la hora del celular no altera la hora registrada. |
| RF-07 | La secuencia diaria es **una entrada y luego una salida**. Una tercera marcación se rechaza. | Alta | Mensaje "Ya registraste tu entrada y tu salida de hoy." |
| RF-08 | El sistema calcula el estado: **a tiempo**, **tardanza** (después de hora de entrada + tolerancia), **salida**, **salida anticipada**, **día no programado** u **observada** (fuera de geocerca). | Alta | Entrada 08:41 con horario 08:30 y tolerancia 10 → tardanza. |
| RF-09 | Mensajes de error claros y en español: sin asignación, fuera de geocerca (con distancia), GPS impreciso, ubicación simulada, sin conexión. | Alta | Ver catálogo de códigos en [04-api.md](04-api.md#errores). |
| RF-10 | El colaborador consulta su historial de los últimos 30 días. | Media | Lista con fecha, hora, local y estado. |

### Dashboard (web)

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-11 | **Dashboard general**: indicadores de la empresa (porcentaje de asistencia, presentes, tardanzas, sin marcar, fuera del local) para una fecha. | Alta | Totales = suma de los locales visibles. |
| RF-12 | **Tabla y mapa por local** con programados, presentes, tardanzas, sin marcar y %. El mapa colorea cada local según su % (verde ≥ 90, ámbar ≥ 70, rojo < 70). | Alta | Clic en un local abre su detalle. |
| RF-13 | **Feed de últimas marcaciones** (nombre, tipo, local, distancia, hora, estado). | Alta | Muestra las 25 más recientes del día. |
| RF-14 | **Actualización en tiempo real**: al registrarse una marcación, el dashboard se refresca solo en menos de 3 s. Si la conexión en vivo falla, refresca cada 60 s. | Alta | Indicador "En vivo" visible. |
| RF-15 | **Detalle por local**: lista de personas programadas o que marcaron, con horario, hora/estado de entrada y salida y situación (sin marcar, en el local, jornada cerrada). Filtros y búsqueda por nombre/DNI. | Alta | Filtro "Sin marcar" muestra solo quienes no registran entrada. |
| RF-16 | Consulta de fechas anteriores con selector de fecha. | Media | Fechas futuras no seleccionables. |
| RF-17 | El supervisor solo ve los locales que tiene asignados (dashboard, detalle, reportes). | Alta | Acceso a otro local → 403 "No supervisas este local." |

### Administración (web, solo admin)

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-18 | Crear locales con nombre, dirección, coordenadas y **radio de geocerca (20–2000 m)**. Coordenadas por clic en el mapa o "usar mi ubicación actual". | Alta | Vista previa del círculo en el mapa. |
| RF-19 | Editar radio y activar/desactivar locales. Un local inactivo no permite marcar. | Alta | — |
| RF-20 | Crear horarios: entrada, salida, tolerancia (0–120 min) y días de la semana. | Alta | Salida debe ser posterior a entrada. |
| RF-21 | Crear usuarios (colaborador, supervisor, admin) con contraseña temporal y, opcionalmente, local + horario. | Alta | Correo duplicado → "Ya existe un usuario con ese correo." |
| RF-22 | Reasignar local/horario a un colaborador **desde hoy**, conservando el historial. | Alta | La asignación anterior queda cerrada con fecha de ayer. |
| RF-23 | Definir los locales que ve cada supervisor. | Alta | — |
| RF-24 | Activar/desactivar usuarios. Un usuario inactivo no puede usar la API. | Alta | El admin no puede desactivarse a sí mismo. |
| RF-25 | Exportar marcaciones a CSV (Excel) por rango de fechas (máx. 93 días) y local. | Alta | Archivo abre en Excel con tildes correctas. |

## 4. Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | La **hora oficial** es la del servidor, convertida a la zona horaria de la empresa (por defecto `America/Lima`). |
| RN-02 | Dentro de geocerca ⇔ distancia (Haversine) entre la posición y el centro del local **≤ radio**. |
| RN-03 | Precisión GPS máxima aceptada: **50 m** por defecto (configurable por empresa, 5–500 m). |
| RN-04 | Política fuera de geocerca por empresa: **rechazar** (por defecto) u **observar** (registra con estado "observada"). |
| RN-05 | Ubicación simulada (fake GPS, detectado en Android) se **rechaza** salvo que la empresa lo permita explícitamente. |
| RN-06 | Máximo **1 entrada y 1 salida** por colaborador y día (garantizado también por índice único en BD). |
| RN-07 | Tardanza: entrada > hora_entrada + tolerancia. Salida anticipada: salida < hora_salida. |
| RN-08 | "Sin marcar" = programado para ese día (según días del horario) sin entrada registrada. |
| RN-09 | Un colaborador tiene **una sola asignación vigente** a la vez. |
| RN-10 | Todo dato pertenece a una empresa (`empresa_id`); ningún usuario puede ver datos de otra empresa. |

## 5. Requerimientos no funcionales

| ID | Categoría | Requerimiento | Cómo se verifica |
|---|---|---|---|
| RNF-01 | Seguridad | Aislamiento total entre empresas mediante RLS en PostgreSQL + filtro explícito por `empresa_id` en el backend. | Pruebas pgTAP `rls_asistencia.test.sql` |
| RNF-02 | Seguridad | Los clientes (web/móvil) **no pueden escribir** en la BD directamente; solo el backend con `service_role`. | Prueba "no puede insertar" (42501) |
| RNF-03 | Seguridad | Autenticación JWT de Supabase; tokens expiran en 1 h con renovación automática. | Revisión de configuración |
| RNF-04 | Seguridad | Validación de toda entrada con Zod; CORS restringido a orígenes configurados; cabeceras seguras. | Pruebas `api.test.ts` |
| RNF-05 | Privacidad | La ubicación **solo se envía al marcar**; no hay rastreo en segundo plano (permiso "solo mientras se usa"). | `app.json` bloquea `ACCESS_BACKGROUND_LOCATION` |
| RNF-06 | Rendimiento | Marcación responde en < 1.5 s (p95) con 4G. Dashboard carga en < 2 s con 50 locales y 2,000 colaboradores. | Prueba de carga antes de producción |
| RNF-07 | Tiempo real | Latencia marcación → dashboard < 3 s (Supabase Realtime). Respaldo: sondeo cada 60 s. | Prueba manual P-15 |
| RNF-08 | Disponibilidad | 99.5 % mensual (dependiente de Vercel y Supabase). Endpoint `/salud` para monitoreo. | Monitor externo |
| RNF-09 | Usabilidad | Marcar en **≤ 2 toques** desde abrir la app. Mensajes en español sin jerga técnica. Botón grande (≥ 48 px). | Prueba con usuarios |
| RNF-10 | Compatibilidad | Android 10+ e iOS 16+. Dashboard en Chrome, Edge, Safari, Firefox actuales; responsive desde 360 px. | Matriz de pruebas |
| RNF-11 | Escalabilidad | Multi-cliente en un proyecto Supabase compartido; índices por `(empresa_id, local_id, fecha_local)`. | Revisión de plan de consultas |
| RNF-12 | Mantenibilidad | Lógica de negocio en funciones puras (`src/domain`) con pruebas; TypeScript estricto; cobertura ≥ 80 % en dominio y servicios. | `npm run test:cobertura` |
| RNF-13 | Auditoría | Cada marcación guarda lat/lng, precisión, distancia, indicador de ubicación simulada y dispositivo. Las marcaciones no se editan ni borran desde la app. | Revisión de esquema |
| RNF-14 | Legal | Cumplimiento de la Ley 29733 (datos personales): finalidad informada, consentimiento, retención definida. | [09-seguridad-privacidad.md](09-seguridad-privacidad.md) |
| RNF-15 | Costos | Sin servicios de pago adicionales: mapas con OpenStreetMap, sin SMS. | Revisión de dependencias |

## 6. Fuera de alcance (Fase 1)

- Marcación sin conexión (cola offline). *Riesgo conocido: sin señal no se puede marcar.*
- Turnos nocturnos que cruzan la medianoche.
- Varias entradas/salidas por día (refrigerio).
- Reconocimiento facial o selfie de verificación.
- Integración con planillas (exportación CSV cubre el caso).

## Fase 2

| ID | Requerimiento |
|---|---|
| RF-F2-01 | Solicitud de vacaciones y permisos desde la app con fechas y motivo. |
| RF-F2-02 | Aprobación/rechazo por supervisor o admin con notificación por correo. |
| RF-F2-03 | Saldo de vacaciones por colaborador (30 días/año, configurable). |
| RF-F2-04 | Los días con permiso aprobado no cuentan como "sin marcar". |
| RF-F2-05 | Cola offline: guardar la marcación con la hora del dispositivo y la última posición, enviarla al recuperar señal y marcarla como "diferida" para revisión. |
| RF-F2-06 | Turnos nocturnos y múltiples tramos por día. |
