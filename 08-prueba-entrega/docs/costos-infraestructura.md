# Costos de Infraestructura — Prueba y Entrega

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Prueba y Entrega usa la plataforma compartida (Vercel + Supabase Pro compartido), Expo EAS para la app móvil de los técnicos en campo, y Resend para enviar los informes de prueba al cliente final. No usa WhatsApp. Es una app orientada a empresas de instalación, mantenimiento y construcción que necesitan actas de entrega de obra con firma digital. Con 1 cliente, el costo mensual para NovaTech es US$3 (S/11.25), con margen del 97%.

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
| Resend (correo transaccional) | ~200 emails/mes (acta de entrega + informe de prueba al cliente) | Gratis hasta 3,000 | US$0/mes |
| Expo EAS | Builds en desarrollo (plan gratuito, 30 builds/mes) | US$0 | US$0/mes |

> No usa WhatsApp. Las notificaciones al cliente del avance de la obra se manejan por email desde Resend.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/350-450/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 0 | 200 | US$3 ≈ S/11.25 | S/400/mes | ~97% |
| Crecimiento | 5 | 0 | 1,000 | US$3 ≈ S/11.25 | S/2,000/mes | ~99% |
| Escala | 20 | 0 | 4,000 | US$23 ≈ S/86.25* | S/8,000/mes | ~99% |

> *A 20 clientes se superan los 3,000 emails/mes → Resend Pro US$20/mes.

## Desglose técnico

### Vercel
- API: Proyecto `prueba-entrega-api` (Root Dir: `08-prueba-entrega/backend`)
- Web: Proyecto `prueba-entrega-web` (Root Dir: `08-prueba-entrega/frontend`)
- Functions: Vercel Serverless Function para generación de PDF del acta de entrega al momento de la firma (no requiere cron — es on-demand)
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `prueba_entrega` dentro del proyecto compartido
- Tablas principales: `empresas`, `proyectos`, `hitos`, `checklist_pruebas`, `resultados_prueba`, `actas_entrega`, `firmas`, `fotos_evidencia`
- Storage: Sí — bucket `actas-entrega` para PDFs firmados y fotos de evidencia por hito (dato de importancia legal; no borrar)
- Realtime: Sí — canal `actas` para que el supervisor en oficina vea en tiempo real cuando el técnico en campo completa la firma del cliente
- RPC / pg_cron: No aplica

### Expo EAS
- App: `prueba-entrega-mobile` (técnicos e inspectores en campo)
- Funcionalidad clave: firma digital capturada en pantalla táctil del móvil, fotos de evidencia geolocalizadas, modo offline con sync posterior
- Canal de builds: plan gratuito suficiente en MVP
- Push notifications: Expo Push Notifications para alertar al supervisor cuando un acta queda pendiente de revisión
- Plataformas: Android + iOS

### Resend
- Uso: envío del acta de entrega firmada (PDF) al cliente y a la empresa contratante inmediatamente tras la firma
- Volumen por cliente: ~200 emails/mes
- Umbral de upgrade: a partir de 15 clientes

## Recomendaciones

1. Los PDFs del bucket `actas-entrega` tienen valor legal — configurar retención indefinida (no lifecycle policy de borrado) y considerar exportar copias mensuales a un bucket de archivo externo (puede ser Google Drive del cliente) como respaldo adicional.
2. La geolocalización de las fotos de evidencia es un diferenciador legal importante; asegurarse de que Expo solicita permisos de ubicación en el momento del disparo de foto y adjunta las coordenadas en los metadatos del registro en Supabase.
3. Expo EAS Production (US$99/mes) se justifica cuando la app tenga actualizaciones frecuentes (más de 4 builds/semana); en MVP con 30 builds gratuitos es más que suficiente.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + S3 + RDS | US$60–90/mes | El componente de S3 es atractivo para archivos legales, pero el costo total y la complejidad no se justifican; Supabase Storage con retención indefinida cubre el caso |
| Firebase (Firestore + Storage) | US$10–30/mes | Firebase Storage es equivalente, pero queries de auditoría de actas (por proyecto, fecha, técnico) son más limpias en PostgreSQL |
| DocuSign / API de firma | US$25–50/mes | Añade costo fijo alto; la firma en pantalla táctil de Expo con evidencia fotográfica es suficiente para el contexto legal de PyMEs peruanas |
