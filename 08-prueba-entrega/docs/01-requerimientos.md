# 01 · Requerimientos — Prueba de entrega (foto, firma, GPS)

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Tener evidencia de cada entrega para resolver reclamos de "no me llegó".

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Carga entregas del día y consulta evidencias |
| **repartidor** | Registra entregas en la app |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Carga de entregas del día (CSV o manual) por repartidor | Alta | — |
| RF-02 | Lista de entregas del repartidor con dirección y mapa | Alta | Orden sugerido |
| RF-03 | Registrar entrega: foto, nombre y firma de quien recibe, GPS y hora | Alta | Los 4 datos son obligatorios |
| RF-04 | Registrar no entrega con motivo y foto | Alta | Motivos configurables |
| RF-05 | Consulta de evidencia por número de pedido | Alta | Enlace compartible con el cliente final (opcional) |
| RF-06 | Funciona sin conexión | Alta | Sincroniza al recuperar señal |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | La evidencia no se edita una vez sincronizada. |
| RN-02 | Se guarda la distancia entre el GPS de entrega y la dirección geocodificada (si existe). |

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
| RNF-08 | Específico | Hasta 300 entregas por repartidor/día. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
