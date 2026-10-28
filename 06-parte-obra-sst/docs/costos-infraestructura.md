# Costos de Infraestructura — Parte de Obra / SST

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Parte de Obra / SST usa la plataforma compartida (Vercel + Supabase Pro compartido), Expo EAS para la app móvil nativa (obreros en campo), y Resend para reportes de seguridad e incidentes. No usa WhatsApp. Es una app orientada a empresas de construcción, ingeniería y SST (Seguridad y Salud en el Trabajo) peruanas. Con 1 cliente, el costo mensual para NovaTech es US$3 (S/11.25), con margen operativo del 97%.

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
| Resend (correo transaccional) | ~150 emails/mes (reportes de incidentes + parte diario a supervisores) | Gratis hasta 3,000 | US$0/mes |
| Expo EAS | Builds en desarrollo (plan gratuito, 30 builds/mes) | US$0 | US$0/mes |

> Esta app no usa WhatsApp; las notificaciones internas al equipo de obra se hacen vía notificaciones push de Expo (gratuitas).

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/350-450/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$3 ≈ S/11.25 | S/0 | — |
| Arranque | 1 | 0 | 150 | US$3 ≈ S/11.25 | S/400/mes | ~97% |
| Crecimiento | 5 | 0 | 750 | US$3 ≈ S/11.25 | S/2,000/mes | ~99% |
| Escala | 20 | 0 | 3,000 | US$23 ≈ S/86.25* | S/8,000/mes | ~99% |

> *A 20 clientes se alcanzan 3,000 emails/mes → Resend Pro US$20/mes. Margen continúa siendo excelente.

## Desglose técnico

### Vercel
- API: Proyecto `parte-obra-sst-api` (Root Dir: `06-parte-obra-sst/backend`)
- Web: Proyecto `parte-obra-sst-web` (Root Dir: `06-parte-obra-sst/frontend`)
- Functions: Vercel Cron diario a las 18:00 PET para generar y enviar el parte diario de obra en PDF a los supervisores de cada proyecto activo
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase
- Esquema: `parte_obra_sst` dentro del proyecto compartido
- Tablas principales: `empresas`, `proyectos`, `trabajadores`, `partes_diarios`, `actividades`, `incidentes_sst`, `epps_control`, `firmas_digitales`
- Storage: Sí — bucket `evidencias-sst` para fotos de incidentes, certificados de EPI, y firmas digitales de trabajadores (acceso privado por empresa). Es el bucket con mayor volumen del portafolio por el componente fotográfico
- Realtime: No aplica — los partes se sincronizan al final del turno, no requieren tiempo real
- RPC / pg_cron: `pg_cron` para generar automáticamente la estructura del parte diario al inicio de cada jornada (06:00 PET) por proyecto activo

### Expo EAS
- App: `parte-obra-sst-mobile` (obreros y supervisores de campo)
- Funcionalidad clave: registro offline con sincronización posterior — crítico en obras con conectividad limitada
- Canal de builds: plan gratuito (30 builds/mes) suficiente en MVP
- Push notifications: Expo Push Notifications (gratuitas) para alertas de incidentes a supervisores
- Plataformas: Android (prioritario para obreros) + iOS (supervisores)

### Resend
- Uso: reporte diario de obra enviado a supervisores, alerta inmediata ante registro de incidente SST
- Volumen por cliente: ~150 emails/mes (parte diario a ~5 supervisores por proyecto, más alertas de incidentes)
- Umbral de upgrade: a partir de 20 clientes

## Recomendaciones

1. El Storage de evidencias SST es el punto de crecimiento de costo más probable — implementar compresión de imágenes antes del upload desde la app Expo (librería `expo-image-manipulator`) para reducir el tamaño de cada foto de ~3MB a ~300KB; esto reduce 10x el consumo de Storage y bandwidth.
2. El modo offline de Expo es diferenciador clave para este sector; asegurarse de que el esquema de sincronización use Supabase local-first (expo-sqlite + sync) o al menos cola local con reintentos para que ningún registro se pierda en zonas sin señal.
3. A 20+ clientes con múltiples proyectos activos, el bucket de Storage puede acercarse al límite de 100 GB del plan Pro compartido — monitorear con alertas en Supabase y definir política de archivo (mover evidencias de proyectos cerrados hace más de 1 año a un bucket de archivo de menor costo).

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS EC2 + S3 + RDS | US$60–90/mes | Sobrecarga operativa; S3 ofrece más opciones de lifecycle que Supabase Storage, pero el costo de ops no se justifica en esta etapa |
| Firebase (Firestore + Storage + Hosting) | US$15–40/mes | Firebase Storage es equivalente, pero Firestore es ineficiente para reportes y queries de auditoría SST; PostgreSQL es superior |
| Railway | US$10–25/mes | Sin ventaja; rompería la consistencia del portafolio y el Stack Expo + Supabase ya está probado |
