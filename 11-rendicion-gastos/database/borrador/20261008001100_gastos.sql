-- =============================================================================
-- BORRADOR · Micro app 11 · Rendición de gastos con foto de comprobante
-- Esquema: gastos. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists gastos;

create table if not exists gastos.categorias (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  tope_mensual numeric(10,2),
  creado_en   timestamptz not null default now()
);
create index if not exists categorias_empresa_idx on gastos.categorias (empresa_id);
alter table gastos.categorias enable row level security;
create policy categorias_lectura_empresa on gastos.categorias for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists gastos.rendiciones (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  colaborador_id uuid not null references core.perfiles(id),
  periodo     text not null,
  estado      text not null default 'borrador' check (estado in ('borrador','enviada','aprobada','rechazada')),
  aprobador_id uuid references core.perfiles(id),
  comentario  text,
  creado_en   timestamptz not null default now()
);
create index if not exists rendiciones_empresa_idx on gastos.rendiciones (empresa_id);
alter table gastos.rendiciones enable row level security;
create policy rendiciones_lectura_empresa on gastos.rendiciones for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists gastos.gastos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  rendicion_id uuid references gastos.rendiciones(id),
  colaborador_id uuid not null references core.perfiles(id),
  categoria_id uuid not null references gastos.categorias(id),
  ruc_emisor  varchar(11),
  serie_numero text,
  fecha       date not null,
  monto       numeric(10,2) not null check (monto > 0),
  foto_url    text not null,
  excede_tope boolean not null default false,
  creado_en   timestamptz not null default now()
);
create index if not exists gastos_empresa_idx on gastos.gastos (empresa_id);
alter table gastos.gastos enable row level security;
create policy gastos_lectura_empresa on gastos.gastos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema gastos to authenticated, service_role;
grant select on all tables in schema gastos to authenticated;
grant all on all tables in schema gastos to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
