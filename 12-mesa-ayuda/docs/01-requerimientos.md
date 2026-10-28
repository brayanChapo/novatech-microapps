# 01 · Requerimientos — Mesa de ayuda interna (tickets)

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Ordenar los pedidos internos a TI o mantenimiento con seguimiento y tiempos de atención.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Categorías, SLA, agentes, reportes |
| **solicitante** | Crea tickets y ve su estado |
| **agente** | Atiende y cierra tickets |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Crear ticket con categoría, prioridad, descripción y adjuntos | Alta | — |
| RF-02 | Asignación manual o por categoría | Alta | — |
| RF-03 | Estados: abierto, en atención, en espera, resuelto, cerrado | Alta | Historial de cambios |
| RF-04 | Comentarios entre solicitante y agente | Alta | Aviso por correo |
| RF-05 | SLA por prioridad con alerta de vencimiento | Media | — |
| RF-06 | Indicadores: tiempo de primera respuesta y de resolución | Media | Por agente y categoría |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | El tiempo de SLA se pausa en "en espera". |
| RN-02 | Un ticket resuelto se cierra solo a los 3 días si el solicitante no responde. |

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
| RNF-08 | Específico | Adjuntos hasta 10 MB. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
