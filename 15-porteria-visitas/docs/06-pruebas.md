# 06 · Plan de pruebas — Registro de visitas en portería con QR

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | QR de un solo uso y por fecha | Vitest |
| U-02 | Flujo de autorización | Vitest |
| U-03 | Permisos residente/portero | Vitest |
| U-04 | Suscripción push | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Unidades (departamentos/oficinas) y residentes | Importación CSV | ☐ |
| P-02 | Pre-registro de visita por el residente con fecha y QR de un solo uso | QR válido solo ese día | ☐ |
| P-03 | Validación del QR en portería | Registra hora de ingreso | ☐ |
| P-04 | Visita sin pre-registro: portero registra y notifica al residente | Residente autoriza/rechaza desde la notificación | ☐ |
| P-05 | Notificación push gratuita al residente (WhatsApp opcional) | Web Push en PWA instalada | ☐ |
| P-06 | Historial de visitas por unidad y fecha | — | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-06 aprobadas, 0 defectos críticos.
