# Backend · Asistencia por QR con aviso a padres (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/escaneos` | Registrar QR |
| GET | `/aulas/:id/carnets.pdf` | Carnets |
| POST | `/tareas/avisos-inasistencia` | Cron a la hora de corte |
| GET | `/reportes/asistencia` | Reporte |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- WhatsApp Cloud API
- Generación de PDF
- Tarea programada

## Pruebas unitarias mínimas (antes del primer cliente)

- Firma y verificación del token QR
- Puntual vs. tardanza
- Detección de inasistencias a la hora de corte
- Un aviso por alumno/día y no en días no lectivos
