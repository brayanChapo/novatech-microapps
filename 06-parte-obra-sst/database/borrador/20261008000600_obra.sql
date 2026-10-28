-- =============================================================================
-- BORRADOR · Micro app 06 · Parte diario de obra + checklist SST
-- Esquema: obra. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists obra;

create table if not exists obra.obras (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  cliente     text,
  lat         double precision,
  lng         double precision,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists obras_empresa_idx on obra.obras (empresa_id);
alter table obra.obras enable row level security;
create policy obras_lectura_empresa on obra.obras for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists obra.partidas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  obra_id     uuid not null references obra.obras(id),
  codigo      text,
  descripcion text not null,
  unidad      text,
  metrado     numeric(12,2),
  creado_en   timestamptz not null default now()
);
create index if not exists partidas_empresa_idx on obra.partidas (empresa_id);
alter table obra.partidas enable row level security;
create policy partidas_lectura_empresa on obra.partidas for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists obra.partes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  obra_id     uuid not null references obra.obras(id),
  fecha       date not null,
  clima       text,
  incidencias text,
  firmado_por uuid references core.perfiles(id),
  firma_url   text,
  cerrado     boolean not null default false,
  creado_en   timestamptz not null default now()
);
create index if not exists partes_empresa_idx on obra.partes (empresa_id);
alter table obra.partes enable row level security;
create policy partes_lectura_empresa on obra.partes for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists obra.parte_avances (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  parte_id    uuid not null references obra.partes(id),
  partida_id  uuid not null references obra.partidas(id),
  avance_pct  numeric(5,2) not null check (avance_pct between 0 and 100),
  creado_en   timestamptz not null default now()
);
create index if not exists parte_avances_empresa_idx on obra.parte_avances (empresa_id);
alter table obra.parte_avances enable row level security;
create policy parte_avances_lectura_empresa on obra.parte_avances for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists obra.plantillas_checklist (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  items       jsonb not null,
  creado_en   timestamptz not null default now()
);
create index if not exists plantillas_checklist_empresa_idx on obra.plantillas_checklist (empresa_id);
alter table obra.plantillas_checklist enable row level security;
create policy plantillas_checklist_lectura_empresa on obra.plantillas_checklist for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists obra.inspecciones (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  obra_id     uuid not null references obra.obras(id),
  plantilla_id uuid not null references obra.plantillas_checklist(id),
  respuestas  jsonb not null,
  criticos_no_conformes integer not null default 0,
  firma_url   text,
  creado_en   timestamptz not null default now()
);
create index if not exists inspecciones_empresa_idx on obra.inspecciones (empresa_id);
alter table obra.inspecciones enable row level security;
create policy inspecciones_lectura_empresa on obra.inspecciones for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists obra.fotos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  obra_id     uuid not null references obra.obras(id),
  origen      text not null,
  origen_id   uuid not null,
  url         text not null,
  lat         double precision,
  lng         double precision,
  tomada_en   timestamptz not null,
  creado_en   timestamptz not null default now()
);
create index if not exists fotos_empresa_idx on obra.fotos (empresa_id);
alter table obra.fotos enable row level security;
create policy fotos_lectura_empresa on obra.fotos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema obra to authenticated, service_role;
grant select on all tables in schema obra to authenticated;
grant all on all tables in schema obra to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
