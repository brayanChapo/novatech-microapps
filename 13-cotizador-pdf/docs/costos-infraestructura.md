# Costos de Infraestructura — Cotizador PDF

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Cotizador PDF usa la plataforma compartida (Vercel + Supabase Pro compartido) y Resend para enviar las cotizaciones generadas directamente al cliente final. No usa WhatsApp ni app móvil nativa. Es una app de generación de cotizaciones profesionales orientada a empresas de servicios, distribuidores y contratistas peruanos. Con 1 cliente, el costo mensual para NovaTech es US$3 (S/11.25), con margen del 97%.

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
| Resend (correo transaccional) | ~200 emails/mes (cotización enviada al cliente + notificación de aceptación/rechazo) | Gratis hasta 3,000 | US$0/mes |

> No usa WhatsApp. La cotización se envía por email como PDF adjunto. El cliente puede aceptar desde un link en el email que registra la aceptación en la plataforma.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/250-350/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 0 | 200 | US$3 ≈ S/11.25 | S/300/mes | ~96% |
| Crecimiento | 5 | 0 | 1,000 | US$3 ≈ S/11.25 | S/1,500/mes | ~99% |
| Escala | 20 | 0 | 4,000 | US$23 ≈ S/86.25* | S/6,000/mes | ~99% |

> *A 15 clientes se superan 3,000 emails/mes → Resend Pro US$20/mes. Precio promedio S/300/mes (app más simple del portafolio).

## Desglose técnico

### Vercel
- API: Proyecto `cotizador-pdf-api` (Root Dir: `13-cotizador-pdf/backend`)
- Web: Proyecto `cotizador-pdf-web` (Root Dir: `13-cotizador-pdf/frontend`)
- Functions: Vercel Serverless Function para generación de PDF de la cotización on-demand (usa librería como `@react-pdf/renderer` o `puppeteer`). La función se ejecuta en cada solicitud de generación de PDF — sin cron, totalmente event-driven.
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes. Nota: si se usa Puppeteer, el bundle de la función puede ser grande; considerar `@react-pdf/renderer` (más liviano) como primera opción.

### Supabase
- Esquema: `cotizador_pdf` dentro del proyecto compartido
- Tablas principales: `empresas`, `clientes_empresa`, `productos_servicios`, `cotizaciones`, `items_cotizacion`, `plantillas_cotizacion`, `historial_versiones`
- Storage: Sí — bucket `cotizaciones-pdf` para almacenar los PDFs generados y permitir re-descarga sin regenerar (también para el historial de versiones de una cotización)
- Realtime: No aplica — los datos son estáticos entre operaciones del usuario
- RPC / pg_cron: No aplica

### Resend
- Uso: envío de la cotización en PDF como adjunto al cliente final, notificación al vendedor cuando el cliente abre/acepta la cotización (tracking de email)
- Volumen por cliente: ~200 emails/mes (asumiendo ~100 cotizaciones/mes, ~2 emails por cotización)
- Umbral de upgrade: a partir de 15 clientes

## Recomendaciones

1. Cachear los PDFs generados en el bucket `cotizaciones-pdf` de Supabase para no regenerar cada vez que se descarga la misma cotización — la generación de PDF es la operación más costosa en cómputo de esta app.
2. Ofrecer personalización de plantilla con colores y logo del cliente (configurado una sola vez por tenant) como diferenciador de producto; aumenta el precio percibido sin complejidad técnica adicional.
3. El Vercel Serverless Function de generación de PDF tiene un límite de 50MB de bundle en plan Pro — si se usa Puppeteer (>100MB), migrar a una Edge Function con `pdf-lib` (alternativa más liviana, compatible con el runtime Edge) o a una función serverless en la región más cercana a Perú (sa-east-1 / us-east-1).

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS Lambda + S3 | US$5–20/mes | Técnicamente apropiado para generación de PDFs, pero el stack Vercel + Supabase ya cubre el caso sin añadir una segunda cuenta de nube |
| Firebase (Hosting + Cloud Functions) | US$5–15/mes | No añade valor; Cloud Functions de Firebase tienen cold starts más notorios para generación de PDF que Vercel |
| PandaDoc / Quoter.io | US$20–50/mes | Soluciones verticales de cotización; costosas por usuario para el mercado PyME peruano; NovaTech ofrece precio fijo más accesible |
