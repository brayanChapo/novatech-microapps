# 02 · Arquitectura — Rendición de gastos con foto de comprobante

Misma plataforma que todas las micro apps (ver [`GUIA-DESARROLLO.md`](../../GUIA-DESARROLLO.md) y la arquitectura de referencia en [`03-asistencia-rrhh/docs/02-arquitectura.md`](../../03-asistencia-rrhh/docs/02-arquitectura.md)).

```mermaid
flowchart LR
    U0["Admin"] --> WEB
    U1["Colaborador"] --> WEB
    U2["Aprobador"] --> WEB
    U3["Contabilidad"] --> WEB
    WEB["Web Next.js<br/>(PWA)"] -->|HTTPS + JWT| API["API gastos<br/>Hono · Vercel"]
    
    API -->|service_role| DB[("Supabase<br/>esquema gastos")]
    API -.-> I0["Supabase Storage"]
    API -.-> I1["Correo"]
```

## Componentes

| Componente | Tecnología | Despliegue |
|---|---|---|
| API | Hono + Zod + supabase-js | Vercel `rendicion-gastos-api` |
| Web | Next.js + Tailwind | Vercel `rendicion-gastos-web` |
| Móvil | PWA (la misma web) | — |
| Datos | PostgreSQL, esquema `gastos` | Supabase `produccion-compartida` |

## Decisiones

- Lógica de negocio en el **backend**; los clientes solo leen/escriben a través de la API.
- No se construye app nativa. La interfaz web es **responsive e instalable (PWA)** desde el navegador del celular; cubre las necesidades de esta micro app sin pasar por tiendas.
- Integraciones: Supabase Storage, Correo.
