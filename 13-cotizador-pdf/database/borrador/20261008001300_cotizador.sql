-- =============================================================================
-- BORRADOR · Micro app 13 · Cotizador con PDF
-- Esquema: cotizador. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists cotizador;

create table if not exists cotizador.items (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  codigo      text,
  descripcion text not null,
  unidad      text,
  precio      numeric(12,2) not null,
  creado_en   timestamptz not null default now()
);
create index if not exists items_empresa_idx on cotizador.items (empresa_id);
alter table cotizador.items enable row level security;
create policy items_lectura_empresa on cotizador.items for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists cotizador.plantilla (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  logo_url    text,
  color       text,
  condiciones text,
  afecto_igv  boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists plantilla_empresa_idx on cotizador.plantilla (empresa_id);
alter table cotizador.plantilla enable row level security;
create policy plantilla_lectura_empresa on cotizador.plantilla for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists cotizador.cotizaciones (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  numero      integer not null,
  version     integer not null default 1,
  cliente     text not null,
  cliente_documento varchar(11),
  validez_dias integer not null default 15,
  descuento_pct numeric(5,2) not null default 0,
  subtotal    numeric(12,2) not null,
  igv         numeric(12,2) not null,
  total       numeric(12,2) not null,
  estado      text not null default 'borrador',
  vendedor_id uuid references core.perfiles(id),
  creado_en   timestamptz not null default now()
);
create index if not exists cotizaciones_empresa_idx on cotizador.cotizaciones (empresa_id);
alter table cotizador.cotizaciones enable row level security;
create policy cotizaciones_lectura_empresa on cotizador.cotizaciones for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists cotizador.cotizacion_items (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  cotizacion_id uuid not null references cotizador.cotizaciones(id),
  descripcion text not null,
  cantidad    numeric(12,2) not null,
  precio      numeric(12,2) not null,
  creado_en   timestamptz not null default now()
);
create index if not exists cotizacion_items_empresa_idx on cotizador.cotizacion_items (empresa_id);
alter table cotizador.cotizacion_items enable row level security;
create policy cotizacion_items_lectura_empresa on cotizador.cotizacion_items for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema cotizador to authenticated, service_role;
grant select on all tables in schema cotizador to authenticated;
grant all on all tables in schema cotizador to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
