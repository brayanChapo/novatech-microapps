# 02 · Arquitectura — Orden de Trabajo con Estado por WhatsApp

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extensión "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    RE["Recepción / Admin"] -->|abre órdenes\ny entrega vehículos| WEB["Dashboard web\nNext.js PWA"]
    TC["Técnico"] -->|actualiza estado\ny adjunta fotos| WEB
    CL["Cliente"] -->|recibe WhatsApp\ncon estado| WA["WhatsApp Business\nCloud API"]
    CL -->|aprueba presupuesto\ndesde enlace| APROB["Página de aprobación\nNext.js — enlace con token"]
    WEB -->|HTTPS + JWT| API["API Taller\nHono en Vercel"]
    APROB -->|HTTPS + token| API
    API -->|service_role\nfiltra empresa_id| DB[("PostgreSQL\nSupabase")]
    API -->|fotos de vehículo\ny diagnóstico| ST["Supabase Storage"]
    API -->|cambio de estado\nal cliente| WA
    API -->|presupuesto PDF| PDF["Generación PDF\n@react-pdf/renderer"]
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph "Panel interno — auth JWT"
        WEB["frontend/app/panel\nNext.js 16\n• Crear y gestionar órdenes de trabajo\n• Asignación de técnico\n• Checklist de diagnóstico\n• Historial por placa\n• Reportes por técnico"]
    end
    subgraph "Aprobación del cliente — token"
        APROB["frontend/app/aprobar/[token]\nNext.js 16\n• Ver presupuesto con ítems\n• Botón aprobar o rechazar\n• Sin login — token de 32 bytes"]
    end
    subgraph "Vercel — equipo NovaTech"
        API["backend — Hono + Zod\n• POST /ordenes (nueva orden)\n• PATCH /ordenes/:id/estado (máquina de estados)\n• POST /ordenes/:id/presupuesto\n• GET /aprobar/:token\n• PATCH /aprobar/:token {decision}\n• GET /ordenes/:id/pdf-presupuesto\n• GET /historial-placa/:placa\n• Cada cambio de estado dispara WhatsApp"]
    end
    subgraph "Supabase — proyecto compartido"
        AU["Auth — JWT"]
        ST["Storage privado\nfotos vehículo y diagnóstico"]
        PG[("PostgreSQL\nesquema: taller\nRLS en todas las tablas")]
    end
    subgraph "Servicios externos"
        WA["WhatsApp Business\nCloud API — Meta"]
    end
    WEB -->|HTTPS + JWT| API
    APROB -->|HTTPS + token| API
    WEB --> AU
    API -->|service_role filtra empresa_id| PG
    API -->|upload / signed URL| ST
    API -->|notificación por cada cambio de estado| WA
```

**Principio clave:** la orden de trabajo es una máquina de estados estricta (recibido → diagnóstico → presupuesto → en reparación → listo → entregado); los estados solo avanzan y cada transición válida dispara automáticamente un WhatsApp al cliente, sin que el técnico o la recepción tengan que recordarlo.

## 3. Secuencia principal: ciclo completo de una orden de trabajo

```mermaid
sequenceDiagram
    autonumber
    actor RE as Recepción
    actor TC as Técnico
    actor CL as Cliente
    participant Web as Dashboard (Next.js)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant WA as WhatsApp (Meta)

    RE->>Web: Abre nueva orden (placa, km, fotos ingreso)
    Web->>API: POST /ordenes {placa, cliente_tel, km, tecnico_id, fotos[]}
    API->>DB: INSERT orden estado=recibido
    API->>WA: plantilla orden_recibida (número de orden, placa)
    WA-->>CL: WhatsApp "Su vehículo fue recibido, Orden #1234"
    API-->>Web: 201 orden_id

    TC->>Web: Completa checklist de diagnóstico
    Web->>API: PATCH /ordenes/:id/estado {estado: diagnostico, checklist: [...]}
    API->>DB: UPDATE orden estado=diagnostico
    API->>WA: plantilla cambio_estado (diagnóstico iniciado)
    WA-->>CL: WhatsApp notificación

    RE->>Web: Carga ítems del presupuesto (repuestos + mano de obra)
    Web->>API: POST /ordenes/:id/presupuesto {items[]}
    API->>DB: INSERT presupuesto + UPDATE orden estado=presupuesto
    API->>DB: genera token aprobación 32 bytes
    API->>WA: plantilla presupuesto_listo con enlace https://…/aprobar/TOKEN
    WA-->>CL: WhatsApp con monto y enlace

    CL->>Web: Abre enlace del presupuesto
    Web->>API: GET /aprobar/:token
    API->>DB: SELECT presupuesto WHERE token válido
    API-->>Web: ítems y total con IGV
    CL->>Web: Aprueba el presupuesto
    Web->>API: PATCH /aprobar/:token {decision: aprobado}
    API->>DB: UPDATE presupuesto aprobado=true, hora_aprobacion=now()
    API->>DB: UPDATE orden estado=en_reparacion
    API->>WA: plantilla cambio_estado (en reparación)
    WA-->>CL: WhatsApp notificación

    TC->>Web: Marca trabajo terminado
    Web->>API: PATCH /ordenes/:id/estado {estado: listo}
    API->>DB: UPDATE orden estado=listo
    API->>WA: plantilla vehiculo_listo
    WA-->>CL: WhatsApp "Su vehículo está listo para recoger"
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\ntaller-api\nRoot Dir: 05-ordenes-taller/backend"]
    CI -->|ok| V2["Vercel proyecto\ntaller-web\nRoot Dir: 05-ordenes-taller/frontend"]
    V1 -->|service_role| SB[("Supabase Pro\nproduccion-compartida\nesquema: taller")]
    V2 --> SB
    V1 -->|HTTPS API Graph| WA["WhatsApp\nBusiness Cloud API"]
    V1 -->|SDK| ST["Supabase Storage\nfotos vehículo y diagnóstico"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `taller-api` (Root Dir: `05-ordenes-taller/backend`) | `api-taller.novatechconsulting.com.pe` |
| Dashboard / Aprobación | `taller-web` (Root Dir: `05-ordenes-taller/frontend`) | `taller.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `taller`) | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **Máquina de estados estricta en el backend** con transiciones válidas por tabla | Libre actualización de estado desde el frontend | La regla RN-02 exige que los estados solo avancen; el backend es el único punto que puede garantizar que no se salten pasos o retrocedan sin autorización de admin. |
| ADR-02 | **WhatsApp automático en cada transición de estado** desde el servicio de dominio | Notificación manual por el técnico o recepción | El humano olvida notificar; el disparo automático en cada `PATCH /ordenes/:id/estado` garantiza que el cliente siempre esté informado sin fricción adicional. |
| ADR-03 | **Aprobación del cliente con token sin cuenta** | Requerir login del cliente | El cliente ya tiene el WhatsApp abierto; un enlace con token de 32 bytes es friccional mínimo y suficientemente seguro para una aprobación de presupuesto. |
| ADR-04 | **Presupuesto PDF generado en el servidor** con `@react-pdf/renderer` | PDF en navegador | El servidor garantiza formato con IGV consistente y el PDF queda en Storage para auditoría; cumple RF-04 con totales correctos. |
| ADR-05 | **No se puede pasar a "en reparación" sin presupuesto aprobado** (validado en el servidor) | Solo validación en el frontend | La lógica de negocio RN-01 no debe vivir en el cliente; el backend rechaza la transición con 422 si el presupuesto no fue aprobado. |
| ADR-06 | **Historial por placa** como índice en la BD | Búsqueda full-text | La placa es el identificador natural del vehículo en el dominio; un índice B-tree sobre `placa` es suficiente para recuperar el historial en O(log n). |
| ADR-07 | **Fotos comprimidas en el cliente** antes de subir (≤ 500 KB) | Comprimir en el servidor | Ahorra ancho de banda y tiempo de carga; el cliente web puede usar `canvas` para comprimir antes del POST. Cumple RNF-08. |

## 6. Estructura de código

```
05-ordenes-taller/
├── backend/
│   ├── api/index.ts                   # entrada Vercel
│   ├── src/
│   │   ├── app.ts                     # Hono: CORS, auth, rutas, errores
│   │   ├── domain/
│   │   │   ├── estado-orden.ts        # máquina de estados y transiciones válidas
│   │   │   ├── presupuesto.ts         # cálculo de subtotal e IGV
│   │   │   └── notificacion.ts        # plantilla WhatsApp por estado
│   │   ├── services/                  # crearOrden, cambiarEstado, aprobarPresupuesto
│   │   ├── repos/                     # OrdenRepo, PresupuestoRepo, VehiculoRepo
│   │   ├── routes/
│   │   │   ├── ordenes.ts             # CRUD de órdenes
│   │   │   ├── presupuesto.ts         # POST ítems, GET PDF
│   │   │   ├── aprobar.ts             # GET|PATCH /aprobar/:token
│   │   │   └── historial.ts           # GET /historial-placa/:placa
│   │   ├── middleware/auth.ts
│   │   └── lib/                       # supabase, whatsapp, pdf-renderer, zod
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── aprobar/[token]/           # página pública de aprobación
│   │   └── (panel)/
│   │       ├── ordenes/               # listado y detalle
│   │       ├── tecnico/               # vista del técnico
│   │       └── reportes/
│   ├── components/                    # KanbanOrdenes, ChecklistSST, ui/
│   └── lib/                           # api-client, compresor-imagen, sesion
└── database/
    ├── migrations/20261008000500_taller.sql
    ├── seed.sql
    └── tests/rls_taller.test.sql
```
