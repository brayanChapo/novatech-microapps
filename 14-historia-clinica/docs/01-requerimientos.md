# 01 · Requerimientos — Historia clínica simple

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Reemplazar historias en papel o Word por fichas digitales con control de acceso y respaldo.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Profesionales y permisos |
| **profesional** | Crea y consulta historias de sus pacientes |
| **recepcion** | Datos administrativos del paciente (sin acceso clínico) |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Ficha del paciente (filiación, antecedentes, alergias) | Alta | Alergias visibles en cabecera |
| RF-02 | Evoluciones por atención (motivo, examen, diagnóstico CIE-10, indicaciones) con fotos | Alta | Firmadas por el profesional |
| RF-03 | Acceso solo de profesionales autorizados; recepción sin datos clínicos | Alta | Probado con RLS |
| RF-04 | Bitácora de accesos: quién vio qué y cuándo | Alta | No editable |
| RF-05 | Exportar historia en PDF a solicitud del paciente | Alta | — |
| RF-06 | Las evoluciones firmadas no se borran; se corrigen con adenda | Alta | — |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Proyecto Supabase DEDICADO por cliente (datos sensibles). |
| RN-02 | Toda lectura de historia registra una fila en la bitácora. |

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
| RNF-08 | Específico | Cifrado en tránsito y en reposo (Supabase). |
| RNF-09 | Específico | Copias de seguridad diarias y exportación mensual al cliente. |
| RNF-10 | Específico | Cumplir Ley 29733 (datos sensibles de salud) y normativa de historias clínicas; validar con asesor legal. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
