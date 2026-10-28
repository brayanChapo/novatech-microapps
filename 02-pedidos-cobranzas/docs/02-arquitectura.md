# 02 · Arquitectura — Toma de Pedidos en Ruta + Cobranzas

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extensión "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    VE["Vendedor\ncelular en ruta"] -->|toma pedidos y\nregistra cobros| APP["App móvil\nExpo SDK 57"]
    AD["Administrador"] -->|catálogo, clientes\ny reportes| WEB["Dashboard web\nNext.js"]
    AL["Almacén"] -->|ve pedidos y\ncambia estados| WEB
    APP -->|HTTPS + JWT\ncuando hay señal| API["API Pedidos\nHono en Vercel"]
    WEB -->|HTTPS + JWT| API
    APP -->|login| AUTH["Supabase Auth"]
    WEB -->|login| AUTH
    API -->|service_role\nfiltra empresa_id| DB[("PostgreSQL\nSupabase")]
    API -->|fotos vouchers\ny productos| ST["Supabase Storage"]
    API -->|recordatorio\ndeuda vencida| WA["WhatsApp Business\nCloud API"]
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph "Móvil — vendedor en campo"
        MOB["mobile — Expo SDK 57\n• Catálogo con búsqueda local (SQLite)\n• Cartera de clientes asignados\n• Toma de pedido offline (SQLite local)\n• UUID generado en el celular\n• Cola de sincronización con retry\n• Registro de cobro + foto de voucher\n• GPS de visita (solo al registrar acción)"]
    end
    subgraph "Web — admin y almacén"
        WEB["frontend — Next.js 16\n• Dashboard de ventas por vendedor / día\n• Gestión de catálogo y precios\n• Cuentas por cobrar con antigüedad\n• Validación de cobros\n• Cambio de estado de despacho"]
    end
    subgraph "Vercel — equipo NovaTech"
        API["backend — Hono + Zod\n• POST /pedidos (idempotente por UUID)\n• POST /cobros (con foto voucher)\n• GET /catalogo, /clientes, /cuentas\n• PATCH /pedidos/:id/estado (almacén)\n• GET /cron/recordatorios-deuda\n• Validación Zod en todas las entradas"]
    end
    subgraph "Supabase — proyecto compartido"
        AU["Auth — JWT"]
        ST["Storage privado\nfotos de vouchers y productos"]
        PG[("PostgreSQL\nesquema: pedidos\nRLS en todas las tablas")]
    end
    subgraph "Servicios externos"
        WA["WhatsApp Business\nCloud API — Meta"]
    end
    MOB -->|sync cola local POST /pedidos| API
    MOB -->|POST /cobros multipart| API
    WEB -->|HTTPS + JWT| API
    MOB --> AU
    WEB --> AU
    API -->|service_role filtra empresa_id| PG
    API -->|upload/download signed URL| ST
    API -->|deuda vencida max 1x/semana| WA
```

**Principio clave:** el UUID del pedido lo genera el celular antes de tener señal; la API aplica idempotencia con `INSERT ... ON CONFLICT (uuid) DO NOTHING`, garantizando que reintentos de sincronización no dupliquen pedidos.

## 3. Secuencia principal: toma de pedido offline y sincronización

```mermaid
sequenceDiagram
    autonumber
    actor V as Vendedor
    participant App as App Expo (SQLite)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant ST as Storage

    V->>App: Abre pedido nuevo para cliente X
    App->>App: genera UUID local para el pedido
    App->>App: carga catálogo desde SQLite local
    V->>App: agrega productos y confirma pedido
    App->>App: INSERT pedido en SQLite (estado: pendiente_sync)
    App-->>V: Pedido guardado localmente

    Note over App,API: Al recuperar señal de red
    App->>API: POST /pedidos {uuid, cliente_id, lineas[], timestamp_local}
    API->>API: valida Zod — verifica JWT y empresa_id
    API->>DB: INSERT INTO pedidos ON CONFLICT (uuid) DO NOTHING
    alt primer intento (pedido nuevo)
        DB-->>API: pedido insertado
        API-->>App: 201 Pedido recibido
        App->>App: UPDATE SQLite estado=sincronizado
    else reintento (UUID ya existe)
        DB-->>API: conflict ignorado
        API-->>App: 200 Ya procesado (idempotente)
        App->>App: UPDATE SQLite estado=sincronizado
    end

    Note over V,ST: Registro de cobro con voucher
    V->>App: Fotografía voucher de pago
    App->>App: comprimir imagen localmente
    App->>API: POST /cobros {pedido_id, monto, foto_base64}
    API->>ST: upload foto a storage privado
    ST-->>API: path del archivo
    API->>DB: INSERT cobro (pendiente validación)
    API-->>App: 201 Cobro registrado
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\npedidos-api\nRoot Dir: 02-pedidos-cobranzas/backend"]
    CI -->|ok| V2["Vercel proyecto\npedidos-web\nRoot Dir: 02-pedidos-cobranzas/frontend"]
    GH -->|EAS Build trigger| EAS["Expo EAS Build\nAPK / AAB / IPA"]
    EAS --> PS["Google Play / App Store\no APK interno"]
    V1 -->|Vercel Cron diario| CRON["Job recordatorios\ndeuda vencida"]
    V1 -->|service_role| SB[("Supabase Pro\nproduccion-compartida\nesquema: pedidos")]
    V2 --> SB
    V1 -->|HTTPS| WA["WhatsApp\nBusiness Cloud API"]
    V1 -->|SDK| ST2["Supabase Storage\nfirmas + vouchers"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `pedidos-api` (Root Dir: `02-pedidos-cobranzas/backend`) | `api-pedidos.novatechconsulting.com.pe` |
| Dashboard web | `pedidos-web` (Root Dir: `02-pedidos-cobranzas/frontend`) | `pedidos.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `pedidos`) | — |
| App móvil | Expo EAS · paquete `pe.com.novatechconsulting.pedidos` | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **UUID generado en el celular** como clave del pedido | ID autoincremental generado en el servidor | El celular está offline cuando se crea el pedido; el UUID permite identificar unívocamente el registro antes de sincronizar y aplicar idempotencia en el servidor con `ON CONFLICT DO NOTHING`. |
| ADR-02 | **App Expo nativa** (no PWA) | PWA con Service Worker y IndexedDB | `expo-sqlite` ofrece una base de datos relacional real en el dispositivo, soporte de transacciones y rendimiento superior a IndexedDB para catálogos de cientos de productos y offline hasta 8 h (RNF-08). |
| ADR-03 | **SQLite local** para catálogo y cola de pedidos | Solo memoria en React Native | La memoria se pierde al matar la app; SQLite persiste entre sesiones y permite búsquedas eficientes sin red. |
| ADR-04 | **Fotos de vouchers en Storage privado** con URL firmada | Guardar fotos en la BD como BYTEA | Storage es más barato, no infla la BD, y permite URLs firmadas de duración controlada para visualización por el admin. |
| ADR-05 | **Recordatorio de deuda máximo 1 vez/semana por cliente** via WhatsApp | Sin límite de frecuencia | Respetar al receptor reduce bloqueos de número; cumple RN-04 y la regla R9 (WhatsApp solo para alertas). |
| ADR-06 | **GPS solo al registrar la visita** (no rastreo continuo) | Rastreo en segundo plano | Batería, privacidad (Ley 29733) y aprobación en tiendas. Cumple R8. |
| ADR-07 | **Un esquema por app** (`pedidos`) en Supabase compartido | Proyecto Supabase separado | Costo ~US$10/mes por proyecto adicional; el esquema con RLS provee aislamiento multi-tenant suficiente. Cumple R7. |

## 6. Estructura de código

```
02-pedidos-cobranzas/
├── backend/
│   ├── api/index.ts                   # entrada Vercel
│   ├── src/
│   │   ├── app.ts                     # Hono: CORS, auth, rutas, errores
│   │   ├── domain/                    # lógica PURA sin I/O
│   │   │   ├── pedido.ts              # cálculo de totales, aplicar lista de precios
│   │   │   ├── cuentas-cobrar.ts      # saldo = crédito − cobros validados
│   │   │   └── idempotencia.ts        # verificar UUID duplicado
│   │   ├── services/                  # crearPedido, registrarCobro, sincronizarCola
│   │   ├── repos/                     # PedidoRepo, CobrosRepo, ClienteRepo
│   │   ├── routes/
│   │   │   ├── pedidos.ts             # POST /pedidos (idempotente)
│   │   │   ├── cobros.ts              # POST /cobros multipart
│   │   │   ├── catalogo.ts            # GET /catalogo (para sync móvil)
│   │   │   ├── clientes.ts            # GET /clientes (cartera por vendedor)
│   │   │   └── cron.ts                # GET /cron/recordatorios-deuda
│   │   ├── middleware/auth.ts         # JWT → perfil con rol
│   │   └── lib/                       # supabase, storage, whatsapp, zod-schemas
│   └── tests/
├── frontend/
│   ├── app/(panel)/
│   │   ├── dashboard/                 # tablero ventas por vendedor / día
│   │   ├── pedidos/                   # listado y detalle
│   │   ├── cobros/                    # validación de vouchers
│   │   ├── cuentas-cobrar/            # antigüedad de deuda
│   │   └── catalogo/                  # gestión de productos y precios
│   ├── components/                    # TablaDeuda, GraficaVentas, ui/
│   └── lib/                           # api-client, sesion, formato
├── mobile/
│   ├── App.tsx                        # sesión + navegación
│   └── src/
│       ├── screens/                   # ClientesScreen, PedidoScreen, CobrosScreen
│       ├── db/                        # esquema SQLite, migraciones locales
│       ├── sync/                      # cola de sincronización con retry
│       └── lib/                       # api-client, compresion-foto, gps
└── database/
    ├── migrations/20261008000200_pedidos.sql
    ├── seed.sql
    └── tests/rls_pedidos.test.sql
```
