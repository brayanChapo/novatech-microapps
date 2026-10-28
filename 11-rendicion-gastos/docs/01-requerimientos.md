# 01 · Requerimientos — Rendición de gastos con foto de comprobante

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Reemplazar las rendiciones en Excel por un flujo con foto del comprobante, aprobación y reporte para contabilidad.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Categorías, topes, centros de costo, reportes |
| **colaborador** | Registra gastos |
| **aprobador** | Aprueba o rechaza |
| **contabilidad** | Exporta |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Registrar gasto con foto del comprobante, RUC del emisor, monto, fecha y categoría | Alta | RUC validado |
| RF-02 | Topes por categoría y alerta si se excede | Alta | Se permite registrar, marcado como excedido |
| RF-03 | Agrupar gastos en una rendición y enviarla a aprobación | Alta | — |
| RF-04 | Aprobar / rechazar con comentario | Alta | Notificación por correo |
| RF-05 | Exportación contable (CSV) por periodo y centro de costo | Alta | — |
| RF-06 | Detección de comprobante duplicado (mismo RUC + serie + número) | Media | Aviso al registrar |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Una rendición aprobada no se edita. |
| RN-02 | El aprobador no puede aprobar sus propios gastos. |

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
| RNF-08 | Específico | Foto comprimida en el navegador; legible al 100 %. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
