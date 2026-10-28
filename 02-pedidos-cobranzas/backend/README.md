# Backend · Toma de pedidos en ruta + cobranzas (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| GET | `/sync/catalogo?desde` | Descarga incremental de productos, precios y clientes |
| POST | `/sync/pedidos` | Sube lote de pedidos (idempotente por id) |
| POST | `/cobros` | Registrar cobro con voucher |
| GET | `/cuentas-por-cobrar` | Saldos y antigüedad |
| PATCH | `/pedidos/:id/estado` | Almacén cambia estado |
| GET | `/dashboard/ventas?fecha` | Ventas por vendedor |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- WhatsApp Cloud API (recordatorio de deuda)
- Supabase Storage (fotos de productos y vouchers)

## Pruebas unitarias mínimas (antes del primer cliente)

- Cálculo de total con lista de precios del cliente
- Idempotencia de sincronización (mismo lote dos veces)
- Saldo y antigüedad de deuda
- Cobro mayor a la deuda rechazado
- Regla de recordatorio semanal
