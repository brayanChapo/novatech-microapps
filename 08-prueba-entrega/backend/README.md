# Backend · Prueba de entrega (foto, firma, GPS) (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/entregas/importar` | CSV del día |
| GET | `/mis-entregas?fecha` | Lista del repartidor |
| POST | `/sync/evidencias` | Subir evidencias |
| GET | `/entregas/:numero` | Consulta de evidencia |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- Supabase Storage

## Pruebas unitarias mínimas (antes del primer cliente)

- Obligatoriedad de foto/firma/GPS
- Idempotencia de sincronización
- Inmutabilidad de evidencia
- Importación CSV con errores de formato
