# 15 · Registro de visitas en portería con QR

> **Estado:** 📝 Especificada — pendiente de construcción (Ola 3). Se construye **bajo demanda** (cliente firmado o 3+ prospectos del nicho).
> **Patrón de referencia:** copiar la estructura y convenciones de [`03-asistencia-rrhh`](../03-asistencia-rrhh/), que está implementada y probada.

**Nicho:** Condominios, empresas
**Objetivo:** Reemplazar el cuaderno de visitas por pre-registro con QR y aviso al residente.

## Resumen comercial

| Concepto | Valor (sin IGV) |
|---|---|
| Implementación por cliente | S/ 1,800 |
| Plan Básico / Estándar / Pro | S/ 120 / S/ 200 / S/ 400 al mes |
| Esfuerzo de construcción estimado | 40 h |
| App móvil nativa | No (PWA responsive) |

## Carpetas

| Carpeta | Contenido actual | Al construir |
|---|---|---|
| [`backend/`](backend/) | Especificación de endpoints | API Hono + Zod + pruebas Vitest (como en 03) |
| [`frontend/`](frontend/) | Especificación de pantallas | Next.js + Tailwind (como en 03) |
| [`mobile/`](mobile/) | Decisión de plataforma móvil | No aplica (PWA) |
| [`database/`](database/) | Borrador SQL del esquema `porteria` | Mover a `migrations/` + pruebas pgTAP |
| [`docs/`](docs/) | Requerimientos, arquitectura, modelo, pruebas, implementación, manual | Completar con lo construido |

## Documentación

1. [Requerimientos](docs/01-requerimientos.md) · 2. [Arquitectura](docs/02-arquitectura.md) · 3. [Modelo de datos](docs/03-modelo-datos.md) · 4. [Levantamiento local](docs/05-levantamiento-local.md) · 5. [Pruebas](docs/06-pruebas.md) · 6. [Implementación](docs/07-documento-implementacion.md) · 7. [Manual de usuario](docs/08-manual-usuario.md)
