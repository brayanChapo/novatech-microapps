# 02 · Arquitectura — Control de Pensiones y Cuotas

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extensión "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    AD["Administrador"] -->|padrón, cronograma\ny configuración| WEB["Dashboard web\nNext.js PWA"]
    TE["Tesorería"] -->|valida vouchers\ny registra pagos| WEB
    AP["Apoderado / Propietario"] -->|ve estado de cuenta\ny sube voucher| PORTAL["Portal del responsable\nNext.js — enlace con token"]
    WEB -->|HTTPS + JWT| API["API Pensiones\nHono en Vercel"]
    PORTAL -->|HTTPS + token| API
    API -->|service_role\nfiltra empresa_id| DB[("PostgreSQL\nSupabase")]
    API -->|vouchers\ny recibos PDF| ST["Supabase Storage"]
    API -->|recordatorio de\ncuota vencida| WA["WhatsApp Business\nCloud API"]
    CRON["Vercel Cron\ndiario a las 8:00 Lima"] -.->|detecta mora\ny vencimientos| API
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph "Panel interno — auth JWT"
        WEB["frontend/app/panel\nNext.js 16\n• Padrón de alumnos / unidades\n• Generación masiva de cuotas\n• Validación de vouchers\n• Reporte de morosidad (CSV)\n• Configuración de mora"]
    end
    subgraph "Portal externo — token firmado"
        PORT["frontend/app/portal/[token]\nNext.js 16\n• Estado de cuenta del responsable\n• Subida de voucher (PDF / imagen)\n• Sin contraseña — token 32 bytes exp. 30 días"]
    end
    subgraph "Vercel — equipo NovaTech"
        API["backend — Hono + Zod\n• POST /cuotas/generar (masivo)\n• GET /portal/:token/cuenta\n• POST /portal/:token/voucher\n• PATCH /cobros/:id/validar\n• GET /cron/mora y /cron/recordatorios\n• GET /recibos/:id/pdf\n• Lógica: estados, mora, máximo 2 recordatorios"]
    end
    subgraph "Supabase — proyecto compartido"
        AU["Auth — JWT"]
        ST["Storage privado\nvouchers y recibos PDF"]
        PG[("PostgreSQL\nesquema: pensiones\nRLS en todas las tablas")]
    end
    subgraph "Servicios externos"
        WA["WhatsApp Business\nCloud API — Meta"]
    end
    WEB -->|HTTPS + JWT| API
    PORT -->|HTTPS + token header| API
    WEB --> AU
    API -->|service_role filtra empresa_id| PG
    API -->|upload / signed URL| ST
    API -->|plantillas recordatorio| WA
```

**Principio clave:** el apoderado accede a su estado de cuenta con un token de 32 bytes sin contraseña; la API valida el token contra la BD, verifica expiración a 30 días y devuelve solo los datos de ese responsable, sin RLS bypass.

## 3. Secuencia principal: generación de cuotas, mora y pago

```mermaid
sequenceDiagram
    autonumber
    actor AD as Administrador
    actor AP as Apoderado
    participant Web as Dashboard (Next.js)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant WA as WhatsApp (Meta)

    AD->>Web: Genera cuotas del período Noviembre 2026
    Web->>API: POST /cuotas/generar {periodo, empresa_id}
    API->>DB: SELECT alumnos activos del padrón
    DB-->>API: lista de responsables
    API->>DB: INSERT cuotas batch (un registro por alumno, estado=pendiente)
    API-->>Web: 201 N cuotas generadas

    Note over API,DB: Cron diario — detección de mora
    API->>DB: SELECT cuotas WHERE fecha_vencimiento < now() AND estado=pendiente
    loop por cada cuota vencida
        API->>DB: UPDATE cuota SET estado=vencida, mora_calculada=...
        alt recordatorios_enviados < 2
            API->>WA: plantilla recordatorio_pago (apoderado, monto, deuda)
            API->>DB: UPDATE cuota recordatorios_enviados += 1
        end
    end

    AP->>Web: Abre portal con enlace https://…/portal/TOKEN
    Web->>API: GET /portal/:token/cuenta
    API->>DB: SELECT token, verifica expiración 30 días
    DB-->>API: datos de cuenta y cuotas pendientes
    API-->>Web: estado de cuenta
    AP->>Web: Adjunta foto voucher Yape
    Web->>API: POST /portal/:token/voucher {cuota_id, archivo}
    API->>DB: INSERT cobro (estado=pendiente_validacion)
    API-->>Web: 201 Voucher recibido

    AD->>Web: Lista cobros pendientes de validar
    Web->>API: GET /cobros?estado=pendiente
    API-->>Web: lista con URL firmada del voucher
    AD->>Web: Aprueba cobro
    Web->>API: PATCH /cobros/:id/validar
    API->>DB: UPDATE cobro estado=validado
    API->>DB: UPDATE cuota estado=pagada
    API-->>Web: 200 Cuota cerrada
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\npensiones-api\nRoot Dir: 04-pensiones-cuotas/backend"]
    CI -->|ok| V2["Vercel proyecto\npensiones-web\nRoot Dir: 04-pensiones-cuotas/frontend"]
    V1 -->|Vercel Cron diario 8:00| CRON1["Job mora y estados"]
    V1 -->|Vercel Cron mensual| CRON2["Job generación cuotas\n(si está configurado)"]
    V1 -->|service_role| SB[("Supabase Pro\nproduccion-compartida\nesquema: pensiones")]
    V2 --> SB
    V1 -->|HTTPS API Graph| WA["WhatsApp\nBusiness Cloud API"]
    V1 -->|SDK| ST["Supabase Storage\nvouchers + PDFs"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `pensiones-api` (Root Dir: `04-pensiones-cuotas/backend`) | `api-pensiones.novatechconsulting.com.pe` |
| Dashboard / Portal | `pensiones-web` (Root Dir: `04-pensiones-cuotas/frontend`) | `pensiones.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `pensiones`) | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **Portal del apoderado sin contraseña** con token de 32 bytes y expiración 30 días | Cuenta de usuario con contraseña | El apoderado promedio no recuerda otra contraseña; el token seguro enviado por WhatsApp/correo es usable y cumple RNF-08. Un token aleatorio de 32 bytes es inviable de adivinar por fuerza bruta. |
| ADR-02 | **Generación masiva de cuotas** como job en lote desde la API | Trigger en PostgreSQL al cambiar fecha | El job API permite logging, control de errores y auditoría clara. Los triggers son difíciles de monitorear y depurar. |
| ADR-03 | **Recibo PDF generado en el servidor** con `@react-pdf/renderer` | PDF en el cliente (navegador) | El servidor garantiza formato consistente y el archivo queda en Storage para descarga posterior; el cliente no necesita procesar el PDF. |
| ADR-04 | **Máximo 2 recordatorios por cuota** | Sin límite | Cumple RN-03; evita hostigamiento al apoderado y bloqueos del número de WhatsApp por spam. |
| ADR-05 | **Mora calculada en el servidor** al momento de ejecutar el cron | Calcular mora en el cliente | El servidor es la fuente de verdad; la mora puede depender de configuración por empresa (monto fijo o porcentaje), que solo el servidor conoce con certeza. |
| ADR-06 | **Vouchers en Storage privado** con URL firmada de visualización | Adjuntos en la BD como BYTEA | Storage es más barato, escalable, y las URLs firmadas controlan el acceso sin exponer el archivo directamente. Cumple RNF-09. |
| ADR-07 | **Un esquema por app** (`pensiones`) en Supabase compartido | Proyecto Supabase separado por app | Costo ~US$10/mes por proyecto adicional. RLS garantiza aislamiento multi-tenant. Cumple R7. |

## 6. Estructura de código

```
04-pensiones-cuotas/
├── backend/
│   ├── api/index.ts                   # entrada Vercel
│   ├── src/
│   │   ├── app.ts                     # Hono: CORS, auth, rutas, errores
│   │   ├── domain/
│   │   │   ├── cuota.ts               # estados, transiciones válidas
│   │   │   ├── mora.ts                # cálculo monto fijo o % por día
│   │   │   └── recordatorio.ts        # regla máximo 2 por cuota
│   │   ├── services/                  # generarCuotas, procesarMora, validarCobro
│   │   ├── repos/                     # CuotaRepo, CobroRepo, AlumnoRepo
│   │   ├── routes/
│   │   │   ├── cuotas.ts              # POST /cuotas/generar, GET listado
│   │   │   ├── portal.ts              # GET|POST /portal/:token/...
│   │   │   ├── cobros.ts              # PATCH /cobros/:id/validar
│   │   │   ├── recibos.ts             # GET /recibos/:id/pdf
│   │   │   └── cron.ts                # GET /cron/mora, /cron/recordatorios
│   │   ├── middleware/auth.ts         # JWT → perfil
│   │   └── lib/                       # supabase, whatsapp, pdf-renderer, zod
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── portal/[token]/            # portal público del apoderado
│   │   └── (panel)/
│   │       ├── padron/                # alumnos y responsables
│   │       ├── cuotas/                # cronograma y generación masiva
│   │       ├── cobros/                # validación de vouchers
│   │       └── reportes/              # morosidad por aula / antigüedad
│   ├── components/                    # TablaMorosidad, EstadoCuenta, ui/
│   └── lib/                           # api-client, sesion, formato
└── database/
    ├── migrations/20261008000400_pensiones.sql
    ├── seed.sql
    └── tests/rls_pensiones.test.sql
```
