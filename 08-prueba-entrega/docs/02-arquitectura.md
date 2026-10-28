# 02 · Arquitectura — Prueba de entrega (foto, firma, GPS)

Misma plataforma que todas las micro apps (ver [`GUIA-DESARROLLO.md`](../../GUIA-DESARROLLO.md) y la arquitectura de referencia en [`03-asistencia-rrhh/docs/02-arquitectura.md`](../../03-asistencia-rrhh/docs/02-arquitectura.md)).

```mermaid
flowchart LR
    U0["Admin"] --> WEB
    U1["Repartidor"] --> APP
    WEB["Web Next.js<br/>(PWA)"] -->|HTTPS + JWT| API["API entregas<br/>Hono · Vercel"]
    APP["App Expo"] -->|HTTPS + JWT| API
    API -->|service_role| DB[("Supabase<br/>esquema entregas")]
    API -.-> I0["Supabase Storage"]
```

## Componentes

| Componente | Tecnología | Despliegue |
|---|---|---|
| API | Hono + Zod + supabase-js | Vercel `prueba-entrega-api` |
| Web | Next.js + Tailwind | Vercel `prueba-entrega-web` |
| Móvil | Expo (React Native) | EAS Build |
| Datos | PostgreSQL, esquema `entregas` | Supabase `produccion-compartida` |

## Decisiones

- Lógica de negocio en el **backend**; los clientes solo leen/escriben a través de la API.
- Se construye app **Expo** reutilizando la base de la app 03 (GPS) más cámara, firma y modo sin conexión.
- Integraciones: Supabase Storage.
