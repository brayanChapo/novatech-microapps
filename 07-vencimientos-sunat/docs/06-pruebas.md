# 06 · Plan de pruebas — Vencimientos SUNAT + portal de documentos

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Validación de RUC | Vitest |
| U-02 | Asignación de vencimiento por último dígito | Vitest |
| U-03 | Reglas de alertas (5 y 2 días; 7 días al cliente) | Vitest |
| U-04 | Transición a declarado solo con constancia | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Cartera de clientes con RUC y régimen tributario | RUC validado (11 dígitos, dígito verificador) | ☐ |
| P-02 | Cronograma anual de vencimientos según último dígito del RUC (carga anual de la tabla oficial) | Vencimientos calculados para cada cliente | ☐ |
| P-03 | Alertas por correo al contador 5 y 2 días antes | — | ☐ |
| P-04 | Portal del cliente para subir comprobantes del mes (PDF, XML, fotos) | Límite 20 MB por archivo | ☐ |
| P-05 | Recordatorio al cliente si no subió documentos 7 días antes del vencimiento | Por correo | ☐ |
| P-06 | Estado mensual por cliente: pendiente, documentos recibidos, declarado | Tablero filtrable | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-06 aprobadas, 0 defectos críticos.
