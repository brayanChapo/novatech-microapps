# Costos de Infraestructura — Membresías de Gimnasio

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Membresías de Gimnasio usa exclusivamente la plataforma compartida (Vercel + Supabase Pro compartido) y Resend para recordatorios de renovación y comprobantes de pago. No usa WhatsApp ni app móvil nativa. Es una app de bajo costo operativo orientada a gimnasios, academias de deporte y centros fitness de PyMEs peruanas. Con 1 cliente, el costo mensual para NovaTech es US$3 (S/11.25), con margen del 97%.

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
| Resend (correo transaccional) | ~300 emails/mes (recordatorio de renovación 5 días antes + comprobante de pago) | Gratis hasta 3,000 | US$0/mes |

> Esta app no usa WhatsApp. Los recordatorios de renovación se envían por email. El acceso al gimnasio se valida con QR desde la app web del recepcionista.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/300-400/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 0 | 300 | US$3 ≈ S/11.25 | S/350/mes | ~97% |
| Crecimiento | 5 | 0 | 1,500 | US$3 ≈ S/11.25 | S/1,750/mes | ~99% |
| Escala | 20 | 0 | 6,000 | US$23 ≈ S/86.25* | S/7,000/mes | ~99% |

> *A 10 clientes se superan 3,000 emails/mes → Resend Pro US$20/mes. Precio promedio S/350/mes.

## Desglose técnico

### Vercel
- API: Proyecto `membresias-gimnasio-api` (Root Dir: `10-membresias-gimnasio/backend`)
- Web: Proyecto `membresias-gimnasio-web` (Root Dir: `10-membresias-gimnasio/frontend`)
- Functions: Vercel Cron diario a las 08:00 PET para enviar recordatorios de membresías que vencen en los próximos 5 días. Cron adicional para marcar automáticamente membresías vencidas.
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `membresias_gimnasio` dentro del proyecto compartido
- Tablas principales: `gimnasios`, `planes`, `miembros`, `membresias`, `pagos`, `accesos_log`, `clases`, `reservas_clase`
- Storage: Sí — bucket `fotos-miembros` para foto de perfil del miembro (usada para verificación visual en el control de acceso)
- Realtime: Sí — canal `accesos_log` para que el recepcionista vea en tiempo real el escaneo QR de entrada de los miembros
- RPC / pg_cron: `pg_cron` para actualizar estado de membresías vencidas diariamente a las 00:00 PET y calcular estadísticas de asistencia por miembro al cierre de cada semana

### Resend
- Uso: recordatorio de renovación (5 días antes del vencimiento), comprobante de pago de membresía, bienvenida a nuevo miembro
- Volumen por cliente: ~300 emails/mes (asumiendo 150 miembros activos, 2 emails promedio al mes por miembro)
- Umbral de upgrade: a partir de 10 clientes

## Recomendaciones

1. Considerar agregar WhatsApp como canal adicional de recordatorio (opt-in) en una versión v2; el costo sería bajo (~30–50 conversaciones/mes por cliente) y el impacto en tasa de renovación puede ser alto para este tipo de negocio.
2. El bucket `fotos-miembros` crece proporcionalmente al número de miembros registrados — definir compresión a 200KB por foto al momento del upload desde el frontend para mantener el Storage bajo control.
3. Para gimnasios grandes (+500 miembros), el `accesos_log` puede tener alto volumen; implementar particionado por mes en Supabase a partir de 1 millón de registros.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + RDS | US$50–70/mes | Complejidad innecesaria para esta app; el costo marginal es 16x mayor sin beneficio técnico adicional |
| Firebase (Firestore + Hosting) | US$5–20/mes | Comparable en precio, pero inferior en capacidades de reporting y queries de membresías; PostgreSQL más natural para datos financieros |
| Mindbody / Reservio (SaaS vertical) | US$50–200/mes | Productos externos de gestión de gimnasios; NovaTech ofrece una solución propia más económica y personalizable para el mercado peruano |
