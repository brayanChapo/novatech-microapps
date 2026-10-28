# Backend · Agenda de citas + recordatorios WhatsApp (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| GET | `/publico/:empresa/disponibilidad` | Horarios libres por servicio y fecha |
| POST | `/publico/:empresa/citas` | Reservar (sin cuenta) |
| GET | `/citas?fecha&profesional_id` | Agenda |
| PATCH | `/citas/:id` | Reprogramar / cancelar / asistencia |
| POST | `/webhooks/whatsapp` | Respuestas y estados de Meta |
| GET | `/reportes/inasistencias.csv` | Reporte |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- WhatsApp Business Cloud API (plantillas de utilidad, webhook)
- Correo transaccional (Resend)

## Pruebas unitarias mínimas (antes del primer cliente)

- Cálculo de bloques libres con citas y bloqueos
- No solapamiento de citas (incluida concurrencia)
- Hora del recordatorio (24 h / 2 h)
- Procesamiento de respuesta del paciente vía webhook
- Verificación de firma del webhook de Meta
