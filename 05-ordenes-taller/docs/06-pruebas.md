# 06 · Plan de pruebas — Orden de trabajo con estado por WhatsApp

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Máquina de estados (transiciones válidas e inválidas) | Vitest |
| U-02 | Totales del presupuesto con IGV | Vitest |
| U-03 | Validación de placa | Vitest |
| U-04 | Numeración correlativa por empresa | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Abrir orden con placa, cliente, kilometraje y fotos de ingreso | Placa con formato peruano validado | ☐ |
| P-02 | Estados: recibido → diagnóstico → presupuesto → en reparación → listo → entregado | Cada cambio queda con hora y usuario | ☐ |
| P-03 | Aviso automático por WhatsApp en cada cambio de estado | Se respeta el paquete del plan | ☐ |
| P-04 | Presupuesto en PDF con ítems (repuestos y mano de obra) | Totales con IGV | ☐ |
| P-05 | Aprobación del presupuesto por el cliente desde enlace | Queda registrada fecha y hora | ☐ |
| P-06 | Historial por placa y recordatorio del próximo mantenimiento | Por km o por fecha | ☐ |
| P-07 | Reporte de órdenes por técnico y tiempos promedio | — | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-07 aprobadas, 0 defectos críticos.
