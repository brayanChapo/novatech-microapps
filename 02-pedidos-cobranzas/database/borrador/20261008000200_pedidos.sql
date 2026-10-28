-- =============================================================================
-- BORRADOR · Micro app 02 · Toma de pedidos en ruta + cobranzas
-- Esquema: pedidos. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists pedidos;

create table if not exists pedidos.productos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  codigo      text not null,
  nombre      text not null,
  unidad      text not null default 'UND',
  stock_referencial numeric(12,2),
  foto_url    text,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists productos_empresa_idx on pedidos.productos (empresa_id);
alter table pedidos.productos enable row level security;
create policy productos_lectura_empresa on pedidos.productos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pedidos.listas_precios (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  creado_en   timestamptz not null default now()
);
create index if not exists listas_precios_empresa_idx on pedidos.listas_precios (empresa_id);
alter table pedidos.listas_precios enable row level security;
create policy listas_precios_lectura_empresa on pedidos.listas_precios for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pedidos.precios (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  lista_id    uuid not null references pedidos.listas_precios(id),
  producto_id uuid not null references pedidos.productos(id),
  precio      numeric(12,2) not null check (precio >= 0),
  creado_en   timestamptz not null default now()
);
create index if not exists precios_empresa_idx on pedidos.precios (empresa_id);
alter table pedidos.precios enable row level security;
create policy precios_lectura_empresa on pedidos.precios for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pedidos.clientes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  razon_social text not null,
  documento   varchar(11),
  telefono    varchar(15),
  lat         double precision,
  lng         double precision,
  lista_id    uuid references pedidos.listas_precios(id),
  vendedor_id uuid references core.perfiles(id),
  dias_credito integer not null default 0,
  creado_en   timestamptz not null default now()
);
create index if not exists clientes_empresa_idx on pedidos.clientes (empresa_id);
alter table pedidos.clientes enable row level security;
create policy clientes_lectura_empresa on pedidos.clientes for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pedidos.pedidos_cab (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  cliente_id  uuid not null references pedidos.clientes(id),
  vendedor_id uuid not null references core.perfiles(id),
  tomado_en   timestamptz not null,
  sincronizado_en timestamptz not null default now(),
  condicion   text not null check (condicion in ('contado','credito')),
  total       numeric(12,2) not null,
  estado      text not null default 'recibido',
  lat         double precision,
  lng         double precision,
  creado_en   timestamptz not null default now()
);
create index if not exists pedidos_cab_empresa_idx on pedidos.pedidos_cab (empresa_id);
alter table pedidos.pedidos_cab enable row level security;
create policy pedidos_cab_lectura_empresa on pedidos.pedidos_cab for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pedidos.pedidos_det (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  pedido_id   uuid not null references pedidos.pedidos_cab(id),
  producto_id uuid not null references pedidos.productos(id),
  cantidad    numeric(12,2) not null check (cantidad > 0),
  precio_unitario numeric(12,2) not null,
  creado_en   timestamptz not null default now()
);
create index if not exists pedidos_det_empresa_idx on pedidos.pedidos_det (empresa_id);
alter table pedidos.pedidos_det enable row level security;
create policy pedidos_det_lectura_empresa on pedidos.pedidos_det for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pedidos.cobros (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  cliente_id  uuid not null references pedidos.clientes(id),
  vendedor_id uuid not null references core.perfiles(id),
  monto       numeric(12,2) not null check (monto > 0),
  medio       text not null check (medio in ('efectivo','yape','plin','transferencia')),
  voucher_url text,
  validado    boolean not null default false,
  creado_en   timestamptz not null default now()
);
create index if not exists cobros_empresa_idx on pedidos.cobros (empresa_id);
alter table pedidos.cobros enable row level security;
create policy cobros_lectura_empresa on pedidos.cobros for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists pedidos.visitas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  cliente_id  uuid not null references pedidos.clientes(id),
  vendedor_id uuid not null references core.perfiles(id),
  lat         double precision,
  lng         double precision,
  motivo_no_compra text,
  creado_en   timestamptz not null default now()
);
create index if not exists visitas_empresa_idx on pedidos.visitas (empresa_id);
alter table pedidos.visitas enable row level security;
create policy visitas_lectura_empresa on pedidos.visitas for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema pedidos to authenticated, service_role;
grant select on all tables in schema pedidos to authenticated;
grant all on all tables in schema pedidos to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
