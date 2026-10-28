# 06 · Plan de pruebas — Parte diario de obra + checklist SST

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Avance acumulado por partida | Vitest |
| U-02 | Conteo de críticos no conformes | Vitest |
| U-03 | Cierre de parte y bloqueo de edición | Vitest |
| U-04 | Idempotencia de sincronización | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Registro de obras con ubicación | — | ☐ |
| P-02 | Parte diario: avance por partida (%), personal por categoría, maquinaria, incidencias, clima, fotos | Un parte por obra y día | ☐ |
| P-03 | Checklist SST configurable (sí/no/no aplica + observación + foto) | Ítems críticos en "no" generan alerta | ☐ |
| P-04 | Firma digital del responsable en pantalla | Firma guardada como imagen | ☐ |
| P-05 | Funciona sin conexión en obra y sincroniza después | Sin pérdida de fotos | ☐ |
| P-06 | Reporte semanal en PDF por obra | Incluye fotos y firmas | ☐ |
| P-07 | Alerta por correo de ítem crítico no conforme | En < 5 min de sincronizado | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-07 aprobadas, 0 defectos críticos.
