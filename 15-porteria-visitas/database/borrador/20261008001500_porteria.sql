-- =============================================================================
-- BORRADOR · Micro app 15 · Registro de visitas en portería con QR
-- Esquema: porteria. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists porteria;

create table if not exists porteria.unidades (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  codigo      text not null,
  torre       text,
  creado_en   timestamptz not null default now()
);
create index if not exists unidades_empresa_idx on porteria.unidades (empresa_id);
alter table porteria.unidades enable row level security;
create policy unidades_lectura_empresa on porteria.unidades for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists porteria.residentes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  perfil_id   uuid references core.perfiles(id),
  unidad_id   uuid not null references porteria.unidades(id),
  nombre      text not null,
  telefono    varchar(15),
  creado_en   timestamptz not null default now()
);
create index if not exists residentes_empresa_idx on porteria.residentes (empresa_id);
alter table porteria.residentes enable row level security;
create policy residentes_lectura_empresa on porteria.residentes for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists porteria.visitas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  unidad_id   uuid not null references porteria.unidades(id),
  visitante   text not null,
  documento   varchar(15),
  fecha       date not null,
  token_qr    text unique,
  estado      text not null default 'pre_registrada' check (estado in ('pre_registrada','por_autorizar','autorizada','rechazada','ingreso','salida')),
  ingreso_en  timestamptz,
  salida_en   timestamptz,
  portero_id  uuid references core.perfiles(id),
  creado_en   timestamptz not null default now()
);
create index if not exists visitas_empresa_idx on porteria.visitas (empresa_id);
alter table porteria.visitas enable row level security;
create policy visitas_lectura_empresa on porteria.visitas for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists porteria.suscripciones_push (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  perfil_id   uuid not null references core.perfiles(id),
  endpoint    text not null,
  claves      jsonb not null,
  creado_en   timestamptz not null default now()
);
create index if not exists suscripciones_push_empresa_idx on porteria.suscripciones_push (empresa_id);
alter table porteria.suscripciones_push enable row level security;
create policy suscripciones_push_lectura_empresa on porteria.suscripciones_push for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema porteria to authenticated, service_role;
grant select on all tables in schema porteria to authenticated;
grant all on all tables in schema porteria to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
