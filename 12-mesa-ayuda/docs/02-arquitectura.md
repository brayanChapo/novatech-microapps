# 02 · Arquitectura — Mesa de ayuda interna (tickets)

Misma plataforma que todas las micro apps (ver [`GUIA-DESARROLLO.md`](../../GUIA-DESARROLLO.md) y la arquitectura de referencia en [`03-asistencia-rrhh/docs/02-arquitectura.md`](../../03-asistencia-rrhh/docs/02-arquitectura.md)).

```mermaid
flowchart LR
    U0["Admin"] --> WEB
    U1["Solicitante"] --> WEB
    U2["Agente"] --> WEB
    WEB["Web Next.js<br/>(PWA)"] -->|HTTPS + JWT| API["API ayuda<br/>Hono · Vercel"]
    
    API -->|service_role| DB[("Supabase<br/>esquema ayuda")]
    API -.-> I0["Correo"]
    API -.-> I1["Supabase Storage"]
```

## Componentes

| Componente | Tecnología | Despliegue |
|---|---|---|
| API | Hono + Zod + supabase-js | Vercel `mesa-ayuda-api` |
| Web | Next.js + Tailwind | Vercel `mesa-ayuda-web` |
| Móvil | PWA (la misma web) | — |
| Datos | PostgreSQL, esquema `ayuda` | Supabase `produccion-compartida` |

## Decisiones

- Lógica de negocio en el **backend**; los clientes solo leen/escriben a través de la API.
- No se construye app nativa. La interfaz web es **responsive e instalable (PWA)** desde el navegador del celular; cubre las necesidades de esta micro app sin pasar por tiendas.
- Integraciones: Correo, Supabase Storage (adjuntos).
