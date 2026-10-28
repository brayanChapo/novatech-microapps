# 02 · Arquitectura — Prueba de Entrega (Foto, Firma, GPS)

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extensión "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    AD["Administrador"] -->|carga entregas\ny consulta evidencias| WEB["Dashboard web\nNext.js"]
    SU["Supervisor"] -->|monitorea\nrutas del día| WEB
    RE["Repartidor\ncelular en campo"] -->|registra entregas\ncon evidencia| APP["App móvil\nExpo SDK 57"]
    APP -->|HTTPS + JWT\ncuando hay señal| API["API Entregas\nHono en Vercel"]
    WEB -->|HTTPS + JWT| API
    APP -->|login| AUTH["Supabase Auth"]
    WEB -->|login| AUTH
    API -->|service_role\nfiltra empresa_id| DB[("PostgreSQL\nSupabase")]
    API -->|foto comprimida\ny firma digital| ST["Supabase Storage"]
    WEB -.->|mapa ruta| OSM["OpenStreetMap\n+ Leaflet"]
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph "Móvil — repartidor en campo"
        MOB["mobile — Expo SDK 57\n• Lista de entregas del día por repartidor\n• Mapa con dirección (OSM)\n• Toma foto del paquete (comprimida)\n• Firma del destinatario en canvas\n• Captura GPS al momento de la acción\n• Registro de no entrega con motivo\n• Cola offline: guarda en SQLite y sincroniza\n• UUID generado en el celular"]
    end
    subgraph "Web — admin y supervisor"
        WEB["frontend — Next.js 16\n• Carga de entregas del día (CSV o manual)\n• Dashboard de avance por repartidor\n• Consulta de evidencia por pedido\n• Mapa Leaflet + OSM con GPS de entrega\n• Enlace compartible de evidencia (opcional)"]
    end
    subgraph "Vercel — equipo NovaTech"
        API["backend — Hono + Zod\n• POST /entregas/carga (CSV o JSON)\n• POST /entregas/:id/registrar\n  (foto, firma, GPS, nombre_receptor)\n• POST /entregas/:id/no-entrega\n• GET /entregas?repartidor=\n• GET /evidencia/:pedido_id\n• Idempotencia por UUID de la entrega"]
    end
    subgraph "Supabase — proyecto compartido"
        AU["Auth — JWT"]
        ST["Storage privado\nfotos y firmas digitales"]
        PG[("PostgreSQL\nesquema: entregas\nRLS en todas las tablas")]
    end
    MOB -->|sync POST /entregas/:id/registrar| API
    WEB -->|HTTPS + JWT| API
    MOB --> AU
    WEB --> AU
    API -->|service_role filtra empresa_id| PG
    API -->|upload foto y firma| ST
    WEB -.->|teselas OSM| OSM["OpenStreetMap"]
```

**Principio clave:** la evidencia (foto + firma + GPS + timestamp del servidor) es inmutable una vez sincronizada (RN-01); la API rechaza cualquier intento de actualizar una entrega ya registrada, y el GPS se captura únicamente en el momento de la acción, no en segundo plano (R8).

## 3. Secuencia principal: registro de entrega con evidencia

```mermaid
sequenceDiagram
    autonumber
    actor RE as Repartidor
    participant App as App Expo (SQLite)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant ST as Storage

    RE->>App: Abre lista de entregas del día
    App->>API: GET /entregas?repartidor=me (al iniciar sesión)
    API->>DB: SELECT entregas del repartidor para hoy
    DB-->>API: lista de paradas
    API-->>App: entregas pendientes
    App->>App: guarda en SQLite para acceso offline

    RE->>App: Llega a destino y abre la entrega
    App->>App: solicita GPS al sistema (primer plano, solo este momento)
    RE->>App: Fotografía el paquete entregado
    App->>App: comprime foto (canvas resize a < 500 KB)
    RE->>App: El destinatario firma en la pantalla
    RE->>App: Ingresa nombre del receptor
    App->>App: guarda evidencia en SQLite (uuid, foto_b64, firma_b64, lat, lng, nombre)

    Note over App,API: Sync inmediata si hay señal, o en cola hasta recuperarla
    App->>API: POST /entregas/:id/registrar {uuid, foto_b64, firma_b64, lat, lng, nombre_receptor, timestamp_local}
    API->>API: valida Zod y JWT
    API->>DB: SELECT entrega, verifica no está ya registrada
    alt entrega ya registrada (reintento idempotente)
        API-->>App: 200 Ya procesada
    else entrega pendiente
        API->>ST: upload foto comprimida
        ST-->>API: foto_path
        API->>ST: upload firma PNG
        ST-->>API: firma_path
        API->>DB: UPDATE entrega SET estado=entregado, foto=..., firma=..., gps_lat=..., gps_lng=..., nombre_receptor=..., registrado_en=now()
        API->>DB: calcula distancia entre GPS entrega y dirección geocodificada
        API-->>App: 201 Entrega registrada
        App->>App: UPDATE SQLite estado=sincronizado
    end
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\nentregas-api\nRoot Dir: 08-prueba-entrega/backend"]
    CI -->|ok| V2["Vercel proyecto\nentregas-web\nRoot Dir: 08-prueba-entrega/frontend"]
    GH -->|EAS Build trigger| EAS["Expo EAS Build\nAPK / AAB / IPA"]
    EAS --> PS["Google Play / App Store\no APK interno"]
    V1 -->|service_role| SB[("Supabase Pro\nproduccion-compartida\nesquema: entregas")]
    V2 --> SB
    V1 -->|SDK| ST["Supabase Storage\nfotos y firmas"]
    V2 -.->|teselas gratuitas| OSM["OpenStreetMap"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `entregas-api` (Root Dir: `08-prueba-entrega/backend`) | `api-entregas.novatechconsulting.com.pe` |
| Dashboard web | `entregas-web` (Root Dir: `08-prueba-entrega/frontend`) | `entregas.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `entregas`) | — |
| App móvil | Expo EAS · paquete `pe.com.novatechconsulting.entregas` | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **App Expo nativa** (no PWA) para el repartidor | PWA con cámara del navegador | La app nativa con `expo-camera` y `expo-location` ofrece acceso más confiable a cámara, GPS de alta precisión y modo offline con `expo-sqlite`; crítico para hasta 300 entregas/día en campo con señal intermitente (RNF-08). |
| ADR-02 | **Evidencia inmutable** una vez sincronizada | Permitir correcciones | La evidencia es prueba legal ante reclamos de "no me llegó"; la inmutabilidad protege al cliente de ediciones posteriores. La API rechaza PATCHs sobre entregas ya registradas. Cumple RN-01. |
| ADR-03 | **GPS capturado solo al momento de la entrega** (primer plano) | GPS en segundo plano continuo | Batería, privacidad (Ley 29733) y aprobación en tiendas de aplicaciones. Cumple R8. |
| ADR-04 | **Foto comprimida en el dispositivo** antes de subir (< 500 KB) | Comprimir en el servidor | 300 entregas × foto + firma en un día implica alto volumen; comprimir en el móvil reduce el uso de datos y el tiempo de sync en 4G limitado. |
| ADR-05 | **Mapa con OpenStreetMap + Leaflet** en el dashboard | Google Maps | Sin costo ni API key; cumple R10. El volumen de mapa del dashboard (vista por repartidor) no requiere funciones avanzadas de Google Maps. |
| ADR-06 | **UUID generado en el celular** para idempotencia | ID del servidor generado en el primer POST | El repartidor puede reintentar la sync si la señal se corta durante el upload; el UUID garantiza que la entrega no se registre dos veces aunque el servidor reciba el POST más de una vez. |
| ADR-07 | **Distancia entre GPS de entrega y dirección geocodificada** guardada en la BD | No guardar la distancia | Permite auditoría posterior de entregas que se registraron lejos del domicilio, sin exponer un sistema de alerta que el repartidor pueda evadir; referencia para reclamos. Cumple RN-02. |

## 6. Estructura de código

```
08-prueba-entrega/
├── backend/
│   ├── api/index.ts                   # entrada Vercel
│   ├── src/
│   │   ├── app.ts                     # Hono: CORS, auth, rutas, errores
│   │   ├── domain/
│   │   │   ├── entrega.ts             # estados, regla inmutabilidad
│   │   │   ├── gps.ts                 # cálculo distancia Haversine
│   │   │   └── evidencia.ts           # validar campos obligatorios (foto+firma+gps+nombre)
│   │   ├── services/                  # registrarEntrega, registrarNoEntrega, cargaCSV
│   │   ├── repos/                     # EntregaRepo, RepartidorRepo
│   │   ├── routes/
│   │   │   ├── entregas.ts            # GET listado, POST carga, PATCH registrar
│   │   │   ├── no-entrega.ts          # POST /entregas/:id/no-entrega
│   │   │   └── evidencia.ts           # GET /evidencia/:pedido_id (enlace compartible)
│   │   ├── middleware/auth.ts
│   │   └── lib/                       # supabase, storage, zod-schemas
│   └── tests/
├── frontend/
│   ├── app/(panel)/
│   │   ├── dashboard/                 # avance por repartidor y resumen del día
│   │   ├── entregas/                  # carga CSV y listado
│   │   ├── evidencia/[pedido]/        # consulta con foto, firma y mapa
│   │   └── repartidores/
│   ├── components/                    # MapaEntregas (Leaflet), TablaEntregas, ui/
│   └── lib/                           # api-client, sesion
├── mobile/
│   ├── App.tsx
│   └── src/
│       ├── screens/
│       │   ├── ListaEntregasScreen.tsx
│       │   ├── RegistrarEntregaScreen.tsx  # foto + firma + GPS
│       │   └── NoEntregaScreen.tsx
│       ├── db/                         # SQLite: entregas pendientes y cola sync
│       ├── sync/                       # cola con retry y manejo de conflictos
│       └── lib/                        # camara, firma-canvas, gps, compresion
└── database/
    ├── migrations/20261008000800_entregas.sql
    ├── seed.sql
    └── tests/rls_entregas.test.sql
```
