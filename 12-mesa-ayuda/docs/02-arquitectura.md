# 02 · Arquitectura — Mesa de Ayuda Interna (Tickets)

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extension "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    SOL["Solicitante\n(navegador / PWA)"] -->|crea ticket y ve estado| WEB["Web / PWA\nNext.js"]
    AGE["Agente\n(navegador)"] -->|atiende y resuelve tickets| WEB
    SUP["Supervisor\n(navegador)"] -->|monitorea SLA y asigna| WEB
    WEB -->|HTTPS + JWT| API["API Mesa Ayuda\nHono en Vercel"]
    API -->|service_role| DB[("PostgreSQL\nSupabase")]
    API -->|login| AUTH["Supabase Auth"]
    API -->|adjuntos| STO["Supabase Storage\n(bucket adjuntos)"]
    API -->|Realtime ticket nuevo| RT["Supabase Realtime"]
    RT -.->|evento push| WEB
    API -.->|notificacion cambio estado| MAIL["Correo\n(Resend)"]
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph Cliente
      F["frontend/ — Next.js 16\n• Login (solicitante, agente, supervisor)\n• Vista solicitante: crear ticket, adjuntar, ver estado y comentarios\n• Vista agente: bandeja por cola, cambiar estado, comentar\n• Vista supervisor: dashboard SLA, reasignar, reportes\n• Suscripcion Realtime: ticket nuevo aparece sin recargar"]
    end
    subgraph "Vercel (equipo NovaTech)"
      B["backend/ — Hono + Zod\n• Valida JWT y carga perfil\n• POST /tickets: crea y asigna por categoria\n• PUT /tickets/:id/estado: transicion con reglas\n• POST /tickets/:id/comentarios\n• Job SLA: detecta tickets proximos a vencer\n• Job cierre auto: cierra resueltos tras 3 dias sin respuesta\n• GET /reportes: metricas por agente y categoria"]
    end
    subgraph "Supabase (proyecto compartido)"
      AU["Auth (JWT)"]
      PG[("PostgreSQL\nesquemas core + mesa_ayuda\nRLS en todas las tablas")]
      ST["Storage bucket adjuntos\n(privado)"]
      RT["Realtime\n(postgres_changes en tickets)"]
    end
    subgraph Externo
      MAIL["Servicio de Correo\n(Resend)"]
    end
    F --> B
    F --> AU
    F <-->|suscripcion filtrada por RLS| RT
    B -->|service_role, filtra empresa_id| PG
    B -->|upload adjunto| ST
    B -->|notifica cambio estado| MAIL
    RT --- PG
```

**Principio clave:** **Supabase Realtime** notifica al agente en tiempo real cuando llega un ticket nuevo a su cola, sin sondeo. El SLA se pausa automaticamente cuando el ticket pasa a estado "en_espera" y se reanuda al volver a "en_atencion"; este calculo ocurre en el servidor, nunca en el cliente.

## 3. Secuencia principal: creacion de ticket y asignacion automatica

```mermaid
sequenceDiagram
    autonumber
    actor U as Solicitante
    actor A as Agente
    participant Web as PWA (Next.js)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant RT as Supabase Realtime
    participant MAIL as Correo (Resend)

    U->>Web: completa formulario: categoria, prioridad, descripcion, adjuntos
    Web->>API: POST /tickets con multipart (datos + adjuntos)
    API->>API: valida Zod
    loop por cada adjunto
        API->>DB: obtiene Storage bucket
        API->>DB: PUT adjunto en Storage privado
    end
    API->>DB: consulta regla de asignacion por categoria
    API->>DB: INSERT ticket con agente asignado y timestamp SLA inicio
    DB-->>RT: evento INSERT en tabla tickets
    RT-->>Web: postgres_changes (agente asignado lo recibe en tiempo real)
    API->>MAIL: notifica al agente (ticket asignado) y al solicitante (numero de ticket)
    API-->>Web: 201 con numero de ticket
    A->>Web: ve ticket nuevo en su bandeja
    A->>Web: abre ticket y cambia estado a en_atencion
    Web->>API: PUT /tickets/:id/estado con nuevo_estado
    API->>DB: INSERT historial_estado con timestamp
    API->>DB: UPDATE ticket estado y, si aplica, pausa o reanuda SLA
    API->>MAIL: notifica cambio de estado al solicitante
    API-->>Web: 200 ticket actualizado
    A->>Web: agrega comentario y resuelve ticket
    Web->>API: POST /tickets/:id/comentarios
    API->>DB: INSERT comentario
    API->>MAIL: notifica al solicitante con link al ticket
    Web->>API: PUT /tickets/:id/estado con resuelto
    API->>DB: UPDATE ticket a resuelto, programa job cierre en 3 dias
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\nmesa-ayuda-api"]
    CI -->|ok| V2["Vercel proyecto\nmesa-ayuda-web"]
    V1 --> SB[("Supabase Pro\nproduccion-compartida\nesquema mesa_ayuda + Storage + Realtime")]
    V2 --> SB
    V1 -->|API key| MAIL["Resend"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `mesa-ayuda-api` (Root: `12-mesa-ayuda/backend`) | `api-ayuda.novatechconsulting.com.pe` |
| Web / PWA | `mesa-ayuda-web` (Root: `12-mesa-ayuda/frontend`) | `ayuda.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `mesa_ayuda`) | — |
| Storage | Supabase `produccion-compartida` bucket `adjuntos-ayuda` (privado) | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decision | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **Supabase Realtime** para notificacion inmediata al agente | Sondeo cada N segundos, WebSocket propio | Sin infraestructura extra; el filtro RLS garantiza que cada agente ve solo sus tickets. Reduce latencia percibida de minutos a menos de 1 s. |
| ADR-02 | **SLA calculado y pausado en el servidor** (INSERT en historial_estado con timestamps) | Calculo en el cliente al renderizar | El servidor es la unica fuente de verdad sobre el tiempo; un cliente con reloj desajustado no debe afectar los SLAs. |
| ADR-03 | **Cierre automatico a los 3 dias** (RN-02) via job programado (Vercel Cron) | Cierre manual obligatorio | Reduce backlog de tickets "resueltos" pendientes de confirmacion sin requerir accion del solicitante. |
| ADR-04 | **Asignacion automatica por regla de categoria** al crear ticket | Solo asignacion manual | Elimina el cuello de botella del supervisor en el primer nivel; la asignacion manual queda disponible para reasignacion posterior. |
| ADR-05 | **Adjuntos en Storage privado con URL firmada** (10 min) | Adjuntos embebidos en base de datos como bytea | Evita inflar la base de datos con binarios; el acceso esta controlado por la misma sesion JWT del ticket. |
| ADR-06 | **Historial de estados inmutable** (INSERT siempre, nunca UPDATE del historial) | UPDATE del estado directamente | El historial de cambios es un requisito auditable (RF-03); con solo INSERT se puede reconstruir el ciclo completo de vida de cualquier ticket. |
| ADR-07 | **Correo transaccional** (no WhatsApp) para notificaciones de tickets | WhatsApp, notificaciones push | Los tickets son procesos laborales internos; el correo es el canal formal y no tiene costo variable. WhatsApp se reserva para alertas criticas urgentes (R9). |

## 6. Estructura de codigo

```
12-mesa-ayuda/
├── backend/
│   ├── api/index.ts
│   ├── src/
│   │   ├── app.ts
│   │   ├── domain/
│   │   │   ├── ticket.ts              # transicionesPermitidas, estadoSiguiente
│   │   │   ├── sla.ts                 # calcularTiempoRestante, estaPausado
│   │   │   └── asignacion.ts          # reglasPorCategoria
│   │   ├── services/
│   │   │   ├── crearTicket.ts
│   │   │   ├── cambiarEstado.ts
│   │   │   ├── procesarSLA.ts         # job alerta vencimiento
│   │   │   └── cerrarResueltos.ts     # job cierre auto 3 dias
│   │   ├── repos/
│   │   │   ├── TicketRepo.ts
│   │   │   ├── ComentarioRepo.ts
│   │   │   └── HistorialRepo.ts
│   │   ├── routes/
│   │   │   ├── tickets.ts             # POST, GET, PUT estado
│   │   │   ├── comentarios.ts         # POST /tickets/:id/comentarios
│   │   │   ├── reportes.ts
│   │   │   └── admin.ts               # categorias, SLA, agentes
│   │   ├── middleware/auth.ts
│   │   └── lib/
│   │       ├── supabase.ts
│   │       ├── storage.ts
│   │       ├── correo.ts
│   │       └── errors.ts
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   └── (panel)/
│   │       ├── mis-tickets/           # vista solicitante
│   │       ├── bandeja/               # vista agente con Realtime
│   │       ├── supervisor/            # dashboard SLA
│   │       └── admin/
│   ├── components/
│   │   ├── TicketCard.tsx
│   │   ├── SLABadge.tsx
│   │   ├── useBandejaRealtime.ts      # hook Supabase Realtime
│   │   └── ui/
│   └── lib/
│       ├── api.ts
│       ├── supabase.ts
│       └── formato.ts
└── database/
    ├── migrations/20261028001200_mesa_ayuda.sql
    ├── seed.sql
    └── tests/rls_mesa_ayuda.test.sql
```
