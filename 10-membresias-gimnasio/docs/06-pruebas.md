# 06 · Plan de pruebas — Membresías con acceso por QR

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | Cálculo de nueva vigencia | Vitest |
| U-02 | Descuento de sesiones (máx. 1/día) | Vitest |
| U-03 | QR rotativo válido/expirado | Vitest |
| U-04 | Rechazo de socio vencido | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Planes (mensual, trimestral, anual, por sesiones) | — | ☐ |
| P-02 | Registro de socios y pagos que extienden la vigencia | Vigencia calculada automáticamente | ☐ |
| P-03 | QR personal del socio en una página instalable | QR rotativo cada 30 s para evitar capturas | ☐ |
| P-04 | Validación de ingreso en recepción (verde/rojo) | Rojo si vencido o sin sesiones | ☐ |
| P-05 | Aviso por WhatsApp 3 días antes del vencimiento | — | ☐ |
| P-06 | Reporte de renovaciones, vencidos y asistencia por hora | — | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-06 aprobadas, 0 defectos críticos.
