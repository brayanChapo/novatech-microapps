# Database · esquema `ayuda`

| Archivo | Estado |
|---|---|
| `borrador/20261008001200_ayuda.sql` | Borrador revisado sintácticamente; **no** se aplica (el script `db-sync` solo copia `migrations/`). |

**Al iniciar la construcción:**

1. Revisar el borrador con los requerimientos y ajustar políticas RLS por rol (el borrador solo filtra por empresa).
2. Moverlo a `database/migrations/` (conservar la marca de tiempo `20261008001200`).
3. Agregar `ayuda` a `[api] schemas` en `supabase/config.toml` y en Supabase → Settings → API.
4. Escribir `tests/rls_ayuda.test.sql` (mínimo: aislamiento entre empresas y entre roles).
5. `node scripts/db-sync.mjs && supabase db reset && supabase test db`.
