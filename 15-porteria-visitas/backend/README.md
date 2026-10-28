# Backend · Registro de visitas en portería con QR (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/visitas` | Pre-registro (residente) |
| POST | `/porteria/validar` | Validar QR |
| POST | `/porteria/visitas` | Visita manual + notificación |
| PATCH | `/visitas/:id/autorizar` | Respuesta del residente |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- Web Push (VAPID)
- WhatsApp opcional

## Pruebas unitarias mínimas (antes del primer cliente)

- QR de un solo uso y por fecha
- Flujo de autorización
- Permisos residente/portero
- Suscripción push
