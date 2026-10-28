# 02 · Arquitectura — Control de pensiones y cuotas

Misma plataforma que todas las micro apps (ver [`GUIA-DESARROLLO.md`](../../GUIA-DESARROLLO.md) y la arquitectura de referencia en [`03-asistencia-rrhh/docs/02-arquitectura.md`](../../03-asistencia-rrhh/docs/02-arquitectura.md)).

```mermaid
flowchart LR
    U0["Admin"] --> WEB
    U1["Tesoreria"] --> WEB
    U2["Apoderado/propietario"] --> WEB
    WEB["Web Next.js<br/>(PWA)"] -->|HTTPS + JWT| API["API pensiones<br/>Hono · Vercel"]
    
    API -->|service_role| DB[("Supabase<br/>esquema pensiones")]
    API -.-> I0["WhatsApp Cloud API"]
    API -.-> I1["Supabase Storage"]
```

## Componentes

| Componente | Tecnología | Despliegue |
|---|---|---|
| API | Hono + Zod + supabase-js | Vercel `pensiones-cuotas-api` |
| Web | Next.js + Tailwind | Vercel `pensiones-cuotas-web` |
| Móvil | PWA (la misma web) | — |
| Datos | PostgreSQL, esquema `pensiones` | Supabase `produccion-compartida` |

## Decisiones

- Lógica de negocio en el **backend**; los clientes solo leen/escriben a través de la API.
- No se construye app nativa. La interfaz web es **responsive e instalable (PWA)** desde el navegador del celular; cubre las necesidades de esta micro app sin pasar por tiendas.
- Integraciones: WhatsApp Cloud API, Supabase Storage (vouchers).
