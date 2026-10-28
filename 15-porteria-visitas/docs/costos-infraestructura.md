# Costos de Infraestructura — Portería / Visitas

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Portería / Visitas usa la plataforma compartida (Vercel + Supabase Pro compartido), WhatsApp Business Cloud API en bajo volumen para notificar al anfitrión cuando llega su visita, y Resend para reportes de accesos. Es una app orientada a edificios de oficinas, condominios y empresas con control de ingreso. El volumen de WhatsApp es el más bajo del portafolio. Con 1 cliente, el costo mensual para NovaTech es US$5 (S/18.75), con margen del 95%.

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
| WhatsApp Business Cloud API | ~50 conversaciones/mes (1 cliente, ~50 visitas relevantes que activan notificación al anfitrión) | US$0.04/conversación | US$2/mes |
| Resend (correo transaccional) | ~100 emails/mes (reporte diario de accesos a seguridad + reporte semanal de visitas) | Gratis hasta 3,000 | US$0/mes |

> Volumen WA muy bajo porque no todas las visitas activan WA — solo aquellas donde el visitante no tiene acceso preregistrado o el anfitrión solicitó notificación activa. Edificios con 20-30 visitas/día × 50% de notificaciones WA × 22 días laborables = ~330 conversaciones máximo; estimación conservadora de 50/mes para cliente PyME (oficina pequeña o condominio).

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/250-350/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 50 | 100 | US$5 ≈ S/18.75 | S/300/mes | ~94% |
| Crecimiento | 5 | 250 | 500 | US$13 ≈ S/48.75 | S/1,500/mes | ~97% |
| Escala | 20 | 1,000 | 2,000 | US$43 ≈ S/161.25 | S/6,000/mes | ~97% |

> Precio promedio S/300/mes (app más simple del portafolio en cuanto a funcionalidad). A 20 clientes aún dentro del plan gratuito de Resend.

## Desglose técnico

### Vercel
- API: Proyecto `porteria-visitas-api` (Root Dir: `15-porteria-visitas/backend`)
- Web: Proyecto `porteria-visitas-web` (Root Dir: `15-porteria-visitas/frontend`)
- Functions: Vercel Serverless Function disparada por evento de Supabase (nueva visita registrada) para enviar notificación WA al anfitrión. Cron diario a las 06:00 PET para generar y enviar el reporte de accesos del día anterior a seguridad.
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `porteria_visitas` dentro del proyecto compartido
- Tablas principales: `empresas`, `edificios`, `pisos`, `residentes_empleados`, `visitantes`, `visitas`, `preregistros`, `listas_negras`, `notificaciones_log`
- Storage: Sí — bucket `fotos-visitantes` para captura de foto del visitante en portería (tomada con cámara del dispositivo del portero). Retención de 30 días por política de privacidad.
- Realtime: Sí — canal crítico `visitas` para que el anfitrión vea en tiempo real cuando llega su visita al lobby, desde su pantalla en el escritorio o móvil
- RPC / pg_cron: `pg_cron` para eliminar automáticamente fotos de visitantes mayores a 30 días del bucket (cumplimiento de privacidad) y para limpiar preregistros no utilizados mayores a 7 días

### WhatsApp Business Cloud API
- Tipo de mensajes: Business-Initiated (notificación de llegada de visita)
- Template registrado: `visita_llegada` con variables {{nombre_anfitrion}}, {{nombre_visitante}}, {{empresa_visitante}}, {{hora_llegada}}, {{piso_destino}}
- Volumen bajo y predecible — el más económico del portafolio en términos de WA
- Integración: Supabase Database Webhook → Vercel Function → Graph API Meta (notificación en segundos del registro de la visita)

### Resend
- Uso: reporte diario de visitas para el área de seguridad, resumen semanal de accesos para gerencia
- Volumen por cliente: ~100 emails/mes (bajo — reportes agregados, no un email por visita)
- Umbral de upgrade: muy lejano — más de 30 clientes

## Recomendaciones

1. El Realtime de Supabase es el diferenciador UX más importante de esta app — el anfitrión recibe la alerta en su pantalla en tiempo real sin necesidad de WhatsApp, que funciona como canal de respaldo para anfitriones no frente a la pantalla. Esto reduce el volumen WA y los costos asociados.
2. Configurar retención de 30 días para fotos de visitantes en el bucket es requisito de privacidad y también controla el crecimiento del Storage. Con `pg_cron` limpiando automáticamente, no se necesita intervención manual.
3. Para edificios empresariales grandes (500+ visitas/día), el plan puede subir a S/400–450/mes y el volumen WA puede alcanzar 300+ conversaciones/mes — revisar el precio en función del aforo declarado del cliente.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + RDS | US$50–70/mes | Completamente sobredimensionado para esta app de bajo volumen; Vercel + Supabase es la elección correcta |
| Firebase (Firestore + Hosting) | US$5–15/mes | Opción razonable en precio, pero el Realtime de Supabase con RLS por empresa es más seguro para este caso multi-tenant |
| Sistemas de control de acceso físico (HID, Suprema) | US$500–2,000/mes | Soluciones de hardware + software para grandes corporaciones; NovaTech apunta a PyMEs que solo necesitan el control lógico de visitas, sin hardware especial |
