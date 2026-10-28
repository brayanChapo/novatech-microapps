# Backend · Mesa de ayuda interna (tickets) (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/tickets` | Crear |
| PATCH | `/tickets/:id` | Estado/asignación |
| POST | `/tickets/:id/comentarios` | Comentar |
| GET | `/indicadores` | SLA y tiempos |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- Correo
- Supabase Storage (adjuntos)

## Pruebas unitarias mínimas (antes del primer cliente)

- Cálculo de SLA con pausas
- Cierre automático a los 3 días
- Numeración correlativa
- Comentarios internos ocultos al solicitante
