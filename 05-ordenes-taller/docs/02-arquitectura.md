# 02 · Arquitectura — Orden de trabajo con estado por WhatsApp

Misma plataforma que todas las micro apps (ver [`GUIA-DESARROLLO.md`](../../GUIA-DESARROLLO.md) y la arquitectura de referencia en [`03-asistencia-rrhh/docs/02-arquitectura.md`](../../03-asistencia-rrhh/docs/02-arquitectura.md)).

```mermaid
flowchart LR
    U0["Admin"] --> WEB
    U1["Recepcion"] --> WEB
    U2["Tecnico"] --> WEB
    WEB["Web Next.js<br/>(PWA)"] -->|HTTPS + JWT| API["API taller<br/>Hono · Vercel"]
    
    API -->|service_role| DB[("Supabase<br/>esquema taller")]
    API -.-> I0["WhatsApp Cloud API"]
    API -.-> I1["Generación de PDF"]
    API -.-> I2["Supabase Storage"]
```

## Componentes

| Componente | Tecnología | Despliegue |
|---|---|---|
| API | Hono + Zod + supabase-js | Vercel `ordenes-taller-api` |
| Web | Next.js + Tailwind | Vercel `ordenes-taller-web` |
| Móvil | PWA (la misma web) | — |
| Datos | PostgreSQL, esquema `taller` | Supabase `produccion-compartida` |

## Decisiones

- Lógica de negocio en el **backend**; los clientes solo leen/escriben a través de la API.
- No se construye app nativa. La interfaz web es **responsive e instalable (PWA)** desde el navegador del celular; cubre las necesidades de esta micro app sin pasar por tiendas.
- Integraciones: WhatsApp Cloud API, Generación de PDF, Supabase Storage.
