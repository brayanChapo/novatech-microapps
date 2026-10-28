# 02 · Arquitectura — Vencimientos SUNAT + Portal de Documentos

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extensión "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    CO["Contador / Admin"] -->|gestiona cartera\ny vencimientos| WEB["Dashboard web\nNext.js PWA"]
    AS["Asistente contable"] -->|revisa documentos\nrecibidos| WEB
    CE["Cliente del estudio"] -->|sube comprobantes\npor portal| PORTAL["Portal del cliente\nNext.js — token"]
    WEB -->|HTTPS + JWT| API["API Contable\nHono en Vercel"]
    PORTAL -->|HTTPS + token| API
    API -->|service_role\nfiltra empresa_id| DB[("PostgreSQL\nSupabase")]
    API -->|documentos privados\nURL firmada 10 min| ST["Supabase Storage"]
    API -->|alertas D-7 D-3 D-0\nal contador| RS["Resend\ncorreo transaccional"]
    API -->|alerta crítica\nopcional| WA["WhatsApp Business\nCloud API (opcional)"]
    CRON["Vercel Cron\ndiario a las 7:00 Lima"] -.->|verifica\nvencimientos| API
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph "Panel interno — auth JWT"
        WEB["frontend/app/panel\nNext.js 16\n• Cartera de clientes RUC\n• Cronograma anual de vencimientos\n• Tablero mensual por cliente\n• Estado: pendiente / docs recibidos / declarado\n• Filtros por período y régimen"]
    end
    subgraph "Portal externo — token del cliente"
        PORT["frontend/app/portal/[token]\nNext.js 16\n• Sube comprobantes PDF / XML / foto\n• Límite 20 MB por archivo\n• Ve estado de sus documentos\n• Sin login — token de 32 bytes exp. 30 días"]
    end
    subgraph "Vercel — equipo NovaTech"
        API["backend — Hono + Zod\n• POST /clientes-contables\n• POST /vencimientos/cargar (carga anual tabla SUNAT)\n• GET /portal/:token/estado\n• POST /portal/:token/documento\n• PATCH /vencimientos/:id/declarado\n• GET /cron/verificar-vencimientos\n• Alertas escalonadas D-7, D-3, D-0"]
    end
    subgraph "Supabase — proyecto compartido"
        AU["Auth — JWT"]
        ST["Storage privado\ndocumentos del cliente\nURL firmada 10 min"]
        PG[("PostgreSQL\nesquema: contable\nRLS en todas las tablas")]
    end
    subgraph "Servicios externos"
        RS["Resend\ncorreo transaccional"]
        WA["WhatsApp Business\nCloud API (alertas críticas)"]
    end
    WEB -->|HTTPS + JWT| API
    PORT -->|HTTPS + token| API
    WEB --> AU
    API -->|service_role filtra empresa_id| PG
    API -->|upload y signed URL 10 min| ST
    API -->|alertas D-7 D-3 D-0| RS
    API -->|alerta crítica D-0| WA
```

**Principio clave:** la tabla de vencimientos se carga manualmente una vez al año desde el cronograma oficial publicado por SUNAT; la aplicación no calcula ni inventa fechas (RN-01), lo que garantiza que las alertas corresponden a las fechas reales de la administración tributaria.

## 3. Secuencia principal: alerta de vencimiento y recepción de documentos

```mermaid
sequenceDiagram
    autonumber
    actor CO as Contador
    actor CE as Cliente del estudio
    participant Web as Dashboard (Next.js)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant ST as Storage
    participant RS as Resend

    Note over API,DB: Cron diario 7:00 Lima
    API->>DB: SELECT vencimientos WHERE fecha IN (today+7, today+3, today)
    DB-->>API: lista de obligaciones por cliente
    loop por cada vencimiento encontrado
        API->>DB: SELECT correos del contador responsable
        API->>RS: correo alerta D-7 / D-3 / D-0 con listado de obligaciones
        RS-->>CO: correo recibido
        alt vencimiento hoy (D-0) y sin documentos
            API->>RS: correo urgente al cliente del estudio
        end
    end

    CO->>Web: Abre cliente y genera enlace de portal
    Web->>API: POST /portal/token {cliente_id, expires_days: 30}
    API->>DB: INSERT portal_token (32 bytes, exp 30d)
    API-->>Web: URL del portal
    CO->>CE: Envía enlace por correo o WhatsApp (manual)

    CE->>Web: Abre portal https://…/portal/TOKEN
    Web->>API: GET /portal/:token/estado
    API->>DB: SELECT token, verifica expiración
    DB-->>API: período pendiente, documentos ya subidos
    API-->>Web: estado de cuenta tributario

    CE->>Web: Sube comprobante PDF del período
    Web->>API: POST /portal/:token/documento {archivo, tipo, periodo}
    API->>API: valida tamaño <= 20 MB y tipo de archivo
    API->>ST: upload archivo a Storage privado
    ST-->>API: path del archivo
    API->>DB: INSERT documento + UPDATE vencimiento estado=docs_recibidos
    API-->>Web: 201 Documento recibido
    API->>RS: correo al contador "Cliente X subió documentos"

    CO->>Web: Adjunta constancia de declaración
    Web->>API: PATCH /vencimientos/:id/declarado {constancia_path}
    API->>DB: UPDATE vencimiento estado=declarado, constancia=...
    API-->>Web: 200 Período cerrado
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\ncontable-api\nRoot Dir: 07-vencimientos-sunat/backend"]
    CI -->|ok| V2["Vercel proyecto\ncontable-web\nRoot Dir: 07-vencimientos-sunat/frontend"]
    V1 -->|Vercel Cron diario 7:00| CRON["Job verificar-vencimientos\nalertas D-7, D-3, D-0"]
    V1 -->|service_role| SB[("Supabase Pro\nproduccion-compartida\nesquema: contable")]
    V2 --> SB
    V1 -->|HTTPS API| RS["Resend\ncorreo"]
    V1 -->|HTTPS API Graph\nopcional| WA["WhatsApp\nBusiness Cloud API"]
    V1 -->|SDK| ST["Supabase Storage\ndocumentos privados"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `contable-api` (Root Dir: `07-vencimientos-sunat/backend`) | `api-contable.novatechconsulting.com.pe` |
| Dashboard / Portal | `contable-web` (Root Dir: `07-vencimientos-sunat/frontend`) | `contable.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `contable`) | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **Tabla de vencimientos cargada manualmente** desde cronograma SUNAT | Calcular fechas automáticamente según último dígito RUC | Las fechas de vencimiento dependen del cronograma oficial publicado cada año por SUNAT y pueden sufrir prórrogas; calcularlas algorítmicamente introduce riesgo de error; la carga manual garantiza exactitud. Cumple RN-01. |
| ADR-02 | **Alertas escalonadas D-7, D-3, D-0** en lugar de una sola alerta | Alerta única el día del vencimiento | Una sola alerta el día 0 llega tarde; el escalonamiento da tiempo al contador de prepararse y al cliente de subir documentos antes de la fecha límite. |
| ADR-03 | **Portal del cliente sin contraseña** con token de 32 bytes | Cuenta de usuario con contraseña | El cliente del estudio no accede diariamente; un token enviado por correo elimina la fricción de contraseña y recuperaciones de cuenta. El token expira a 30 días. Cumple RNF-08. |
| ADR-04 | **Documentos en Storage privado** con URL firmada de 10 minutos | Storage público o en BD | Los documentos tributarios son confidenciales; las URLs firmadas limitan el acceso temporal sin exponer rutas permanentes. Cumple RNF-08. |
| ADR-05 | **Correo como canal principal** (Resend), WhatsApp solo para alertas críticas D-0 | Solo WhatsApp o solo correo | El contador trabaja en su computadora y prefiere correo para acción; WhatsApp queda para el D-0 como llamada de atención urgente de bajo costo adicional. Cumple R9. |
| ADR-06 | **Estado "declarado" solo con constancia adjunta** | Solo con click del contador | Cumple RN-02: evita marcar períodos como declarados sin evidencia adjunta, lo que protege al estudio ante auditorías. |
| ADR-07 | **Un esquema por app** (`contable`) en Supabase compartido | Proyecto Supabase separado | Costo ~US$10/mes por proyecto adicional; el esquema con RLS aísla los datos de cada estudio contable. Cumple R7. |

## 6. Estructura de código

```
07-vencimientos-sunat/
├── backend/
│   ├── api/index.ts                   # entrada Vercel
│   ├── src/
│   │   ├── app.ts                     # Hono: CORS, auth, rutas, errores
│   │   ├── domain/
│   │   │   ├── vencimiento.ts         # estados, regla constancia obligatoria
│   │   │   ├── alerta.ts              # lógica D-7, D-3, D-0
│   │   │   └── ruc.ts                 # validación dígito verificador
│   │   ├── services/                  # verificarVencimientos, procesarDocumento
│   │   ├── repos/                     # VencimientoRepo, DocumentoRepo, ClienteRepo
│   │   ├── routes/
│   │   │   ├── clientes-contables.ts  # CRUD cartera
│   │   │   ├── vencimientos.ts        # carga anual, PATCH declarado
│   │   │   ├── portal.ts              # GET|POST /portal/:token/...
│   │   │   └── cron.ts                # GET /cron/verificar-vencimientos
│   │   ├── middleware/auth.ts
│   │   └── lib/                       # supabase, storage, resend, whatsapp, zod
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── portal/[token]/            # portal público del cliente
│   │   └── (panel)/
│   │       ├── clientes/              # cartera de empresas
│   │       ├── calendario/            # cronograma de vencimientos
│   │       ├── documentos/            # revisión de archivos recibidos
│   │       └── reportes/              # estado mensual por cliente
│   ├── components/                    # CalendarioVencimientos, TablaEstado, ui/
│   └── lib/                           # api-client, sesion, formato-fecha
└── database/
    ├── migrations/20261008000700_contable.sql
    ├── seed.sql
    └── tests/rls_contable.test.sql
```
