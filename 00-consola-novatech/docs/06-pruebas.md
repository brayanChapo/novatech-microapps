# 06 · Plan de pruebas — Consola NovaTech

## Unitarias / base de datos

| # | Caso | Esperado | Herramienta |
|---|---|---|---|
| C-01 | `mrr()` con descuento 10 % sobre S/ 400 | 360.00 | pgTAP |
| C-02 | `mrr()` excluye contratos con baja anterior a la fecha y en implementación sin `inicio_plan` | No suman | pgTAP |
| C-03 | `kpis()` con pago parcial de S/ 1,000 sobre total S/ 2,950 | Por cobrar 1,950 | pgTAP |
| C-04 | Vencido = pendientes con vencimiento anterior a la fecha | Correcto | pgTAP |
| C-05 | `recolectar_uso()` dos veces el mismo día | No duplica (actualiza) | pgTAP |
| C-06 | `recolectar_uso()` con producto sin esquema creado aún | Lo omite sin error | pgTAP |
| C-07 | Usuario `authenticated` (cliente) consulta `consola.*` | Permiso denegado | pgTAP |
| C-08 | Usuario autenticado que no está en `consola.staff` llama a la API | 403 | Vitest |
| C-09 | Rol `lectura` intenta registrar un pago | 403 | Vitest |
| C-10 | Cambiar precio de lista no altera contratos firmados | Precio congelado | Vitest |

C-01, C-03, C-05, C-06 y C-07 ya se verificaron manualmente sobre el borrador SQL (PostgreSQL 16).

## Aceptación (Dirección)

- [ ] Los indicadores de la consola coinciden con los del Excel para el mismo mes (después de importar).
- [ ] La ficha de un cliente muestra contratos, comprobantes, pagos, uso y notas.
- [ ] La lista de "planes por facturar" del mes no omite ningún contrato activo.
