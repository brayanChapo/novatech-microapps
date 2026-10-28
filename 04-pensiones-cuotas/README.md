# 04 · Control de pensiones y cuotas

> **Estado:** 📝 Especificada — pendiente de construcción (Ola 2). Se construye **bajo demanda** (cliente firmado o 3+ prospectos del nicho).
> **Patrón de referencia:** copiar la estructura y convenciones de [`03-asistencia-rrhh`](../03-asistencia-rrhh/), que está implementada y probada.

**Nicho:** Educación privada, condominios
**Objetivo:** Bajar la morosidad con cronogramas claros, registro de pagos con voucher y recordatorios automáticos.

## Resumen comercial

| Concepto | Valor (sin IGV) |
|---|---|
| Implementación por cliente | S/ 2,500 |
| Plan Básico / Estándar / Pro | S/ 180 / S/ 300 / S/ 600 al mes |
| Esfuerzo de construcción estimado | 60 h |
| App móvil nativa | No (PWA responsive) |

## Carpetas

| Carpeta | Contenido actual | Al construir |
|---|---|---|
| [`backend/`](backend/) | Especificación de endpoints | API Hono + Zod + pruebas Vitest (como en 03) |
| [`frontend/`](frontend/) | Especificación de pantallas | Next.js + Tailwind (como en 03) |
| [`mobile/`](mobile/) | Decisión de plataforma móvil | No aplica (PWA) |
| [`database/`](database/) | Borrador SQL del esquema `pensiones` | Mover a `migrations/` + pruebas pgTAP |
| [`docs/`](docs/) | Requerimientos, arquitectura, modelo, pruebas, implementación, manual | Completar con lo construido |

## Documentación

1. [Requerimientos](docs/01-requerimientos.md) · 2. [Arquitectura](docs/02-arquitectura.md) · 3. [Modelo de datos](docs/03-modelo-datos.md) · 4. [Levantamiento local](docs/05-levantamiento-local.md) · 5. [Pruebas](docs/06-pruebas.md) · 6. [Implementación](docs/07-documento-implementacion.md) · 7. [Manual de usuario](docs/08-manual-usuario.md)
