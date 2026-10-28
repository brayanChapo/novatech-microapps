-- =============================================================================
-- BORRADOR · Micro app 14 · Historia clínica simple
-- Esquema: clinica. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists clinica;

create table if not exists clinica.pacientes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  documento   varchar(15),
  fecha_nacimiento date,
  sexo        text,
  telefono    varchar(15),
  alergias    text,
  antecedentes text,
  creado_en   timestamptz not null default now()
);
create index if not exists pacientes_empresa_idx on clinica.pacientes (empresa_id);
alter table clinica.pacientes enable row level security;
create policy pacientes_lectura_empresa on clinica.pacientes for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists clinica.evoluciones (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  paciente_id uuid not null references clinica.pacientes(id),
  profesional_id uuid not null references core.perfiles(id),
  motivo      text not null,
  examen      text,
  diagnostico_cie10 text,
  indicaciones text,
  firmada_en  timestamptz,
  creado_en   timestamptz not null default now()
);
create index if not exists evoluciones_empresa_idx on clinica.evoluciones (empresa_id);
alter table clinica.evoluciones enable row level security;
create policy evoluciones_lectura_empresa on clinica.evoluciones for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists clinica.adendas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  evolucion_id uuid not null references clinica.evoluciones(id),
  profesional_id uuid not null references core.perfiles(id),
  texto       text not null,
  creado_en   timestamptz not null default now()
);
create index if not exists adendas_empresa_idx on clinica.adendas (empresa_id);
alter table clinica.adendas enable row level security;
create policy adendas_lectura_empresa on clinica.adendas for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists clinica.archivos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  evolucion_id uuid not null references clinica.evoluciones(id),
  url         text not null,
  tipo        text,
  creado_en   timestamptz not null default now()
);
create index if not exists archivos_empresa_idx on clinica.archivos (empresa_id);
alter table clinica.archivos enable row level security;
create policy archivos_lectura_empresa on clinica.archivos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists clinica.bitacora_accesos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  usuario_id  uuid not null references core.perfiles(id),
  paciente_id uuid not null references clinica.pacientes(id),
  accion      text not null,
  ip          inet,
  creado_en   timestamptz not null default now()
);
create index if not exists bitacora_accesos_empresa_idx on clinica.bitacora_accesos (empresa_id);
alter table clinica.bitacora_accesos enable row level security;
create policy bitacora_accesos_lectura_empresa on clinica.bitacora_accesos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema clinica to authenticated, service_role;
grant select on all tables in schema clinica to authenticated;
grant all on all tables in schema clinica to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
