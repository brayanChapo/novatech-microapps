# SRST — Agenda de Citas + Recordatorios WhatsApp
## App 01 · NovaTech Consulting

**Versión:** 1.0 · **Fecha:** 28 de octubre de 2026
**Autor:** Analista de Negocio — NovaTech Consulting
**Estado:** Aprobado para desarrollo

---

## 1. Propósito y alcance

### 1.1 Objetivo del sistema

La App 01 — Agenda de Citas + Recordatorios WhatsApp resuelve uno de los problemas más costosos para las PyMEs de servicios presenciales: las inasistencias no avisadas. Cuando un paciente no llega y no avisa, el slot de tiempo queda desperdiciado, el profesional pierde ingresos y la operación absorbe el costo sin recuperación. Este sistema reduce ese problema mediante dos mecanismos: una reserva en línea accesible sin fricción (sin crear cuenta, desde el celular en cuatro pasos o menos) y un recordatorio automático por WhatsApp 24 horas antes que le da al paciente la opción de confirmar, cancelar o reprogramar antes de que sea demasiado tarde.

El sistema está orientado a negocios de atención con turno: clínicas, consultorios médicos, barberías, spas, salones de belleza y talleres. El personal interno (administrador, recepcionista, profesional) opera desde un panel web autenticado. El cliente final (paciente, usuario, cliente del negocio) accede a una página pública sin registro para hacer su reserva. No hay app móvil nativa en el MVP; la página pública es una PWA responsive que funciona desde cualquier navegador móvil.

La solución corre sobre la plataforma compartida de NovaTech Consulting: API en Vercel (Hono + TypeScript), base de datos en Supabase (PostgreSQL con aislamiento por esquema y empresa), y mensajería por WhatsApp Business Cloud API de Meta. Este diseño multi-tenant permite que NovaTech entregue el servicio a múltiples clientes PyME sobre la misma infraestructura, con aislamiento de datos garantizado por RLS (Row Level Security) y el filtro `empresa_id` en cada consulta del backend.

El éxito del sistema se mide en dos indicadores: (1) reducción de la tasa de inasistencia del cliente respecto al período anterior y (2) porcentaje de citas con recordatorio enviado exitosamente. El reporte mensual por profesional es la herramienta de seguimiento interna del cliente para monitorear estos indicadores.

### 1.2 Alcance incluido

- Agenda visual por profesional en vista día y semana, accesible desde el panel interno autenticado.
- Configuración de profesionales, servicios (con duración en minutos y precio referencial) y horarios de atención por día de la semana.
- Gestión de bloqueos de agenda (vacaciones, feriados, horarios cerrados) que impiden reservas en esos slots.
- Página pública de reserva con URL propia por cliente (empresa), accesible sin cuenta, optimizada para celular.
- Confirmación inmediata de la reserva por WhatsApp con plantilla de utilidad aprobada por Meta.
- Recordatorio automático por WhatsApp 24 horas antes de la cita (o 2 horas antes si la cita fue creada con menos de 24 horas de anticipación).
- Procesamiento de respuestas del paciente vía webhook de WhatsApp: confirmar, cancelar o solicitar reprogramación.
- Marcación de asistencia por parte del profesional: asistió o no asistió.
- Reporte mensual de asistencias e inasistencias por profesional, exportable a CSV.
- Alerta por correo electrónico al administrador cuando el consumo de mensajes WhatsApp alcanza el 80% del paquete contratado.
- Protección anti-spam en la página pública (rate limit por IP y por número de teléfono).
- Registro completo de envíos de WhatsApp para auditoría y facturación de excedentes.

### 1.3 Fuera de alcance (MVP)

- Pagos o cobro anticipado en línea al momento de la reserva.
- Historia clínica, diagnósticos o cualquier dato de salud del paciente (pertenece a la App 14).
- App móvil nativa para el personal interno (el panel web es responsive).
- Integración con calendarios externos (Google Calendar, Outlook).
- Videollamadas o citas virtuales.
- Recordatorios por SMS, correo electrónico al paciente o notificaciones push.
- Lista de espera automática cuando un slot se cancela.
- Facturación electrónica o boletas.
- Módulo de fidelización, descuentos o cupones.
- Multiidioma (el MVP es solo en español).
- Encuestas de satisfacción post-cita.
- Integración con sistemas externos del cliente (ERP, HIS, POS).

### 1.4 Glosario

| Término | Definición |
|---|---|
| **Cita** | Reserva confirmada de un slot de tiempo para un paciente con un profesional específico, para un servicio específico. |
| **Slot** | Bloque de tiempo disponible para una cita, definido por la hora de inicio y la duración del servicio. |
| **Profesional** | Persona que presta el servicio: médico, barbero, esteticista, técnico, etc. Cada profesional tiene su propia agenda. |
| **Servicio** | Tipo de atención que ofrece el negocio: consulta, corte de cabello, masaje, afinamiento de motor, etc. Tiene duración en minutos y precio referencial. |
| **Disponibilidad** | Configuración de los horarios de atención de un profesional por día de la semana (ej. lunes de 09:00 a 13:00 y de 15:00 a 18:00). |
| **Bloqueo** | Período dentro de la disponibilidad en que un profesional no atiende: feriado, vacaciones, cierre temporal. Los slots bloqueados no aparecen en la reserva pública. |
| **Paciente** | Término genérico para el cliente final del negocio, independientemente del rubro (puede ser cliente, usuario o paciente según el negocio). No crea cuenta en el sistema. |
| **Empresa** | Cliente PyME de NovaTech que contrata la App 01. Cada empresa tiene su propio conjunto de profesionales, servicios y agenda, aislado de otras empresas. |
| **empresa_id** | Identificador único de la empresa en el sistema. Presente en todas las tablas de la base de datos para garantizar el aislamiento multi-tenant. |
| **RLS** | Row Level Security — política de seguridad a nivel de fila en PostgreSQL que impide que un usuario acceda a registros de otra empresa. |
| **Plantilla de utilidad** | Tipo de mensaje de WhatsApp Business aprobado por Meta para notificaciones transaccionales (confirmaciones, recordatorios). Tiene costo fijo predecible y no requiere que el destinatario haya iniciado conversación en las últimas 24 horas. |
| **Webhook** | Notificación HTTP en tiempo real enviada por WhatsApp (Meta) hacia la API de NovaTech cuando un paciente responde a un mensaje. |
| **Rate limit** | Límite de solicitudes por unidad de tiempo aplicado por IP o número de teléfono para prevenir abuso en la página pública de reservas. |
| **UTC** | Tiempo Universal Coordinado. Las horas de las citas se almacenan en UTC en la base de datos y se convierten a America/Lima para mostrarlas al usuario. |
| **PWA** | Progressive Web App — aplicación web que funciona como app en el celular sin instalación desde la tienda. La página pública de reservas es una PWA. |
| **Estado de cita** | Valor que describe en qué etapa del ciclo de vida se encuentra una cita: pendiente, confirmada, cancelada, reprogramada, asistió, no_asistio. |
| **Recordatorio** | Mensaje de WhatsApp enviado automáticamente 24 horas antes de la cita (o 2 horas si la cita se creó con menos de 24 horas de anticipación) para recordar al paciente su turno. |
| **Cron** | Tarea programada que se ejecuta automáticamente cada hora en Vercel para detectar y enviar los recordatorios pendientes. |
| **multi-tenant** | Arquitectura en la que múltiples clientes (empresas) comparten la misma infraestructura de software con aislamiento lógico de sus datos. |

---

## 2. Actores y roles

| Actor | Descripción | Permisos principales |
|---|---|---|
| **admin** | Dueño del negocio o administrador designado. Configura toda la cuenta: profesionales, servicios, horarios y bloqueos. Ve reportes y recibe alertas de consumo. | Crear/editar/desactivar profesionales, servicios, disponibilidad y bloqueos. Ver todos los reportes. Recibir alerta de consumo WhatsApp. Ver todas las citas de todos los profesionales. |
| **recepcion** | Personal de recepción o asistente. Gestiona la agenda del día: crea, reprograma y cancela citas. Es el punto de contacto operativo con el paciente. | Ver agenda de todos los profesionales. Crear, confirmar, reprogramar y cancelar citas. No puede modificar configuración de profesionales ni servicios. |
| **profesional** | Médico, barbero, esteticista u otro prestador del servicio. Ve solo su propia agenda y registra la asistencia del paciente al finalizar la cita. | Ver su propia agenda (solo sus citas). Marcar asistió / no asistió en sus citas. No puede crear ni modificar citas. |
| **paciente (público)** | Cliente final del negocio. Accede desde un enlace compartido por el negocio. No requiere cuenta ni contraseña. Interactúa también vía WhatsApp para confirmar, cancelar o solicitar reprogramación. | Consultar slots disponibles para un profesional/servicio. Crear una reserva completando nombre y teléfono. Responder al recordatorio de WhatsApp (confirmar/cancelar/reprogramar). |

---

## 3. Requerimientos funcionales detallados

### RF-01: Agenda por profesional en vista día y semana

- **Descripción:** El panel interno muestra la agenda de un profesional seleccionado en vista día o semana. Cada cita ocupa visualmente el bloque de tiempo correspondiente según su hora de inicio y duración del servicio. No es posible tener dos citas activas en el mismo slot del mismo profesional.
- **Actor(es):** admin, recepcion, profesional (solo su propia agenda).
- **Precondiciones:** El usuario está autenticado con JWT válido. Existe al menos un profesional configurado en la empresa.
- **Flujo principal:**
  1. El usuario accede al panel y selecciona la opción "Agenda".
  2. El sistema muestra la vista semana del profesional activo por defecto (o el primero en la lista si no hay selección previa).
  3. El usuario puede cambiar entre vista día y vista semana.
  4. El usuario puede navegar entre días/semanas con botones de anterior/siguiente.
  5. El usuario puede seleccionar otro profesional desde un selector.
  6. El sistema consulta las citas del profesional en el rango de fechas visible y las muestra en el calendario.
- **Flujos alternativos:**
  - A1: Si el profesional no tiene citas en el período, se muestra el calendario vacío con los slots de disponibilidad resaltados.
  - A2: Si el profesional tiene bloqueos en el período, esos slots aparecen sombreados como no disponibles.
- **Postcondiciones:** El usuario visualiza el estado actual de la agenda sin modificaciones en el sistema.
- **Reglas de negocio aplicadas:** RN-01, RN-04.
- **Criterios de aceptación:**
  - [ ] CA-01: Dos citas del mismo profesional en el mismo horario no pueden existir simultáneamente en el sistema.
  - [ ] CA-02: La vista semana muestra los 7 días de la semana con las citas distribuidas correctamente por franja horaria.
  - [ ] CA-03: El cambio entre vista día y semana no requiere recargar la página.
  - [ ] CA-04: Los bloqueos de agenda aparecen visualmente diferenciados de las citas.
  - [ ] CA-05: El profesional autenticado solo puede ver su propia agenda, no la de otros profesionales.

---

### RF-02: Configurar servicios con duración y precio referencial

- **Descripción:** El administrador crea y gestiona los servicios que ofrece el negocio. Cada servicio tiene un nombre, una duración en minutos y un precio referencial. La duración define el tamaño de los bloques de tiempo que se reservan automáticamente en la agenda del profesional.
- **Actor(es):** admin.
- **Precondiciones:** El usuario está autenticado como admin. El negocio tiene la cuenta activa en el sistema.
- **Flujo principal:**
  1. El admin accede a Configuración > Servicios.
  2. El sistema muestra la lista de servicios existentes.
  3. El admin hace clic en "Nuevo servicio".
  4. El admin completa: nombre del servicio, duración en minutos (ej. 30, 45, 60), precio referencial (opcional).
  5. El admin guarda. El sistema valida los campos y crea el servicio.
  6. El servicio nuevo aparece en la lista y queda disponible para asignarlo a citas y para la página pública de reservas.
- **Flujos alternativos:**
  - A1: Si el admin ingresa una duración de 0 o negativa, el sistema rechaza el guardado con el mensaje "La duración debe ser mayor a 0 minutos".
  - A2: El admin puede editar un servicio existente. Los cambios de duración no afectan a las citas ya creadas; solo afectan a los nuevos slots generados.
  - A3: El admin puede desactivar un servicio. Un servicio inactivo no aparece en la página pública de reservas, pero las citas existentes con ese servicio permanecen en el historial.
- **Postcondiciones:** El servicio queda registrado en la tabla `servicios` con el `empresa_id` del admin. Los nuevos slots disponibles en la agenda del profesional reflejan la duración del servicio.
- **Reglas de negocio aplicadas:** RN-01.
- **Criterios de aceptación:**
  - [ ] CA-06: Al crear un servicio con duración 60 minutos, una reserva en el slot de las 10:00 bloquea el horario hasta las 11:00 del mismo profesional.
  - [ ] CA-07: No se puede crear un servicio con nombre vacío o duración igual a 0.
  - [ ] CA-08: El precio referencial es opcional — un servicio sin precio se guarda correctamente.
  - [ ] CA-09: Un servicio desactivado no aparece en el selector de la página pública de reservas.
  - [ ] CA-10: Los servicios creados por la empresa A no son visibles para la empresa B.

---

### RF-03: Horarios de atención y bloqueos

- **Descripción:** El administrador configura los horarios de atención de cada profesional por día de la semana (disponibilidad recurrente) y puede crear bloqueos puntuales (fechas específicas, rangos de tiempo) para vacaciones, feriados o cierres temporales. Los slots que caen dentro de un bloqueo no aparecen como disponibles en la página pública de reservas.
- **Actor(es):** admin.
- **Precondiciones:** Existe al menos un profesional configurado. El usuario está autenticado como admin.
- **Flujo principal (configurar disponibilidad recurrente):**
  1. El admin accede a Configuración > Profesionales > [nombre] > Horarios.
  2. El sistema muestra los días de la semana con los horarios actuales del profesional.
  3. El admin activa o desactiva días y define rangos de hora inicio/fin para cada día activo.
  4. El admin puede agregar múltiples franjas por día (ej. mañana y tarde).
  5. El admin guarda. El sistema valida que hora_fin > hora_inicio y que no haya solapamiento entre franjas del mismo día.
- **Flujo principal (crear bloqueo puntual):**
  1. El admin accede a Agenda > botón "Bloquear horario" o desde el calendario hace clic en un slot.
  2. El admin define: profesional, fecha de inicio, fecha de fin, motivo (opcional).
  3. El admin guarda. Las citas existentes en ese período NO se cancelan automáticamente — el sistema muestra una advertencia listando las citas afectadas para que recepción las gestione manualmente.
- **Flujos alternativos:**
  - A1: Si el admin intenta bloquear un período que ya tiene citas confirmadas, el sistema muestra una advertencia con la lista de citas afectadas. El bloqueo se crea pero las citas existentes no cambian de estado.
  - A2: Un bloqueo puede eliminarse. Al eliminarlo, los slots vuelven a estar disponibles para nuevas reservas.
- **Postcondiciones:** La disponibilidad del profesional está registrada en la tabla `disponibilidad`. Los bloqueos están registrados. La página pública de reservas no muestra slots que caigan dentro de un bloqueo activo.
- **Reglas de negocio aplicadas:** RN-01, RN-04.
- **Criterios de aceptación:**
  - [ ] CA-11: Un slot dentro de un bloqueo activo no aparece en el resultado de GET /reservas/slots de la API.
  - [ ] CA-12: Si el profesional no tiene disponibilidad configurada para un día, no se muestran slots para ese día.
  - [ ] CA-13: El sistema no cancela automáticamente citas existentes al crear un bloqueo; solo muestra advertencia.
  - [ ] CA-14: Dos franjas horarias del mismo profesional en el mismo día no pueden solaparse.

---

### RF-04: Página pública de reserva con enlace propio

- **Descripción:** Cada empresa tiene una URL única de reservas públicas (ej. `agenda.novatechconsulting.com.pe/reservar/clinica-san-martin`). El paciente accede sin cuenta, selecciona profesional, servicio y slot disponible, completa su nombre y teléfono, y confirma la reserva en cuatro pasos o menos desde el celular.
- **Actor(es):** paciente (público).
- **Precondiciones:** La empresa tiene al menos un profesional activo con disponibilidad configurada y al menos un servicio activo. La URL de reservas está activa.
- **Flujo principal:**
  1. El paciente abre el enlace de reserva en su celular.
  2. La página carga en menos de 2 segundos en red 4G y muestra el nombre/logo del negocio.
  3. El paciente selecciona el servicio deseado.
  4. El paciente selecciona el profesional (o "cualquier disponible").
  5. El paciente selecciona la fecha en el calendario y luego el slot horario disponible.
  6. El paciente completa su nombre completo y número de celular (WhatsApp).
  7. El paciente confirma la reserva.
  8. La pantalla muestra el resumen de la cita confirmada con fecha, hora (en hora Lima) y nombre del profesional.
- **Flujos alternativos:**
  - A1: Si el slot seleccionado ya fue tomado por otro paciente en el momento de confirmar (reserva concurrente), el sistema devuelve el error "Lo sentimos, ese horario acaba de ser tomado. Por favor elige otro." y muestra los slots disponibles actualizados.
  - A2: Si el paciente supera el límite de solicitudes (rate limit), recibe el mensaje "Has realizado demasiadas solicitudes. Intenta de nuevo en unos minutos."
  - A3: Si el teléfono no tiene formato válido (no comienza con 9, no tiene 9 dígitos para Perú), el formulario muestra error de validación antes de enviar.
- **Postcondiciones:** La cita queda registrada en la tabla `citas` con estado `pendiente`. Se envía el mensaje de confirmación por WhatsApp. Se registra el intento en `mensajes_whatsapp`.
- **Reglas de negocio aplicadas:** RN-01, RN-02, RN-03, RN-04.
- **Criterios de aceptación:**
  - [ ] CA-15: La página pública carga en menos de 2 segundos en conexión 4G simulada (Lighthouse > 70 en mobile).
  - [ ] CA-16: La reserva se completa en 4 pasos o menos desde el celular sin necesidad de crear cuenta.
  - [ ] CA-17: El sistema rechaza el slot con 409 si fue tomado por otra reserva concurrente.
  - [ ] CA-18: El sistema devuelve 429 si la misma IP realiza más de 5 reservas en 10 minutos.
  - [ ] CA-19: Un teléfono con formato inválido (ej. "abc12345") no pasa la validación del formulario.

---

### RF-05: Confirmación inmediata y recordatorio por WhatsApp

- **Descripción:** Al crear una reserva exitosa, el sistema envía inmediatamente un mensaje de WhatsApp al paciente usando la plantilla de confirmación aprobada por Meta. Adicionalmente, el cron de Vercel (ejecutado cada hora) detecta las citas que corresponden recibir recordatorio y envía la plantilla de recordatorio: 24 horas antes si la cita fue creada con más de 24 horas de anticipación, o 2 horas antes si fue creada con menos de 24 horas de anticipación. Cada envío se registra en la tabla `mensajes_whatsapp` para auditoría y facturación.
- **Actor(es):** Sistema (cron), paciente (receptor).
- **Precondiciones:** La cita existe con estado `pendiente` o `confirmada`. El paciente tiene número de teléfono registrado. El campo `recordatorio_enviado` de la cita es `false`.
- **Flujo principal (confirmación inmediata):**
  1. El paciente confirma la reserva desde la página pública.
  2. La API crea la cita en la base de datos en una transacción atómica.
  3. La API llama a la WhatsApp Business Cloud API con la plantilla `confirmacion_cita`, pasando nombre del paciente, nombre del profesional, nombre del servicio, fecha y hora en América/Lima.
  4. WhatsApp devuelve el `message_id`.
  5. La API actualiza el registro en `mensajes_whatsapp` con estado `enviado` y el `meta_message_id`.
- **Flujo principal (recordatorio automático):**
  1. El cron de Vercel ejecuta GET /cron/recordatorios cada hora.
  2. La API consulta citas donde `recordatorio_enviado = false` y cuya hora de inicio es igual o menor a `now() + 24h` (para recordatorio normal) o `now() + 2h` (para citas creadas con menos de 24h de anticipación).
  3. Por cada cita encontrada, la API envía la plantilla `recordatorio_cita` con las opciones: 1 - Confirmar, 2 - Cancelar, 3 - Reprogramar.
  4. Al recibir confirmación de WhatsApp (`message_id`), la API actualiza `recordatorio_enviado = true` en la cita.
- **Flujos alternativos:**
  - A1: Si la llamada a la WhatsApp API falla (timeout, error 5xx), el envío queda en estado `fallido` en `mensajes_whatsapp`. El cron lo reintentará en la siguiente ejecución (solo si aún está dentro de la ventana de tiempo).
  - A2: Si la cita fue cancelada antes de la hora del recordatorio, el cron la omite.
- **Postcondiciones:** El registro en `mensajes_whatsapp` tiene estado `enviado` con el `meta_message_id`. El campo `recordatorio_enviado` de la cita queda en `true`.
- **Reglas de negocio aplicadas:** RN-02, RN-03, RN-04.
- **Criterios de aceptación:**
  - [ ] CA-20: Al crear una reserva, el paciente recibe el WhatsApp de confirmación en menos de 30 segundos.
  - [ ] CA-21: Cada envío de WhatsApp genera un registro en `mensajes_whatsapp` con el `meta_message_id` de Meta.
  - [ ] CA-22: Una cita no recibe más de un recordatorio (el campo `recordatorio_enviado` previene duplicados).
  - [ ] CA-23: Si la cita se crea a las 10:00 del 5 de noviembre para las 11:00 del mismo día, el recordatorio se envía 2 horas antes (a las 09:00), no 24 horas antes.
  - [ ] CA-24: Si el envío de WhatsApp falla, la cita no queda en estado de error — el fallo queda en `mensajes_whatsapp` y la cita sigue su ciclo normal.

---

### RF-06: Respuesta del paciente — confirmar, reprogramar, cancelar

- **Descripción:** Cuando el paciente responde al recordatorio de WhatsApp con "1", "2" o "3", el webhook de Meta notifica a la API de NovaTech. La API procesa la respuesta y actualiza el estado de la cita. Si el paciente elige reprogramar, el estado cambia a `solicitud_reprogramacion` y recepción recibe una notificación interna para gestionar el cambio.
- **Actor(es):** paciente (vía WhatsApp), sistema (procesamiento del webhook).
- **Precondiciones:** El webhook de WhatsApp está correctamente configurado y verificado con el token secreto. La cita tiene estado `pendiente` o `confirmada`.
- **Flujo principal:**
  1. El paciente recibe el recordatorio de WhatsApp con las opciones 1/2/3.
  2. El paciente responde "1" (confirmar).
  3. Meta envía un POST a /webhooks/whatsapp con el número del remitente y el texto del mensaje.
  4. La API valida la firma del webhook (header `X-Hub-Signature-256`) con el secret configurado.
  5. La API identifica la cita asociada al número de teléfono con estado pendiente/confirmada más próxima.
  6. La API actualiza el estado de la cita a `confirmada`.
  7. La API devuelve 200 OK a Meta.
- **Flujos alternativos:**
  - A1: El paciente responde "2" (cancelar). La API actualiza el estado a `cancelada`. No se elimina la cita, queda en el historial.
  - A2: El paciente responde "3" (reprogramar). La API actualiza el estado a `solicitud_reprogramacion`. Recepción ve el cambio en el panel y contacta al paciente para coordinar la nueva fecha.
  - A3: Si el webhook llega sin firma válida o con firma incorrecta, la API devuelve 401 y no procesa el mensaje.
  - A4: Si no se encuentra ninguna cita activa asociada al número de teléfono, la API devuelve 200 OK (para no reintentar) pero no realiza ningún cambio.
  - A5: Si el mensaje del paciente no es "1", "2" ni "3", la API no realiza cambios pero registra el mensaje.
- **Postcondiciones:** El estado de la cita en la tabla `citas` refleja la acción del paciente.
- **Reglas de negocio aplicadas:** RN-03.
- **Criterios de aceptación:**
  - [ ] CA-25: Responder "1" al recordatorio cambia el estado de la cita a `confirmada` en menos de 5 segundos.
  - [ ] CA-26: Responder "2" cambia el estado a `cancelada`. La cita permanece en el historial con ese estado.
  - [ ] CA-27: Un webhook sin firma válida devuelve 401 y no modifica ningún dato.
  - [ ] CA-28: Un webhook de una empresa con token diferente no puede modificar citas de otra empresa.

---

### RF-07: Marcar asistencia del paciente

- **Descripción:** Al finalizar la atención, el profesional (o recepción) registra si el paciente asistió o no asistió a su cita. Este dato alimenta el reporte mensual de inasistencias.
- **Actor(es):** profesional, recepcion.
- **Precondiciones:** La cita existe y su hora de inicio ya pasó (o está en curso). El usuario está autenticado con el rol correcto.
- **Flujo principal:**
  1. El profesional accede a su agenda del día.
  2. En la cita correspondiente, hace clic en "Marcar asistencia".
  3. El sistema muestra las opciones: "Asistió" o "No asistió".
  4. El profesional selecciona la opción correcta.
  5. El sistema actualiza el estado de la cita: `asistio` o `no_asistio`.
  6. El cambio se refleja visualmente en la agenda.
- **Flujos alternativos:**
  - A1: Si el profesional intenta marcar asistencia en una cita cuya hora de inicio aún no llegó, el sistema muestra el mensaje "No puedes marcar asistencia antes de la hora de la cita".
  - A2: Si la cita ya fue marcada, el sistema permite corregir el estado en el mismo día.
- **Postcondiciones:** El estado de la cita en la tabla `citas` queda en `asistio` o `no_asistio`. El reporte mensual incluirá esta marcación.
- **Reglas de negocio aplicadas:** RN-01.
- **Criterios de aceptación:**
  - [ ] CA-29: Al marcar "No asistió", el estado de la cita cambia a `no_asistio` y el reporte mensual lo contabiliza.
  - [ ] CA-30: El profesional no puede marcar asistencia en citas de otros profesionales de su empresa.
  - [ ] CA-31: No se puede marcar asistencia en una cita con estado `cancelada`.

---

### RF-08: Reporte mensual de asistencia e inasistencias

- **Descripción:** El administrador (y recepción) puede ver y exportar un reporte mensual con el conteo de citas por profesional, desglosado en: total de citas agendadas, asistencias, inasistencias, cancelaciones y tasa de asistencia. El reporte es exportable a CSV.
- **Actor(es):** admin, recepcion.
- **Precondiciones:** Existen citas en el mes seleccionado con estado de asistencia marcado.
- **Flujo principal:**
  1. El admin accede a Reportes > Asistencia mensual.
  2. El admin selecciona el mes y año del reporte.
  3. El sistema consulta las citas del período filtradas por `empresa_id` y agrupa por profesional.
  4. El sistema muestra la tabla con las columnas: Profesional, Total agendadas, Asistencias, Inasistencias, Cancelaciones, Tasa de asistencia (%).
  5. El admin puede exportar el reporte haciendo clic en "Exportar CSV".
  6. El sistema genera y descarga el archivo CSV con los mismos datos de la tabla.
- **Flujos alternativos:**
  - A1: Si no hay citas en el mes seleccionado, el sistema muestra el mensaje "No hay datos para el período seleccionado".
- **Postcondiciones:** El usuario tiene el CSV descargado con los datos del período seleccionado.
- **Reglas de negocio aplicadas:** RN-04.
- **Criterios de aceptación:**
  - [ ] CA-32: El CSV exportado contiene al menos las columnas: profesional, total_agendadas, asistencias, inasistencias, cancelaciones, tasa_asistencia.
  - [ ] CA-33: La tasa de asistencia se calcula como (asistencias / total_agendadas) × 100, redondeada a un decimal.
  - [ ] CA-34: El reporte solo muestra citas de la empresa del admin autenticado, no de otras empresas.
  - [ ] CA-35: El reporte puede filtrarse por profesional específico desde la interfaz.

---

### RF-09: Alerta de consumo de WhatsApp al 80%

- **Descripción:** El sistema monitorea el consumo de mensajes de WhatsApp. Cuando el número de mensajes enviados en el mes en curso alcanza el 80% del límite del paquete contratado, el sistema envía un correo electrónico de alerta al administrador de la empresa.
- **Actor(es):** Sistema (automático), admin (receptor).
- **Precondiciones:** El paquete de mensajes tiene un límite configurado por empresa. Existe una dirección de correo de contacto registrada para el admin.
- **Flujo principal:**
  1. Después de cada envío exitoso de WhatsApp, la API consulta el total de mensajes enviados en el mes en curso para esa empresa.
  2. Si el total es igual o supera el 80% del límite del paquete, la API llama a Resend para enviar el correo de alerta al admin.
  3. El correo incluye: consumo actual, límite total, porcentaje consumido y enlace al panel de configuración.
  4. La alerta se envía solo una vez por mes (no en cada mensaje posterior al umbral).
- **Flujos alternativos:**
  - A1: Si el envío del correo de alerta falla, el sistema registra el error en logs pero no interrumpe la operación de mensajería.
- **Postcondiciones:** El admin recibe el correo de alerta. La alerta queda registrada para no enviarse de nuevo en el mismo mes.
- **Reglas de negocio aplicadas:** RN-03.
- **Criterios de aceptación:**
  - [ ] CA-36: Al enviar el mensaje número 80 de 100 del paquete, el admin recibe el correo de alerta.
  - [ ] CA-37: Al enviar el mensaje número 81, 82, etc., no se envían correos de alerta adicionales en el mismo mes.
  - [ ] CA-38: El correo de alerta indica claramente el consumo actual y el límite del paquete.

---

## 4. Requerimientos no funcionales

| ID | Categoría | Requerimiento | Métrica de aceptación |
|---|---|---|---|
| RNF-01 | Seguridad | Aislamiento multi-tenant entre empresas mediante RLS en todas las tablas y filtro `empresa_id` en todas las consultas del backend con `service_role`. | 0 pruebas pgTAP de aislamiento fallando. El admin de empresa A no puede leer, crear ni modificar registros de empresa B en ningún endpoint. Verificado con suite pgTAP en `rls_agenda.test.sql`. |
| RNF-02 | Seguridad | Los clientes web y la página pública no escriben directamente en Supabase; toda escritura pasa por la API con validación Zod. | 100% de las rutas que reciben entrada tienen schema Zod. Las variables `SUPABASE_SERVICE_ROLE_KEY` y `WHATSAPP_TOKEN` no están expuestas en el frontend (verificación en build). |
| RNF-03 | Usabilidad | Interfaz en español, responsive desde 360 px de ancho, acciones principales en 3 toques o menos. | Prueba en Chrome DevTools con viewport 360 × 640 px: ninguna acción principal requiere más de 3 interacciones. Sin texto desbordado ni botones inaccesibles. |
| RNF-04 | Rendimiento | Respuestas de la API en el percentil 95 menores a 1 segundo. Página pública carga en menos de 2 segundos en red 4G. | p95 < 1 s medido con k6 en 50 usuarios concurrentes durante 1 minuto. Lighthouse mobile Performance Score ≥ 70 para la página /reservar. |
| RNF-05 | Mantenibilidad | TypeScript estricto (`strict: true`) en backend y frontend. Cobertura de pruebas ≥ 80% en los módulos `domain/` y `services/`. | `npm run typecheck` sin errores. Reporte de Vitest: cobertura de líneas ≥ 80% en `src/domain` y `src/services`. |
| RNF-06 | Costos | Toda la app corre en la plataforma compartida de NovaTech (Vercel + Supabase). No se pueden agregar servicios de pago adicionales sin aprobación de Dirección. | 0 servicios de pago no aprobados en `package.json`. Sin proyectos Supabase adicionales creados para esta app. |
| RNF-07 | Legal / Privacidad | Ley 29733 (Ley de Protección de Datos Personales): el paciente debe ser informado de la finalidad del tratamiento de sus datos en el formulario de reserva. No se almacenan diagnósticos ni datos clínicos. | El formulario de reserva pública incluye texto de finalidad informada y el campo `acepta_whatsapp = true` antes de enviar. Las columnas de la tabla `pacientes` no incluyen campos de salud. |
| RNF-08 | Rendimiento | La página pública de reserva carga en menos de 2 segundos en conexión 4G simulada. | Lighthouse mobile en /reservar/{slug}: First Contentful Paint < 2 s, Time to Interactive < 3 s. |
| RNF-09 | Seguridad / Anti-spam | Protección contra abuso en la página pública de reservas: límite de 5 intentos de reserva por IP en 10 minutos y límite de 3 reservas por número de teléfono por día. | El endpoint POST /reservas devuelve 429 con el mensaje correcto al superar cualquiera de los dos límites. Verificado con prueba automatizada de rate limit. |
| RNF-10 | Privacidad | Los datos de pacientes son accesibles solo por los usuarios autenticados de la misma empresa (RLS). No se incluyen datos clínicos ni diagnósticos. | La tabla `pacientes` no tiene columnas de diagnóstico, medicamentos ni historial clínico. Un usuario autenticado de empresa B no puede consultar pacientes de empresa A (probado en pgTAP). |

---

## 5. Reglas de negocio

| ID | Regla | Implementación sugerida |
|---|---|---|
| RN-01 | Una cita ocupa el intervalo [inicio, inicio + duración_min del servicio) del profesional. No se permiten dos citas activas que se solapan para el mismo profesional. | En la ruta POST /reservas, dentro de una transacción PostgreSQL: `SELECT id FROM citas WHERE profesional_id = $1 AND empresa_id = $2 AND estado NOT IN ('cancelada') AND inicio < $fin AND fin > $inicio FOR UPDATE`. Si devuelve filas, devolver 409. La restricción también puede reforzarse con un índice de exclusión (`EXCLUDE USING gist`) en PostgreSQL como segunda capa. |
| RN-02 | El recordatorio de WhatsApp se envía 24 horas antes de la cita. Si la cita fue creada con menos de 24 horas de anticipación, el recordatorio se envía 2 horas antes. Si quedan menos de 2 horas, no se envía recordatorio (la confirmación inicial fue suficiente). | En `src/domain/recordatorio.ts`: función pura `calcularVentanaRecordatorio(creadoEn, inicio): 'h24' | 'h2' | 'sin_recordatorio'`. El cron verifica `recordatorio_enviado = false` y aplica esta lógica para decidir si envía. |
| RN-03 | Los mensajes de WhatsApp al paciente solo se envían usando plantillas de utilidad aprobadas por Meta. Cada envío se registra en `mensajes_whatsapp` con: `plantilla`, `telefono`, `estado` (pendiente / enviado / fallido), `meta_message_id` y `enviado_en`. Este registro sirve para facturar excedentes al cliente. | En `src/lib/whatsapp.ts`: función `enviarPlantilla(plantilla, telefono, variables)` que siempre registra el intento antes de llamar a Meta y actualiza el estado después. Nunca enviar texto libre. El nombre de la plantilla debe ser una constante tipada (`PLANTILLAS_WA`). |
| RN-04 | La hora de la cita se almacena en UTC en la columna `inicio` (tipo `timestamptz`). Toda visualización al usuario se convierte a `America/Lima` en el frontend usando `Intl.DateTimeFormat` o la función `formatearFechaLima()` de `frontend/lib/formato-fecha-lima.ts`. | El backend nunca devuelve timestamps en zona horaria distinta de UTC. El frontend convierte usando la utilidad centralizada. En el formulario de reserva, se muestra la hora en Lima con la aclaración "(hora Lima)" para evitar confusión. |

---

## 6. Casos de prueba del sistema

### 6.1 Casos de prueba funcionales

#### CP-01: Reserva exitosa flujo completo
| Campo | Valor |
|---|---|
| **ID** | CP-01 |
| **RF trazado** | RF-04, RF-05 |
| **Tipo** | Funcional — Happy Path |
| **Prioridad** | Alta |
| **Precondición** | Empresa "Clínica San Martín" activa. Profesional "Dr. Gómez" con disponibilidad lunes 09:00–13:00. Servicio "Consulta general" 30 min. No hay citas el 2026-11-09 a las 10:00. |
| **Datos de entrada** | nombre: "María Torres", telefono: "999888777", servicio_id: UUID del servicio, profesional_id: UUID del Dr. Gómez, slot: 2026-11-09T15:00:00Z (10:00 Lima) |
| **Pasos** | 1. Abrir la página /reservar/clinica-san-martin en celular. 2. Seleccionar "Consulta general". 3. Seleccionar "Dr. Gómez". 4. Seleccionar lunes 09-nov. 5. Seleccionar slot 10:00. 6. Ingresar nombre y teléfono. 7. Hacer clic en Confirmar. |
| **Resultado esperado** | Pantalla de confirmación con: "Cita confirmada para María Torres el lunes 9 de noviembre a las 10:00 con Dr. Gómez". Registro creado en tabla `citas` con estado `pendiente`. Registro creado en `mensajes_whatsapp` con plantilla `confirmacion_cita` y estado `enviado`. |
| **Criterio de éxito** | HTTP 201. Cita en BD. WhatsApp enviado (meta_message_id no nulo). |

---

#### CP-02: Intento de reserva en slot ya ocupado
| Campo | Valor |
|---|---|
| **ID** | CP-02 |
| **RF trazado** | RF-04 |
| **Tipo** | Borde — Concurrencia |
| **Prioridad** | Alta |
| **Precondición** | Existe una cita del Dr. Gómez el 2026-11-09 a las 10:00 con estado `pendiente`. |
| **Datos de entrada** | profesional_id: UUID Dr. Gómez, slot: 2026-11-09T15:00:00Z |
| **Pasos** | 1. POST /reservas con el mismo slot ya ocupado. |
| **Resultado esperado** | HTTP 409. Body: `{ "error": { "codigo": "SLOT_NO_DISPONIBLE", "mensaje": "Lo sentimos, ese horario acaba de ser tomado. Por favor elige otro." } }`. No se crea ninguna cita nueva. |
| **Criterio de éxito** | Status 409. Tabla `citas` sigue con solo la cita original. |

---

#### CP-03: Rate limit por IP excedido
| Campo | Valor |
|---|---|
| **ID** | CP-03 |
| **RF trazado** | RF-04 |
| **Tipo** | Seguridad / Anti-spam |
| **Prioridad** | Alta |
| **Precondición** | IP "203.0.113.5" ha realizado 5 reservas en los últimos 10 minutos. |
| **Datos de entrada** | Sexta solicitud POST /reservas desde la misma IP. |
| **Pasos** | 1. Enviar la solicitud número 6 de reserva. |
| **Resultado esperado** | HTTP 429. Body: `{ "error": { "codigo": "LIMITE_SOLICITUDES", "mensaje": "Has realizado demasiadas solicitudes. Intenta de nuevo en unos minutos." } }`. |
| **Criterio de éxito** | Status 429. No se procesa la reserva. |

---

#### CP-04: Rate limit por teléfono excedido
| Campo | Valor |
|---|---|
| **ID** | CP-04 |
| **RF trazado** | RF-04, RNF-09 |
| **Tipo** | Seguridad / Anti-spam |
| **Prioridad** | Alta |
| **Precondición** | El número "999888777" ya realizó 3 reservas hoy. |
| **Datos de entrada** | Cuarta solicitud POST /reservas con telefono: "999888777". |
| **Pasos** | 1. Enviar la cuarta solicitud de reserva con el mismo teléfono. |
| **Resultado esperado** | HTTP 429. Body con código `LIMITE_RESERVAS_TELEFONO`. |
| **Criterio de éxito** | Status 429. No se crea la cuarta cita. |

---

#### CP-05: Creación de servicio con duración válida
| Campo | Valor |
|---|---|
| **ID** | CP-05 |
| **RF trazado** | RF-02 |
| **Tipo** | Funcional — Happy Path |
| **Prioridad** | Alta |
| **Precondición** | Usuario autenticado como admin de empresa "Barbería El Faro". |
| **Datos de entrada** | nombre: "Corte + barba", duracion_min: 45, precio_referencial: 35.00 |
| **Pasos** | 1. POST /servicios con los datos. |
| **Resultado esperado** | HTTP 201. Servicio creado en la BD con empresa_id correcto. |
| **Criterio de éxito** | El servicio aparece en GET /servicios de la misma empresa. |

---

#### CP-06: Rechazo de servicio con duración cero
| Campo | Valor |
|---|---|
| **ID** | CP-06 |
| **RF trazado** | RF-02 |
| **Tipo** | Negativo |
| **Prioridad** | Media |
| **Precondición** | Usuario autenticado como admin. |
| **Datos de entrada** | nombre: "Servicio inválido", duracion_min: 0 |
| **Pasos** | 1. POST /servicios con duracion_min: 0. |
| **Resultado esperado** | HTTP 400. Body: `{ "error": { "codigo": "VALIDACION", "mensaje": "La duración debe ser mayor a 0 minutos." } }`. |
| **Criterio de éxito** | Status 400. No se crea el servicio en la BD. |

---

#### CP-07: Configurar disponibilidad recurrente de profesional
| Campo | Valor |
|---|---|
| **ID** | CP-07 |
| **RF trazado** | RF-03 |
| **Tipo** | Funcional — Happy Path |
| **Prioridad** | Alta |
| **Precondición** | Admin autenticado. Profesional "Dra. Silva" sin disponibilidad configurada. |
| **Datos de entrada** | profesional_id: UUID Dra. Silva, dia_semana: 1 (lunes), hora_inicio: "09:00", hora_fin: "13:00" |
| **Pasos** | 1. POST /disponibilidad con los datos. |
| **Resultado esperado** | HTTP 201. Los lunes de 09:00 a 13:00 aparecen como slots disponibles en GET /reservas/slots para la Dra. Silva. |
| **Criterio de éxito** | GET /reservas/slots?profesional_id=UUID&fecha=2026-11-09 devuelve slots entre 09:00 y 13:00 separados por la duración del servicio. |

---

#### CP-08: Bloqueo de agenda crea advertencia si hay citas
| Campo | Valor |
|---|---|
| **ID** | CP-08 |
| **RF trazado** | RF-03 |
| **Tipo** | Funcional — Caso con advertencia |
| **Prioridad** | Media |
| **Precondición** | Existe una cita del Dr. Gómez el 2026-11-10 a las 11:00 con estado `confirmada`. |
| **Datos de entrada** | profesional_id: UUID Dr. Gómez, fecha_inicio: 2026-11-10, fecha_fin: 2026-11-10, motivo: "Feriado" |
| **Pasos** | 1. POST /bloqueos con los datos del bloqueo. |
| **Resultado esperado** | HTTP 201. Bloqueo creado. Response incluye campo `advertencia` con la lista de citas afectadas (al menos la del 11:00). La cita del 11:00 NO cambia de estado. |
| **Criterio de éxito** | Bloqueo existe en BD. Estado de la cita afectada sigue siendo `confirmada`. |

---

#### CP-09: Slot dentro de bloqueo no aparece en reserva pública
| Campo | Valor |
|---|---|
| **ID** | CP-09 |
| **RF trazado** | RF-03, RF-04 |
| **Tipo** | Funcional |
| **Prioridad** | Alta |
| **Precondición** | Existe bloqueo del Dr. Gómez para el 2026-11-10. |
| **Datos de entrada** | GET /reservas/slots?profesional_id=UUID&fecha=2026-11-10&servicio_id=UUID |
| **Pasos** | 1. Consultar slots disponibles para esa fecha. |
| **Resultado esperado** | HTTP 200. La respuesta devuelve lista vacía o sin ningún slot del 2026-11-10 para ese profesional. |
| **Criterio de éxito** | No aparece ningún slot disponible para esa fecha bloqueada. |

---

#### CP-10: Recordatorio enviado 24 horas antes
| Campo | Valor |
|---|---|
| **ID** | CP-10 |
| **RF trazado** | RF-05 |
| **Tipo** | Funcional — Happy Path |
| **Prioridad** | Alta |
| **Precondición** | Cita del Dr. Gómez para el 2026-11-09T15:00:00Z (10:00 Lima) creada el 2026-11-07T15:00:00Z. `recordatorio_enviado = false`. |
| **Datos de entrada** | El cron se ejecuta el 2026-11-08T15:30:00Z. |
| **Pasos** | 1. GET /cron/recordatorios se ejecuta. |
| **Resultado esperado** | La API envía la plantilla `recordatorio_cita` al teléfono del paciente. El campo `recordatorio_enviado` de la cita queda en `true`. Un registro en `mensajes_whatsapp` con plantilla `recordatorio_cita` y estado `enviado`. |
| **Criterio de éxito** | `recordatorio_enviado = true` en la cita. Registro en `mensajes_whatsapp` con `meta_message_id` no nulo. |

---

#### CP-11: Recordatorio enviado 2 horas antes para cita de corto plazo
| Campo | Valor |
|---|---|
| **ID** | CP-11 |
| **RF trazado** | RF-05, RN-02 |
| **Tipo** | Funcional — Caso borde |
| **Prioridad** | Alta |
| **Precondición** | Cita creada el 2026-11-09T12:00:00Z para el 2026-11-09T20:00:00Z (cita en 8 horas). `recordatorio_enviado = false`. |
| **Datos de entrada** | Cron se ejecuta el 2026-11-09T17:30:00Z. |
| **Pasos** | 1. GET /cron/recordatorios se ejecuta. |
| **Resultado esperado** | La API envía el recordatorio al paciente con la ventana de 2 horas. |
| **Criterio de éxito** | Recordatorio enviado. `recordatorio_enviado = true`. |

---

#### CP-12: Cita no recibe recordatorio duplicado
| Campo | Valor |
|---|---|
| **ID** | CP-12 |
| **RF trazado** | RF-05 |
| **Tipo** | Borde — Duplicación |
| **Prioridad** | Alta |
| **Precondición** | Cita con `recordatorio_enviado = true`. |
| **Datos de entrada** | El cron se ejecuta nuevamente. |
| **Pasos** | 1. GET /cron/recordatorios se ejecuta dos veces en un intervalo de una hora. |
| **Resultado esperado** | En la segunda ejecución, la cita no se procesa. No se envía un segundo mensaje al paciente. |
| **Criterio de éxito** | La tabla `mensajes_whatsapp` tiene solo un registro de recordatorio para esa cita. |

---

#### CP-13: Paciente confirma respuesta "1" por WhatsApp
| Campo | Valor |
|---|---|
| **ID** | CP-13 |
| **RF trazado** | RF-06 |
| **Tipo** | Funcional — Happy Path |
| **Prioridad** | Alta |
| **Precondición** | Cita de teléfono "999888777" con estado `pendiente`. Webhook configurado con secret `TEST_SECRET_123`. |
| **Datos de entrada** | POST /webhooks/whatsapp con body simulando respuesta de Meta: from "51999888777", body "1", con firma X-Hub-Signature-256 válida. |
| **Pasos** | 1. Enviar POST al webhook con la firma válida. |
| **Resultado esperado** | HTTP 200. El estado de la cita cambia a `confirmada`. |
| **Criterio de éxito** | Estado en BD = `confirmada`. HTTP 200. |

---

#### CP-14: Paciente cancela respondiendo "2" por WhatsApp
| Campo | Valor |
|---|---|
| **ID** | CP-14 |
| **RF trazado** | RF-06 |
| **Tipo** | Funcional |
| **Prioridad** | Alta |
| **Precondición** | Cita de teléfono "999888777" con estado `pendiente`. |
| **Datos de entrada** | POST /webhooks/whatsapp con body "2", firma válida. |
| **Pasos** | 1. Enviar POST al webhook. |
| **Resultado esperado** | HTTP 200. Estado de la cita = `cancelada`. La cita permanece en el historial. |
| **Criterio de éxito** | Estado en BD = `cancelada`. La cita no se elimina. |

---

#### CP-15: Paciente solicita reprogramar respondiendo "3"
| Campo | Valor |
|---|---|
| **ID** | CP-15 |
| **RF trazado** | RF-06 |
| **Tipo** | Funcional |
| **Prioridad** | Alta |
| **Precondición** | Cita de teléfono "999888777" con estado `pendiente`. |
| **Datos de entrada** | POST /webhooks/whatsapp con body "3", firma válida. |
| **Pasos** | 1. Enviar POST al webhook. |
| **Resultado esperado** | HTTP 200. Estado de la cita = `solicitud_reprogramacion`. El panel interno muestra la cita marcada como "Solicitud de reprogramación". |
| **Criterio de éxito** | Estado en BD = `solicitud_reprogramacion`. Visible en el panel de recepción. |

---

#### CP-16: Marcar asistencia — paciente asistió
| Campo | Valor |
|---|---|
| **ID** | CP-16 |
| **RF trazado** | RF-07 |
| **Tipo** | Funcional — Happy Path |
| **Prioridad** | Alta |
| **Precondición** | Cita del Dr. Gómez el 2026-11-09 a las 10:00 con estado `confirmada`. La hora actual es 10:35 Lima (pasó la hora de inicio). Usuario autenticado como `profesional`. |
| **Datos de entrada** | PATCH /marcaciones-asistencia con cita_id: UUID, estado: "asistio" |
| **Pasos** | 1. Enviar PATCH al endpoint. |
| **Resultado esperado** | HTTP 200. Estado de la cita = `asistio`. |
| **Criterio de éxito** | Estado en BD = `asistio`. Visible en el reporte mensual. |

---

#### CP-17: Marcar asistencia — intento antes de la hora
| Campo | Valor |
|---|---|
| **ID** | CP-17 |
| **RF trazado** | RF-07 |
| **Tipo** | Negativo |
| **Prioridad** | Media |
| **Precondición** | Cita para las 10:00. La hora actual es 09:30 Lima (aún no es la hora de la cita). |
| **Datos de entrada** | PATCH /marcaciones-asistencia con cita_id: UUID, estado: "asistio" |
| **Pasos** | 1. Enviar PATCH antes de la hora de la cita. |
| **Resultado esperado** | HTTP 400. Body: `{ "error": { "codigo": "CITA_NO_INICIADA", "mensaje": "No puedes marcar asistencia antes de la hora de la cita." } }`. |
| **Criterio de éxito** | Status 400. Estado de la cita no cambia. |

---

#### CP-18: Reporte mensual genera CSV correcto
| Campo | Valor |
|---|---|
| **ID** | CP-18 |
| **RF trazado** | RF-08 |
| **Tipo** | Funcional — Happy Path |
| **Prioridad** | Media |
| **Precondición** | Empresa tiene 3 citas en noviembre 2026: 2 con estado `asistio`, 1 con estado `no_asistio`. Admin autenticado. |
| **Datos de entrada** | GET /reportes/asistencia?mes=2026-11&formato=csv |
| **Pasos** | 1. Enviar GET al endpoint. |
| **Resultado esperado** | HTTP 200 con Content-Type text/csv. El CSV contiene: una fila de cabecera y una fila por profesional con columnas: profesional, total_agendadas, asistencias, inasistencias, cancelaciones, tasa_asistencia. La tasa = 66.7% para el profesional con 2/3. |
| **Criterio de éxito** | El archivo CSV se puede abrir en Excel. Los conteos son correctos. |

---

#### CP-19: Reporte no incluye datos de otra empresa
| Campo | Valor |
|---|---|
| **ID** | CP-19 |
| **RF trazado** | RF-08, RNF-01 |
| **Tipo** | Seguridad — Aislamiento |
| **Prioridad** | Alta |
| **Precondición** | Empresa A tiene 5 citas en noviembre. Empresa B tiene 10 citas en noviembre. Admin de empresa A autenticado. |
| **Datos de entrada** | GET /reportes/asistencia?mes=2026-11 con JWT de empresa A. |
| **Pasos** | 1. Enviar GET con el JWT de empresa A. |
| **Resultado esperado** | El reporte solo contiene las 5 citas de empresa A. Las 10 citas de empresa B no aparecen. |
| **Criterio de éxito** | Conteo total en el reporte = 5, no 15. |

---

#### CP-20: Alerta al 80% del paquete WhatsApp
| Campo | Valor |
|---|---|
| **ID** | CP-20 |
| **RF trazado** | RF-09 |
| **Tipo** | Funcional |
| **Prioridad** | Media |
| **Precondición** | Empresa "Clínica San Martín" tiene paquete de 100 mensajes/mes. Han enviado 79 mensajes en noviembre. Correo del admin: "admin@clinica.com". |
| **Datos de entrada** | Se crea una reserva que activa el envío del mensaje número 80. |
| **Pasos** | 1. Crear la reserva que provoca el envío del mensaje 80. |
| **Resultado esperado** | El admin recibe un correo a "admin@clinica.com" con asunto "Alerta: 80% del paquete WhatsApp consumido". El correo indica: consumo actual 80/100, porcentaje 80%. |
| **Criterio de éxito** | Correo recibido con los datos correctos. |

---

#### CP-21: No se envía alerta duplicada en el mismo mes
| Campo | Valor |
|---|---|
| **ID** | CP-21 |
| **RF trazado** | RF-09 |
| **Tipo** | Borde |
| **Prioridad** | Media |
| **Precondición** | La alerta del 80% ya fue enviada este mes (mensaje 80). Se crea una reserva nueva (mensaje 81). |
| **Datos de entrada** | Envío del mensaje número 81. |
| **Pasos** | 1. Crear la reserva que provoca el envío del mensaje 81. |
| **Resultado esperado** | No se envía correo de alerta. Solo se envía en el mensaje que cruza el umbral (80), no en los siguientes. |
| **Criterio de éxito** | La bandeja del admin no recibe un segundo correo de alerta. |

---

#### CP-22: Reserva con nombre vacío rechazada
| Campo | Valor |
|---|---|
| **ID** | CP-22 |
| **RF trazado** | RF-04 |
| **Tipo** | Negativo — Validación |
| **Prioridad** | Media |
| **Precondición** | Ninguna. |
| **Datos de entrada** | POST /reservas con nombre: "", telefono: "999888777", servicio_id: UUID, slot: válido. |
| **Pasos** | 1. Enviar la solicitud con nombre vacío. |
| **Resultado esperado** | HTTP 400. Body con `codigo: "VALIDACION"` y mensaje indicando que el nombre es requerido. |
| **Criterio de éxito** | Status 400. No se crea ninguna cita. |

---

#### CP-23: Reserva con teléfono inválido rechazada
| Campo | Valor |
|---|---|
| **ID** | CP-23 |
| **RF trazado** | RF-04 |
| **Tipo** | Negativo — Validación |
| **Prioridad** | Media |
| **Precondición** | Ninguna. |
| **Datos de entrada** | POST /reservas con nombre: "Ana López", telefono: "12345" (formato inválido — menos de 9 dígitos). |
| **Pasos** | 1. Enviar la solicitud con teléfono corto. |
| **Resultado esperado** | HTTP 400. Mensaje indicando formato de teléfono inválido. |
| **Criterio de éxito** | Status 400. No se crea cita. |

---

#### CP-24: Vista de agenda del profesional solo muestra sus citas
| Campo | Valor |
|---|---|
| **ID** | CP-24 |
| **RF trazado** | RF-01 |
| **Tipo** | Seguridad — Permisos por rol |
| **Prioridad** | Alta |
| **Precondición** | Empresa tiene dos profesionales: Dr. Gómez y Dra. Silva. Dr. Gómez está autenticado. |
| **Datos de entrada** | GET /citas?profesional_id=UUID_DR_SILVA con JWT del Dr. Gómez. |
| **Pasos** | 1. Dr. Gómez intenta consultar la agenda de Dra. Silva. |
| **Resultado esperado** | HTTP 403. Body: `{ "error": { "codigo": "ACCESO_NO_AUTORIZADO", "mensaje": "No tienes permiso para ver la agenda de otro profesional." } }`. |
| **Criterio de éxito** | Status 403. No se devuelven citas de la Dra. Silva. |

---

#### CP-25: Profesional no puede crear citas
| Campo | Valor |
|---|---|
| **ID** | CP-25 |
| **RF trazado** | RF-01 |
| **Tipo** | Seguridad — Permisos por rol |
| **Prioridad** | Alta |
| **Precondición** | Dr. Gómez autenticado con rol `profesional`. |
| **Datos de entrada** | POST /citas con JWT de rol `profesional`. |
| **Pasos** | 1. Dr. Gómez intenta crear una cita vía el endpoint autenticado. |
| **Resultado esperado** | HTTP 403. Solo `admin` y `recepcion` pueden crear citas desde el panel. |
| **Criterio de éxito** | Status 403. No se crea la cita. |

---

#### CP-26: Recepción puede reprogramar una cita
| Campo | Valor |
|---|---|
| **ID** | CP-26 |
| **RF trazado** | RF-01, RF-06 |
| **Tipo** | Funcional |
| **Prioridad** | Alta |
| **Precondición** | Cita existente con estado `solicitud_reprogramacion`. Nuevo slot disponible: 2026-11-10T16:00:00Z. Recepcionista autenticada. |
| **Datos de entrada** | PATCH /citas/{id} con nuevo inicio: 2026-11-10T16:00:00Z y fin calculado según duración del servicio. |
| **Pasos** | 1. Recepcionista envía PATCH con la nueva hora. |
| **Resultado esperado** | HTTP 200. Estado de la cita cambia a `pendiente` con la nueva hora. El slot anterior queda liberado. |
| **Criterio de éxito** | Cita en BD con nuevo `inicio`. El slot anterior disponible para nuevas reservas. |

---

#### CP-27: Admin configura profesional inactivo — no aparece en reserva pública
| Campo | Valor |
|---|---|
| **ID** | CP-27 |
| **RF trazado** | RF-02, RF-03 |
| **Tipo** | Funcional |
| **Prioridad** | Media |
| **Precondición** | Profesional "Dr. Rojas" marcado como inactivo (`activo = false`). |
| **Datos de entrada** | GET /reservas/profesionales desde la página pública de la empresa. |
| **Pasos** | 1. Cargar la página pública de reservas. |
| **Resultado esperado** | El Dr. Rojas no aparece en la lista de profesionales disponibles para reservar. |
| **Criterio de éxito** | La lista de profesionales devuelta no incluye al Dr. Rojas. |

---

#### CP-28: Fallo de WhatsApp no cancela la cita
| Campo | Valor |
|---|---|
| **ID** | CP-28 |
| **RF trazado** | RF-05 |
| **Tipo** | Negativo — Resiliencia |
| **Prioridad** | Alta |
| **Precondición** | La WhatsApp Cloud API devuelve error 500 al intentar enviar la confirmación. |
| **Datos de entrada** | POST /reservas con datos válidos. La llamada a Meta está mockeada para devolver 500. |
| **Pasos** | 1. Crear la reserva con la API de WhatsApp simulando fallo. |
| **Resultado esperado** | HTTP 201. La cita se crea correctamente. El registro en `mensajes_whatsapp` tiene estado `fallido`. La pantalla de confirmación muestra los detalles de la cita (sin depender del WhatsApp para confirmar). |
| **Criterio de éxito** | Cita en BD con estado `pendiente`. Registro en `mensajes_whatsapp` con estado `fallido`. |

---

#### CP-29: Cron no procesa citas canceladas
| Campo | Valor |
|---|---|
| **ID** | CP-29 |
| **RF trazado** | RF-05 |
| **Tipo** | Funcional — Caso borde |
| **Prioridad** | Media |
| **Precondición** | Cita cancelada (`estado = cancelada`) con `recordatorio_enviado = false`. |
| **Datos de entrada** | Cron se ejecuta. |
| **Pasos** | 1. GET /cron/recordatorios se ejecuta. |
| **Resultado esperado** | La cita cancelada no recibe recordatorio. No se crea registro en `mensajes_whatsapp` para esa cita. |
| **Criterio de éxito** | Tabla `mensajes_whatsapp` sin nuevo registro de recordatorio para la cita cancelada. |

---

#### CP-30: Respuesta de texto libre no modifica el estado de la cita
| Campo | Valor |
|---|---|
| **ID** | CP-30 |
| **RF trazado** | RF-06 |
| **Tipo** | Borde — Entrada inesperada |
| **Prioridad** | Baja |
| **Precondición** | Cita con estado `pendiente` asociada al número "999888777". |
| **Datos de entrada** | POST /webhooks/whatsapp con body "Quiero cambiar la hora" (texto libre), firma válida. |
| **Pasos** | 1. Enviar el webhook con un texto que no es 1, 2 ni 3. |
| **Resultado esperado** | HTTP 200. Estado de la cita no cambia. |
| **Criterio de éxito** | Estado en BD sin cambios. |

---

#### CP-31: Marcar asistencia en cita cancelada es rechazado
| Campo | Valor |
|---|---|
| **ID** | CP-31 |
| **RF trazado** | RF-07 |
| **Tipo** | Negativo |
| **Prioridad** | Media |
| **Precondición** | Cita con estado `cancelada`. |
| **Datos de entrada** | PATCH /marcaciones-asistencia con cita_id: UUID, estado: "asistio" |
| **Pasos** | 1. Intentar marcar asistencia en una cita cancelada. |
| **Resultado esperado** | HTTP 400. Mensaje: "No se puede marcar asistencia en una cita cancelada." |
| **Criterio de éxito** | Status 400. Estado de la cita permanece `cancelada`. |

---

#### CP-32: Horarios con solapamiento son rechazados
| Campo | Valor |
|---|---|
| **ID** | CP-32 |
| **RF trazado** | RF-03 |
| **Tipo** | Negativo — Validación |
| **Prioridad** | Media |
| **Precondición** | Profesional tiene disponibilidad lunes 09:00–13:00. |
| **Datos de entrada** | Segunda franja para el mismo lunes: hora_inicio: "11:00", hora_fin: "15:00" (solapa con 11:00–13:00). |
| **Pasos** | 1. POST /disponibilidad con la segunda franja solapada. |
| **Resultado esperado** | HTTP 409. Mensaje indicando que las franjas horarias del mismo día no pueden solaparse. |
| **Criterio de éxito** | Status 409. No se crea la segunda franja. |

---

#### CP-33: Disponibilidad sin hora_fin > hora_inicio es rechazada
| Campo | Valor |
|---|---|
| **ID** | CP-33 |
| **RF trazado** | RF-03 |
| **Tipo** | Negativo — Validación |
| **Prioridad** | Baja |
| **Precondición** | Ninguna. |
| **Datos de entrada** | hora_inicio: "14:00", hora_fin: "09:00" (hora_fin menor a hora_inicio). |
| **Pasos** | 1. POST /disponibilidad con los datos inválidos. |
| **Resultado esperado** | HTTP 400. Mensaje: "La hora de fin debe ser posterior a la hora de inicio." |
| **Criterio de éxito** | Status 400. No se crea la disponibilidad. |

---

#### CP-34: Visualización de hora en zona Lima
| Campo | Valor |
|---|---|
| **ID** | CP-34 |
| **RF trazado** | RF-04, RN-04 |
| **Tipo** | Funcional |
| **Prioridad** | Alta |
| **Precondición** | Cita creada con `inicio = 2026-11-09T15:00:00Z` (UTC). |
| **Datos de entrada** | GET /citas/{id} desde el panel del administrador. |
| **Pasos** | 1. Consultar el detalle de la cita. |
| **Resultado esperado** | La interfaz muestra "10:00 a.m." (UTC-5, hora Lima, sin DST). |
| **Criterio de éxito** | La hora visualizada corresponde a UTC menos 5 horas = 10:00 Lima. |

---

#### CP-35: La hora UTC de la cita se envía correctamente en el mensaje de WhatsApp
| Campo | Valor |
|---|---|
| **ID** | CP-35 |
| **RF trazado** | RF-05, RN-04 |
| **Tipo** | Funcional — Integración |
| **Prioridad** | Alta |
| **Precondición** | Cita con `inicio = 2026-11-09T15:00:00Z`. |
| **Datos de entrada** | Envío de la plantilla `confirmacion_cita`. |
| **Pasos** | 1. Verificar el texto del mensaje WhatsApp enviado. |
| **Resultado esperado** | El mensaje dice "lunes 9 de noviembre a las 10:00 a.m." (hora Lima), no "15:00 UTC". |
| **Criterio de éxito** | El texto del mensaje contiene la hora Lima, no UTC. |

---

#### CP-36: Profesional no puede acceder al reporte general
| Campo | Valor |
|---|---|
| **ID** | CP-36 |
| **RF trazado** | RF-08 |
| **Tipo** | Seguridad — Permisos por rol |
| **Prioridad** | Media |
| **Precondición** | Dr. Gómez autenticado con rol `profesional`. |
| **Datos de entrada** | GET /reportes/asistencia?mes=2026-11 con JWT de rol `profesional`. |
| **Pasos** | 1. El profesional intenta acceder al reporte. |
| **Resultado esperado** | HTTP 403. Solo `admin` y `recepcion` pueden ver el reporte. |
| **Criterio de éxito** | Status 403. No se devuelven datos del reporte. |

---

#### CP-37: Empresa A no puede ver citas de empresa B (aislamiento RLS)
| Campo | Valor |
|---|---|
| **ID** | CP-37 |
| **RF trazado** | RNF-01 |
| **Tipo** | Seguridad — Multi-tenant |
| **Prioridad** | Alta |
| **Precondición** | Empresa A (empresa_id: "aaa-...") y empresa B (empresa_id: "bbb-...") ambas con citas activas. Admin de empresa A autenticado. |
| **Datos de entrada** | GET /citas con JWT de empresa A, intentando forzar empresa_id de empresa B en la query. |
| **Pasos** | 1. Hacer GET /citas?empresa_id=bbb-... con JWT de empresa A. |
| **Resultado esperado** | HTTP 200 con lista vacía O HTTP 403. Bajo ninguna circunstancia devuelve citas de empresa B. |
| **Criterio de éxito** | Respuesta no contiene ninguna cita con empresa_id = "bbb-...". |

---

#### CP-38: Webhook sin firma válida rechazado
| Campo | Valor |
|---|---|
| **ID** | CP-38 |
| **RF trazado** | RF-06, RNF-02 |
| **Tipo** | Seguridad |
| **Prioridad** | Alta |
| **Precondición** | Webhook configurado con secret. |
| **Datos de entrada** | POST /webhooks/whatsapp sin header X-Hub-Signature-256 o con firma incorrecta. |
| **Pasos** | 1. Enviar POST sin firma. 2. Enviar POST con firma incorrecta. |
| **Resultado esperado** | HTTP 401 en ambos casos. No se procesa el webhook ni se modifica ningún estado. |
| **Criterio de éxito** | Status 401. No hay cambios en la BD. |

---

#### CP-39: JWT expirado rechazado en todas las rutas autenticadas
| Campo | Valor |
|---|---|
| **ID** | CP-39 |
| **RF trazado** | RNF-02 |
| **Tipo** | Seguridad |
| **Prioridad** | Alta |
| **Precondición** | Se tiene un JWT válido pero expirado (generado hace más de 1 hora). |
| **Datos de entrada** | GET /citas con JWT expirado en el header Authorization. |
| **Pasos** | 1. Enviar cualquier solicitud autenticada con el JWT expirado. |
| **Resultado esperado** | HTTP 401. Body: `{ "error": { "codigo": "TOKEN_EXPIRADO", "mensaje": "Tu sesión ha expirado. Vuelve a iniciar sesión." } }`. |
| **Criterio de éxito** | Status 401. No se devuelven datos. |

---

#### CP-40: Carga de slots disponibles en menos de 1 segundo
| Campo | Valor |
|---|---|
| **ID** | CP-40 |
| **RF trazado** | RNF-04 |
| **Tipo** | Rendimiento |
| **Prioridad** | Alta |
| **Precondición** | Profesional con 200 citas en el historial de los últimos 6 meses. |
| **Datos de entrada** | GET /reservas/slots?profesional_id=UUID&fecha=2026-11-09&servicio_id=UUID medido con k6. |
| **Pasos** | 1. Ejecutar 50 solicitudes concurrentes al endpoint de slots. |
| **Resultado esperado** | El percentil 95 de tiempo de respuesta es menor a 1 segundo (p95 < 1000 ms). |
| **Criterio de éxito** | Informe de k6: p95 < 1000 ms. Sin errores 5xx. |

---

#### CP-41: Creación de reserva en menos de 2 segundos bajo carga
| Campo | Valor |
|---|---|
| **ID** | CP-41 |
| **RF trazado** | RNF-04 |
| **Tipo** | Rendimiento |
| **Prioridad** | Alta |
| **Precondición** | Slots disponibles sin conflicto de concurrencia. |
| **Datos de entrada** | 20 solicitudes POST /reservas concurrentes con slots diferentes. |
| **Pasos** | 1. Ejecutar carga concurrente de 20 reservas en slots distintos. |
| **Resultado esperado** | p95 < 2000 ms. Las 20 reservas se crean sin error. |
| **Criterio de éxito** | Informe de k6: p95 < 2000 ms. 20 citas creadas en BD. |

---

#### CP-42: Cron de recordatorios con 50 citas pendientes
| Campo | Valor |
|---|---|
| **ID** | CP-42 |
| **RF trazado** | RF-05, RNF-04 |
| **Tipo** | Rendimiento — Recordatorio masivo |
| **Prioridad** | Media |
| **Precondición** | 50 citas con `recordatorio_enviado = false` dentro de la ventana de 24 horas. La API de WhatsApp está mockeada para responder en < 200 ms. |
| **Datos de entrada** | GET /cron/recordatorios. |
| **Pasos** | 1. Ejecutar el endpoint del cron. |
| **Resultado esperado** | Los 50 recordatorios se envían en menos de 30 segundos. Todos los registros en `mensajes_whatsapp` quedan en estado `enviado`. |
| **Criterio de éxito** | Tiempo total del cron < 30 s. 50 registros con estado `enviado`. |

---

#### CP-43: Página pública de reserva carga en menos de 2 segundos
| Campo | Valor |
|---|---|
| **ID** | CP-43 |
| **RF trazado** | RF-04, RNF-08 |
| **Tipo** | Rendimiento |
| **Prioridad** | Alta |
| **Precondición** | La página /reservar/{slug} está desplegada en Vercel. |
| **Datos de entrada** | Auditoría Lighthouse con perfil "Mobile" y throttling 4G lento. |
| **Pasos** | 1. Ejecutar Lighthouse en la URL de la empresa. |
| **Resultado esperado** | First Contentful Paint < 2 s. Time to Interactive < 3 s. Performance Score ≥ 70. |
| **Criterio de éxito** | Informe Lighthouse mobile con los valores dentro del umbral. |

---

#### CP-44: Admin de empresa A no puede leer pacientes de empresa B
| Campo | Valor |
|---|---|
| **ID** | CP-44 |
| **RF trazado** | RNF-01, RNF-10 |
| **Tipo** | Seguridad — Multi-tenant a nivel de BD |
| **Prioridad** | Alta |
| **Precondición** | Suite pgTAP en `database/tests/rls_agenda.test.sql`. Empresa A y B tienen pacientes registrados. |
| **Datos de entrada** | Consulta directa a la tabla `pacientes` como role de empresa A. |
| **Pasos** | 1. Ejecutar `npm run db:test`. |
| **Resultado esperado** | Todas las pruebas pgTAP de aislamiento pasan. La consulta desde empresa A no devuelve pacientes de empresa B. |
| **Criterio de éxito** | 0 pruebas pgTAP fallando. |

---

#### CP-45: service_role_key no expuesta en el bundle del frontend
| Campo | Valor |
|---|---|
| **ID** | CP-45 |
| **RF trazado** | RNF-02 |
| **Tipo** | Seguridad |
| **Prioridad** | Alta |
| **Precondición** | Build de producción del frontend generado. |
| **Datos de entrada** | Buscar la cadena "service_role" en los archivos del build (.js). |
| **Pasos** | 1. Ejecutar `npm run build` en el frontend. 2. Buscar "service_role" y "WHATSAPP_TOKEN" en la carpeta .next/. |
| **Resultado esperado** | Ninguna cadena que corresponda a la service_role key ni al token de WhatsApp aparece en los archivos del build. |
| **Criterio de éxito** | `grep -r "service_role\|WHATSAPP_TOKEN" .next/` no devuelve resultados con valores reales. |

---

### 6.2 Matriz de trazabilidad

| Caso de Prueba | RF trazado | RNF trazado | RN trazada |
|---|---|---|---|
| CP-01 | RF-04, RF-05 | RNF-04 | RN-01, RN-03, RN-04 |
| CP-02 | RF-04 | RNF-04 | RN-01 |
| CP-03 | RF-04 | RNF-09 | — |
| CP-04 | RF-04 | RNF-09 | — |
| CP-05 | RF-02 | — | RN-01 |
| CP-06 | RF-02 | RNF-02 | — |
| CP-07 | RF-03 | — | RN-01 |
| CP-08 | RF-03 | — | — |
| CP-09 | RF-03, RF-04 | — | RN-01 |
| CP-10 | RF-05 | — | RN-02, RN-03, RN-04 |
| CP-11 | RF-05 | — | RN-02 |
| CP-12 | RF-05 | — | RN-02 |
| CP-13 | RF-06 | RNF-02 | RN-03 |
| CP-14 | RF-06 | RNF-02 | RN-03 |
| CP-15 | RF-06 | RNF-02 | RN-03 |
| CP-16 | RF-07 | — | — |
| CP-17 | RF-07 | — | — |
| CP-18 | RF-08 | RNF-04 | RN-04 |
| CP-19 | RF-08 | RNF-01 | — |
| CP-20 | RF-09 | — | RN-03 |
| CP-21 | RF-09 | — | — |
| CP-22 | RF-04 | RNF-02 | — |
| CP-23 | RF-04 | RNF-02 | — |
| CP-24 | RF-01 | RNF-01 | — |
| CP-25 | RF-01 | RNF-01 | — |
| CP-26 | RF-01, RF-06 | — | RN-01 |
| CP-27 | RF-02, RF-03 | — | — |
| CP-28 | RF-05 | RNF-04 | RN-03 |
| CP-29 | RF-05 | — | RN-02 |
| CP-30 | RF-06 | — | RN-03 |
| CP-31 | RF-07 | — | — |
| CP-32 | RF-03 | RNF-02 | RN-01 |
| CP-33 | RF-03 | RNF-02 | — |
| CP-34 | RF-04 | — | RN-04 |
| CP-35 | RF-05 | — | RN-04 |
| CP-36 | RF-08 | RNF-01 | — |
| CP-37 | — | RNF-01, RNF-10 | — |
| CP-38 | RF-06 | RNF-02 | RN-03 |
| CP-39 | — | RNF-02 | — |
| CP-40 | — | RNF-04 | — |
| CP-41 | — | RNF-04 | RN-01 |
| CP-42 | RF-05 | RNF-04 | RN-02, RN-03 |
| CP-43 | RF-04 | RNF-04, RNF-08 | — |
| CP-44 | — | RNF-01, RNF-10 | — |
| CP-45 | — | RNF-02 | — |

---

### 6.3 Casos de prueba de seguridad

#### CS-01: Aislamiento multi-tenant en todas las tablas (pgTAP)
- **Objetivo:** Verificar que ninguna consulta del backend con `service_role` puede leer ni escribir datos de una empresa diferente.
- **Método:** Ejecutar `npm run db:test` que corre `rls_agenda.test.sql`. Las pruebas prueban: SELECT, INSERT, UPDATE y DELETE en tablas `citas`, `pacientes`, `profesionales`, `servicios`, `disponibilidad` y `mensajes_whatsapp` simulando el rol de empresa A accediendo a datos de empresa B.
- **Criterio de éxito:** 0 pruebas pgTAP fallando.

#### CS-02: Rate limit por IP — protección contra scraping y spam de reservas
- **Objetivo:** Verificar que una IP no pueda crear más de 5 reservas en 10 minutos.
- **Método:** Ejecutar script de carga que envía 10 solicitudes POST /reservas desde la misma IP en 5 minutos.
- **Criterio de éxito:** Las solicitudes 6 a 10 devuelven HTTP 429. Las solicitudes 1 a 5 se procesan normalmente.

#### CS-03: Verificación de firma del webhook de WhatsApp (HMAC-SHA256)
- **Objetivo:** Verificar que el endpoint POST /webhooks/whatsapp rechaza mensajes sin firma válida o con firma manipulada.
- **Método:** Enviar 3 variantes: (a) sin header X-Hub-Signature-256, (b) con firma de otro secret, (c) con body modificado después de firmar.
- **Criterio de éxito:** Los 3 casos devuelven HTTP 401. No se modifica ningún estado en la BD en ninguno de los 3 casos.

#### CS-04: Escalación de privilegios — rol profesional no puede ejecutar acciones de admin
- **Objetivo:** Verificar que un JWT con rol `profesional` no puede realizar acciones reservadas para `admin`.
- **Método:** Con JWT de profesional, intentar: crear/editar servicios (POST/PUT /servicios), crear bloqueos (POST /bloqueos), exportar reporte (GET /reportes/asistencia).
- **Criterio de éxito:** Todos los intentos devuelven HTTP 403.

#### CS-05: Variables de entorno sensibles no expuestas en el bundle de producción
- **Objetivo:** Verificar que la `SUPABASE_SERVICE_ROLE_KEY` y el `WHATSAPP_TOKEN` no son visibles en el código JavaScript del frontend servido al navegador.
- **Método:** Ejecutar build de producción del frontend (`npm run build`). Ejecutar `grep -rn "service_role\|eyJ" .next/static/` buscando patrones de JWT o keys.
- **Criterio de éxito:** El grep no devuelve ningún valor que coincida con las keys reales de producción.

---

### 6.4 Casos de prueba de rendimiento

#### CR-01: Tiempo de respuesta de la API bajo carga sostenida
- **Objetivo:** Verificar que la API responde con p95 < 1 s bajo 50 usuarios concurrentes durante 1 minuto.
- **Herramienta:** k6.
- **Configuración:** 50 VUs (virtual users), duración 60 segundos. Endpoints: GET /reservas/slots, POST /reservas, GET /citas.
- **Criterio de éxito:** p95 < 1000 ms. p99 < 2000 ms. Tasa de errores < 1%.

#### CR-02: Concurrencia en reservas del mismo slot — verificación de lock
- **Objetivo:** Verificar que cuando 10 solicitudes concurrentes intentan reservar el mismo slot, exactamente 1 tiene éxito y 9 reciben HTTP 409.
- **Herramienta:** Script de k6 o Vitest con Promises paralelos contra el entorno local.
- **Configuración:** 10 solicitudes simultáneas al mismo `profesional_id + slot`.
- **Criterio de éxito:** Exactamente 1 cita creada en BD. 9 respuestas HTTP 409. Sin duplicados en la tabla `citas`.

#### CR-03: Envío masivo de recordatorios — cron con 50 citas
- **Objetivo:** Verificar que el cron puede procesar 50 recordatorios en menos de 30 segundos sin agotar la cuota de la API de WhatsApp ni dejar registros en estado inconsistente.
- **Método:** Insertar 50 citas con `recordatorio_enviado = false` en el entorno demo. Mockear la API de WhatsApp para responder en 200 ms. Ejecutar GET /cron/recordatorios y medir el tiempo total.
- **Criterio de éxito:** Tiempo total < 30 s. 50 registros en `mensajes_whatsapp` con estado `enviado`. 50 citas con `recordatorio_enviado = true`.

---

## 7. Criterios de aceptación del proyecto

### 7.1 Definición de Done (DoD)

Una funcionalidad de la App 01 está terminada solo si cumple todos estos puntos:

- [ ] Cumple los criterios de aceptación del requerimiento funcional correspondiente (sección 3 de este documento).
- [ ] Tiene pruebas unitarias de su lógica de dominio: cobertura ≥ 80% en los módulos `src/domain/` y `src/services/` (Vitest).
- [ ] Si toca la base de datos: incluye migración SQL en `database/migrations/` y al menos una prueba pgTAP de aislamiento por `empresa_id` en `database/tests/rls_agenda.test.sql`.
- [ ] `npm run typecheck` sin errores TypeScript en backend y frontend.
- [ ] `npm test` en verde (todos los tests de Vitest pasan).
- [ ] `npm run build` en verde en backend y frontend.
- [ ] La página pública funciona correctamente en viewport de 360 px (probado en Chrome DevTools).
- [ ] Los mensajes de error al usuario están en español claro, sin tecnicismos.
- [ ] La documentación fue actualizada (`docs/04-api.md` para nuevos endpoints, manual si aplica).
- [ ] El código fue revisado y aprobado por al menos otra persona del equipo.
- [ ] El checklist de seguridad de la GUIA-DESARROLLO (sección 11) fue revisado y todos los puntos aplican.

### 7.2 Criterios de aceptación del cliente

El cliente puede verificar los siguientes puntos en la demo antes de aprobar la entrega:

- [ ] El cliente puede acceder al panel de administración con su correo y contraseña.
- [ ] El cliente puede configurar al menos un profesional, un servicio y un horario de atención sin asistencia técnica.
- [ ] El cliente puede compartir el enlace de reservas con un paciente real y este puede completar la reserva desde el celular en menos de 2 minutos.
- [ ] El paciente recibe el WhatsApp de confirmación en menos de 1 minuto después de confirmar la reserva.
- [ ] El paciente recibe el WhatsApp de recordatorio 24 horas antes de su cita (demostrado en ambiente de prueba con una cita de corto plazo).
- [ ] Al responder "1" al recordatorio, el estado de la cita cambia a "confirmada" en el panel sin intervención manual.
- [ ] El profesional puede ver su agenda del día desde el panel y marcar asistencia.
- [ ] El cliente puede exportar el reporte mensual a CSV y abrirlo en Excel sin problemas de formato.
- [ ] Si el cliente intenta reservar el mismo slot dos veces, la segunda reserva es rechazada con un mensaje claro.
- [ ] El cliente puede bloquear un día festivo y verificar que no aparecen slots en ese día en la página pública.

---

## 8. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| La plantilla de WhatsApp de confirmación o recordatorio es rechazada por Meta durante la revisión. | Media | Alto — el sistema no puede enviar mensajes sin plantillas aprobadas. | Preparar el texto de la plantilla con antelación (mínimo 2 semanas antes del primer cliente). Tener una versión de respaldo del texto. Activar correo transaccional (Resend) como notificación alternativa mientras se resuelve. |
| Race condition en la reserva de slots: dos pacientes reservan el mismo slot simultáneamente y ambos reciben confirmación. | Media | Alto — genera experiencia de cliente muy negativa y requiere gestión manual. | `SELECT ... FOR UPDATE` dentro de una transacción PostgreSQL (ADR-01). Prueba de concurrencia obligatoria (CP-41, CR-02) antes de ir a producción. |
| El número de mensajes de WhatsApp enviados excede el paquete contratado y la cuenta es suspendida por Meta. | Baja | Alto — la funcionalidad principal queda inoperativa. | Alerta al 80% del paquete (RF-09). Documentar el proceso de ampliación del paquete. Registro detallado de cada envío para auditar el consumo. |
| El cron de Vercel falla silenciosamente y los recordatorios no se envían durante horas o días. | Media | Medio — los pacientes no reciben recordatorio pero la cita sigue en pie. | Monitoreo de logs de Vercel activado. Alertas por correo si el cron no completa en el tiempo esperado. Verificación manual periódica del `recordatorio_enviado` como KPI. |
| Un cliente con muchas citas simultáneas genera latencia superior a 1 segundo en la API de slots durante la reserva pública. | Baja | Medio — experiencia degradada en la página pública. | Índices en columnas de consulta frecuente (`profesional_id`, `inicio`, `empresa_id`). Prueba de carga (CR-01) antes de desplegar con el primer cliente. Caché de disponibilidad si se necesita. |
| La URL pública de reservas es indexada por bots y recibe tráfico automatizado que dispara el rate limit para pacientes legítimos. | Media | Medio — pacientes reales son bloqueados erróneamente. | Ajustar los límites del rate limit según el tráfico real observado en las primeras semanas. Considerar CAPTCHA invisible si el abuso continúa. |
| El paciente tiene un número de WhatsApp de otro país (fuera de Perú) y el formato del teléfono falla en la API de Meta. | Media | Bajo — falla solo el envío de WhatsApp, no la reserva. | Validar el formato del número con el estándar E.164 antes de llamar a Meta. Registrar el error en `mensajes_whatsapp` con estado `fallido` y continuar. |

---

## 9. Dependencias externas

| Dependencia | Proveedor | SLA | Alternativa si falla |
|---|---|---|---|
| WhatsApp Business Cloud API | Meta (Facebook Inc.) | 99.9% (según documentación de Meta para la Graph API) | Correo transaccional vía Resend: enviar los datos de la cita por correo al email del paciente si está disponible. La operación de reserva no falla — solo el canal de notificación. |
| Supabase (PostgreSQL + Auth + RLS) | Supabase Inc. | 99.9% (plan Pro) | Sin alternativa automática en el MVP. Ante caída prolongada: activar modo de solo lectura en el frontend y mostrar mensaje de mantenimiento. Restaurar desde último backup automático de Supabase. |
| Vercel (hosting API + frontend + Cron Jobs) | Vercel Inc. | 99.99% | Sin alternativa automática en el MVP. Ante caída: comunicar al cliente. Vercel tiene rollback automático a la versión anterior. |
| Resend (correo transaccional) | Resend Inc. | 99.9% | Si falla el envío de la alerta de consumo (RF-09), el sistema lo registra en logs y no reintenta en el mismo ciclo. No bloquea ninguna operación crítica. |
| GitHub Actions (CI/CD) | GitHub Inc. | 99.9% | Los despliegues pueden hacerse manualmente con `vercel deploy --prod` desde la máquina del líder técnico. Las pruebas se pueden correr localmente antes del despliegue manual. |

---

## 10. Historial de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 2026-10-28 | NovaTech BA | Versión inicial del SRST con 9 RF detallados, 10 RNF con métricas, 4 RN con implementación sugerida, 45 casos de prueba (funcionales, borde, negativo, seguridad y rendimiento), matriz de trazabilidad completa y criterios de aceptación del cliente. |
