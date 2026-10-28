-- =============================================================================
-- BORRADOR · Micro app 08 · Prueba de entrega (foto, firma, GPS)
-- Esquema: entregas. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists entregas;

create table if not exists entregas.entregas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  numero_pedido text not null,
  repartidor_id uuid references core.perfiles(id),
  fecha       date not null,
  destinatario text not null,
  direccion   text not null,
  telefono    varchar(15),
  lat_destino double precision,
  lng_destino double precision,
  estado      text not null default 'pendiente' check (estado in ('pendiente','entregado','no_entregado')),
  creado_en   timestamptz not null default now()
);
create index if not exists entregas_empresa_idx on entregas.entregas (empresa_id);
alter table entregas.entregas enable row level security;
create policy entregas_lectura_empresa on entregas.entregas for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists entregas.evidencias (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  entrega_id  uuid not null references entregas.entregas(id),
  resultado   text not null,
  recibe_nombre text,
  firma_url   text,
  foto_url    text not null,
  lat         double precision not null,
  lng         double precision not null,
  precision_m real,
  motivo      text,
  registrado_en timestamptz not null,
  creado_en   timestamptz not null default now()
);
create index if not exists evidencias_empresa_idx on entregas.evidencias (empresa_id);
alter table entregas.evidencias enable row level security;
create policy evidencias_lectura_empresa on entregas.evidencias for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema entregas to authenticated, service_role;
grant select on all tables in schema entregas to authenticated;
grant all on all tables in schema entregas to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
