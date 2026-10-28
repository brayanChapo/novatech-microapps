# 06 · Plan de pruebas — Prueba de entrega (foto, firma, GPS)

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Obligatoriedad de foto/firma/GPS | Vitest |
| U-02 | Idempotencia de sincronización | Vitest |
| U-03 | Inmutabilidad de evidencia | Vitest |
| U-04 | Importación CSV con errores de formato | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Carga de entregas del día (CSV o manual) por repartidor | — | ☐ |
| P-02 | Lista de entregas del repartidor con dirección y mapa | Orden sugerido | ☐ |
| P-03 | Registrar entrega: foto, nombre y firma de quien recibe, GPS y hora | Los 4 datos son obligatorios | ☐ |
| P-04 | Registrar no entrega con motivo y foto | Motivos configurables | ☐ |
| P-05 | Consulta de evidencia por número de pedido | Enlace compartible con el cliente final (opcional) | ☐ |
| P-06 | Funciona sin conexión | Sincroniza al recuperar señal | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-06 aprobadas, 0 defectos críticos.
