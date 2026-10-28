# 08 · Manual de usuario (borrador) — Toma de pedidos en ruta + cobranzas

> Borrador basado en los requerimientos. Completar con capturas de pantalla al terminar la construcción, usando como modelo el [manual de la app 03](../../03-asistencia-rrhh/docs/08-manual-usuario.md).

## Para qué sirve

Que los vendedores tomen pedidos en ruta (incluso sin señal) con precios correctos y que el dueño controle las cuentas por cobrar.

## Quién la usa

### Admin

Catálogo, listas de precios, clientes, vendedores, reportes.

### Vendedor

Toma pedidos y registra cobros en ruta (app).

### Almacen

Recibe pedidos y los despacha.

## Funciones

1. **Catálogo de productos con stock referencial y foto.** Búsqueda por nombre o código en < 1 s.
2. **Listas de precios por tipo de cliente.** El pedido usa la lista del cliente automáticamente.
3. **Cartera de clientes por vendedor con ubicación.** El vendedor solo ve su cartera.
4. **Tomar pedido sin internet y sincronizar al recuperar señal.** Ningún pedido se pierde ni se duplica (id generado en el celular)
5. **Registrar visita con GPS.** Motivo de no compra obligatorio si no hay pedido.
6. **Envío del pedido al almacén y estados.** El vendedor ve el estado.
7. **Cuentas por cobrar por cliente con antigüedad de deuda.** Saldo = pedidos a crédito − cobros.
8. **Registrar cobro con foto del voucher.** Cobro queda pendiente de validación por admin.
9. **Recordatorio de deuda por WhatsApp.** Solo deudas vencidas; respeta el paquete del plan.
10. **Tablero de ventas por vendedor y día.** Totales coinciden con pedidos.

## Ingreso

- Web: `https://pedidos-cobranzas.novatechconsulting.com.pe` con el correo y contraseña que entrega el administrador.
- Celular: app **Toma de pedidos en ruta + cobranzas** (enlace de instalación que envía la empresa).

## Soporte

WhatsApp NovaTech +51 924 678 727 · horario laboral.
