# 01 · Requerimientos — Parte diario de obra + checklist SST

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Ordenar el reporte diario de avance y las inspecciones de seguridad con evidencia fotográfica y firma.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Obras, plantillas de checklist, reportes |
| **residente** | Llena el parte diario y firma |
| **prevencionista** | Llena checklists SST |
| **gerencia** | Consulta avances |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Registro de obras con ubicación | Alta | — |
| RF-02 | Parte diario: avance por partida (%), personal por categoría, maquinaria, incidencias, clima, fotos | Alta | Un parte por obra y día |
| RF-03 | Checklist SST configurable (sí/no/no aplica + observación + foto) | Alta | Ítems críticos en "no" generan alerta |
| RF-04 | Firma digital del responsable en pantalla | Alta | Firma guardada como imagen |
| RF-05 | Funciona sin conexión en obra y sincroniza después | Alta | Sin pérdida de fotos |
| RF-06 | Reporte semanal en PDF por obra | Alta | Incluye fotos y firmas |
| RF-07 | Alerta por correo de ítem crítico no conforme | Media | En < 5 min de sincronizado |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | El parte del día se cierra con firma; luego solo admin puede reabrir. |
| RN-02 | Las fotos guardan fecha, hora y GPS de captura. |

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
| RNF-08 | Específico | Hasta 30 fotos por parte; compresión en el dispositivo. |
| RNF-09 | Específico | Operación sin señal hasta 24 h. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
