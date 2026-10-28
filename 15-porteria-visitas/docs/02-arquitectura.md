# 02 · Arquitectura — Registro de visitas en portería con QR

Misma plataforma que todas las micro apps (ver [`GUIA-DESARROLLO.md`](../../GUIA-DESARROLLO.md) y la arquitectura de referencia en [`03-asistencia-rrhh/docs/02-arquitectura.md`](../../03-asistencia-rrhh/docs/02-arquitectura.md)).

```mermaid
flowchart LR
    U0["Admin"] --> WEB
    API -.->|WhatsApp| U1["Residente"]
    U2["Portero"] --> WEB
    WEB["Web Next.js<br/>(PWA)"] -->|HTTPS + JWT| API["API porteria<br/>Hono · Vercel"]
    
    API -->|service_role| DB[("Supabase<br/>esquema porteria")]
    API -.-> I0["Web Push"]
    API -.-> I1["WhatsApp opcional"]
```

## Componentes

| Componente | Tecnología | Despliegue |
|---|---|---|
| API | Hono + Zod + supabase-js | Vercel `porteria-visitas-api` |
| Web | Next.js + Tailwind | Vercel `porteria-visitas-web` |
| Móvil | PWA (la misma web) | — |
| Datos | PostgreSQL, esquema `porteria` | Supabase `produccion-compartida` |

## Decisiones

- Lógica de negocio en el **backend**; los clientes solo leen/escriben a través de la API.
- No se construye app nativa. La interfaz web es **responsive e instalable (PWA)** desde el navegador del celular; cubre las necesidades de esta micro app sin pasar por tiendas.
- Integraciones: Web Push (VAPID), WhatsApp opcional.
