# 01 · Requerimientos — Agenda de citas + recordatorios WhatsApp

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Reducir las inasistencias de pacientes con reserva en línea y recordatorios automáticos por WhatsApp.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Configura profesionales, servicios y horarios; ve reportes |
| **recepcion** | Gestiona la agenda del día, confirma y reprograma |
| **profesional** | Ve su agenda y marca asistencia del paciente |
| **paciente (público)** | Reserva desde un enlace sin crear cuenta |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Agenda por profesional y consultorio en vista día/semana | Alta | No permite dos citas en el mismo horario del mismo profesional |
| RF-02 | Configurar servicios con duración y precio referencial | Alta | La duración define los bloques disponibles |
| RF-03 | Horarios de atención y bloqueos (vacaciones, feriados) | Alta | Bloques bloqueados no aparecen en la reserva |
| RF-04 | Página pública de reserva con enlace propio del cliente | Alta | Reserva en ≤ 4 pasos desde el celular |
| RF-05 | Confirmación inmediata y recordatorio por WhatsApp 24 h antes | Alta | Plantilla de utilidad aprobada por Meta; registro de envío |
| RF-06 | Respuesta del paciente: confirmar / reprogramar / cancelar | Alta | El estado de la cita cambia según la respuesta |
| RF-07 | Marcar asistencia: asistió / no asistió | Alta | Alimenta el reporte de inasistencias |
| RF-08 | Reporte mensual de asistencia e inasistencias por profesional | Media | Exportable a CSV |
| RF-09 | Alerta de consumo de WhatsApp al 80 % del paquete | Media | Correo al admin |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Una cita ocupa [inicio, inicio + duración) del profesional; no se solapan. |
| RN-02 | El recordatorio sale 24 h antes; si la cita se crea con < 24 h, sale 2 h antes. |
| RN-03 | Mensajes de WhatsApp solo por plantillas aprobadas; se registra cada envío para facturar excedentes. |
| RN-04 | La hora de la cita se guarda en UTC y se muestra en America/Lima. |

## Requerimientos no funcionales

| ID | Categoría | Requerimiento |
|---|---|---|
| RNF-01 | Seguridad | Aislamiento entre empresas con RLS + filtro `empresa_id` en backend; pruebas pgTAP. |
| RNF-02 | Seguridad | Clientes sin permisos de escritura directa; validación Zod en todas las entradas. |
| RNF-03 | Usabilidad | Interfaz en español, responsive desde 360 px, acciones principales en ≤ 3 toques. |
| RNF-04 | Rendimiento | Respuestas de API p95 < 1 s; páginas < 2 s en 4G. |
| RNF-05 | Mantenibilidad | TypeScript estricto; cobertura ≥ 80 % en dominio y servicios. |
| RNF-06 | Costos | Usar solo la plataforma compartida (Vercel + Supabase); servicios de pago adicionales requieren aprobación. |
| RNF-07 | Legal | Ley 29733: finalidad informada y encargo de tratamiento con el cliente. |
| RNF-08 | Específico | Página pública carga en < 2 s en 4G. |
| RNF-09 | Específico | Protección anti-spam en reservas públicas (límite por IP y teléfono). |
| RNF-10 | Específico | Datos de pacientes con RLS por empresa; no se guardan diagnósticos (eso es la app 14). |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
