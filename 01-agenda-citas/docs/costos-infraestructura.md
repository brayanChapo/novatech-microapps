# Costos de Infraestructura — Agenda de Citas

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Agenda de Citas usa la plataforma compartida (Vercel Team Pro + Supabase Pro compartido) más WhatsApp Business Cloud API para enviar recordatorios de cita y Resend para confirmaciones por correo. Con un cliente activo, el costo mensual para NovaTech es aproximadamente US$14 (S/52.50), frente a una mensualidad cobrada de S/350–S/450, lo que representa un margen operativo superior al 85%.

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
| WhatsApp Business Cloud API | 200 conversaciones/mes (1 cliente, ~200 citas) | US$0.04/conversación | US$8/mes |
| Resend (correo transaccional) | ~400 emails/mes (confirmación + recordatorio por cita) | Gratis hasta 3,000 | US$0/mes |

> Nota: cada cita genera 2 emails (confirmación inmediata + recordatorio 24h antes). Con 200 citas/mes = 400 emails, dentro del plan gratuito de Resend.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/350-450/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 200 | 400 | US$11 ≈ S/41.25 | S/400/mes | ~90% |
| Crecimiento | 5 | 1,000 | 2,000 | US$43 ≈ S/161.25 | S/2,000/mes | ~92% |
| Escala | 20 | 4,000 | 8,000 | US$166 ≈ S/622.50 | S/8,000/mes | ~92% |

> Costo NovaTech = prorrateo base US$3 + (WA: clientes × 200 × US$0.04) + Resend (gratis hasta 20 clientes × 400 = 8,000 emails/mes; plan Pro US$20 si se supera ese umbral).
> Ingresos asumen precio promedio S/400/mes por cliente.

## Desglose técnico

### Vercel
- API: Proyecto `agenda-citas-api` (Root Dir: `01-agenda-citas/backend`)
- Web: Proyecto `agenda-citas-web` (Root Dir: `01-agenda-citas/frontend`)
- Functions: Vercel Cron configurado para disparar recordatorios diarios (job nocturno a las 20:00 PET que consulta citas del día siguiente y encola mensajes WA/email)
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes, cron jobs ilimitados

### Supabase
- Esquema: `agenda_citas` dentro del proyecto compartido
- Tablas principales: `profesionales`, `servicios`, `clientes`, `citas`, `recordatorios_log`
- Storage: No aplica (no se almacenan archivos adjuntos en esta versión)
- Realtime: Sí — canal `citas` para actualización instantánea del calendario en el panel del profesional cuando se agenda/cancela una cita
- RPC / pg_cron: `pg_cron` para limpiar registros de `recordatorios_log` mayores a 90 días

### WhatsApp Business Cloud API
- Tipo de mensajes: Business-Initiated (recordatorios de cita programados)
- Template registrado: `recordatorio_cita` con variables {{nombre_cliente}}, {{fecha}}, {{hora}}, {{profesional}}
- Volumen estimado: 1 mensaje por cita confirmada, enviado 24h antes
- Integración: Vercel Serverless Function invocada por el cron job, llama a la Graph API de Meta con el número del cliente

### Resend
- Uso: confirmación de reserva (inmediata) y recordatorio por email (24h antes)
- Template: HTML con logo del cliente (personalizable por tenant)
- Volumen por cliente: ~400 emails/mes — bien dentro del plan gratuito (3,000/mes)
- Umbral de upgrade: a partir de ~7 clientes (2,800+ emails/mes, cerca del límite gratuito)

## Recomendaciones

1. Mantener Resend en plan gratuito hasta superar 7 clientes; el upgrade a Pro (US$20/mes, 50,000 emails) solo se justifica cuando hay 8 o más clientes activos, incrementando el costo por app en US$1.33/mes prorrateado.
2. Para WhatsApp, registrar el template `recordatorio_cita` en Meta Business Manager antes del go-live; la aprobación puede tomar 24–48h y es el paso crítico del camino.
3. A partir de 20 clientes revisar si conviene un plan de volumen en WhatsApp; Meta ofrece descuentos por volumen en algunos mercados — a 4,000 conversaciones/mes se puede negociar rate mejor que US$0.04.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + RDS | US$50–80/mes | Mayor complejidad operativa; no justificada para el tamaño actual de la app |
| Firebase (Firestore + Hosting) | US$10–30/mes | Vendor lock-in Google; menor control sobre datos; RLS menos expresivo que PostgreSQL Row Level Security |
| Railway | US$10–20/mes | Sin RLS nativo como Supabase; stack diferente al resto del portafolio; migraría el equipo fuera de la convención |
