# 06 · Plan de pruebas — Mesa de ayuda interna (tickets)

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Cálculo de SLA con pausas | Vitest |
| U-02 | Cierre automático a los 3 días | Vitest |
| U-03 | Numeración correlativa | Vitest |
| U-04 | Comentarios internos ocultos al solicitante | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Crear ticket con categoría, prioridad, descripción y adjuntos | — | ☐ |
| P-02 | Asignación manual o por categoría | — | ☐ |
| P-03 | Estados: abierto, en atención, en espera, resuelto, cerrado | Historial de cambios | ☐ |
| P-04 | Comentarios entre solicitante y agente | Aviso por correo | ☐ |
| P-05 | SLA por prioridad con alerta de vencimiento | — | ☐ |
| P-06 | Indicadores: tiempo de primera respuesta y de resolución | Por agente y categoría | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-06 aprobadas, 0 defectos críticos.
