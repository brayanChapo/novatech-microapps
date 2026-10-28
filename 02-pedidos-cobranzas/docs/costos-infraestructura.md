# Costos de Infraestructura — Pedidos y Cobranzas

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Pedidos y Cobranzas usa la plataforma compartida (Vercel + Supabase Pro compartido), WhatsApp Business Cloud API para recordatorios de deuda, Resend para confirmaciones de pedido y recibos, y Expo EAS para el build de la app móvil nativa. Con un cliente activo, el costo mensual para NovaTech es aproximadamente US$9 (S/33.75), frente a una mensualidad cobrada de S/350–S/450, lo que representa un margen superior al 90%.

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
| WhatsApp Business Cloud API | 150 conversaciones/mes (1 cliente, ~150 deudas vencidas) | US$0.04/conversación | US$6/mes |
| Resend (correo transaccional) | ~300 emails/mes (confirmación pedido + recibo) | Gratis hasta 3,000 | US$0/mes |
| Expo EAS | Builds en desarrollo (plan gratuito, 30 builds/mes) | US$0 | US$0/mes |

> Nota: EAS gratuito suficiente en fase MVP. En producción con actualizaciones frecuentes se evalúa EAS Production (US$99/mes) pero no es necesario hasta tener 10+ clientes.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/350-450/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 150 | 300 | US$9 ≈ S/33.75 | S/400/mes | ~92% |
| Crecimiento | 5 | 750 | 1,500 | US$33 ≈ S/123.75 | S/2,000/mes | ~94% |
| Escala | 20 | 3,000 | 6,000 | US$123 ≈ S/461.25 | S/8,000/mes | ~94% |

> Costo NovaTech = prorrateo base US$3 + (WA: clientes × 150 × US$0.04). Resend gratuito hasta ~10 clientes (3,000 emails/mes).

## Desglose técnico

### Vercel
- API: Proyecto `pedidos-cobranzas-api` (Root Dir: `02-pedidos-cobranzas/backend`)
- Web: Proyecto `pedidos-cobranzas-web` (Root Dir: `02-pedidos-cobranzas/frontend`)
- Functions: Vercel Cron diario a las 09:00 PET que identifica facturas vencidas y dispara recordatorios WA/email
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `pedidos_cobranzas` dentro del proyecto compartido
- Tablas principales: `clientes`, `productos`, `pedidos`, `items_pedido`, `facturas`, `pagos`, `recordatorios_log`
- Storage: Sí — bucket `facturas-pdf` para almacenar PDFs generados de facturas/boletas (acceso privado, signed URLs de corta duración)
- Realtime: Sí — canal `pedidos` para actualización en tiempo real del estado del pedido en el panel de despacho
- RPC / pg_cron: `pg_cron` para actualizar automáticamente el estado de facturas a `vencida` pasada la fecha de vencimiento

### WhatsApp Business Cloud API
- Tipo de mensajes: Business-Initiated (recordatorios de cobranza automatizados)
- Templates registrados: `recordatorio_deuda` con variables {{nombre_cliente}}, {{monto}}, {{fecha_vencimiento}}, {{enlace_pago}}
- Volumen estimado: ~150 mensajes/cliente/mes (deudas vencidas con 3 intentos de recordatorio escalonados: día 1, día 7, día 15)
- Integración: Vercel Serverless Function invocada por cron, consulta Supabase y llama Graph API de Meta

### Resend
- Uso: confirmación de pedido recibido, notificación de despacho, recibo de pago
- Volumen por cliente: ~300 emails/mes
- Umbral de upgrade: a partir de ~10 clientes (3,000 emails/mes); Plan Pro US$20/mes

### Expo EAS
- App: `pedidos-cobranzas-mobile` (repartidores y cobradores en campo)
- Canal de builds: plan gratuito (30 builds/mes) suficiente en MVP
- OTA updates: Expo Updates integrado, permite actualizar el JS bundle sin pasar por app stores
- Plataformas: Android (prioridad para PyMEs peruanas) + iOS

## Recomendaciones

1. Configurar cola de mensajes WA (tabla `recordatorio_queue` en Supabase) para reintentos automáticos ante fallo de la Graph API, evitando deudas sin recordatorio por error puntual de red.
2. Para el storage de facturas PDF, definir lifecycle policy en Supabase Storage para archivar PDFs mayores a 2 años, manteniendo el costo de almacenamiento bajo (Supabase Pro incluye 100 GB storage).
3. Evaluar EAS Production (US$99/mes) cuando se superen 10 clientes activos con la app móvil, para tener builds ilimitados y soporte prioritario de Expo.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + RDS | US$60–100/mes | Complejidad de gestión no justificada; ECS Fargate requeriría configuración de VPC, ALB y tareas, excesivo para este tamaño |
| Firebase (Firestore + Hosting) | US$15–40/mes | Vendor lock-in Google; queries complejas de cobranza son costosas en Firestore; RLS de Supabase más adecuado para multi-tenant |
| Railway | US$15–25/mes | Sin RLS nativo; stack diferente al portafolio; Expo/Supabase ya integrados en el stack estándar |
