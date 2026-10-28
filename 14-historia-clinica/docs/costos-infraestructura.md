# Costos de Infraestructura — Historia Clínica

**Fecha:** 28 de octubre de 2026 · **Versión:** 1.0

## Resumen ejecutivo

Historia Clínica es la app de mayor costo de infraestructura del portafolio por dos razones: (1) requiere un proyecto Supabase dedicado (datos de salud sensibles que no pueden compartir proyecto con otras apps) y (2) usa Resend para recordatorios de cita y reportes médicos. El costo mensual para NovaTech con 1 cliente es US$28 (S/105), frente a una mensualidad de S/450 (precio más alto del portafolio por el sector salud), resultando en un margen del 77%. Es la app que justifica el precio premium por su criticidad y por los requisitos de privacidad de datos de salud.

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
| **Supabase Pro dedicado** | Proyecto propio para datos de salud | US$25/mes fijo | **US$25/mes** |
| Resend (correo transaccional) | ~250 emails/mes (recordatorios de cita + resúmenes de consulta para el paciente) | Gratis hasta 3,000 | US$0/mes |

> El proyecto Supabase dedicado es el costo diferencial de esta app. Todos los datos de historias clínicas, diagnósticos y tratamientos residen en este proyecto aislado, sin compartir esquemas con otras apps.

## Escenarios de costo mensual por número de clientes

| Escenario | Clientes | Mensajes WA/mes | Correos/mes | Costo NovaTech | Ingresos (S/450/mes) | Margen |
|---|---|---|---|---|---|---|
| Demo | 0 | 0 | 0 | US$28 ≈ S/105 (base dedicada) | S/0 | — |
| Arranque | 1 | 0 | 250 | US$28 ≈ S/105 | S/450/mes | ~77% |
| Crecimiento | 5 | 0 | 1,250 | US$28 ≈ S/105 | S/2,250/mes | ~95% |
| Escala | 20 | 0 | 5,000 | US$48 ≈ S/180* | S/9,000/mes | ~98% |

> *A 20 clientes: prorrateo base US$3 + Supabase dedicado US$25 + Resend Pro US$20 (5,000 emails/mes) = US$48. El costo del proyecto Supabase dedicado se distribuye mejor con más clientes (costo fijo, no variable).

## Desglose técnico

### Vercel
- API: Proyecto `historia-clinica-api` (Root Dir: `14-historia-clinica/backend`)
- Web: Proyecto `historia-clinica-web` (Root Dir: `14-historia-clinica/frontend`)
- Functions: Vercel Serverless Function para generación de resumen de consulta en PDF. Cron diario a las 07:00 PET para recordatorios de cita del día siguiente.
- Límites relevantes del plan Pro: 1 TB bandwidth/mes, 1,000,000 function invocations/mes

### Supabase (PROYECTO DEDICADO)
- **Proyecto:** `novatech-historia-clinica` — proyecto Supabase propio, aislado completamente del proyecto compartido
- **Razón del aislamiento:** datos de salud sensibles (diagnósticos, tratamientos, medicamentos, antecedentes) requieren aislamiento técnico y legal. Permite auditoría independiente, backup dedicado y RLS reforzado.
- Tablas principales: `pacientes`, `medicos`, `consultorios`, `citas`, `consultas`, `diagnosticos`, `tratamientos`, `medicamentos`, `examenes`, `resultados_examen`, `alergias`, `antecedentes`
- Storage: Sí — bucket `imagenes-medicas` para radiografías, ecografías y resultados de laboratorio en imagen (acceso restringido: solo el médico tratante y el paciente pueden acceder)
- Realtime: Sí — canal `citas` para actualización del calendario del médico en tiempo real cuando se agenda/cancela una cita
- RPC / pg_cron: `pg_cron` para anonimizar registros de pacientes inactivos por más de 5 años (cumplimiento LOPD/PDPD peruana) y para backup diario del esquema completo a Storage del mismo proyecto

### Resend
- Uso: recordatorio de cita 24h antes (al paciente), resumen de consulta (al paciente), alerta de examen listo para recoger
- Volumen por cliente: ~250 emails/mes
- Umbral de upgrade: a partir de 12 clientes

## Consideraciones de seguridad y privacidad (sector salud)

- **Ley N° 29733 (PDPD — Ley de Protección de Datos Personales de Perú):** los datos de salud son "datos sensibles" con protección reforzada. El aislamiento en Supabase dedicado es obligatorio para poder demostrar control de acceso granular ante una auditoría.
- **Row Level Security (RLS):** políticas de RLS que garantizan que un médico solo acceda a historias clínicas de sus propios pacientes y de su consultorio.
- **Cifrado en reposo:** habilitado por defecto en Supabase Pro (AES-256).
- **Auditoría:** tabla `audit_log` para registrar todas las lecturas de historia clínica (quién accedió, cuándo, desde qué IP).

## Recomendaciones

1. Esta app justifica la mensualidad más alta del portafolio (S/450/mes mínimo, considerar S/500 para clínicas). El costo del proyecto Supabase dedicado (US$25/mes) es el precio de la tranquilidad legal y de la confianza del cliente del sector salud.
2. A partir de 5 clientes, el costo por cliente del proyecto dedicado baja de US$25 a US$5 (se amortiza entre todos los clientes de la app). El modelo de negocio mejora drásticamente con escala.
3. Considerar certificación SOC 2 Type II de Supabase (disponible en planes Enterprise) como argumento de venta para clínicas grandes o redes de salud.

## Comparativa con alternativas

| Alternativa | Costo estimado | Por qué no se eligió |
|---|---|---|
| AWS RDS dedicado + S3 | US$80–150/mes | Mayor costo y complejidad; requiere configurar VPC, IAM, backups manuales. Supabase Pro dedicado ofrece lo mismo con menos overhead |
| Firebase (con proyecto dedicado) | US$25–60/mes | Firebase Health Data Protection requiere plan Blaze y configuración adicional; menos robusto para queries médicas complejas |
| Sistema EMR existente (AS400, OpenMRS) | US$100–500/mes | Soluciones legacy costosas; NovaTech ofrece una solución moderna, accesible y adaptada al mercado peruano |
