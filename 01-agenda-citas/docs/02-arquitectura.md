# 02 · Arquitectura — Agenda de Citas + Recordatorios WhatsApp

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extensión "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    PA["Paciente (público)\nsin cuenta"] -->|reserva online| WEB["Web App\nNext.js PWA"]
    AD["Administrador"] -->|configura profesionales\ny horarios| WEB
    RE["Recepción"] -->|gestiona la agenda\ndel día| WEB
    PR["Profesional"] -->|ve su agenda\ny marca asistencia| WEB
    WEB -->|HTTPS + JWT| API["API Agenda\nHono en Vercel"]
    API -->|service_role\nfiltra empresa_id| DB[("PostgreSQL\nSupabase")]
    API -->|plantillas aprobadas\npor Meta| WA["WhatsApp Business\nCloud API"]
    API -->|confirmaciones\ny alertas| RS["Resend\ncorreo transaccional"]
    WA -.->|webhook respuestas\ndel paciente| API
    CRON["Vercel Cron\ncada hora"] -.->|dispara\nrecordatorios| API
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph "Acceso público sin auth"
        PUB["frontend/app/reservar\nNext.js 16\n• Selección profesional / servicio / slot\n• Formulario datos del paciente\n• Confirmación visual de la cita"]
    end
    subgraph "Panel interno — auth JWT"
        WEB["frontend/app/panel\nNext.js 16\n• Vista día/semana por profesional\n• Confirmar / reprogramar / cancelar\n• Marcar asistencia del paciente\n• Reportes CSV"]
    end
    subgraph "Vercel — equipo NovaTech"
        API["backend — Hono + Zod\n• POST /reservas (público, rate-limit IP+tel)\n• GET|PATCH /citas (autenticado)\n• PATCH /marcaciones-asistencia\n• POST /webhooks/whatsapp\n• GET /cron/recordatorios\n• Lógica: solapamiento, slots, estados"]
    end
    subgraph "Supabase — proyecto compartido"
        AU["Auth — JWT"]
        ST["Storage privado\nvouchers / adjuntos"]
        PG[("PostgreSQL\nesquema: agenda\nRLS en todas las tablas")]
    end
    subgraph "Servicios externos"
        WA["WhatsApp Business\nCloud API — Meta"]
        RS["Resend\ncorreo transaccional"]
    end
    PUB -->|POST /reservas HTTPS| API
    WEB -->|HTTPS + JWT| API
    WEB --> AU
    API -->|service_role filtra empresa_id| PG
    API -->|plantillas de utilidad| WA
    API -->|correo confirmación / alerta| RS
    WA -.->|webhook POST /webhooks/whatsapp| API
```

**Principio clave:** la página pública de reserva nunca escribe directo a Supabase; la API valida disponibilidad del slot con `SELECT FOR UPDATE`, aplica rate limit por IP y teléfono, y registra la cita en una transacción atómica.

## 3. Secuencia principal: reserva y ciclo de recordatorio

```mermaid
sequenceDiagram
    autonumber
    actor P as Paciente
    participant Web as Web pública (Next.js)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant WA as WhatsApp (Meta)

    P->>Web: Abre enlace de reserva del consultorio
    Web->>API: GET /reservas/slots?profesional=X&fecha=Y
    API->>DB: consulta horarios, bloqueos y citas existentes
    DB-->>API: slots disponibles
    API-->>Web: lista de bloques libres
    P->>Web: Selecciona slot y completa nombre y teléfono
    Web->>API: POST /reservas {nombre, telefono, servicio_id, slot}
    API->>API: verifica rate-limit por IP y por teléfono
    alt límite excedido
        API-->>Web: 429 Demasiadas solicitudes
    else dentro del límite
        API->>DB: BEGIN — SELECT slot FOR UPDATE
        alt slot ya tomado por otra reserva concurrente
            API-->>Web: 409 Slot no disponible
        else slot libre
            API->>DB: INSERT cita + INSERT log_envio_wa (pendiente)
            API->>DB: COMMIT
            API->>WA: plantilla confirmacion_cita (nombre, fecha, hora Lima)
            WA-->>API: message_id
            API->>DB: UPDATE log_envio_wa estado=enviado
            API-->>Web: 201 Cita confirmada
            Web-->>P: Pantalla con detalles y botón añadir al calendario
        end
    end

    Note over API,DB: Cron cada hora — ventana de recordatorio
    API->>DB: SELECT citas donde recordatorio_enviado=false AND inicio <= now()+24h
    DB-->>API: lista de citas pendientes de recordatorio
    API->>WA: plantilla recordatorio_cita (24h antes; 2h si cita < 24h)
    WA-->>P: WhatsApp con opciones 1-Confirmar 2-Cancelar 3-Reprogramar
    P->>WA: responde "1"
    WA->>API: POST /webhooks/whatsapp {from, body}
    API->>DB: UPDATE cita SET estado='confirmada', recordatorio_enviado=true
    API-->>WA: 200 OK
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\nagenda-api\nRoot Dir: 01-agenda-citas/backend"]
    CI -->|ok| V2["Vercel proyecto\nagenda-web\nRoot Dir: 01-agenda-citas/frontend"]
    V1 -->|Vercel Cron /cron/recordatorios| CRON["Job de recordatorios\ncada hora"]
    V1 -->|service_role| SB[("Supabase Pro\nproduccion-compartida\nesquema: agenda")]
    V2 --> SB
    V1 -->|HTTPS API Graph| WA["WhatsApp\nBusiness Cloud API"]
    V1 -->|HTTPS API| RS["Resend"]
    META["Meta Developers\nWebhook registrado"] -.->|POST /webhooks/whatsapp| V1
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `agenda-api` (Root Dir: `01-agenda-citas/backend`) | `api-agenda.novatechconsulting.com.pe` |
| Web / PWA | `agenda-web` (Root Dir: `01-agenda-citas/frontend`) | `agenda.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `agenda`) | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decisión | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | Validación de solapamiento en el servidor con `SELECT FOR UPDATE` | Validar solo en frontend o índice UNIQUE en BD | El frontend es manipulable; dos reservas concurrentes sobre el mismo slot solo se resuelven sin carrera con un lock de fila en la transacción del servidor. |
| ADR-02 | Página pública sin autenticación con rate limit por IP y teléfono | Requerir cuenta para reservar | El paciente no crea cuenta; barreras de registro reducen conversión. El rate limit en middleware es la capa anti-spam suficiente según RNF-09. |
| ADR-03 | Cron de Vercel (cada hora) para recordatorios | pg_cron en Supabase | Visible en logs de Vercel, pausable sin tocar la BD, no requiere extensión adicional. pg_cron queda como alternativa si se necesita precisión al minuto. |
| ADR-04 | Solo plantillas de utilidad aprobadas por Meta | Mensajes de sesión libres o plantillas de marketing | Las de utilidad tienen costo fijo predecible y no requieren que el paciente haya iniciado conversación en las últimas 24 h. Cumple RN-03 y R9. |
| ADR-05 | Webhook de WhatsApp para procesar respuestas del paciente | Polling a la API de Meta | Push en tiempo real sin costo de llamadas repetidas; latencia menor a 2 s frente a minutos con polling. |
| ADR-06 | Hora guardada en UTC, visualización en America/Lima | Guardar directo en zona Lima | Evita ambigüedad si Perú cambia horario de verano; facilita comparaciones y ordenamientos. Cumple R3. |
| ADR-07 | Un esquema por app (`agenda`) en Supabase compartido | Proyecto Supabase separado por app | Cada proyecto adicional cuesta ~US$10/mes; el esquema separado mantiene aislamiento con RLS y costo bajo. Cumple R7. |

## 6. Estructura de código

```
01-agenda-citas/
├── backend/
│   ├── api/index.ts                   # entrada Vercel (handler)
│   ├── src/
│   │   ├── app.ts                     # Hono: CORS, auth, rutas, errores globales
│   │   ├── domain/                    # lógica PURA sin dependencias de I/O
│   │   │   ├── slots.ts               # calcular disponibilidad de bloques
│   │   │   ├── recordatorio.ts        # regla 24h / 2h antes
│   │   │   └── estado-cita.ts         # máquina de estados y transiciones válidas
│   │   ├── services/                  # casos de uso: crearReserva, procesarRespuestaWA
│   │   ├── repos/                     # CitaRepo, EnvioWARepo (interfaz + impl Supabase)
│   │   ├── routes/
│   │   │   ├── reservas.ts            # POST /reservas (público con rate-limit)
│   │   │   ├── citas.ts               # CRUD autenticado
│   │   │   ├── webhooks.ts            # POST /webhooks/whatsapp
│   │   │   └── cron.ts                # GET /cron/recordatorios
│   │   ├── middleware/
│   │   │   ├── auth.ts                # JWT → perfil (empresa_id, rol)
│   │   │   └── rate-limit.ts          # límite por IP y teléfono
│   │   └── lib/                       # supabase-client, whatsapp, resend, zod-schemas
│   └── tests/                         # Vitest — dominio y servicios
├── frontend/
│   ├── app/
│   │   ├── reservar/                  # ruta pública sin layout de auth
│   │   └── (panel)/                   # layout autenticado
│   │       ├── agenda/                # vista día / semana
│   │       ├── pacientes/
│   │       └── configuracion/
│   ├── components/                    # CalendarioSemana, SlotPicker, ui/
│   └── lib/                           # api-client, sesion, formato-fecha-lima
└── database/
    ├── migrations/20261008000100_agenda.sql
    ├── seed.sql
    └── tests/rls_agenda.test.sql
```
