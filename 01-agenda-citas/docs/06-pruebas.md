# 06 · Plan de pruebas — Agenda de citas + recordatorios WhatsApp

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Cálculo de bloques libres con citas y bloqueos | Vitest |
| U-02 | No solapamiento de citas (incluida concurrencia) | Vitest |
| U-03 | Hora del recordatorio (24 h / 2 h) | Vitest |
| U-04 | Procesamiento de respuesta del paciente vía webhook | Vitest |
| U-05 | Verificación de firma del webhook de Meta | Vitest |
| U-06 | Aislamiento entre empresas (RLS) | pgTAP |
| U-07 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Agenda por profesional y consultorio en vista día/semana | No permite dos citas en el mismo horario del mismo profesional | ☐ |
| P-02 | Configurar servicios con duración y precio referencial | La duración define los bloques disponibles | ☐ |
| P-03 | Horarios de atención y bloqueos (vacaciones, feriados) | Bloques bloqueados no aparecen en la reserva | ☐ |
| P-04 | Página pública de reserva con enlace propio del cliente | Reserva en ≤ 4 pasos desde el celular | ☐ |
| P-05 | Confirmación inmediata y recordatorio por WhatsApp 24 h antes | Plantilla de utilidad aprobada por Meta; registro de envío | ☐ |
| P-06 | Respuesta del paciente: confirmar / reprogramar / cancelar | El estado de la cita cambia según la respuesta | ☐ |
| P-07 | Marcar asistencia: asistió / no asistió | Alimenta el reporte de inasistencias | ☐ |
| P-08 | Reporte mensual de asistencia e inasistencias por profesional | Exportable a CSV | ☐ |
| P-09 | Alerta de consumo de WhatsApp al 80 % del paquete | Correo al admin | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-09 aprobadas, 0 defectos críticos.
