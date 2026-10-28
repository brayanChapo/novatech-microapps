# 06 · Plan de pruebas — Rendición de gastos con foto de comprobante

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Validación de RUC | Vitest |
| U-02 | Cálculo de tope mensual | Vitest |
| U-03 | Duplicados | Vitest |
| U-04 | El aprobador no aprueba lo suyo | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Registrar gasto con foto del comprobante, RUC del emisor, monto, fecha y categoría | RUC validado | ☐ |
| P-02 | Topes por categoría y alerta si se excede | Se permite registrar, marcado como excedido | ☐ |
| P-03 | Agrupar gastos en una rendición y enviarla a aprobación | — | ☐ |
| P-04 | Aprobar / rechazar con comentario | Notificación por correo | ☐ |
| P-05 | Exportación contable (CSV) por periodo y centro de costo | — | ☐ |
| P-06 | Detección de comprobante duplicado (mismo RUC + serie + número) | Aviso al registrar | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-06 aprobadas, 0 defectos críticos.
