# Database · esquema `agenda`

| Archivo | Estado |
|---|---|
| `borrador/20261008000100_agenda.sql` | Borrador revisado sintácticamente; **no** se aplica (el script `db-sync` solo copia `migrations/`). |

**Al iniciar la construcción:**

1. Revisar el borrador con los requerimientos y ajustar políticas RLS por rol (el borrador solo filtra por empresa).
2. Moverlo a `database/migrations/` (conservar la marca de tiempo `20261008000100`).
3. Agregar `agenda` a `[api] schemas` en `supabase/config.toml` y en Supabase → Settings → API.
4. Escribir `tests/rls_agenda.test.sql` (mínimo: aislamiento entre empresas y entre roles).
5. `node scripts/db-sync.mjs && supabase db reset && supabase test db`.
