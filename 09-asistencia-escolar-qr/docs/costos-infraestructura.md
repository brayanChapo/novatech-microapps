# Costos de Infraestructura — Asistencia Escolar QR

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Asistencia Escolar QR usa la plataforma compartida (Vercel + Supabase Pro compartido), WhatsApp Business Cloud API para notificar a los padres de familia cuando el alumno llega o falta, Expo EAS para la app de los padres y auxiliares, y Resend para reportes de asistencia. Es la app con mayor volumen de WhatsApp del portafolio porque notifica a cada padre individualmente. Con 1 cliente (colegio de ~300 alumnos), el costo mensual para NovaTech es aproximadamente US$42 (S/157.50), con margen del 63% sobre una mensualidad de S/450.

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
| WhatsApp Business Cloud API | ~975 conversaciones/mes (300 alumnos × 22 días lectivos × 15% de alertas críticas: ausentes sin justificar) | US$0.04/conversación | US$39/mes |
| Resend (correo transaccional) | ~400 emails/mes (reporte semanal de asistencia a dirección + notificaciones a padres sin WA) | Gratis hasta 3,000 | US$0/mes |
| Expo EAS | Builds en desarrollo (plan gratuito) | US$0 | US$0/mes |

> Desglose WA: 300 alumnos × 22 días laborables. Cada día: ~15% de ausencias sin aviso = 45 alertas/día. En mes de 22 días = 990 mensajes ≈ 975 conversaciones (algunas familias tienen múltiples interacciones en misma conversación de 24h).

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/400-450/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 975 | 400 | US$42 ≈ S/157.50 | S/450/mes | ~65% |
| Crecimiento | 5 | 4,875 | 2,000 | US$198 ≈ S/742.50 | S/2,250/mes | ~67% |
| Escala | 20 | 19,500 | 8,000 | US$803 ≈ S/3,011.25* | S/9,000/mes | ~67% |

> *A 5 clientes se superan 3,000 emails → Resend Pro US$20/mes. Precio S/450/mes por ser la app de mayor impacto y volumen. Margen positivo pero más ajustado que otras apps por el alto volumen WA.

## Desglose técnico

### Vercel
- API: Proyecto `asistencia-escolar-qr-api` (Root Dir: `09-asistencia-escolar-qr/backend`)
- Web: Proyecto `asistencia-escolar-qr-web` (Root Dir: `09-asistencia-escolar-qr/frontend`)
- Functions: Vercel Cron a las 09:00 PET (30 min después de la hora de ingreso) para detectar ausencias no justificadas y disparar alertas WA. Cron semanal para reportes de asistencia.
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `asistencia_escolar_qr` dentro del proyecto compartido
- Tablas principales: `colegios`, `grados`, `alumnos`, `apoderados`, `registros_asistencia`, `justificaciones`, `qr_tokens`, `notificaciones_log`
- Storage: No aplica (no se almacenan archivos — el QR se genera en tiempo real)
- Realtime: Sí — canal crítico `registros_asistencia` para que auxiliares vean en tiempo real el marcado de entrada de cada alumno en el panel de turno de ingreso
- RPC / pg_cron: `pg_cron` para regenerar tokens QR diarios con expiración de 8 horas (seguridad: QR del lunes no válido el martes)

### WhatsApp Business Cloud API
- Tipo de mensajes: Business-Initiated (alertas de ausencia)
- Templates registrados: `alerta_ausencia` ({{nombre_apoderado}}, {{nombre_alumno}}, {{grado}}, {{fecha}}), `llegada_tarde` (para tardanzas mayores a 15 min)
- Volumen: el más alto del portafolio — crítico configurar rate limiting para no superar 1,000 mensajes/hora ante Meta
- Integración: Vercel Cron → Serverless Function con batch processing (grupos de 50 mensajes) → Graph API Meta

### Resend
- Uso: reporte semanal de asistencia a dirección, alerta a padres sin número WA registrado
- Volumen por cliente: ~400 emails/mes
- Umbral de upgrade: a partir de 7 clientes (2,800 emails/mes → cerca del límite gratuito)

### Expo EAS
- App: `asistencia-escolar-qr-mobile` (auxiliares de entrada con scanner QR + app de padres para ver asistencia)
- Canal de builds: plan gratuito suficiente en MVP
- Push notifications: Expo Push para notificaciones a padres como canal alternativo al WA

## Recomendaciones

1. Esta app tiene el mayor costo de WhatsApp del portafolio — precio de venta debe ser el más alto (S/450/mes mínimo). Considerar precio escalonado por tamaño del colegio (número de alumnos).
2. Implementar "ventana de justificación" de 30 minutos antes de disparar el WA: si el padre envía un WhatsApp previo justificando la ausencia, el sistema no envía la alerta. Reduce costos WA y mejora la experiencia.
3. A 5+ colegios grandes, evaluar negociación de tarifas de volumen con Meta para Perú. Con casi 5,000 conversaciones/mes se puede buscar un rate de US$0.035 en vez de US$0.04, ahorrando ~US$25/mes.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + SQS + Lambda | US$70–100/mes | SQS sería útil para el batch de mensajes WA, pero la complejidad total no se justifica; el batch manual en Vercel Function es suficiente |
| Twilio WhatsApp API | Similar a Meta directo | Twilio agrega una capa de costo encima de Meta; sin ventaja técnica justificada para este caso de uso; preferimos Meta directo |
| Firebase (Firestore + Hosting) | US$20–50/mes | Realtime de Supabase es equivalente; PostgreSQL + pg_cron para tokens QR es más limpio que Cloud Functions de Firebase |
