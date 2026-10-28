# 02 · Arquitectura — Vencimientos SUNAT + portal de documentos

Misma plataforma que todas las micro apps (ver [`GUIA-DESARROLLO.md`](../../GUIA-DESARROLLO.md) y la arquitectura de referencia en [`03-asistencia-rrhh/docs/02-arquitectura.md`](../../03-asistencia-rrhh/docs/02-arquitectura.md)).

```mermaid
flowchart LR
    U0["Admin"] --> WEB
    U1["Asistente"] --> WEB
    U2["Cliente"] --> WEB
    WEB["Web Next.js<br/>(PWA)"] -->|HTTPS + JWT| API["API contable<br/>Hono · Vercel"]
    
    API -->|service_role| DB[("Supabase<br/>esquema contable")]
    API -.-> I0["Correo transaccional"]
    API -.-> I1["Supabase Storage"]
    API -.-> I2["Tarea programada diaria"]
```

## Componentes

| Componente | Tecnología | Despliegue |
|---|---|---|
| API | Hono + Zod + supabase-js | Vercel `vencimientos-sunat-api` |
| Web | Next.js + Tailwind | Vercel `vencimientos-sunat-web` |
| Móvil | PWA (la misma web) | — |
| Datos | PostgreSQL, esquema `contable` | Supabase `produccion-compartida` |

## Decisiones

- Lógica de negocio en el **backend**; los clientes solo leen/escriben a través de la API.
- No se construye app nativa. La interfaz web es **responsive e instalable (PWA)** desde el navegador del celular; cubre las necesidades de esta micro app sin pasar por tiendas.
- Integraciones: Correo transaccional, Supabase Storage, Tarea programada diaria (cron).
