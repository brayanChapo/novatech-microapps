# 02 · Arquitectura — Cotizador con PDF

Misma plataforma que todas las micro apps (ver [`GUIA-DESARROLLO.md`](../../GUIA-DESARROLLO.md) y la arquitectura de referencia en [`03-asistencia-rrhh/docs/02-arquitectura.md`](../../03-asistencia-rrhh/docs/02-arquitectura.md)).

```mermaid
flowchart LR
    U0["Admin"] --> WEB
    U1["Vendedor"] --> WEB
    WEB["Web Next.js<br/>(PWA)"] -->|HTTPS + JWT| API["API cotizador<br/>Hono · Vercel"]
    
    API -->|service_role| DB[("Supabase<br/>esquema cotizador")]
    API -.-> I0["Generación de PDF"]
    API -.-> I1["Correo"]
    API -.-> I2["Enlace wa.me"]
```

## Componentes

| Componente | Tecnología | Despliegue |
|---|---|---|
| API | Hono + Zod + supabase-js | Vercel `cotizador-pdf-api` |
| Web | Next.js + Tailwind | Vercel `cotizador-pdf-web` |
| Móvil | PWA (la misma web) | — |
| Datos | PostgreSQL, esquema `cotizador` | Supabase `produccion-compartida` |

## Decisiones

- Lógica de negocio en el **backend**; los clientes solo leen/escriben a través de la API.
- No se construye app nativa. La interfaz web es **responsive e instalable (PWA)** desde el navegador del celular; cubre las necesidades de esta micro app sin pasar por tiendas.
- Integraciones: Generación de PDF, Correo, Enlace wa.me.
