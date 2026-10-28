# 06 · Plan de pruebas — Toma de pedidos en ruta + cobranzas

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Cálculo de total con lista de precios del cliente | Vitest |
| U-02 | Idempotencia de sincronización (mismo lote dos veces) | Vitest |
| U-03 | Saldo y antigüedad de deuda | Vitest |
| U-04 | Cobro mayor a la deuda rechazado | Vitest |
| U-05 | Regla de recordatorio semanal | Vitest |
| U-06 | Aislamiento entre empresas (RLS) | pgTAP |
| U-07 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Catálogo de productos con stock referencial y foto | Búsqueda por nombre o código en < 1 s | ☐ |
| P-02 | Listas de precios por tipo de cliente | El pedido usa la lista del cliente automáticamente | ☐ |
| P-03 | Cartera de clientes por vendedor con ubicación | El vendedor solo ve su cartera | ☐ |
| P-04 | Tomar pedido sin internet y sincronizar al recuperar señal | Ningún pedido se pierde ni se duplica (id generado en el celular) | ☐ |
| P-05 | Registrar visita con GPS (con o sin pedido) | Motivo de no compra obligatorio si no hay pedido | ☐ |
| P-06 | Envío del pedido al almacén y estados (recibido, despachado) | El vendedor ve el estado | ☐ |
| P-07 | Cuentas por cobrar por cliente con antigüedad de deuda | Saldo = pedidos a crédito − cobros | ☐ |
| P-08 | Registrar cobro con foto del voucher | Cobro queda pendiente de validación por admin | ☐ |
| P-09 | Recordatorio de deuda por WhatsApp | Solo deudas vencidas; respeta el paquete del plan | ☐ |
| P-10 | Tablero de ventas por vendedor y día | Totales coinciden con pedidos | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-10 aprobadas, 0 defectos críticos.
