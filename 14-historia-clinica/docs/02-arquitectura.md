# 02 · Arquitectura — Historia clínica simple

Misma plataforma que todas las micro apps (ver [`GUIA-DESARROLLO.md`](../../GUIA-DESARROLLO.md) y la arquitectura de referencia en [`03-asistencia-rrhh/docs/02-arquitectura.md`](../../03-asistencia-rrhh/docs/02-arquitectura.md)).

```mermaid
flowchart LR
    U0["Admin"] --> WEB
    U1["Profesional"] --> WEB
    U2["Recepcion"] --> WEB
    WEB["Web Next.js<br/>(PWA)"] -->|HTTPS + JWT| API["API clinica<br/>Hono · Vercel"]
    
    API -->|service_role| DB[("Supabase<br/>esquema clinica")]
    API -.-> I0["Generación de PDF"]
    API -.-> I1["Supabase Storage privado"]
```

## Componentes

| Componente | Tecnología | Despliegue |
|---|---|---|
| API | Hono + Zod + supabase-js | Vercel `historia-clinica-api` |
| Web | Next.js + Tailwind | Vercel `historia-clinica-web` |
| Móvil | PWA (la misma web) | — |
| Datos | PostgreSQL, esquema `clinica` | Supabase `produccion-compartida` — **proyecto dedicado por cliente** |

## Decisiones

- Lógica de negocio en el **backend**; los clientes solo leen/escriben a través de la API.
- No se construye app nativa. La interfaz web es **responsive e instalable (PWA)** desde el navegador del celular; cubre las necesidades de esta micro app sin pasar por tiendas.
- Integraciones: Generación de PDF, Supabase Storage privado.
