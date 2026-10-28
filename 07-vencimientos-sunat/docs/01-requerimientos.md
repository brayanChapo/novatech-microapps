# 01 · Requerimientos — Vencimientos SUNAT + portal de documentos

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Que el estudio contable no pierda vencimientos y reciba a tiempo los comprobantes de sus clientes.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin (contador)** | Cartera de clientes, cronograma, seguimiento |
| **asistente** | Revisa documentos recibidos |
| **cliente del estudio** | Sube comprobantes por portal |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Cartera de clientes con RUC y régimen tributario | Alta | RUC validado (11 dígitos, dígito verificador) |
| RF-02 | Cronograma anual de vencimientos según último dígito del RUC (carga anual de la tabla oficial) | Alta | Vencimientos calculados para cada cliente |
| RF-03 | Alertas por correo al contador 5 y 2 días antes | Alta | — |
| RF-04 | Portal del cliente para subir comprobantes del mes (PDF, XML, fotos) | Alta | Límite 20 MB por archivo |
| RF-05 | Recordatorio al cliente si no subió documentos 7 días antes del vencimiento | Alta | Por correo |
| RF-06 | Estado mensual por cliente: pendiente, documentos recibidos, declarado | Alta | Tablero filtrable |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | La tabla de vencimientos se carga cada año desde el cronograma publicado por SUNAT (no se inventan fechas). |
| RN-02 | Un periodo se marca "declarado" solo con constancia adjunta. |

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
| RNF-08 | Específico | Archivos en Storage privado; acceso con URL firmada de 10 min. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
