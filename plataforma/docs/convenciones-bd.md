# Convenciones de base de datos

1. **Un esquema por micro app** (`asistencia`, `agenda`, `pedidos`…). Lo compartido vive en `core`.
2. **Toda tabla de negocio** tiene `id uuid`, `empresa_id uuid not null references core.empresas`, `creado_en timestamptz` y **RLS activado**.
3. **Nombres en español, snake_case, plural** para tablas (`marcaciones`), singular para columnas (`fecha_local`).
4. **Archivo de migración:** `YYYYMMDDNNNN00_<descripcion>.sql`. Los 4 dígitos `NNNN` usan el número de la app para evitar choques: app 03 → `20261008000300_…`, siguiente cambio de la app 03 → `20261015000301_…`.
5. **Las migraciones solo avanzan.** Nunca editar una migración ya aplicada en producción: crear otra.
6. **Escrituras solo desde el backend** (`service_role`). No crear políticas `insert/update/delete` para `authenticated` salvo aprobación del líder técnico.
7. Lecturas para Realtime: si el dashboard escucha una tabla, su política `select` debe filtrar por empresa **y** rol.
8. Funciones de reportes pesados en SQL (`language sql stable`, `set search_path = ''`) con `grant execute` solo a `service_role`.
9. Montos: `numeric(12,2)`. Horas: `timestamptz` en UTC + `fecha_local date` cuando se consulte por día.
10. Cada migración nueva incluye su prueba pgTAP en `database/tests/` (mínimo: aislamiento entre empresas).
11. Flujo: `node scripts/db-sync.mjs` → `supabase db reset` → `supabase test db` → PR.
