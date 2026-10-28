# 01 · Requerimientos — Control de pensiones y cuotas

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Bajar la morosidad con cronogramas claros, registro de pagos con voucher y recordatorios automáticos.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Padrón, conceptos, cronogramas, validación de pagos, reportes |
| **tesoreria** | Valida vouchers |
| **apoderado/propietario** | Ve su estado de cuenta y sube vouchers (enlace) |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Padrón de alumnos/unidades con responsable de pago y teléfono | Alta | Importación desde CSV |
| RF-02 | Conceptos y cronograma de cuotas (matrícula, pensión mensual, mora) | Alta | Genera cuotas para todo el padrón en un paso |
| RF-03 | Estado de cuenta por responsable con enlace seguro (sin contraseña, token) | Alta | El enlace expira y es único |
| RF-04 | Registro de pago con voucher (Yape, Plin, transferencia, efectivo) | Alta | Queda pendiente hasta validación |
| RF-05 | Validación de pagos por tesorería | Alta | Al validar, la cuota pasa a pagada |
| RF-06 | Recordatorio automático por WhatsApp 3 días antes y el día de vencimiento | Alta | No se envía si ya está pagada |
| RF-07 | Reporte de morosidad por aula/torre y antigüedad | Alta | Exportable a CSV |
| RF-08 | Cálculo de mora configurable (monto fijo o % por día) | Media | Se aplica al vencer |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Una cuota pagada parcialmente queda "parcial" con saldo. |
| RN-02 | La mora no se aplica si el pago se registró antes del vencimiento aunque se valide después. |
| RN-03 | Máximo 2 recordatorios por cuota. |

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
| RNF-08 | Específico | Enlaces de estado de cuenta con token aleatorio de 32 bytes y caducidad de 30 días. |
| RNF-09 | Específico | Vouchers en Storage privado con URL firmada. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
