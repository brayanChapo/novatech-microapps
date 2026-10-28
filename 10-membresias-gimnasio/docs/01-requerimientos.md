# 01 · Requerimientos — Membresías con acceso por QR

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Controlar que solo ingresen socios con membresía vigente y aumentar las renovaciones.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Planes, socios, pagos, reportes |
| **recepcion** | Registra pagos y valida ingreso |
| **socio** | Muestra su QR desde el celular (PWA) |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Planes (mensual, trimestral, anual, por sesiones) | Alta | — |
| RF-02 | Registro de socios y pagos que extienden la vigencia | Alta | Vigencia calculada automáticamente |
| RF-03 | QR personal del socio en una página instalable | Alta | QR rotativo cada 30 s para evitar capturas |
| RF-04 | Validación de ingreso en recepción (verde/rojo) | Alta | Rojo si vencido o sin sesiones |
| RF-05 | Aviso por WhatsApp 3 días antes del vencimiento | Alta | — |
| RF-06 | Reporte de renovaciones, vencidos y asistencia por hora | Media | — |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Un pago extiende desde el vencimiento actual si aún está vigente; si no, desde hoy. |
| RN-02 | Planes por sesiones descuentan 1 por ingreso (máx. 1 por día). |

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
| RNF-08 | Específico | Validación de ingreso en < 1 s. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
