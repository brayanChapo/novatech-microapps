# 03 · Asistencia (RR.HH.)

> **Estado:** ✅ Fase 1 implementada (marcación con geocerca + dashboard por local).
> **Fase 2 (especificada, no construida):** vacaciones y permisos. Ver [docs/01-requerimientos.md](docs/01-requerimientos.md#fase-2).

Micro app para que los colaboradores **marquen entrada y salida desde su celular**, validando con GPS en tiempo real que están **dentro de la geocerca de su local asignado**, y para que administradores y supervisores vean un **dashboard general y por local** que se actualiza al instante.

## Qué hay en esta carpeta

| Carpeta | Contenido | Tecnología |
|---|---|---|
| [`backend/`](backend/) | API REST: valida y registra marcaciones, dashboard, administración, reportes | Node 20+, Hono, Zod, Supabase JS · Vercel |
| [`frontend/`](frontend/) | Dashboard web para admin y supervisores (tiempo real, mapa) | Next.js 16, React 19, Tailwind 4, Leaflet · Vercel |
| [`mobile/`](mobile/) | App del colaborador: ubicación en vivo y botón de marcar | Expo SDK 57 (React Native), expo-location |
| [`database/`](database/) | Migraciones SQL, RLS, funciones del dashboard, seed demo y pruebas pgTAP | PostgreSQL (Supabase) |
| [`docs/`](docs/) | Requerimientos, arquitectura, API, levantamiento local, pruebas, implementación, manual | Markdown + Mermaid |

## Inicio rápido (local)

```bash
# Desde la raíz del monorepo (microapps/)
node scripts/db-sync.mjs && supabase start && supabase db reset

cd 03-asistencia-rrhh/backend  && cp .env.example .env       && npm install && npm run seed:demo && npm run dev
cd 03-asistencia-rrhh/frontend && cp .env.example .env.local && npm install && npm run dev   # http://localhost:3000
cd 03-asistencia-rrhh/mobile   && cp .env.example .env       && npm install && npx expo start
```

Guía completa paso a paso: **[docs/05-levantamiento-local.md](docs/05-levantamiento-local.md)**.

Usuarios demo (contraseña `Demo2026!`): `admin@demo.pe`, `supervisor@demo.pe`, `ana@demo.pe`, `luis@demo.pe`, `carla@demo.pe`, `jorge@demo.pe`, `rosa@demo.pe`, `pedro@demo.pe`.

## Pruebas

| Capa | Comando | Resultado actual |
|---|---|---|
| Backend (dominio, servicio, API) | `cd backend && npm test` | 49 pruebas ✅ |
| Base de datos (RLS, aislamiento) | `supabase test db` | 8 pruebas ✅ |
| Frontend (formato de fechas) | `cd frontend && npm test` | 4 pruebas ✅ |
| Móvil (cálculo de distancia) | `cd mobile && npm test` | 3 pruebas ✅ |

Detalle en [docs/06-pruebas.md](docs/06-pruebas.md).

## Documentación

1. [Requerimientos funcionales y no funcionales](docs/01-requerimientos.md)
2. [Arquitectura y diagramas](docs/02-arquitectura.md)
3. [Modelo de datos](docs/03-modelo-datos.md)
4. [API](docs/04-api.md)
5. [Levantamiento local](docs/05-levantamiento-local.md)
6. [Plan y casos de prueba](docs/06-pruebas.md)
7. [Documento de implementación (producción y alta de clientes)](docs/07-documento-implementacion.md)
8. [Manual de usuario](docs/08-manual-usuario.md)
9. [Seguridad y privacidad (Ley 29733)](docs/09-seguridad-privacidad.md)
