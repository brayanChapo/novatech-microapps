# 02 · Arquitectura — Asistencia

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extensión "Markdown Preview Mermaid Support").

## 1. Contexto

```mermaid
flowchart LR
    C["👷 Colaborador<br/>(celular)"] -->|marca entrada/salida| APP["App móvil<br/>Expo"]
    S["🧑‍💼 Supervisor"] -->|ve sus locales| WEB["Dashboard web<br/>Next.js"]
    A["🛡️ Administrador"] -->|gestiona y ve todo| WEB
    APP -->|HTTPS + JWT| API["API Asistencia<br/>Hono en Vercel"]
    WEB -->|HTTPS + JWT| API
    APP -->|login| AUTH["Supabase Auth"]
    WEB -->|login + Realtime| SB["Supabase"]
    API -->|service_role| DB[("PostgreSQL<br/>Supabase")]
    APP -.->|GPS del teléfono| GPS(("Satélites /<br/>red"))
    WEB -.->|teselas| OSM["OpenStreetMap"]
```

## 2. Contenedores y responsabilidades

```mermaid
flowchart TB
    subgraph Cliente
      M["mobile/ — Expo SDK 57<br/>• Login<br/>• Ubicación en vivo (primer plano)<br/>• Distancia al local (solo informativa)<br/>• POST /marcaciones"]
      F["frontend/ — Next.js 16<br/>• Dashboard general y por local<br/>• Mapa Leaflet + OSM<br/>• Suscripción Realtime<br/>• Administración y reportes"]
    end
    subgraph "Vercel (equipo NovaTech)"
      B["backend/ — Hono + Zod<br/>• Valida JWT y carga perfil<br/>• Reglas: geocerca, precisión, fake GPS,<br/>  secuencia, tardanza<br/>• Hora oficial del servidor<br/>• Dashboard (RPC), CRUD, CSV"]
    end
    subgraph "Supabase (proyecto compartido)"
      AU["Auth (JWT)"]
      RT["Realtime<br/>(postgres_changes)"]
      PG[("PostgreSQL<br/>esquemas core + asistencia<br/>RLS en todas las tablas")]
    end
    M --> B
    F --> B
    M --> AU
    F --> AU
    F <-->|INSERT en marcaciones<br/>filtrado por RLS| RT
    B -->|service_role<br/>filtra empresa_id| PG
    RT --- PG
```

**Principio clave:** el celular **nunca decide** si la marcación es válida. Envía su posición y el **backend** recalcula la distancia, verifica precisión, ubicación simulada, secuencia del día y hora. Los clientes no tienen permisos de escritura en la base de datos (RLS sin políticas de INSERT).

## 3. Secuencia: marcar entrada

```mermaid
sequenceDiagram
    autonumber
    actor C as Colaborador
    participant App as App móvil
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant RT as Supabase Realtime
    participant Web as Dashboard

    C->>App: Abre la app
    App->>API: GET /yo (JWT)
    API->>DB: perfil, asignación vigente, marcaciones de hoy, reglas
    API-->>App: local, horario, siguiente = "entrada", reglas
    loop cada ~2 s mientras la pantalla está abierta
        App->>App: watchPositionAsync → distancia al local (informativa)
    end
    C->>App: Toca "MARCAR ENTRADA"
    App->>API: POST /marcaciones {lat, lng, precision_m, ubicacion_simulada, dispositivo}
    API->>API: hora servidor → fecha/hora Lima
    API->>DB: config, asignación, marcaciones del día
    API->>API: ¿fake GPS? ¿precisión ≤ máx? ¿distancia ≤ radio? ¿secuencia? → estado
    alt válido
        API->>DB: INSERT marcación (índice único evita duplicados)
        DB-->>RT: evento INSERT
        RT-->>Web: postgres_changes (solo a quien RLS permite)
        Web->>API: GET /dashboard/resumen y /marcaciones
        API-->>App: 201 "Entrada registrada a las 08:22 en Sede Miraflores a tiempo."
    else inválido
        API-->>App: 422/409 {codigo, mensaje en español, detalle}
    end
```

## 4. Despliegue

```mermaid
flowchart LR
    GH["GitHub<br/>novatech-consulting/microapps"] -->|push main| CI["GitHub Actions<br/>tests + typecheck"]
    CI -->|ok| V1["Vercel proyecto<br/>asistencia-api"]
    CI -->|ok| V2["Vercel proyecto<br/>asistencia-web"]
    GH -->|EAS Build| EAS["Expo EAS<br/>APK / AAB / IPA"]
    EAS --> PS["Google Play / App Store<br/>o APK interno"]
    V1 --> SB[("Supabase Pro<br/>produccion-compartida")]
    V2 --> SB
```

| Componente | Proyecto | Dominio sugerido |
|---|---|---|
| API | Vercel `asistencia-api` (Root Directory: `03-asistencia-rrhh/backend`) | `api-asistencia.novatechconsulting.com.pe` |
| Dashboard | Vercel `asistencia-web` (Root Directory: `03-asistencia-rrhh/frontend`) | `asistencia.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquemas `core`, `asistencia`) | — |
| App | Expo EAS · paquete `pe.com.novatechconsulting.asistencia` | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | Validación de geocerca **en el servidor** | Solo en el celular | El cliente es manipulable; el servidor es la única fuente de verdad. |
| ADR-02 | **App nativa con Expo** (no solo PWA) | PWA | `expo-location` expone `mocked` (detección de fake GPS en Android) y mejor precisión/permisos. |
| ADR-03 | **API propia (Hono)** con `service_role` | Clientes escribiendo directo a Supabase con RLS | Reglas complejas (hora servidor, secuencia, estados) en un solo lugar, probadas con unit tests. |
| ADR-04 | Geocerca **circular** con Haversine | Polígonos con PostGIS | Suficiente para locales urbanos; simple de configurar por el cliente. Polígonos quedan para Fase 2 si se requiere. |
| ADR-05 | **Supabase Realtime** para el dashboard + sondeo de respaldo cada 60 s | WebSocket propio, sondeo puro | Sin infraestructura extra; RLS filtra eventos por empresa/local. |
| ADR-06 | Un esquema por micro app (`asistencia`) dentro del **proyecto Supabase compartido** | Un proyecto por app | Costo: cada proyecto extra ≈ US$10/mes. Ver guía de desarrollo. |
| ADR-07 | **Hora del servidor** y `fecha_local` guardada | Hora del celular | Evita fraude cambiando la hora del teléfono; facilita consultas por día. |
| ADR-08 | Mapas con **OpenStreetMap + Leaflet** | Google Maps | Sin costo ni API key. Respetar la política de uso de teselas de OSM; si el tráfico crece, usar un proveedor de teselas. |
| ADR-09 | Sin rastreo en segundo plano | Seguimiento continuo | Privacidad (Ley 29733), batería y aprobación en tiendas. |

## 6. Estructura de código

```
03-asistencia-rrhh/
├── backend/
│   ├── api/index.ts               # entrada Vercel
│   ├── src/
│   │   ├── app.ts                 # Hono: CORS, auth, rutas, errores
│   │   ├── domain/                # funciones PURAS: geocerca, tiempo, reglas (100 % probadas)
│   │   ├── services/              # casos de uso: registrarMarcacion, estadoDelDia
│   │   ├── repos/                 # puerto MarcacionRepo + implementación Supabase
│   │   ├── routes/                # marcaciones, dashboard, locales, horarios, colaboradores, reportes
│   │   ├── middleware/auth.ts     # JWT → perfil (empresa, rol)
│   │   └── lib/                   # supabase, validación (Zod), errores, CSV, permisos
│   ├── scripts/seed-demo.ts
│   └── tests/                     # Vitest
├── frontend/
│   ├── app/login, app/(panel)/{dashboard,locales,colaboradores,reportes}
│   ├── components/                # KpiCard, Mapa (Leaflet), useTiempoReal, ui
│   └── lib/                       # api, supabase, sesión, formato
├── mobile/
│   ├── App.tsx                    # sesión + pestañas
│   └── src/{screens,hooks,lib,components}
└── database/
    ├── migrations/20261008000300_asistencia.sql
    ├── seed.sql
    └── tests/rls_asistencia.test.sql
```
