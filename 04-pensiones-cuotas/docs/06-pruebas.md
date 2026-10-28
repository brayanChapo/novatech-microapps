# 06 · Plan de pruebas — Control de pensiones y cuotas

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Generación de cronograma sin duplicados | Vitest |
| U-02 | Cálculo de mora fijo y porcentual | Vitest |
| U-03 | Estados pendiente/parcial/pagada | Vitest |
| U-04 | Token de enlace (hash, caducidad) | Vitest |
| U-05 | Regla de máximo 2 recordatorios | Vitest |
| U-06 | Aislamiento entre empresas (RLS) | pgTAP |
| U-07 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Padrón de alumnos/unidades con responsable de pago y teléfono | Importación desde CSV | ☐ |
| P-02 | Conceptos y cronograma de cuotas (matrícula, pensión mensual, mora) | Genera cuotas para todo el padrón en un paso | ☐ |
| P-03 | Estado de cuenta por responsable con enlace seguro (sin contraseña, token) | El enlace expira y es único | ☐ |
| P-04 | Registro de pago con voucher (Yape, Plin, transferencia, efectivo) | Queda pendiente hasta validación | ☐ |
| P-05 | Validación de pagos por tesorería | Al validar, la cuota pasa a pagada | ☐ |
| P-06 | Recordatorio automático por WhatsApp 3 días antes y el día de vencimiento | No se envía si ya está pagada | ☐ |
| P-07 | Reporte de morosidad por aula/torre y antigüedad | Exportable a CSV | ☐ |
| P-08 | Cálculo de mora configurable (monto fijo o % por día) | Se aplica al vencer | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-08 aprobadas, 0 defectos críticos.
