# 09 · Asistencia por QR con aviso a padres

> **Estado:** 📝 Especificada — pendiente de construcción (Ola 3). Se construye **bajo demanda** (cliente firmado o 3+ prospectos del nicho).
> **Patrón de referencia:** copiar la estructura y convenciones de [`03-asistencia-rrhh`](../03-asistencia-rrhh/), que está implementada y probada.

**Nicho:** Educación privada
**Objetivo:** Registrar el ingreso de alumnos con QR y avisar a los padres solo cuando el alumno falta.

## Resumen comercial

| Concepto | Valor (sin IGV) |
|---|---|
| Implementación por cliente | S/ 2,000 |
| Plan Básico / Estándar / Pro | S/ 180 / S/ 300 / S/ 600 al mes |
| Esfuerzo de construcción estimado | 40 h |
| App móvil nativa | Sí (Expo) |

## Carpetas

| Carpeta | Contenido actual | Al construir |
|---|---|---|
| [`backend/`](backend/) | Especificación de endpoints | API Hono + Zod + pruebas Vitest (como en 03) |
| [`frontend/`](frontend/) | Especificación de pantallas | Next.js + Tailwind (como en 03) |
| [`mobile/`](mobile/) | Decisión de plataforma móvil | App Expo (como en 03) |
| [`database/`](database/) | Borrador SQL del esquema `escolar` | Mover a `migrations/` + pruebas pgTAP |
| [`docs/`](docs/) | Requerimientos, arquitectura, modelo, pruebas, implementación, manual | Completar con lo construido |

## Documentación

1. [Requerimientos](docs/01-requerimientos.md) · 2. [Arquitectura](docs/02-arquitectura.md) · 3. [Modelo de datos](docs/03-modelo-datos.md) · 4. [Levantamiento local](docs/05-levantamiento-local.md) · 5. [Pruebas](docs/06-pruebas.md) · 6. [Implementación](docs/07-documento-implementacion.md) · 7. [Manual de usuario](docs/08-manual-usuario.md)
