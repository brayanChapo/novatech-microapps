# 01 · Agenda de citas + recordatorios WhatsApp

> **Estado:** 📝 Especificada — pendiente de construcción (Ola 1). Se construye **bajo demanda** (cliente firmado o 3+ prospectos del nicho).
> **Patrón de referencia:** copiar la estructura y convenciones de [`03-asistencia-rrhh`](../03-asistencia-rrhh/), que está implementada y probada.

**Nicho:** Salud privada (adaptable a barberías, spas, talleres)
**Objetivo:** Reducir las inasistencias de pacientes con reserva en línea y recordatorios automáticos por WhatsApp.

## Resumen comercial

| Concepto | Valor (sin IGV) |
|---|---|
| Implementación por cliente | S/ 3,500 |
| Plan Básico / Estándar / Pro | S/ 180 / S/ 300 / S/ 600 al mes |
| Esfuerzo de construcción estimado | 100 h |
| App móvil nativa | No (PWA responsive) |

## Carpetas

| Carpeta | Contenido actual | Al construir |
|---|---|---|
| [`backend/`](backend/) | Especificación de endpoints | API Hono + Zod + pruebas Vitest (como en 03) |
| [`frontend/`](frontend/) | Especificación de pantallas | Next.js + Tailwind (como en 03) |
| [`mobile/`](mobile/) | Decisión de plataforma móvil | No aplica (PWA) |
| [`database/`](database/) | Borrador SQL del esquema `agenda` | Mover a `migrations/` + pruebas pgTAP |
| [`docs/`](docs/) | Requerimientos, arquitectura, modelo, pruebas, implementación, manual | Completar con lo construido |

## Documentación

1. [Requerimientos](docs/01-requerimientos.md) · 2. [Arquitectura](docs/02-arquitectura.md) · 3. [Modelo de datos](docs/03-modelo-datos.md) · 4. [Levantamiento local](docs/05-levantamiento-local.md) · 5. [Pruebas](docs/06-pruebas.md) · 6. [Implementación](docs/07-documento-implementacion.md) · 7. [Manual de usuario](docs/08-manual-usuario.md)
