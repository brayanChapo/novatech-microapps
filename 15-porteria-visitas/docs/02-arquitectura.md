# 02 · Arquitectura — Registro de Visitas en Porteria con QR

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extension "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    POR["Portero\n(tablet PWA en caseta)"] -->|registra ingresos y egresos| WEB["Web / PWA\nNext.js"]
    ANF["Anfitrion / Residente\n(celular PWA)"] -->|pre-registra visitas y autoriza| WEB
    ADM["Admin Seguridad\n(navegador)"] -->|gestiona unidades, residentes y reportes| WEB
    VIS["Visitante\n(fisico)"] -.->|presenta QR o DNI en caseta| POR
    WEB -->|HTTPS + JWT| API["API Porteria\nHono en Vercel"]
    API -->|service_role| DB[("PostgreSQL\nSupabase")]
    API -->|login| AUTH["Supabase Auth"]
    API -->|foto visitante| STO["Supabase Storage\n(bucket porteria)"]
    API -.->|notificacion al anfitrion| PUSH["Web Push\n(VAPID)"]
    API -.->|aviso opcional| WA["WhatsApp\nBusiness Cloud API"]
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph Cliente
      F["frontend/ — Next.js 16\n• Login (portero, anfitrion, admin)\n• Vista portero: escaner QR, registro manual DNI,\n  foto opcional desde camara tablet, semaforo\n• Vista anfitrion: pre-registrar visita, generar QR\n  de un solo uso, bandeja de autorizaciones pendientes\n• Vista admin: unidades, residentes, libro de visitas,\n  exportar a Excel o PDF\n• Service Worker para recibir Web Push"]
    end
    subgraph "Vercel (equipo NovaTech)"
      B["backend/ — Hono + Zod\n• Valida JWT y carga perfil\n• POST /invitaciones: genera QR HMAC de un solo uso\n• POST /ingresos: valida QR o registra visita manual,\n  notifica al anfitrion por Web Push o WhatsApp\n• POST /ingresos/:id/autorizar o denegar (anfitrion)\n• POST /ingresos/:id/egreso: registra hora de salida\n• Job timeout: alerta si sin respuesta en 3 min\n• GET /reportes: libro de visitas en CSV/PDF"]
    end
    subgraph "Supabase (proyecto compartido)"
      AU["Auth (JWT)"]
      PG[("PostgreSQL\nesquemas core + porteria\nRLS en todas las tablas")]
      ST["Storage bucket porteria\n(fotos visitantes, privado)"]
      RT["Realtime\n(postgres_changes en ingresos)"]
    end
    subgraph Externo
      PUSH["Servidor Web Push\n(VAPID, sin costo)"]
      WA["WhatsApp Business\nCloud API (opcional)"]
    end
    F --> B
    F --> AU
    F <-->|suscripcion Realtime autorizacion| RT
    B -->|service_role, filtra empresa_id| PG
    B -->|upload foto| ST
    B -->|Web Push VAPID| PUSH
    B -->|WhatsApp opcional| WA
    RT --- PG
    PUSH -.->|push al browser del anfitrion| F
```

**Principio clave:** el **QR de invitacion es de un solo uso** (se invalida en la primera validacion exitosa). La decision de "dejar pasar" la toma el servidor, nunca el portero por su cuenta ni el cliente. Para visitas sin pre-registro el sistema notifica al anfitrion en tiempo real y bloquea el acceso hasta recibir autorizacion o que se cumpla el timeout de 3 minutos.

## 3. Secuencia principal: llegada de visitante con QR de invitacion

```mermaid
sequenceDiagram
    autonumber
    actor A as Anfitrion
    actor V as Visitante
    actor P as Portero
    participant WebAnf as PWA Anfitrion
    participant WebPor as PWA Portero
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant PUSH as Web Push (VAPID)

    A->>WebAnf: pre-registra visita con nombre, DNI y fecha
    WebAnf->>API: POST /invitaciones con datos del visitante
    API->>API: genera token HMAC-SHA256 valido para el dia
    API->>DB: INSERT invitacion con token y estado pendiente
    API-->>WebAnf: QR de invitacion (imagen o link)
    WebAnf->>WebAnf: muestra QR al visitante por mensaje o imprime
    V->>P: presenta QR en la caseta
    P->>WebPor: escanea QR con camara tablet
    WebPor->>WebPor: decodifica QR con jsQR
    WebPor->>API: POST /ingresos con qr_token (JWT portero)
    API->>DB: busca invitacion por token y empresa_id
    alt token invalido o vencido
        API-->>WebPor: 422 QR invalido o vencido
    else ya usado
        API-->>WebPor: 409 QR ya utilizado
    else invitacion valida
        API->>DB: UPDATE invitacion a estado usado (invalida el token)
        API->>DB: INSERT ingreso con hora_entrada UTC
        opt foto del visitante
            P->>WebPor: toma foto opcional con camara
            WebPor->>API: POST /ingresos/:id/foto
            API->>DB: PUT foto en Storage
        end
        API->>PUSH: Web Push al anfitrion (visitante en porteria)
        API-->>WebPor: 200 ingreso autorizado, nombre del visitante
        WebPor->>WebPor: semaforo VERDE
    end
    Note over V,P: Al salir el visitante
    P->>WebPor: busca el ingreso activo del visitante
    WebPor->>API: POST /ingresos/:id/egreso
    API->>DB: UPDATE ingreso con hora_egreso UTC
    API-->>WebPor: 200 egreso registrado
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\nporteria-visitas-api"]
    CI -->|ok| V2["Vercel proyecto\nporteria-visitas-web"]
    V1 --> SB[("Supabase Pro\nproduccion-compartida\nesquema porteria + Storage + Realtime")]
    V2 --> SB
    V1 -->|VAPID keys| PUSH["Web Push API\n(browser standard)"]
    V1 -.->|API key opcional| WA["WhatsApp Business\nCloud API"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `porteria-visitas-api` (Root: `15-porteria-visitas/backend`) | `api-porteria.novatechconsulting.com.pe` |
| Web / PWA | `porteria-visitas-web` (Root: `15-porteria-visitas/frontend`) | `porteria.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `porteria`) | — |
| Storage | Supabase `produccion-compartida` bucket `porteria` (privado) | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decision | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **QR de invitacion de un solo uso** (token HMAC-SHA256, UPDATE a usado en primer scan) | QR reutilizable por dia | RN-01 lo exige; un QR reutilizable puede fotografiarse y ser usado por terceros; el UPDATE atomico en DB previene doble entrada por race condition. |
| ADR-02 | **Web Push VAPID como canal principal de notificacion al anfitrion** | Solo correo, solo WhatsApp | Web Push es gratuito y de latencia baja (menos de 1 s); WhatsApp queda como canal opcional de respaldo para anfitriones que no instalen la PWA. En iOS la PWA debe estar instalada (RNF-08). |
| ADR-03 | **Supabase Realtime** para que el portero vea autorizaciones del anfitrion sin recargar | Sondeo cada N segundos | La respuesta del anfitrion debe llegar al portero en tiempo real para no dejar al visitante esperando; el sondeo agrega latencia innecesaria. |
| ADR-04 | **Foto del visitante opcional** (no obligatoria en MVP) | Obligatoria con reconocimiento facial | La camara PWA en tablet funciona en la mayoria de dispositivos; el reconocimiento facial requiere un servicio externo con costo y complejidad legal adicional. |
| ADR-05 | **Registro manual sin QR disponible** (portero ingresa datos, notifica al anfitrion) | Solo QR | RF-04 requiere cubrir el caso de visitante sin invitacion previa; la mayoria de visitas imprevistas son la norma, no la excepcion. |
| ADR-06 | **Job de timeout a los 3 min** (alerta al portero si no hay respuesta) (RN-02) | Timeout visual solo en el cliente | El portero no debe depender de que el cliente recuerde contar el tiempo; el servidor registra el evento y puede alertar a un supervisor si el anfitrion no responde. |
| ADR-07 | **Exportacion de libro de visitas en CSV y PDF** generada en servidor | Descarga desde el cliente | El volumen de visitas por mes puede ser alto; el servidor filtra por empresa_id y periodo sin exponer datos de otras instalaciones. |

## 6. Estructura de codigo

```
15-porteria-visitas/
├── backend/
│   ├── api/index.ts
│   ├── src/
│   │   ├── app.ts
│   │   ├── domain/
│   │   │   ├── qr.ts                  # generarTokenInvitacion (HMAC), verificarToken
│   │   │   ├── visita.ts              # estadoPermitido, calcularDuracion
│   │   │   └── notificacion.ts        # construirPayloadPush, construirMensajeWA
│   │   ├── services/
│   │   │   ├── crearInvitacion.ts
│   │   │   ├── registrarIngreso.ts    # valida QR o registra manual
│   │   │   ├── autorizarIngreso.ts    # accion del anfitrion
│   │   │   ├── registrarEgreso.ts
│   │   │   └── procesarTimeouts.ts    # job 3 min sin respuesta
│   │   ├── repos/
│   │   │   ├── InvitacionRepo.ts
│   │   │   ├── IngresoRepo.ts
│   │   │   └── FotoRepo.ts
│   │   ├── routes/
│   │   │   ├── invitaciones.ts        # POST, GET mi-qr
│   │   │   ├── ingresos.ts            # POST, PUT egreso, POST foto
│   │   │   ├── autorizaciones.ts      # POST autorizar o denegar
│   │   │   ├── reportes.ts            # GET libro-visitas CSV y PDF
│   │   │   └── admin.ts               # unidades, residentes, porteros
│   │   ├── middleware/auth.ts
│   │   └── lib/
│   │       ├── supabase.ts
│   │       ├── storage.ts
│   │       ├── webpush.ts             # wrapper web-push con VAPID
│   │       ├── whatsapp.ts            # opcional
│   │       └── errors.ts
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   └── (panel)/
│   │       ├── porteria/              # escanear QR, registro manual, buscar egreso
│   │       ├── mis-invitaciones/      # vista anfitrion: crear, ver QR, autorizar
│   │       ├── reportes/              # libro de visitas
│   │       └── admin/
│   ├── components/
│   │   ├── EscanerQR.tsx              # jsQR en camara tablet
│   │   ├── SemaforoPase.tsx
│   │   ├── RegistroManual.tsx
│   │   └── ui/
│   ├── public/
│   │   └── sw.js                      # Service Worker para Web Push
│   └── lib/
│       ├── api.ts
│       ├── supabase.ts
│       ├── webpush.ts                 # suscripcion VAPID
│       ├── qrScanner.ts
│       └── formato.ts
└── database/
    ├── migrations/20261028001500_porteria.sql
    ├── seed.sql
    └── tests/rls_porteria.test.sql
```
