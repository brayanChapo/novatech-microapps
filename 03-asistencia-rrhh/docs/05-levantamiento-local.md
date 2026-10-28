# 05 · Levantamiento local — Asistencia

Tiempo estimado: **30–45 minutos** la primera vez.

## 1. Requisitos

| Herramienta | Versión | Verificar |
|---|---|---|
| Node.js | 20 o superior (recomendado 22 LTS) | `node -v` |
| npm | 10+ | `npm -v` |
| Docker Desktop | Actual (lo usa Supabase CLI) | `docker ps` |
| Supabase CLI | Actual | `supabase -v` → instalar: `npm i -g supabase` o `brew install supabase/tap/supabase` |
| Git | Actual | `git --version` |
| App **Expo Go** | En tu celular (Android/iOS) | — |
| Celular y PC en la **misma red Wi-Fi** | — | — |

## 2. Base de datos (Supabase local)

```bash
cd microapps                       # raíz del monorepo
node scripts/db-sync.mjs           # copia migraciones de plataforma y apps a supabase/migrations
supabase start                     # primera vez descarga imágenes (~5 min)
supabase db reset                  # aplica migraciones + seed.sql
supabase test db                   # 8 pruebas RLS deben pasar ✅
```

`supabase start` imprime algo como:

```
API URL: http://127.0.0.1:54321
Studio URL: http://127.0.0.1:54323
anon key: eyJhbGciOi...
service_role key: eyJhbGciOi...
```

Guarda **anon key** y **service_role key**: las usarás abajo.

> ⚠️ La `service_role key` **solo** va en el backend. Nunca en frontend ni móvil.

## 3. Backend (API)

```bash
cd 03-asistencia-rrhh/backend
cp .env.example .env
# Edita .env: SUPABASE_URL=http://127.0.0.1:54321 y SUPABASE_SERVICE_ROLE_KEY=<service_role key>
npm install
npm test                  # 49 pruebas ✅
npm run seed:demo         # crea admin, supervisor y 6 colaboradores demo
npm run dev               # http://localhost:4000
curl http://localhost:4000/salud
```

## 4. Dashboard web

```bash
cd 03-asistencia-rrhh/frontend
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
# NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev               # http://localhost:3000
```

Ingresa con `admin@demo.pe` / `Demo2026!` (o `supervisor@demo.pe` para ver la vista restringida).

## 5. App móvil

1. Averigua la IP de tu PC en la red local: `ipconfig` (Windows) o `ipconfig getifaddr en0` (macOS) → ej. `192.168.1.50`.
2. Configura:

```bash
cd 03-asistencia-rrhh/mobile
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL=http://192.168.1.50:54321
# EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
# EXPO_PUBLIC_API_URL=http://192.168.1.50:4000
npm install
npx expo start
```

3. Escanea el QR con **Expo Go**. Inicia sesión con `ana@demo.pe` / `Demo2026!`.
4. En el backend agrega la IP del celular solo si usas el dashboard desde otro equipo (`CORS_ORIGINS`). La app móvil no requiere CORS.

### Probar la geocerca sin ir al local

Opción A — **mover el local a donde estás**: en el dashboard → Locales → crea un local con "Usar mi ubicación actual" y asígnalo a `ana@demo.pe` en Colaboradores.

Opción B — **emulador Android**: Android Studio → Extended controls → Location → fija coordenadas `-12.1211, -77.0297` (Sede Miraflores demo). Nota: en emulador `mocked` puede venir `true`; para pruebas activa temporalmente en Supabase Studio `asistencia.configuracion.permitir_ubicacion_simulada = true` **solo en local**.

Opción C — **curl** (ver [04-api.md](04-api.md#ejemplo-con-curl)).

## 6. Ver el tiempo real

1. Abre el dashboard en el navegador (`admin@demo.pe`).
2. Marca entrada desde el celular.
3. En menos de 3 s el indicador "En vivo" refresca el KPI y la marcación aparece en "Últimas marcaciones".

## 7. Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `Falta la variable de entorno SUPABASE_URL` | No existe `.env` | `cp .env.example .env` y completa |
| Dashboard: "Inicia sesión para continuar" en bucle | Clave anon equivocada | Copia de nuevo la `anon key` de `supabase status` |
| Error CORS en el navegador | Origen no permitido | Agrega el origen en `CORS_ORIGINS` del backend y reinicia |
| App: "No hay conexión con el servidor" | Usaste `localhost` en el celular | Usa la IP de tu PC y la misma red Wi-Fi |
| `PGRST106` / esquema no encontrado | Esquema no expuesto | Revisa `[api] schemas` en `supabase/config.toml` incluya `core` y `asistencia`, luego `supabase stop && supabase start` |
| Dashboard no dice "En vivo" | Realtime no publicado | `supabase db reset` (la migración agrega la tabla a `supabase_realtime`) |
| "Señal GPS imprecisa" en interiores | Precisión > 50 m | Acércate a una ventana; en local puedes subir `precision_max_m` |
| `supabase start` falla | Docker apagado | Inicia Docker Desktop |

## 8. Validar en Postgres sin Docker (CI)

```bash
psql -d prueba -f 03-asistencia-rrhh/database/tests/stub_auth_postgres.sql
psql -d prueba -f plataforma/database/migrations/20261008000000_core.sql
psql -d prueba -f 03-asistencia-rrhh/database/migrations/20261008000300_asistencia.sql
psql -d prueba -f 03-asistencia-rrhh/database/seed.sql
psql -d prueba -f 03-asistencia-rrhh/database/tests/rls_asistencia.test.sql   # requiere extensión pgtap
```
