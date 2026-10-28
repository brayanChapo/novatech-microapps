# 01 · Requerimientos — Registro de visitas en portería con QR

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Reemplazar el cuaderno de visitas por pre-registro con QR y aviso al residente.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Unidades, residentes, porteros, reportes |
| **residente** | Pre-registra visitas y recibe avisos |
| **portero** | Valida QR o registra visita manual |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Unidades (departamentos/oficinas) y residentes | Alta | Importación CSV |
| RF-02 | Pre-registro de visita por el residente con fecha y QR de un solo uso | Alta | QR válido solo ese día |
| RF-03 | Validación del QR en portería | Alta | Registra hora de ingreso |
| RF-04 | Visita sin pre-registro: portero registra y notifica al residente | Alta | Residente autoriza/rechaza desde la notificación |
| RF-05 | Notificación push gratuita al residente (WhatsApp opcional) | Alta | Web Push en PWA instalada |
| RF-06 | Historial de visitas por unidad y fecha | Media | — |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Un QR se invalida al primer uso. |
| RN-02 | Sin respuesta del residente en 3 min → el portero llama por intercomunicador. |

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
| RNF-08 | Específico | iOS requiere que el residente instale la PWA para recibir notificaciones push. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
