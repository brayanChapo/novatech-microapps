# 02 · Toma de pedidos en ruta + cobranzas

> **Estado:** 📝 Especificada — pendiente de construcción (Ola 1). Se construye **bajo demanda** (cliente firmado o 3+ prospectos del nicho).
> **Patrón de referencia:** copiar la estructura y convenciones de [`03-asistencia-rrhh`](../03-asistencia-rrhh/), que está implementada y probada.

**Nicho:** Distribuidoras y mayoristas
**Objetivo:** Que los vendedores tomen pedidos en ruta (incluso sin señal) con precios correctos y que el dueño controle las cuentas por cobrar.

## Resumen comercial

| Concepto | Valor (sin IGV) |
|---|---|
| Implementación por cliente | S/ 5,500 |
| Plan Básico / Estándar / Pro | S/ 250 / S/ 400 / S/ 700 al mes |
| Esfuerzo de construcción estimado | 140 h |
| App móvil nativa | Sí (Expo) |

## Carpetas

| Carpeta | Contenido actual | Al construir |
|---|---|---|
| [`backend/`](backend/) | Especificación de endpoints | API Hono + Zod + pruebas Vitest (como en 03) |
| [`frontend/`](frontend/) | Especificación de pantallas | Next.js + Tailwind (como en 03) |
| [`mobile/`](mobile/) | Decisión de plataforma móvil | App Expo (como en 03) |
| [`database/`](database/) | Borrador SQL del esquema `pedidos` | Mover a `migrations/` + pruebas pgTAP |
| [`docs/`](docs/) | Requerimientos, arquitectura, modelo, pruebas, implementación, manual | Completar con lo construido |

## Documentación

1. [Requerimientos](docs/01-requerimientos.md) · 2. [Arquitectura](docs/02-arquitectura.md) · 3. [Modelo de datos](docs/03-modelo-datos.md) · 4. [Levantamiento local](docs/05-levantamiento-local.md) · 5. [Pruebas](docs/06-pruebas.md) · 6. [Implementación](docs/07-documento-implementacion.md) · 7. [Manual de usuario](docs/08-manual-usuario.md)
