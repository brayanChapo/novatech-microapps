# Backend · Control de pensiones y cuotas (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/cronogramas/generar` | Crear cuotas para el padrón |
| GET | `/estado-cuenta/:token` | Vista pública del responsable |
| POST | `/estado-cuenta/:token/pagos` | Subir voucher |
| PATCH | `/pagos/:id/validar` | Validar/rechazar |
| GET | `/reportes/morosidad` | Morosidad |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- WhatsApp Cloud API
- Supabase Storage (vouchers)

## Pruebas unitarias mínimas (antes del primer cliente)

- Generación de cronograma sin duplicados
- Cálculo de mora fijo y porcentual
- Estados pendiente/parcial/pagada
- Token de enlace (hash, caducidad)
- Regla de máximo 2 recordatorios
