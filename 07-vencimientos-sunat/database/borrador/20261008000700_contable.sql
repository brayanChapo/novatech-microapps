-- =============================================================================
-- BORRADOR · Micro app 07 · Vencimientos SUNAT + portal de documentos
-- Esquema: contable. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists contable;

create table if not exists contable.clientes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  ruc         varchar(11) not null,
  razon_social text not null,
  regimen     text,
  correo      text,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists clientes_empresa_idx on contable.clientes (empresa_id);
alter table contable.clientes enable row level security;
create policy clientes_lectura_empresa on contable.clientes for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists contable.cronograma_sunat (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  anio        integer not null,
  periodo     text not null,
  ultimo_digito smallint not null check (ultimo_digito between 0 and 9),
  vence       date not null,
  creado_en   timestamptz not null default now()
);
create index if not exists cronograma_sunat_empresa_idx on contable.cronograma_sunat (empresa_id);
alter table contable.cronograma_sunat enable row level security;
create policy cronograma_sunat_lectura_empresa on contable.cronograma_sunat for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists contable.periodos_cliente (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  cliente_id  uuid not null references contable.clientes(id),
  periodo     text not null,
  vence       date not null,
  estado      text not null default 'pendiente' check (estado in ('pendiente','documentos_recibidos','declarado')),
  constancia_url text,
  creado_en   timestamptz not null default now()
);
create index if not exists periodos_cliente_empresa_idx on contable.periodos_cliente (empresa_id);
alter table contable.periodos_cliente enable row level security;
create policy periodos_cliente_lectura_empresa on contable.periodos_cliente for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists contable.documentos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  periodo_cliente_id uuid not null references contable.periodos_cliente(id),
  nombre_archivo text not null,
  url         text not null,
  tipo        text,
  subido_por  text,
  creado_en   timestamptz not null default now()
);
create index if not exists documentos_empresa_idx on contable.documentos (empresa_id);
alter table contable.documentos enable row level security;
create policy documentos_lectura_empresa on contable.documentos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema contable to authenticated, service_role;
grant select on all tables in schema contable to authenticated;
grant all on all tables in schema contable to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
