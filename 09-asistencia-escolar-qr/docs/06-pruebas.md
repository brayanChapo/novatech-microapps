# 06 · Plan de pruebas — Asistencia por QR con aviso a padres

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Firma y verificación del token QR | Vitest |
| U-02 | Puntual vs. tardanza | Vitest |
| U-03 | Detección de inasistencias a la hora de corte | Vitest |
| U-04 | Un aviso por alumno/día y no en días no lectivos | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Carnet con QR por alumno (PDF imprimible por aula) | QR con token firmado, no con el DNI | ☐ |
| P-02 | Escaneo rápido en la puerta (cámara del celular/tablet) | < 1 s por alumno; sonido de confirmación | ☐ |
| P-03 | Registro de tardanza según hora de ingreso del aula | — | ☐ |
| P-04 | Aviso por WhatsApp al apoderado solo en inasistencias (hora de corte configurable) | Un aviso por alumno por día | ☐ |
| P-05 | Reporte de asistencia por aula y alumno | Exportable | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-05 aprobadas, 0 defectos críticos.
