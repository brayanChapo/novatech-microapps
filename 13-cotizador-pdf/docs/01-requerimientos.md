# 01 · Requerimientos — Cotizador con PDF

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Generar cotizaciones profesionales en minutos con la marca del cliente.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Catálogo, plantilla con logo, condiciones |
| **vendedor** | Crea cotizaciones |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Catálogo de ítems/partidas con unidad y precio | Alta | Importación CSV |
| RF-02 | Crear cotización: cliente, ítems, descuentos, IGV, validez | Alta | Totales correctos al céntimo |
| RF-03 | PDF con logo, colores y condiciones del cliente | Alta | — |
| RF-04 | Numeración correlativa y versiones | Alta | COT-2026-0001 v2 |
| RF-05 | Estados: borrador, enviada, aceptada, rechazada, vencida | Media | — |
| RF-06 | Envío por correo o enlace de WhatsApp (wa.me) | Media | Sin costo de API |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | IGV 18 % sobre la base después de descuentos (configurable si el cliente está exonerado). |
| RN-02 | Una cotización enviada no se edita: se crea una nueva versión. |

## Requerimientos no funcionales

| ID | Categoría | Requerimiento |
|---|---|---|
| RNF-01 | Seguridad | Aislamiento entre empresas con RLS + filtro `empresa_id` en backend; pruebas pgTAP. |
| RNF-02 | Seguridad | Clientes sin permisos de escritura directa; validación Zod en todas las entradas. |
| RNF-03 | Usabilidad | Interfaz en español, responsive desde 360 px, acciones principales en ≤ 3 toques. |
| RNF-04 | Rendimiento | Respuestas de API p95 < 1 s; páginas < 2 s en 4G. |
| RNF-05 | Mantenibilidad | TypeScript estricto; cobertura ≥ 80 % en dominio y servicios. |
| RNF-06 | Costos | Usar solo la plataforma compartida (Vercel + Supabase); servicios de pago adicionales requieren aprobación. |
| RNF-07 | Legal | Ley 29733: finalidad informada y encargo de tratamiento con el cliente. |
| RNF-08 | Específico | PDF generado en < 3 s. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
