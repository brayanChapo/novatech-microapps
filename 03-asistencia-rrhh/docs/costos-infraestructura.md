# Costos de Infraestructura — Asistencia RRHH

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Asistencia RRHH usa exclusivamente la plataforma compartida (Vercel Team Pro + Supabase Pro compartido) sin servicios adicionales de mensajería ni app móvil nativa. Es una app de bajo costo marginal: US$3/mes prorrateados para NovaTech con cualquier número de clientes base, escalando solo con el volumen de emails si se activa Resend Pro. El margen operativo supera el 96% desde el primer cliente.

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
| Resend (correo transaccional) | ~200 emails/mes (reportes de asistencia mensuales + alertas de ausencias) | Gratis hasta 3,000 | US$0/mes |

> Esta app no usa WhatsApp ni app móvil nativa. El registro de asistencia se hace vía web con QR o tarjeta RFID desde el navegador del dispositivo del empleado.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/300-400/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 0 | 200 | US$3 ≈ S/11.25 | S/350/mes | ~97% |
| Crecimiento | 5 | 0 | 1,000 | US$3 ≈ S/11.25 | S/1,750/mes | ~99% |
| Escala | 20 | 0 | 4,000 | US$23 ≈ S/86.25* | S/7,000/mes | ~99% |

> *A 20 clientes con ~200 emails/cliente/mes = 4,000 emails/mes, supera el plan gratuito de Resend → upgrade a Plan Pro US$20/mes. El costo total pasa de US$3 a US$23/mes, aún con margen excelente.

## Desglose técnico

### Vercel
- API: Proyecto `asistencia-rrhh-api` (Root Dir: `03-asistencia-rrhh/backend`)
- Web: Proyecto `asistencia-rrhh-web` (Root Dir: `03-asistencia-rrhh/frontend`)
- Functions: Vercel Cron mensual (1er día del mes a las 06:00 PET) para generación automática de reportes de asistencia y envío por email a RRHH
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `asistencia_rrhh` dentro del proyecto compartido
- Tablas principales: `empleados`, `departamentos`, `turnos`, `registros_asistencia`, `justificaciones`, `reportes`
- Storage: Sí — bucket `reportes-asistencia` para PDFs de reportes mensuales generados (acceso privado por tenant)
- Realtime: Sí — canal `registros` para que el panel de RRHH vea en tiempo real los marcajes de entrada/salida del día
- RPC / pg_cron: `pg_cron` para calcular horas trabajadas, tardanzas y ausencias al cierre de cada día (23:59 PET), materializando los datos en la tabla `reportes` para consultas rápidas

### Resend
- Uso: reporte mensual de asistencia enviado a gerencia RRHH, alertas de ausencias injustificadas al tercer día consecutivo
- Volumen por cliente: ~200 emails/mes (muy bajo — principalmente reportes agregados, no un email por empleado)
- Umbral de upgrade: a partir de 15 clientes

## Recomendaciones

1. Implementar el QR de asistencia con tiempo de expiración corto (2 minutos) para evitar que empleados compartan el código; el QR se genera desde Vercel Edge Function para mínima latencia desde dispositivos en fábrica o planta.
2. Para empresas con más de 100 empleados por cliente, considerar indexación adicional en `registros_asistencia` (columna `fecha`, `empleado_id`) — Supabase Pro incluye herramientas de query performance que facilitan identificar esto.
3. A partir de 15 clientes revisar si Resend Plan Pro (US$20/mes, 50,000 emails) es necesario; el costo adicional es marginal frente al ingreso generado.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + RDS | US$50–80/mes | Costo base excesivo para una app sin WhatsApp ni mobile; Vercel + Supabase cubre el caso de uso completamente |
| Firebase (Firestore + Hosting) | US$5–15/mes | Queries agregadas de reportes de asistencia son ineficientes y costosas en Firestore; PostgreSQL con pg_cron es mucho más adecuado |
| Railway | US$10–20/mes | Sin RLS nativo; cambiaría el stack del portafolio sin beneficio justificado para esta app |
