# 06 · Plan de pruebas — Historia clínica simple

Misma estrategia que la app de referencia ([03 · pruebas](../../03-asistencia-rrhh/docs/06-pruebas.md)): unitarias de dominio y servicios (Vitest), API (`app.request`), RLS (pgTAP), integración manual y UAT con el cliente.

## Pruebas unitarias obligatorias

| # | Caso | Herramienta |
|---|---|---|
| U-01 | RLS: recepción no lee evoluciones | Vitest |
| U-02 | Evolución firmada inmutable | Vitest |
| U-03 | Bitácora en cada lectura | Vitest |
| U-04 | Exportación PDF completa | Vitest |
| U-05 | Aislamiento entre empresas (RLS) | pgTAP |
| U-06 | Rutas protegidas devuelven 401 sin token | Vitest |

## Pruebas de integración manual (una por requerimiento)

| # | Requerimiento | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Ficha del paciente (filiación, antecedentes, alergias) | Alergias visibles en cabecera | ☐ |
| P-02 | Evoluciones por atención (motivo, examen, diagnóstico CIE-10, indicaciones) con fotos | Firmadas por el profesional | ☐ |
| P-03 | Acceso solo de profesionales autorizados; recepción sin datos clínicos | Probado con RLS | ☐ |
| P-04 | Bitácora de accesos: quién vio qué y cuándo | No editable | ☐ |
| P-05 | Exportar historia en PDF a solicitud del paciente | — | ☐ |
| P-06 | Las evoluciones firmadas no se borran; se corrigen con adenda | — | ☐ |

**Criterio de salida:** todas las pruebas automáticas en verde, P-01 a P-06 aprobadas, 0 defectos críticos.
