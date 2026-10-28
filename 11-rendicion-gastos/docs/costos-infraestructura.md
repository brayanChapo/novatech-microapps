# Costos de Infraestructura — Rendición de Gastos

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Rendición de Gastos usa la plataforma compartida (Vercel + Supabase Pro compartido) y Resend para notificaciones de aprobación/rechazo y reportes contables. No usa WhatsApp ni app móvil nativa. Es una app de administración interna orientada a empresas con equipos de ventas, logística o proyectos que rinden gastos en campo. Con 1 cliente, el costo mensual para NovaTech es US$3 (S/11.25), con margen del 97%.

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
| Resend (correo transaccional) | ~250 emails/mes (notificaciones de rendición aprobada/rechazada + reporte mensual contable) | Gratis hasta 3,000 | US$0/mes |

> No usa WhatsApp. Las notificaciones de aprobación van por email. Para empresas con trabajadores sin email corporativo se puede añadir WA en v2.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/300-400/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 0 | 250 | US$3 ≈ S/11.25 | S/350/mes | ~97% |
| Crecimiento | 5 | 0 | 1,250 | US$3 ≈ S/11.25 | S/1,750/mes | ~99% |
| Escala | 20 | 0 | 5,000 | US$23 ≈ S/86.25* | S/7,000/mes | ~99% |

> *A 12 clientes se superan 3,000 emails/mes → Resend Pro US$20/mes.

## Desglose técnico

### Vercel
- API: Proyecto `rendicion-gastos-api` (Root Dir: `11-rendicion-gastos/backend`)
- Web: Proyecto `rendicion-gastos-web` (Root Dir: `11-rendicion-gastos/frontend`)
- Functions: Vercel Serverless Function para generación de reporte de rendición en PDF al momento de aprobación final. Cron mensual para exportar resumen contable a Excel/CSV para contabilidad.
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `rendicion_gastos` dentro del proyecto compartido
- Tablas principales: `empresas`, `empleados`, `centros_costo`, `anticipos`, `gastos`, `comprobantes`, `rendiciones`, `aprobaciones`, `categorias_gasto`
- Storage: Sí — bucket `comprobantes-gasto` para fotos de boletas/facturas (el componente de mayor crecimiento de esta app — cada gasto puede tener 1-3 fotos de comprobante)
- Realtime: Sí — canal `rendiciones` para que el aprobador vea en tiempo real cuando un colaborador envía una rendición pendiente de revisión
- RPC / pg_cron: `pg_cron` para calcular el saldo de anticipo pendiente por colaborador al cierre de cada quincena y generar alerta si hay anticipos sin rendir por más de 30 días

### Resend
- Uso: notificación al aprobador de rendición pendiente, notificación al colaborador de aprobación/rechazo con comentarios, reporte mensual consolidado a contabilidad
- Volumen por cliente: ~250 emails/mes
- Umbral de upgrade: a partir de 12 clientes

## Recomendaciones

1. El bucket `comprobantes-gasto` es el de mayor crecimiento en Storage — implementar compresión automática en el frontend (máximo 500KB por foto) y política de retención de 5 años (plazo mínimo para auditoría tributaria SUNAT en Perú).
2. Agregar integración por webhook o API con sistemas contables peruanos (Concar, Defcon, o simplemente exportación a Excel/CSV) como diferenciador del producto — no tiene costo adicional de infraestructura, solo desarrollo.
3. Considerar agregar WhatsApp en v2 para notificaciones a colaboradores en campo sin email corporativo; el costo sería ~US$2–3/mes por cliente adicionales y aumentaría significativamente la adopción de la app.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + S3 + RDS | US$60–90/mes | Costo desproporcionado; S3 para fotos de comprobantes sería más barato a escala, pero no se justifica en MVP |
| Firebase (Firestore + Storage) | US$10–25/mes | Storage de Firebase es comparable, pero las queries de auditoría contable y reportes con filtros complejos son mucho más eficientes en PostgreSQL |
| SAP Concur / Rindegastos | US$5–15/usuario/mes | Soluciones verticales costosas para el mercado PyME peruano; NovaTech ofrece precio competitivo con personalización |
