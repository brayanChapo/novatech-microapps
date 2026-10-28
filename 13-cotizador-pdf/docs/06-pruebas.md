# 06 · Plan de pruebas — Cotizador con PDF

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Cálculo de subtotal, descuento, IGV y redondeo | Vitest |
| U-02 | Versionado | Vitest |
| U-03 | Vencimiento por validez | Vitest |
| U-04 | Numeración por empresa y año | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Catálogo de ítems/partidas con unidad y precio | Importación CSV | ☐ |
| P-02 | Crear cotización: cliente, ítems, descuentos, IGV, validez | Totales correctos al céntimo | ☐ |
| P-03 | PDF con logo, colores y condiciones del cliente | — | ☐ |
| P-04 | Numeración correlativa y versiones | COT-2026-0001 v2 | ☐ |
| P-05 | Estados: borrador, enviada, aceptada, rechazada, vencida | — | ☐ |
| P-06 | Envío por correo o enlace de WhatsApp (wa.me) | Sin costo de API | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-06 aprobadas, 0 defectos críticos.
