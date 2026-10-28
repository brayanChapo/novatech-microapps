# 02 · Arquitectura — Parte Diario de Obra + Checklist SST

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extensión "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    CA["Capataz / Residente"] -->|parte diario\ny checklist SST| APP["App móvil\nExpo SDK 57"]
    JO["Jefe de Obra"] -->|revisa partes\ndel día| WEB["Dashboard web\nNext.js"]
    GE["Gerencia"] -->|consulta avances\ny KPIs| WEB
    SP["Supervisor SST"] -->|revisa checklists\nde seguridad| WEB
    APP -->|HTTPS + JWT\ncuando hay señal| API["API Obra\nHono en Vercel"]
    WEB -->|HTTPS + JWT| API
    APP -->|login| AUTH["Supabase Auth"]
    WEB -->|login| AUTH
    API -->|service_role\nfiltra empresa_id| DB[("PostgreSQL\nSupabase")]
    API -->|fotos de obra\ny firmas digitales| ST["Supabase Storage"]
    API -->|alerta ítem SST\ncrítico no conforme| RS["Resend\ncorreo transaccional"]
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph "Móvil — campo sin internet"
        MOB["mobile — Expo SDK 57\n• Parte diario offline (SQLite local)\n• Fotos con GPS y timestamp capturados\n• Checklist SST configurable\n• Firma digital en canvas\n• Cola de sincronización con retry\n• Hasta 30 fotos comprimidas por parte"]
    end
    subgraph "Web — supervisión y gerencia"
        WEB["frontend — Next.js 16\n• Dashboard de avance por obra\n• Historial de partes diarios\n• Revisión de checklists SST\n• Exportación a PDF semanal\n• Gestión de obras y plantillas SST"]
    end
    subgraph "Vercel — equipo NovaTech"
        API["backend — Hono + Zod\n• POST /partes (sync desde móvil)\n• PATCH /partes/:id/cerrar (con firma)\n• GET /partes/:id/pdf\n• POST /checklists (items SST)\n• GET /cron/alertas-sst\n• Idempotencia por UUID del parte"]
    end
    subgraph "Supabase — proyecto compartido"
        AU["Auth — JWT"]
        ST["Storage privado\nfotos de obra y firmas"]
        PG[("PostgreSQL\nesquema: obra\nRLS en todas las tablas")]
    end
    subgraph "Servicios externos"
        RS["Resend\ncorreo alerta SST"]
    end
    MOB -->|sync POST /partes| API
    WEB -->|HTTPS + JWT| API
    MOB --> AU
    WEB --> AU
    API -->|service_role filtra empresa_id| PG
    API -->|upload fotos y firmas| ST
    API -->|alerta item crítico no conforme| RS
```

**Principio clave:** el parte diario se registra completamente offline en el dispositivo con su propio UUID; al sincronizar, la API aplica idempotencia y guarda fotos y firma en Storage antes de confirmar la sincronización al móvil, garantizando que no se pierde ninguna evidencia aunque la señal se corte a la mitad.

## 3. Secuencia principal: llenado del parte diario offline y sincronización

```mermaid
sequenceDiagram
    autonumber
    actor CA as Capataz
    participant App as App Expo (SQLite)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant ST as Storage

    CA->>App: Abre parte del día para Obra X
    App->>App: carga plantilla desde SQLite local (bajada al inicio del día)
    CA->>App: Registra personal (categorías y HH)
    CA->>App: Registra avance por partida (%)
    CA->>App: Adjunta fotos de avance (comprimidas < 500 KB c/u)
    CA->>App: Completa checklist SST ítem por ítem
    CA->>App: Firma en canvas
    App->>App: genera UUID del parte, guarda todo en SQLite (estado: pendiente_sync)
    App-->>CA: Parte guardado localmente

    Note over App,API: Al recuperar señal (puede ser horas después)
    App->>API: POST /partes {uuid, obra_id, fecha, personal, partidas, fotos_b64[], firma_b64, checklist[]}
    API->>API: valida Zod y JWT
    API->>DB: INSERT INTO partes ON CONFLICT (uuid) DO NOTHING
    alt parte nuevo
        loop por cada foto y firma
            API->>ST: upload imagen comprimida
            ST-->>API: path en Storage
        end
        API->>DB: UPDATE parte SET fotos_paths=[], firma_path=..., estado=sincronizado
        API->>DB: INSERT items_checklist SST
        API->>API: evalúa items críticos con valor=no
        alt hay items críticos no conformes
            API->>RS: correo alerta SST a supervisor
        end
        API-->>App: 201 Parte sincronizado
        App->>App: UPDATE SQLite estado=sincronizado
    else UUID ya existe (reintento)
        API-->>App: 200 Ya procesado
    end
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\nobra-api\nRoot Dir: 06-parte-obra-sst/backend"]
    CI -->|ok| V2["Vercel proyecto\nobra-web\nRoot Dir: 06-parte-obra-sst/frontend"]
    GH -->|EAS Build trigger| EAS["Expo EAS Build\nAPK / AAB / IPA"]
    EAS --> PS["Google Play / App Store\no APK interno"]
    V1 -->|service_role| SB[("Supabase Pro\nproduccion-compartida\nesquema: obra")]
    V2 --> SB
    V1 -->|HTTPS API| RS["Resend\nalertas SST"]
    V1 -->|SDK| ST["Supabase Storage\nfotos y firmas"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `obra-api` (Root Dir: `06-parte-obra-sst/backend`) | `api-obra.novatechconsulting.com.pe` |
| Dashboard web | `obra-web` (Root Dir: `06-parte-obra-sst/frontend`) | `obra.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `obra`) | — |
| App móvil | Expo EAS · paquete `pe.com.novatechconsulting.obra` | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **App Expo nativa** (no PWA) para campo | PWA con Service Worker | La obra puede carecer de señal hasta 24 h (RNF-09); `expo-sqlite` provee almacenamiento relacional persistente y la API de cámara permite capturar GPS y timestamp en la foto, lo que no es posible con la misma confiabilidad desde el navegador. |
| ADR-02 | **UUID generado en el dispositivo** para el parte diario | ID del servidor | El parte se crea sin conexión; el UUID permite idempotencia en la sincronización (reintento seguro si la red se corta durante el upload). |
| ADR-03 | **Fotos comprimidas en el dispositivo** antes de subir | Comprimir en el servidor | 30 fotos × 500 KB = 15 MB máximo por parte; comprimir en el móvil reduce tiempo de sincronización en señal débil de obra. Cumple RNF-08. |
| ADR-04 | **Firma digital en canvas** guardada como imagen PNG en Storage | Firma sobre PDF del parte | La imagen de firma es inmutable, más liviana que un PDF firmado, y se puede incrustar en la exportación PDF semanal desde el servidor. |
| ADR-05 | **Alertas SST por correo** (Resend), no por WhatsApp | WhatsApp para alertas SST | Los ítems críticos no conformes van al supervisor SST, que normalmente usa correo en su computadora de oficina. WhatsApp queda para el plan de contacto con clientes finales, no para comunicación interna. |
| ADR-06 | **Exportación PDF semanal generada en el servidor** | PDF en el cliente | Incluye fotos y firmas alojadas en Storage; el servidor puede acceder a ellas con `service_role` y construir el PDF completo; el cliente solo las vería con URLs firmadas temporales. |
| ADR-07 | **Checklist SST configurable por empresa** en la BD | Checklist fijo en el código | Cada empresa tiene regulaciones distintas; la configurabilidad evita actualizaciones de la app cada vez que se cambia un ítem del checklist. |

## 6. Estructura de código

```
06-parte-obra-sst/
├── backend/
│   ├── api/index.ts                   # entrada Vercel
│   ├── src/
│   │   ├── app.ts                     # Hono: CORS, auth, rutas, errores
│   │   ├── domain/
│   │   │   ├── parte.ts               # estados, regla firma obligatoria
│   │   │   ├── checklist-sst.ts       # evaluar ítems críticos no conformes
│   │   │   └── idempotencia.ts        # verificar UUID duplicado
│   │   ├── services/                  # sincronizarParte, generarPdfSemanal, alertarSST
│   │   ├── repos/                     # ParteRepo, ChecklistRepo, ObraRepo
│   │   ├── routes/
│   │   │   ├── partes.ts              # POST /partes, PATCH /cerrar, GET /pdf
│   │   │   ├── checklists.ts          # GET plantillas, POST items
│   │   │   └── obras.ts               # CRUD de obras
│   │   ├── middleware/auth.ts
│   │   └── lib/                       # supabase, storage, resend, pdf-renderer, zod
│   └── tests/
├── frontend/
│   ├── app/(panel)/
│   │   ├── obras/                     # listado y detalle por obra
│   │   ├── partes/                    # historial de partes diarios
│   │   ├── sst/                       # revisión de checklists
│   │   └── reportes/                  # exportación PDF semanal
│   ├── components/                    # GraficoAvance, TablaSST, VisorFotos, ui/
│   └── lib/                           # api-client, sesion
├── mobile/
│   ├── App.tsx
│   └── src/
│       ├── screens/                   # ParteScreen, ChecklistScreen, FirmaScreen
│       ├── db/                        # esquema SQLite local, migraciones
│       ├── sync/                      # cola upload con retry
│       └── lib/                       # camara-gps, compresion, firma-canvas
└── database/
    ├── migrations/20261008000600_obra.sql
    ├── seed.sql
    └── tests/rls_obra.test.sql
```
