# Costos de Infraestructura — Mesa de Ayuda

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Mesa de Ayuda usa la plataforma compartida (Vercel + Supabase Pro compartido) y Resend para notificaciones de tickets (creación, actualización, resolución). No usa WhatsApp ni app móvil nativa. Es una app de soporte interno orientada a empresas que necesitan gestionar tickets de incidencias técnicas o solicitudes de servicio. Con 1 cliente, el costo mensual para NovaTech es US$3 (S/11.25), con margen del 97%.

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
| Resend (correo transaccional) | ~400 emails/mes (confirmación de ticket + actualizaciones de estado + resolución) | Gratis hasta 3,000 | US$0/mes |

> No usa WhatsApp. Los tickets se crean desde el portal web o email. El canal email es suficiente para el caso de uso de soporte interno B2B.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/300-400/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 0 | 400 | US$3 ≈ S/11.25 | S/350/mes | ~97% |
| Crecimiento | 5 | 0 | 2,000 | US$3 ≈ S/11.25 | S/1,750/mes | ~99% |
| Escala | 20 | 0 | 8,000 | US$23 ≈ S/86.25* | S/7,000/mes | ~99% |

> *A 7 clientes se superan 3,000 emails/mes → Resend Pro US$20/mes (400 emails × 7 clientes = 2,800; a 8 clientes = 3,200). Precio promedio S/350/mes.

## Desglose técnico

### Vercel
- API: Proyecto `mesa-ayuda-api` (Root Dir: `12-mesa-ayuda/backend`)
- Web: Proyecto `mesa-ayuda-web` (Root Dir: `12-mesa-ayuda/frontend`)
- Functions: Vercel Serverless Function para envío de emails transaccionales vía Resend. Vercel Cron semanal para generar reporte de SLA (tiempo de respuesta, tickets resueltos vs. pendientes) y enviarlo a gerencia.
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `mesa_ayuda` dentro del proyecto compartido
- Tablas principales: `empresas`, `agentes`, `usuarios`, `categorias`, `prioridades`, `tickets`, `comentarios_ticket`, `adjuntos_ticket`, `sla_config`, `historial_estados`
- Storage: Sí — bucket `adjuntos-tickets` para capturas de pantalla, archivos de configuración y documentos adjuntos en los tickets
- Realtime: Sí — canal `tickets` para que los agentes de soporte vean en tiempo real cuando se crea o actualiza un ticket sin necesidad de refrescar la página (similar a una bandeja de entrada live)
- RPC / pg_cron: `pg_cron` para calcular métricas SLA diarias (tickets con primera respuesta dentro del plazo, tickets resueltos en tiempo) y alertar si hay tickets de alta prioridad sin respuesta en más de 2 horas

### Resend
- Uso: confirmación de ticket creado (al usuario), asignación a agente (al agente), actualización de estado, resolución con encuesta de satisfacción
- Volumen por cliente: ~400 emails/mes (asumiendo ~100 tickets/mes × 4 emails promedio por ticket)
- Umbral de upgrade: a partir de 8 clientes

## Recomendaciones

1. El Realtime de Supabase para el panel de agentes es el diferenciador principal de UX de esta app — asegurarse de configurar correctamente los filtros de canal para que cada agente solo reciba actualizaciones de sus tickets asignados (evitar suscripciones globales innecesarias).
2. Configurar SLA por prioridad (crítico: 1h, alto: 4h, normal: 24h) desde la configuración del cliente, no hardcodeado — permite que cada empresa defina sus propios niveles de servicio.
3. Considerar integración con email entrante (inbound email de Resend) para crear tickets automáticamente desde emails enviados a una dirección como `soporte@cliente.com` — diferenciador que no añade costo de infraestructura extra.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + SES + RDS | US$50–80/mes | SES como alternativa a Resend, pero la complejidad total no se justifica |
| Zendesk / Freshdesk | US$15–50/agente/mes | Soluciones verticales costosas para PyMEs; NovaTech ofrece precio fijo mensual más accesible |
| osTicket (self-hosted) | ~US$30–50/mes (hosting) | Open source pero requiere mantenimiento de servidor; el modelo SaaS de NovaTech elimina ese overhead para el cliente |
