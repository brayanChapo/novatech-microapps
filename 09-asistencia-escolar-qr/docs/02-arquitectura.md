# 02 · Arquitectura — Asistencia Escolar por QR con Aviso a Padres

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extensión "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    AUX["Auxiliar / Docente\n(celular con Expo)"] -->|escanea QR del alumno| APP["App móvil\nExpo SDK 57"]
    ADM["Admin\n(navegador)"] -->|gestiona alumnos y reportes| WEB["Dashboard web\nNext.js"]
    APO["Apoderado\n(celular)"] -.->|recibe aviso de ausencia| WA["WhatsApp\nBusiness Cloud API"]
    APP -->|HTTPS + JWT| API["API Asistencia Escolar\nHono en Vercel"]
    WEB -->|HTTPS + JWT| API
    APP -->|login| AUTH["Supabase Auth"]
    WEB -->|login| AUTH
    API -->|service_role| DB[("PostgreSQL\nSupabase")]
    API -->|notificacion de ausencia| WA
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph Cliente
      M["mobile/ — Expo SDK 57\n• Login docente\n• Camara (expo-barcode-scanner)\n• POST /asistencias\n• Cola offline con reintentos"]
      F["frontend/ — Next.js 16\n• Dashboard por aula y alumno\n• Generacion y descarga de carnets PDF\n• Reportes diarios y mensuales\n• Administracion de alumnos y apoderados"]
    end
    subgraph "Vercel (equipo NovaTech)"
      B["backend/ — Hono + Zod\n• Valida JWT y carga perfil docente\n• Verifica token del QR (HMAC-SHA256)\n• Calcula estado: presente / tardanza\n• Job de corte: marca ausentes y envia WhatsApp\n• Bloquea doble registro del dia\n• Genera PDFs de carnets por aula"]
    end
    subgraph "Supabase (proyecto compartido)"
      AU["Auth (JWT)"]
      PG[("PostgreSQL\nesquemas core + asistencia_escolar\nRLS en todas las tablas")]
      ST["Storage\n(carnets PDF)"]
    end
    subgraph Externo
      WA["WhatsApp Business\nCloud API"]
    end
    M --> B
    F --> B
    M --> AU
    F --> AU
    B -->|service_role, filtra empresa_id| PG
    B -->|PUT PDF carnet| ST
    B -->|POST /messages| WA
```

**Principio clave:** el servidor es la unica fuente de verdad sobre el estado de asistencia. El dispositivo del docente unicamente captura el QR y lo envia; **nunca decide** si el alumno esta presente, tardio o ausente, ni envia el aviso a los padres directamente.

## 3. Secuencia principal: escaneo de QR y registro de asistencia

```mermaid
sequenceDiagram
    autonumber
    actor D as Auxiliar/Docente
    participant App as App movil (Expo)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant WA as WhatsApp Cloud API

    D->>App: Abre la app y selecciona aula
    App->>API: GET /aula/:id/sesion-hoy (JWT)
    API->>DB: consulta sesion, hora de corte y alumnos
    API-->>App: hora_inicio, hora_corte, lista parcial de presentes
    D->>App: Apunta camara al carnet del alumno
    App->>App: expo-barcode-scanner decodifica QR
    App->>API: POST /asistencias con qr_token y dispositivo
    API->>API: hora servidor UTC a hora Lima
    API->>DB: busca alumno por qr_token, verifica empresa_id y matricula vigente
    alt token invalido o alumno no matriculado
        API-->>App: 422 Token invalido
    else alumno ya registrado hoy
        API-->>App: 409 Ya registrado hoy
    else registro valido
        API->>API: calcularEstado segun hora_corte (presente / tardanza)
        API->>DB: INSERT asistencia con estado y hora_llegada
        API-->>App: 201 con nombre alumno y estado
        App->>App: sonido de confirmacion y color verde o amarillo
    end
    Note over API,WA: Job programado a la hora de corte
    API->>DB: SELECT alumnos sin registro del dia (ausentes)
    loop por cada ausente con apoderado registrado
        API->>WA: POST /messages con plantilla ausencia
        WA-->>API: message_id
        API->>DB: INSERT notificacion_enviada
    end
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\nasistencia-escolar-api"]
    CI -->|ok| V2["Vercel proyecto\nasistencia-escolar-web"]
    GH -->|EAS Build| EAS["Expo EAS\nAPK / AAB"]
    EAS --> PS["Google Play\no APK interno"]
    V1 --> SB[("Supabase Pro\nproduccion-compartida\nesquema asistencia_escolar")]
    V2 --> SB
    V1 -->|HTTPS| WA["WhatsApp Business\nCloud API"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `asistencia-escolar-api` (Root: `09-asistencia-escolar-qr/backend`) | `api-asistencia-escolar.novatechconsulting.com.pe` |
| Dashboard web | `asistencia-escolar-web` (Root: `09-asistencia-escolar-qr/frontend`) | `asistencia-escolar.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `asistencia_escolar`) | — |
| App movil | Expo EAS · paquete `pe.com.novatechconsulting.asistenciaescolar` | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decision | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **Token HMAC-SHA256 en el QR**, no el ID del alumno en claro | UUID directo, DNI | Un ID en el QR es falsificable; HMAC con secret del backend impide fabricar QRs validos o enumerar alumnos. |
| ADR-02 | **Aviso WhatsApp desde el servidor** via job a la hora de corte | Envio inmediato al escanear, SMS, correo | La ausencia solo se confirma al vencer la hora de corte; enviar antes genera falsas alarmas si el alumno llega tarde dentro del margen. |
| ADR-03 | **App nativa Expo** para el docente (no PWA) | PWA con WebRTC | `expo-barcode-scanner` ofrece acceso a la camara nativa con latencia menor a 300 ms y funciona offline con cola de reintentos; la WebRTC en movil es menos fiable para uso intensivo en la puerta. |
| ADR-04 | **PDF de carnets generado en el servidor** (backend + PDFKit) | Generado en navegador con jsPDF | El servidor controla la plantilla y garantiza el HMAC del token sin exponerlo al cliente. |
| ADR-05 | **Un solo registro por alumno por dia** con indice unico `(empresa_id, alumno_id, fecha_local)` | Permitir multiples y tomar el primero | La restriccion en base de datos elimina race conditions si el docente escanea dos veces por error. |
| ADR-06 | **Supabase proyecto compartido** con esquema `asistencia_escolar` | Proyecto dedicado por cliente | Cada proyecto adicional cuesta aproximadamente USD 10 al mes; RLS mas filtro `empresa_id` en el backend proveen aislamiento suficiente para datos escolares. |
| ADR-07 | **Sin fotos de alumnos** en el QR ni en la base de datos | Foto en ficha del alumno | Datos de menores (RNF-09, Ley 29733); principio de minimizacion del dato. |

## 6. Estructura de codigo

```
09-asistencia-escolar-qr/
├── backend/
│   ├── api/index.ts                   # entrada Vercel (serverless)
│   ├── src/
│   │   ├── app.ts                     # Hono: CORS, auth, rutas, errores globales
│   │   ├── domain/
│   │   │   ├── qr.ts                  # generarToken, verificarToken (HMAC-SHA256)
│   │   │   ├── asistencia.ts          # calcularEstado (presente/tardanza), esAusente
│   │   │   └── notificacion.ts        # construirMensajeWhatsApp
│   │   ├── services/
│   │   │   ├── registrarAsistencia.ts # caso de uso principal
│   │   │   ├── procesarAusencias.ts   # job hora de corte
│   │   │   └── generarCarnetsPDF.ts
│   │   ├── repos/
│   │   │   ├── AsistenciaRepo.ts
│   │   │   ├── AlumnoRepo.ts
│   │   │   └── NotificacionRepo.ts
│   │   ├── routes/
│   │   │   ├── asistencias.ts         # POST /asistencias, GET /aula/:id/sesion-hoy
│   │   │   ├── carnets.ts             # GET /aulas/:id/carnets.pdf
│   │   │   ├── reportes.ts            # diario y mensual
│   │   │   └── admin.ts               # CRUD alumnos, aulas, apoderados
│   │   ├── middleware/
│   │   │   └── auth.ts                # JWT a perfil (empresa, rol)
│   │   └── lib/
│   │       ├── supabase.ts
│   │       ├── whatsapp.ts
│   │       ├── pdf.ts
│   │       └── errors.ts
│   └── tests/                         # Vitest + pgTAP RLS
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   └── (panel)/
│   │       ├── dashboard/             # resumen del dia por aula
│   │       ├── alumnos/               # CRUD + descarga QR individual
│   │       ├── aulas/
│   │       └── reportes/
│   ├── components/
│   │   ├── QRCard.tsx
│   │   └── EstadoBadge.tsx
│   └── lib/
│       ├── api.ts
│       └── formato.ts                 # hora Lima, fechas
├── mobile/
│   ├── App.tsx
│   └── src/
│       ├── screens/
│       │   ├── LoginScreen.tsx
│       │   ├── ScanScreen.tsx         # expo-barcode-scanner + cola offline
│       │   └── ResumenScreen.tsx
│       ├── hooks/
│       │   ├── useScanner.ts
│       │   └── useColaOffline.ts      # AsyncStorage + retry
│       └── lib/
│           ├── api.ts
│           └── audio.ts
└── database/
    ├── migrations/20261028000900_asistencia_escolar.sql
    ├── seed.sql
    └── tests/rls_asistencia_escolar.test.sql
```
