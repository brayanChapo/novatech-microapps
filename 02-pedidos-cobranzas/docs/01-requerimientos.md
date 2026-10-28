# 01 · Requerimientos — Toma de pedidos en ruta + cobranzas

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Que los vendedores tomen pedidos en ruta (incluso sin señal) con precios correctos y que el dueño controle las cuentas por cobrar.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Catálogo, listas de precios, clientes, vendedores, reportes |
| **vendedor** | Toma pedidos y registra cobros en ruta (app) |
| **almacen** | Recibe pedidos y los despacha |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Catálogo de productos con stock referencial y foto | Alta | Búsqueda por nombre o código en < 1 s |
| RF-02 | Listas de precios por tipo de cliente | Alta | El pedido usa la lista del cliente automáticamente |
| RF-03 | Cartera de clientes por vendedor con ubicación | Alta | El vendedor solo ve su cartera |
| RF-04 | Tomar pedido sin internet y sincronizar al recuperar señal | Alta | Ningún pedido se pierde ni se duplica (id generado en el celular) |
| RF-05 | Registrar visita con GPS (con o sin pedido) | Media | Motivo de no compra obligatorio si no hay pedido |
| RF-06 | Envío del pedido al almacén y estados (recibido, despachado) | Alta | El vendedor ve el estado |
| RF-07 | Cuentas por cobrar por cliente con antigüedad de deuda | Alta | Saldo = pedidos a crédito − cobros |
| RF-08 | Registrar cobro con foto del voucher | Alta | Cobro queda pendiente de validación por admin |
| RF-09 | Recordatorio de deuda por WhatsApp | Media | Solo deudas vencidas; respeta el paquete del plan |
| RF-10 | Tablero de ventas por vendedor y día | Alta | Totales coinciden con pedidos |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | El precio se congela en el pedido al momento de tomarlo. |
| RN-02 | El id del pedido lo genera el celular (UUID) para que la sincronización sea idempotente. |
| RN-03 | Un cobro no puede superar la deuda pendiente del cliente. |
| RN-04 | Los recordatorios solo se envían a deudas vencidas y como máximo 1 vez por semana por cliente. |

## Requerimientos no funcionales

| ID | Categoría | Requerimiento |
|---|---|---|
| RNF-01 | Seguridad | Aislamiento entre empresas con RLS + filtro `empresa_id` en backend; pruebas pgTAP. |
| RNF-02 | Seguridad | Clientes sin permisos de escritura directa; validación Zod en todas las entradas. |
| RNF-03 | Usabilidad | Interfaz en español, responsive desde 360 px, acciones principales en ≤ 3 toques. |
| RNF-04 | Rendimiento | Respuestas de API p95 < 1 s; páginas < 2 s en 4G. |
| RNF-05 | Mantenibilidad | TypeScript estricto; cobertura ≥ 80 % en dominio y servicios. |
| RNF-06 | Costos | Usar solo la plataforma compartida (Vercel + Supabase); servicios de pago adicionales requieren aprobación. |
| RNF-07 | Legal | Ley 29733: finalidad informada y encargo de tratamiento con el cliente. |
| RNF-08 | Específico | Funciona sin conexión hasta 8 h con hasta 200 pedidos en cola. |
| RNF-09 | Específico | Sincronización en < 10 s al recuperar señal. |
| RNF-10 | Específico | Conflictos de stock se resuelven en el servidor (el almacén confirma). |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
