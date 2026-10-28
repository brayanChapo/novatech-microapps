-- =============================================================================
-- BORRADOR · Micro app 10 · Membresías con acceso por QR
-- Esquema: gimnasio. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists gimnasio;

create table if not exists gimnasio.planes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  dias        integer,
  sesiones    integer,
  precio      numeric(10,2) not null,
  creado_en   timestamptz not null default now()
);
create index if not exists planes_empresa_idx on gimnasio.planes (empresa_id);
alter table gimnasio.planes enable row level security;
create policy planes_lectura_empresa on gimnasio.planes for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists gimnasio.socios (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  documento   varchar(15),
  telefono    varchar(15),
  vence       date,
  sesiones_restantes integer,
  secreto_qr  text not null,
  creado_en   timestamptz not null default now()
);
create index if not exists socios_empresa_idx on gimnasio.socios (empresa_id);
alter table gimnasio.socios enable row level security;
create policy socios_lectura_empresa on gimnasio.socios for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists gimnasio.pagos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  socio_id    uuid not null references gimnasio.socios(id),
  plan_id     uuid not null references gimnasio.planes(id),
  monto       numeric(10,2) not null,
  medio       text not null,
  creado_en   timestamptz not null default now()
);
create index if not exists pagos_empresa_idx on gimnasio.pagos (empresa_id);
alter table gimnasio.pagos enable row level security;
create policy pagos_lectura_empresa on gimnasio.pagos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists gimnasio.ingresos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  socio_id    uuid not null references gimnasio.socios(id),
  permitido   boolean not null,
  motivo      text,
  creado_en   timestamptz not null default now()
);
create index if not exists ingresos_empresa_idx on gimnasio.ingresos (empresa_id);
alter table gimnasio.ingresos enable row level security;
create policy ingresos_lectura_empresa on gimnasio.ingresos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema gimnasio to authenticated, service_role;
grant select on all tables in schema gimnasio to authenticated;
grant all on all tables in schema gimnasio to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
