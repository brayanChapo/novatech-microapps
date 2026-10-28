# Costos de Infraestructura — Órdenes de Taller

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Órdenes de Taller usa la plataforma compartida (Vercel + Supabase Pro compartido), WhatsApp Business Cloud API para notificar al cliente el cambio de estado de su vehículo/equipo en reparación, y Resend para enviar la orden de trabajo firmada. Es una app orientada a talleres mecánicos, electrónicos y de servicio técnico peruanos. Con 1 cliente (taller con ~80 órdenes/mes), el costo mensual para NovaTech es aproximadamente US$9 (S/33.75), con margen del 92%.

## Servicios de infraestructura

### Plataforma compartida (costo prorrateado)

| Servicio | Plan | Costo total plataforma | Prorrateo por app (15 apps) |
|---|---|---|---|
| Vercel Team Pro | Pro (1 asiento) | US$20/mes | US$1.33/mes |
| Supabase Pro | Pro compartido | US$25/mes | US$1.67/mes |
| **Subtotal infraestructura base** | | | **≈ US$3/mes** |

### Servicios adicionales de esta app

| Servicio | Uso estimado | Costo unitario | Costo mensual estimado |
|---|---|---|---|
| WhatsApp Business Cloud API | ~160 conversaciones/mes (1 cliente, 80 órdenes × ~2 notificaciones de estado clave) | US$0.04/conversación | US$6.40/mes |
| Resend (correo transaccional) | ~160 emails/mes (orden recibida + orden lista para recoger) | Gratis hasta 3,000 | US$0/mes |

> Cada orden genera ~2 mensajes WA relevantes: "ingresó al taller" y "listo para recoger". Estados intermedios (en diagnóstico, en reparación) se pueden activar opcionalmente por el taller.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/300-400/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 160 | 160 | US$9.40 ≈ S/35.25 | S/350/mes | ~90% |
| Crecimiento | 5 | 800 | 800 | US$35 ≈ S/131.25 | S/1,750/mes | ~92% |
| Escala | 20 | 3,200 | 3,200 | US$131 ≈ S/491.25* | S/7,000/mes | ~93% |

> *A 20 clientes se superan los 3,000 emails/mes → Resend Pro US$20/mes. Precio mensualidad promedio S/350.

## Desglose técnico

### Vercel
- API: Proyecto `ordenes-taller-api` (Root Dir: `05-ordenes-taller/backend`)
- Web: Proyecto `ordenes-taller-web` (Root Dir: `05-ordenes-taller/frontend`)
- Functions: Vercel Serverless Function disparada por webhook de Supabase (cambio de estado en `ordenes`) para enviar notificación WA/email inmediata — no requiere cron, es event-driven
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `ordenes_taller` dentro del proyecto compartido
- Tablas principales: `talleres`, `clientes`, `vehiculos`, `ordenes`, `items_orden`, `estados_orden`, `tecnicos`, `notificaciones_log`
- Storage: Sí — bucket `evidencias-taller` para fotos del estado del vehículo/equipo al ingreso y al cierre (evidencia visual para disputas)
- Realtime: Sí — canal `ordenes` para actualización instantánea del tablero Kanban de órdenes que ve el técnico y el recepcionista en tiempo real
- RPC / pg_cron: No aplica activamente — los triggers de notificación son event-driven vía Supabase Database Webhooks

### WhatsApp Business Cloud API
- Tipo de mensajes: Business-Initiated (notificaciones de estado de orden)
- Templates registrados: `orden_recibida` (estado: ingresado), `orden_lista` (estado: listo para recoger), `orden_entregada` (confirmación de entrega)
- Variables: {{nombre_cliente}}, {{numero_orden}}, {{descripcion_trabajo}}, {{monto_total}}
- Integración: Supabase Database Webhook → Vercel Function → Graph API Meta

### Resend
- Uso: email con detalle de la orden al ingreso (para el cliente) y comprobante PDF al momento de recoger
- Volumen por cliente: ~160 emails/mes
- Umbral de upgrade: a partir de ~18 clientes

## Recomendaciones

1. Usar Supabase Database Webhooks (no cron jobs) para las notificaciones — disparar en tiempo real ante el cambio de estado es mejor UX para el cliente del taller que esperar un batch nocturno.
2. El bucket `evidencias-taller` puede crecer rápido; definir política de retención de 6 meses para fotos antiguas. Supabase Pro incluye 100 GB de Storage, suficiente hasta ~50 talleres.
3. Ofrecer como feature premium la opción de activar los estados intermedios en WhatsApp (en diagnóstico, esperando repuesto, en reparación) — esto aumenta el valor percibido sin aumentar costos fijos de infraestructura.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + RDS | US$50–80/mes | Overhead de operaciones innecesario; Supabase Webhooks reemplaza Lambda + SQS para este caso de uso |
| Firebase (Firestore + Hosting) | US$10–25/mes | Realtime de Supabase es equivalente para este caso; PostgreSQL permite queries complejas de historial de órdenes que Firestore no maneja bien |
| Railway | US$10–20/mes | Sin ventaja técnica clara frente al stack actual; rompería la consistencia del portafolio |
