# 02 · Arquitectura — Rendicion de Gastos con Foto de Comprobante

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extension "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    COL["Colaborador\n(celular PWA)"] -->|registra gasto con foto| WEB["Web / PWA\nNext.js"]
    APR["Aprobador\n(navegador)"] -->|aprueba o rechaza| WEB
    ADM["Admin Contable\n(navegador)"] -->|configura categorias y exporta| WEB
    WEB -->|HTTPS + JWT| API["API Gastos\nHono en Vercel"]
    API -->|service_role| DB[("PostgreSQL\nSupabase")]
    API -->|login| AUTH["Supabase Auth"]
    API -->|guarda foto comprobante| STO["Supabase Storage\n(bucket privado)"]
    API -.->|notificacion al aprobador| MAIL["Correo\n(Resend)"]
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph Cliente
      F["frontend/ — Next.js 16\n• Login (todos los roles)\n• Vista colaborador: formulario de gasto con camara\n• Vista aprobador: bandeja de rendiciones pendientes\n• Vista admin: categorias, topes, centros de costo\n• Exportacion CSV mensual\n• Alerta visual si gasto excede tope"]
    end
    subgraph "Vercel (equipo NovaTech)"
      B["backend/ — Hono + Zod\n• Valida JWT y carga perfil\n• POST /gastos: guarda foto en Storage y metadata en DB\n• POST /rendiciones: agrupa gastos y envia a aprobacion\n• POST /rendiciones/:id/aprobar o rechazar\n• Detecta comprobantes duplicados (RUC+serie+numero)\n• Valida tope por categoria\n• GET /reportes/csv"]
    end
    subgraph "Supabase (proyecto compartido)"
      AU["Auth (JWT)"]
      PG[("PostgreSQL\nesquemas core + gastos\nRLS en todas las tablas")]
      ST["Storage bucket gastos\n(privado, URL firmada)"]
    end
    subgraph Externo
      MAIL["Servicio de Correo\n(Resend)"]
    end
    F --> B
    F --> AU
    B -->|service_role, filtra empresa_id| PG
    B -->|upload foto| ST
    B -->|notifica aprobacion pendiente| MAIL
```

**Principio clave:** las fotos de comprobantes se guardan en un **bucket privado de Supabase Storage**; el cliente nunca recibe una URL publica permanente, sino **URL firmadas de corta duracion** generadas por el backend bajo demanda, respetando el RLS de datos.

## 3. Secuencia principal: registro de gasto y flujo de aprobacion

```mermaid
sequenceDiagram
    autonumber
    actor C as Colaborador
    actor A as Aprobador
    participant Web as PWA (Next.js)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant STO as Storage (bucket gastos)
    participant MAIL as Correo (Resend)

    C->>Web: Abre formulario Nuevo Gasto
    C->>Web: Toma foto del comprobante con camara PWA
    Web->>Web: comprime imagen en browser (max 800 KB)
    C->>Web: completa RUC, serie, numero, monto, categoria, fecha
    Web->>API: POST /gastos con multipart (foto + metadata)
    API->>API: valida Zod: RUC 11 digitos, monto positivo
    API->>DB: verifica duplicado (empresa_id, RUC, serie, numero)
    alt duplicado detectado
        API-->>Web: 409 Comprobante ya registrado
    else nuevo registro
        API->>STO: PUT foto con path empresa_id/anio/mes/uuid.jpg
        API->>DB: INSERT gasto con storage_path y estado borrador
        API->>DB: consulta tope de categoria
        API-->>Web: 201 con id y alerta si excede tope
    end
    C->>Web: agrupa gastos y envia rendicion
    Web->>API: POST /rendiciones con lista de gasto_ids
    API->>DB: INSERT rendicion, UPDATE gastos a estado enviado
    API->>MAIL: envia notificacion al aprobador con resumen
    MAIL-->>API: entregado
    A->>Web: abre bandeja de rendiciones pendientes
    Web->>API: GET /rendiciones/pendientes (JWT aprobador)
    API->>DB: SELECT rendiciones con gastos de empresa del aprobador
    API-->>Web: lista de rendiciones con montos y categorias
    A->>Web: revisa fotos de comprobantes
    Web->>API: GET /gastos/:id/foto-url (JWT)
    API->>STO: genera URL firmada con expiracion 10 min
    API-->>Web: URL firmada temporal
    A->>Web: aprueba o rechaza con comentario
    Web->>API: POST /rendiciones/:id/aprobar o /rechazar
    API->>DB: UPDATE rendicion estado y comentario
    API->>MAIL: notifica resultado al colaborador
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\nrendicion-gastos-api"]
    CI -->|ok| V2["Vercel proyecto\nrendicion-gastos-web"]
    V1 --> SB[("Supabase Pro\nproduccion-compartida\nesquema gastos + Storage")]
    V2 --> SB
    V1 -->|API key| MAIL["Resend"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `rendicion-gastos-api` (Root: `11-rendicion-gastos/backend`) | `api-gastos.novatechconsulting.com.pe` |
| Web / PWA | `rendicion-gastos-web` (Root: `11-rendicion-gastos/frontend`) | `gastos.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `gastos`) | — |
| Storage | Supabase `produccion-compartida` bucket `gastos` (privado) | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decision | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **Fotos en bucket privado con URL firmada** (10 min) | Bucket publico con URL permanente, Google Drive | Datos financieros y fiscales deben tener acceso controlado; la URL firmada expira automaticamente y fuerza validacion de sesion en cada acceso. |
| ADR-02 | **Compresion de imagen en el browser** antes de subir | Subir en full resolution, comprimir en servidor | Reduce el consumo de ancho de banda del cliente movil y el tiempo de carga; la calidad resultante (max 800 KB) es suficiente para leer RUC y montos. |
| ADR-03 | **Deteccion de duplicado por (empresa_id, RUC, serie, numero)** a nivel DB con constraint unico | Solo validacion en codigo | La restriccion en base de datos es la barrera mas robusta; elimina race conditions en envios concurrentes. |
| ADR-04 | **Estado de rendicion inmutable tras aprobacion** (RN-01) | Edicion con trazabilidad | Simplifica la auditoria contable; cualquier correccion requiere nueva rendicion, lo que genera trazabilidad automatica. |
| ADR-05 | **El aprobador no puede aprobar sus propios gastos** (RN-02) validado en el servidor | Solo en el frontend | La regla de negocio en el servidor evita que un cambio de rol o una llamada directa a la API omita la restriccion. |
| ADR-06 | **Exportacion CSV generada en el servidor** con streaming | Descarga desde el cliente con datos cacheados | El volumen mensual puede ser grande; el servidor filtra por empresa_id, periodo y centro de costo sin exponer datos de otras empresas. |
| ADR-07 | **Notificaciones solo por correo** (no WhatsApp) | WhatsApp, push nativa | El flujo de aprobacion es un proceso laboral interno; el correo es el canal adecuado y no genera costo variable por mensaje. |

## 6. Estructura de codigo

```
11-rendicion-gastos/
├── backend/
│   ├── api/index.ts
│   ├── src/
│   │   ├── app.ts
│   │   ├── domain/
│   │   │   ├── gasto.ts               # validarDuplicado, calcularExcedente
│   │   │   ├── rendicion.ts           # calcularTotal, estadoPermitido
│   │   │   └── storage.ts             # generarPath, generarURLFirmada
│   │   ├── services/
│   │   │   ├── registrarGasto.ts      # sube foto y guarda metadata
│   │   │   ├── enviarRendicion.ts
│   │   │   └── aprobarRechazar.ts
│   │   ├── repos/
│   │   │   ├── GastoRepo.ts
│   │   │   └── RendicionRepo.ts
│   │   ├── routes/
│   │   │   ├── gastos.ts              # POST /gastos, GET /gastos/:id/foto-url
│   │   │   ├── rendiciones.ts         # POST, GET pendientes, aprobar, rechazar
│   │   │   ├── reportes.ts            # GET /reportes/csv
│   │   │   └── admin.ts               # CRUD categorias, topes, centros de costo
│   │   ├── middleware/auth.ts
│   │   └── lib/
│   │       ├── supabase.ts
│   │       ├── storage.ts
│   │       ├── correo.ts
│   │       └── csv.ts
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   └── (panel)/
│   │       ├── nuevo-gasto/           # formulario con camara PWA
│   │       ├── mis-rendiciones/
│   │       ├── aprobar/               # bandeja del aprobador
│   │       ├── reportes/
│   │       └── admin/                 # categorias y topes
│   ├── components/
│   │   ├── CamaraComprobante.tsx      # PWA camera API
│   │   ├── EstadoBadge.tsx
│   │   └── ui/
│   └── lib/
│       ├── api.ts
│       ├── imagen.ts                  # compresion browser-side
│       └── formato.ts
└── database/
    ├── migrations/20261028001100_gastos.sql
    ├── seed.sql
    └── tests/rls_gastos.test.sql
```
