# Database · esquema `cotizador`

| Archivo | Estado |
|---|---|
| `borrador/20261008001300_cotizador.sql` | Borrador revisado sintácticamente; **no** se aplica (el script `db-sync` solo copia `migrations/`). |

**Al iniciar la construcción:**

1. Revisar el borrador con los requerimientos y ajustar políticas RLS por rol (el borrador solo filtra por empresa).
2. Moverlo a `database/migrations/` (conservar la marca de tiempo `20261008001300`).
3. Agregar `cotizador` a `[api] schemas` en `supabase/config.toml` y en Supabase → Settings → API.
4. Escribir `tests/rls_cotizador.test.sql` (mínimo: aislamiento entre empresas y entre roles).
5. `node scripts/db-sync.mjs && supabase db reset && supabase test db`.
