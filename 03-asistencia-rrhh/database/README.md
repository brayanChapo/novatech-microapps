# Database · Asistencia

| Archivo | Contenido |
|---|---|
| `migrations/20261008000300_asistencia.sql` | Esquema `asistencia`: tablas, índices, RLS, funciones del dashboard, Realtime |
| `seed.sql` | Empresa demo, 3 locales en Lima, 2 horarios (solo local/demo) |
| `tests/rls_asistencia.test.sql` | 8 pruebas pgTAP de aislamiento |
| `tests/stub_auth_postgres.sql` | Simula lo mínimo de Supabase para probar en Postgres plano (CI) |

Depende de `plataforma/database/migrations/20261008000000_core.sql` (empresas y perfiles).

No ejecutes estos archivos a mano en Supabase: usa `node scripts/db-sync.mjs` desde la raíz y luego `supabase db reset` (local) o `supabase db push` (producción).

Modelo y RLS explicados en [docs/03-modelo-datos.md](../docs/03-modelo-datos.md).
