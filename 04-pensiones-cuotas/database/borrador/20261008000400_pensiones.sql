-- =============================================================================
-- BORRADOR · Micro app 04 · Control de pensiones y cuotas
-- Esquema: pensiones. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists pensiones;

create table if not exists pensiones.responsables (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  documento   varchar(15),
  telefono    varchar(15),
  correo      text,
  creado_en   timestamptz not null default now()
);
create index if not exists responsables_empresa_idx on pensiones.responsables (empresa_id);
alter table pensiones.responsables enable row level security;
create policy responsables_lectura_empresa on pensiones.responsables for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pensiones.cuentas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  codigo      text not null,
  descripcion text not null,
  grupo       text,
  responsable_id uuid not null references pensiones.responsables(id),
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists cuentas_empresa_idx on pensiones.cuentas (empresa_id);
alter table pensiones.cuentas enable row level security;
create policy cuentas_lectura_empresa on pensiones.cuentas for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pensiones.conceptos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  monto       numeric(10,2) not null,
  mora_tipo   text check (mora_tipo in ('fijo','porcentaje_dia')),
  mora_valor  numeric(10,4),
  creado_en   timestamptz not null default now()
);
create index if not exists conceptos_empresa_idx on pensiones.conceptos (empresa_id);
alter table pensiones.conceptos enable row level security;
create policy conceptos_lectura_empresa on pensiones.conceptos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pensiones.cuotas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  cuenta_id   uuid not null references pensiones.cuentas(id),
  concepto_id uuid not null references pensiones.conceptos(id),
  periodo     text not null,
  vence       date not null,
  monto       numeric(10,2) not null,
  mora        numeric(10,2) not null default 0,
  estado      text not null default 'pendiente' check (estado in ('pendiente','parcial','pagada','anulada')),
  creado_en   timestamptz not null default now()
);
create index if not exists cuotas_empresa_idx on pensiones.cuotas (empresa_id);
alter table pensiones.cuotas enable row level security;
create policy cuotas_lectura_empresa on pensiones.cuotas for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pensiones.pagos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  cuota_id    uuid not null references pensiones.cuotas(id),
  monto       numeric(10,2) not null check (monto > 0),
  medio       text not null,
  voucher_url text,
  pagado_en   date not null,
  validado_por uuid references core.perfiles(id),
  estado      text not null default 'por_validar',
  creado_en   timestamptz not null default now()
);
create index if not exists pagos_empresa_idx on pensiones.pagos (empresa_id);
alter table pensiones.pagos enable row level security;
create policy pagos_lectura_empresa on pensiones.pagos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pensiones.enlaces (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  responsable_id uuid not null references pensiones.responsables(id),
  token_hash  text not null unique,
  expira      timestamptz not null,
  creado_en   timestamptz not null default now()
);
create index if not exists enlaces_empresa_idx on pensiones.enlaces (empresa_id);
alter table pensiones.enlaces enable row level security;
create policy enlaces_lectura_empresa on pensiones.enlaces for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema pensiones to authenticated, service_role;
grant select on all tables in schema pensiones to authenticated;
grant all on all tables in schema pensiones to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
