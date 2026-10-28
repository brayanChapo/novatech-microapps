# Backend · Orden de trabajo con estado por WhatsApp (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/ordenes` | Abrir orden |
| PATCH | `/ordenes/:id/estado` | Cambiar estado (+WhatsApp) |
| GET | `/ordenes/:id/presupuesto.pdf` | PDF |
| POST | `/publico/presupuestos/:token/aprobar` | Aprobación del cliente |
| GET | `/vehiculos/:placa/historial` | Historial |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- WhatsApp Cloud API
- Generación de PDF
- Supabase Storage

## Pruebas unitarias mínimas (antes del primer cliente)

- Máquina de estados (transiciones válidas e inválidas)
- Totales del presupuesto con IGV
- Validación de placa
- Numeración correlativa por empresa
