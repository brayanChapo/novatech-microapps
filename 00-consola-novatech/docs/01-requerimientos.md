# 01 · Requerimientos — Consola NovaTech

**Versión:** 0.9 · **Fecha:** 8 de octubre de 2026 · **Responsable:** Gerencia de Proyectos

## Objetivo

Que la Dirección y la Gerencia de Proyectos de NovaTech vean, en una sola pantalla y sin armar reportes a mano, cuántos clientes y contratos hay, cuánto se factura y cobra, cuánto usa cada cliente sus micro apps y quién está en riesgo de darse de baja.

## Actores

| Actor | Rol en `consola.staff` | Puede |
|---|---|---|
| Dirección (Alfredo, Diego) | `direccion` | Todo, incluido registrar comprobantes, pagos y precios |
| Gerencia de Proyectos (Pablo) | `operaciones` | Clientes, contratos, notas, uso; ver facturación |
| Lectura (contador externo, socio) | `lectura` | Solo ver indicadores y exportar |

## Requerimientos funcionales

### Indicadores (inicio)

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Fecha de corte seleccionable (por defecto hoy, hora de Lima) | Alta | Todos los indicadores se recalculan |
| RF-02 | Clientes activos y prospectos | Alta | Coincide con `consola.clientes` |
| RF-03 | Contratos firmados **hoy** y **en el mes**; bajas del mes | Alta | Por fecha de firma / baja |
| RF-04 | **Ingreso mensual recurrente** (planes activos con descuento aplicado) | Alta | Solo contratos con plan iniciado y sin baja |
| RF-05 | **Facturado hoy y en el mes** (sin IGV), **cobrado en el mes**, **por cobrar** y **vencido** | Alta | Pagos parciales descuentan el saldo |
| RF-06 | Tabla **por micro app**: contratos activos, ingreso recurrente, facturado del mes | Alta | Suma = totales |
| RF-07 | Gráfico de evolución mensual de 12 meses (facturado, cobrado, recurrente) | Media | — |

### Clientes y contratos

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-08 | Registro de clientes y prospectos (RUC, contacto, nicho, origen) | Alta | RUC de 11 dígitos |
| RF-09 | **Ficha del cliente**: contratos, comprobantes, pagos, uso, notas y última actividad | Alta | Todo en una pantalla |
| RF-10 | Crear contrato eligiendo producto y plan; precio, implementación y WhatsApp incluido se **toman de la lista de precios vigente** y quedan congelados | Alta | Cambiar precios después no altera contratos firmados |
| RF-11 | Estados del contrato: implementación → activo → baja | Alta | Solo "activo" suma al recurrente |
| RF-12 | **Aprovisionar**: al activar el primer contrato de un cliente, crear su empresa en `core.empresas` y su primer administrador | Media | Reemplaza el SQL manual del documento de implementación |
| RF-13 | Notas comerciales, de soporte y de cobranza por cliente | Media | Con autor y fecha |

### Facturación y cobranza

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-14 | Registrar comprobantes (serie-número, concepto, periodo, monto, IGV, vencimiento) y adjuntar el PDF emitido por el proveedor electrónico | Alta | Serie-número único |
| RF-15 | Registrar pagos (total o parcial) con medio y referencia | Alta | Al completar el total, el comprobante pasa a "pagado" |
| RF-16 | Lista de **vencidos** con días de atraso y botón para enviar recordatorio por correo | Alta | — |
| RF-17 | **Planes del mes por facturar**: lista de contratos activos sin comprobante del periodo | Alta | Evita olvidar cobros |
| RF-18 | **Excedentes de WhatsApp por facturar**: mensajes del mes − incluidos × S/ 0.15 | Alta | Usa `consola.uso_diario` |

### Uso y salud

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-19 | Recolección **diaria automática** de conteos de uso de cada micro app (`<esquema>.uso_diario`) | Alta | Corre 00:15 hora de Lima; idempotente |
| RF-20 | **Clientes en riesgo**: sin actividad en 7 días o con caída > 50 % frente al mes anterior | Media | Alerta en el inicio |
| RF-21 | Costo de infraestructura del mes (fijo + WhatsApp estimado) y margen bruto | Media | Parámetros editables |
| RF-22 | Exportar cualquier tabla a CSV | Media | Abre en Excel |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Montos en soles; "facturado" sin IGV, "cobrado" y "por cobrar" con IGV. |
| RN-02 | Ingreso recurrente a una fecha = Σ precio mensual × (1 − descuento) de contratos con `inicio_plan ≤ fecha` y sin baja o con baja posterior. |
| RN-03 | El precio del contrato se congela al firmar; la lista de precios tiene historial por fecha de vigencia. |
| RN-04 | La consola **no emite** comprobantes electrónicos; registra los emitidos por el proveedor autorizado por SUNAT (integración en una fase posterior). |
| RN-05 | Las métricas de uso son **conteos por empresa**; nunca nombres, ubicaciones u horarios de personas. |

## Requerimientos no funcionales

| ID | Categoría | Requerimiento |
|---|---|---|
| RNF-01 | Seguridad | Esquema `consola` sin acceso para usuarios de clientes (RLS sin políticas y sin `grant` a `authenticated`); solo el backend con `service_role`. |
| RNF-02 | Seguridad | Acceso solo para usuarios registrados en `consola.staff`; verificación en dos pasos obligatoria para el rol `direccion`. |
| RNF-03 | Privacidad | Cumple el principio de minimización (Ley 29733): sin datos personales de los usuarios finales de los clientes. |
| RNF-04 | Auditoría | Registro de quién creó/modificó contratos, comprobantes y pagos. |
| RNF-05 | Rendimiento | Inicio carga en < 2 s con 200 clientes y 24 meses de datos. |
| RNF-06 | Disponibilidad | Si la recolección diaria falla, se reintenta y se muestra la fecha del último dato. |
| RNF-07 | Costo | Sin servicios nuevos de pago. |

## Migración desde la hoja de cálculo

Al construir la consola, importar las pestañas `Clientes`, `Contratos`, `Facturacion` y `Uso_WhatsApp` de **NovaTech-Control-Clientes.xlsx** (mismas columnas) con un script de carga única.
