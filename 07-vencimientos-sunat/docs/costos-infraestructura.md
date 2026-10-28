# Costos de Infraestructura — Vencimientos SUNAT

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Vencimientos SUNAT usa la plataforma compartida (Vercel + Supabase Pro compartido), WhatsApp Business Cloud API para alertas de vencimiento tributario, y Resend para enviar el calendario tributario mensual. Es una app de alto valor percibido para PyMEs peruanas con obligaciones tributarias. Los costos de WhatsApp son moderados porque los recordatorios son periódicos (no por evento). Con 1 cliente, el costo mensual para NovaTech es US$6 (S/22.50), con margen del 94%.

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
| WhatsApp Business Cloud API | ~75 conversaciones/mes (1 cliente con ~5 usuarios clave, ~15 vencimientos tributarios/mes, aviso 3 días antes) | US$0.04/conversación | US$3/mes |
| Resend (correo transaccional) | ~100 emails/mes (calendario tributario mensual + alertas de vencimientos críticos) | Gratis hasta 3,000 | US$0/mes |

> Perú tiene entre 10–20 vencimientos tributarios mensuales relevantes (IGV, PLAME, IR, PDT, etc.). Con 5 usuarios por empresa que reciben alertas 3 días antes: 15 vencimientos × 5 usuarios = 75 conversaciones WA/mes por cliente.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/300-400/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 75 | 100 | US$6 ≈ S/22.50 | S/350/mes | ~94% |
| Crecimiento | 5 | 375 | 500 | US$18 ≈ S/67.50 | S/1,750/mes | ~96% |
| Escala | 20 | 1,500 | 2,000 | US$63 ≈ S/236.25 | S/7,000/mes | ~97% |

> A 20 clientes con 2,000 emails/mes aún dentro del plan gratuito de Resend (3,000/mes). Margen excelente en todos los escenarios.

## Desglose técnico

### Vercel
- API: Proyecto `vencimientos-sunat-api` (Root Dir: `07-vencimientos-sunat/backend`)
- Web: Proyecto `vencimientos-sunat-web` (Root Dir: `07-vencimientos-sunat/frontend`)
- Functions: Vercel Cron diario a las 08:00 PET que revisa el calendario tributario y dispara alertas WA/email para vencimientos en los próximos 3 días. Cron adicional el día 1 de cada mes para enviar el calendario completo del mes.
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, crons ilimitados

### Supabase
- Esquema: `vencimientos_sunat` dentro del proyecto compartido
- Tablas principales: `empresas`, `usuarios_empresa`, `regimenes_tributarios`, `calendario_tributario`, `vencimientos_empresa`, `alertas_enviadas`, `configuracion_alertas`
- Storage: No aplica
- Realtime: No aplica — los datos tributarios son periódicos, no requieren tiempo real
- RPC / pg_cron: `pg_cron` para actualizar anualmente el calendario tributario con las fechas oficiales publicadas por SUNAT (script de carga manual + verificación automática de que las fechas estén cargadas antes del inicio de cada mes)

### WhatsApp Business Cloud API
- Tipo de mensajes: Business-Initiated (alertas tributarias programadas)
- Templates registrados: `alerta_vencimiento_sunat` con variables {{nombre_empresa}}, {{nombre_obligacion}}, {{fecha_vencimiento}}, {{dias_restantes}}, {{enlace_detalle}}
- Volumen estimado: moderado y predecible (calendario fijo, no depende de comportamiento del cliente final)
- Integración: Vercel Cron → Serverless Function → Graph API Meta

### Resend
- Uso: calendario tributario mensual (primer día del mes), alertas de vencimientos próximos para usuarios con email configurado
- Volumen por cliente: ~100 emails/mes
- Umbral de upgrade: a partir de 30 clientes (bien lejano, no es preocupación en el horizonte actual)

## Recomendaciones

1. El calendario tributario SUNAT cambia cada año; crear un proceso de actualización anual en diciembre que cargue las fechas del año siguiente — considerar un pequeño scraper o carga manual verificada desde el PDF oficial de SUNAT. Este proceso no tiene costo de infraestructura adicional.
2. Permitir configuración por empresa de qué tipos de obligaciones recibir (solo IGV, solo PLAME, etc.) reduce el volumen de mensajes WA innecesarios y mejora la experiencia del usuario.
3. Esta app tiene uno de los mejores márgenes del portafolio porque los costos son muy bajos y el valor percibido (evitar multas SUNAT) es muy alto. Considerar precio de venta en el rango alto (S/400–S/450/mes).

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS Lambda + EventBridge | US$1–5/mes | Técnicamente viable y barato, pero rompería la arquitectura compartida; el cron de Vercel es suficiente y está dentro del plan ya pagado |
| Firebase (Cloud Functions + Firestore) | US$5–15/mes | No añade valor sobre el stack actual; Firestore innecesario para datos de calendario que son mayormente estáticos |
| Railway | US$10–15/mes | Sin ventaja técnica ni económica frente al stack actual |
