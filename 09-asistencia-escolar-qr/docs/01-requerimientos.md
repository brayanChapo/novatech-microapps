# 01 · Requerimientos — Asistencia por QR con aviso a padres

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Registrar el ingreso de alumnos con QR y avisar a los padres solo cuando el alumno falta.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Alumnos, aulas, apoderados, reportes |
| **auxiliar** | Escanea QR en la puerta |
| **apoderado** | Recibe avisos por WhatsApp |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Carnet con QR por alumno (PDF imprimible por aula) | Alta | QR con token firmado, no con el DNI |
| RF-02 | Escaneo rápido en la puerta (cámara del celular/tablet) | Alta | < 1 s por alumno; sonido de confirmación |
| RF-03 | Registro de tardanza según hora de ingreso del aula | Alta | — |
| RF-04 | Aviso por WhatsApp al apoderado solo en inasistencias (hora de corte configurable) | Alta | Un aviso por alumno por día |
| RF-05 | Reporte de asistencia por aula y alumno | Alta | Exportable |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | Se considera inasistencia si a la hora de corte no hay registro. |
| RN-02 | No se envía aviso los días no lectivos (calendario escolar). |

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
| RNF-08 | Específico | Escáner funciona con conexión intermitente (cola local). |
| RNF-09 | Específico | Datos de menores: acceso mínimo, sin fotos en el QR. |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
