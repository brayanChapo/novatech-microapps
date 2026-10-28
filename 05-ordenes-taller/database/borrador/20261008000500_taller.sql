-- =============================================================================
-- BORRADOR · Micro app 05 · Orden de trabajo con estado por WhatsApp
-- Esquema: taller. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists taller;

create table if not exists taller.vehiculos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  placa       varchar(7) not null,
  marca       text,
  modelo      text,
  anio        integer,
  cliente_nombre text not null,
  cliente_telefono varchar(15),
  creado_en   timestamptz not null default now()
);
create index if not exists vehiculos_empresa_idx on taller.vehiculos (empresa_id);
alter table taller.vehiculos enable row level security;
create policy vehiculos_lectura_empresa on taller.vehiculos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists taller.ordenes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  vehiculo_id uuid not null references taller.vehiculos(id),
  numero      integer not null,
  kilometraje integer,
  motivo      text not null,
  estado      text not null default 'recibido',
  tecnico_id  uuid references core.perfiles(id),
  aprobado_en timestamptz,
  entregado_en timestamptz,
  creado_en   timestamptz not null default now()
);
create index if not exists ordenes_empresa_idx on taller.ordenes (empresa_id);
alter table taller.ordenes enable row level security;
create policy ordenes_lectura_empresa on taller.ordenes for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists taller.orden_items (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  orden_id    uuid not null references taller.ordenes(id),
  tipo        text not null check (tipo in ('repuesto','mano_obra')),
  descripcion text not null,
  cantidad    numeric(10,2) not null,
  precio      numeric(10,2) not null,
  creado_en   timestamptz not null default now()
);
create index if not exists orden_items_empresa_idx on taller.orden_items (empresa_id);
alter table taller.orden_items enable row level security;
create policy orden_items_lectura_empresa on taller.orden_items for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists taller.orden_eventos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  orden_id    uuid not null references taller.ordenes(id),
  estado      text not null,
  usuario_id  uuid references core.perfiles(id),
  nota        text,
  notificado  boolean not null default false,
  creado_en   timestamptz not null default now()
);
create index if not exists orden_eventos_empresa_idx on taller.orden_eventos (empresa_id);
alter table taller.orden_eventos enable row level security;
create policy orden_eventos_lectura_empresa on taller.orden_eventos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists taller.orden_fotos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  orden_id    uuid not null references taller.ordenes(id),
  url         text not null,
  etapa       text not null,
  creado_en   timestamptz not null default now()
);
create index if not exists orden_fotos_empresa_idx on taller.orden_fotos (empresa_id);
alter table taller.orden_fotos enable row level security;
create policy orden_fotos_lectura_empresa on taller.orden_fotos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema taller to authenticated, service_role;
grant select on all tables in schema taller to authenticated;
grant all on all tables in schema taller to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
