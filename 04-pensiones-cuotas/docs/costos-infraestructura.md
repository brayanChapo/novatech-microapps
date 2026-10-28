# Costos de Infraestructura — Pensiones y Cuotas

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Pensiones y Cuotas usa la plataforma compartida (Vercel + Supabase Pro compartido), WhatsApp Business Cloud API para recordatorios de pago a padres/estudiantes, y Resend para comprobantes de pago. Es una app crítica para colegios e institutos peruanos: los volúmenes de WhatsApp son altos (muchos alumnos por institución). Con 1 cliente (colegio de ~500 alumnos), el costo mensual estimado para NovaTech es US$26 (S/97.50), con margen operativo del 73% sobre una mensualidad de S/400.

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
| WhatsApp Business Cloud API | ~575 conversaciones/mes (1 cliente, 500 alumnos, ~15% morosos reciben hasta 3 recordatorios escalonados) | US$0.04/conversación | US$23/mes |
| Resend (correo transaccional) | ~600 emails/mes (comprobante de pago a cada familia que paga) | Gratis hasta 3,000 | US$0/mes |

> Volumen WA: 500 alumnos × 15% = 75 morosos × 3 recordatorios promedio = 225 conversaciones. Más avisos generales de vencimiento próximo: 500 × 70% (sin pago aún en día -3) × 1 aviso = 350 conversaciones. Total ≈ 575/mes.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/400-450/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 575 | 600 | US$26 ≈ S/97.50 | S/425/mes | ~77% |
| Crecimiento | 5 | 2,875 | 3,000 | US$118 ≈ S/442.50 | S/2,125/mes | ~79% |
| Escala | 20 | 11,500 | 12,000 | US$483 ≈ S/1,811.25* | S/8,500/mes | ~79% |

> *A 5 clientes se superan los 3,000 emails/mes → Resend Pro US$20/mes. A 20 clientes el costo WA es dominante. Considerar precio de mensualidad S/425 promedio.

## Desglose técnico

### Vercel
- API: Proyecto `pensiones-cuotas-api` (Root Dir: `04-pensiones-cuotas/backend`)
- Web: Proyecto `pensiones-cuotas-web` (Root Dir: `04-pensiones-cuotas/frontend`)
- Functions: Vercel Cron en tres momentos: día -5 antes del vencimiento (aviso próximo), día 0 (último aviso), día +3/+7/+15 (escalonado para morosos)
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes, crons ilimitados

### Supabase
- Esquema: `pensiones_cuotas` dentro del proyecto compartido
- Tablas principales: `instituciones`, `estudiantes`, `apoderados`, `cuotas`, `pagos`, `recordatorios_log`, `planes_pago`
- Storage: Sí — bucket `comprobantes-pago` para PDFs de recibos generados por cada pago registrado
- Realtime: Sí — canal `pagos` para que el cajero del colegio vea en tiempo real los pagos confirmados durante el día
- RPC / pg_cron: `pg_cron` para calcular automáticamente mora diaria sobre cuotas vencidas y actualizar estado de deuda de cada alumno

### WhatsApp Business Cloud API
- Tipo de mensajes: Business-Initiated (recordatorios de pago programados)
- Templates registrados: `aviso_vencimiento_proximo` (día -5), `vencimiento_hoy` (día 0), `cuota_vencida` (días +3, +7, +15)
- Variable principal: {{nombre_apoderado}}, {{alumno}}, {{monto}}, {{fecha_vencimiento}}, {{enlace_pago}}
- Integración: Vercel Serverless Functions por cada cron, consumiendo Graph API de Meta con número del apoderado

### Resend
- Uso: comprobante de pago enviado inmediatamente tras confirmar el pago, más reporte mensual de estado de cuenta a cada apoderado
- Volumen por cliente: ~600 emails/mes
- Umbral de upgrade: a partir de 5 clientes (3,000 emails/mes) → Plan Pro US$20/mes

## Recomendaciones

1. Segmentar los recordatorios WA por tipo de deuda (cuota regular vs. mora) para reducir el volumen total; muchos pagos ocurren tras el primer recordatorio, evitando los siguientes — esto puede reducir el costo WA hasta en 30%.
2. Ofrecer al cliente (institución) un panel de configuración para que defina ellos mismos cuántos recordatorios enviar y en qué días — esto diferencia el producto y reduce costos en colegios más disciplinados con sus cobros.
3. A partir de 10 clientes grandes (500+ alumnos cada uno), evaluar negociación de volume pricing con Meta para Perú; el volumen mensual supera 5,000 conversaciones, rango donde puede aplicar descuento.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + RDS | US$70–100/mes | Costo base desproporcionado; la complejidad de ops no se justifica cuando Vercel + Supabase cubren el caso |
| Firebase (Firestore + Hosting) | US$20–50/mes | Queries de mora y cálculos de interés son complejos; SQL (PostgreSQL + pg_cron) es superior para este dominio financiero |
| Railway | US$15–30/mes | Sin RLS multi-tenant nativo; cambiaría el stack del portafolio sin beneficio claro |
