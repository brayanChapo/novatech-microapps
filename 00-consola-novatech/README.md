# 00 · Consola NovaTech (panel interno)

> **Estado:** 📝 Especificada — se construye cuando NovaTech tenga **3–5 clientes activos**. Mientras tanto se usa el libro **`NovaTech-Control-Clientes.xlsx`** (mismas métricas, llenado a mano).
> **Usuarios:** solo el equipo de NovaTech. Ningún cliente tiene acceso.

## Para qué sirve

Ver el negocio completo de NovaTech en un solo lugar:

| Vista | Qué muestra |
|---|---|
| **Inicio** | Clientes activos y prospectos · contratos firmados hoy / este mes · bajas · ingreso mensual recurrente · facturado hoy / mes · cobrado · por cobrar y vencido |
| **Por producto** | Contratos activos, ingreso recurrente y facturación de cada una de las 15 micro apps |
| **Ficha del cliente** | Contratos, plan, comprobantes y pagos, consumo (usuarios activos, actividad, WhatsApp vs. incluido), notas comerciales y de soporte, última actividad |
| **Facturación** | Comprobantes emitidos, pagos, vencidos, excedentes de WhatsApp por facturar |
| **Salud** | Clientes sin actividad en 7 días (riesgo de baja), errores de API por app, costos de infraestructura del mes |

## Diferencia con los dashboards de cada micro app

| | Dashboard de la micro app | Consola NovaTech |
|---|---|---|
| Quién lo usa | El cliente (su admin y supervisores) | Solo NovaTech |
| Qué ve | **Su** operación con detalle (personas, horas, ubicaciones) | **Todos** los clientes, con datos comerciales y **conteos** de uso |
| Datos personales de trabajadores del cliente | Sí (son suyos) | **No** (NovaTech es encargado de tratamiento) |

## Resumen comercial interno

| Concepto | Valor |
|---|---|
| Esfuerzo estimado | 60–80 h |
| Costo de infraestructura adicional | S/ 0 (usa la plataforma compartida) |
| Prioridad | Después del 3.er–5.º cliente |

## Carpetas

| Carpeta | Contenido |
|---|---|
| [`backend/`](backend/) | Endpoints previstos |
| [`frontend/`](frontend/) | Pantallas previstas |
| [`mobile/`](mobile/) | No aplica |
| [`database/`](database/) | Borrador SQL del esquema `consola` (validado en PostgreSQL) |
| [`docs/`](docs/) | Requerimientos, arquitectura, modelo, pruebas, implementación, manual |
