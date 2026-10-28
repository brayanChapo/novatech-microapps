# 01 · Requerimientos — Orden de trabajo con estado por WhatsApp

**Versión:** 0.9 (especificación previa a construcción) · **Fecha:** 8 de octubre de 2026

## Objetivo

Que el cliente sepa en qué estado está su vehículo sin llamar, y que el taller tenga historial por placa.

## Actores

| Actor | Responsabilidad |
|---|---|
| **admin** | Configura servicios, técnicos y reportes |
| **recepcion** | Abre órdenes, presupuesta, entrega |
| **tecnico** | Actualiza estado y fotos |

## Requerimientos funcionales

| ID | Requerimiento | Prioridad | Criterio de aceptación |
|---|---|---|---|
| RF-01 | Abrir orden con placa, cliente, kilometraje y fotos de ingreso | Alta | Placa con formato peruano validado |
| RF-02 | Estados: recibido → diagnóstico → presupuesto → en reparación → listo → entregado | Alta | Cada cambio queda con hora y usuario |
| RF-03 | Aviso automático por WhatsApp en cada cambio de estado | Alta | Se respeta el paquete del plan |
| RF-04 | Presupuesto en PDF con ítems (repuestos y mano de obra) | Alta | Totales con IGV |
| RF-05 | Aprobación del presupuesto por el cliente desde enlace | Media | Queda registrada fecha y hora |
| RF-06 | Historial por placa y recordatorio del próximo mantenimiento | Media | Por km o por fecha |
| RF-07 | Reporte de órdenes por técnico y tiempos promedio | Media | — |

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-01 | No se puede pasar a "en reparación" sin presupuesto aprobado (salvo garantía). |
| RN-02 | Los estados solo avanzan; retroceder requiere admin y deja motivo. |

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
| RNF-08 | Específico | Fotos comprimidas en el navegador antes de subir (≤ 500 KB). |

## Validar con el primer cliente

- [ ] Confirmar que los RF de prioridad Alta cubren su proceso real.
- [ ] Ajustar textos, estados y reportes a su vocabulario.
- [ ] Firmar la ficha de alcance (lo no listado se cotiza aparte).
