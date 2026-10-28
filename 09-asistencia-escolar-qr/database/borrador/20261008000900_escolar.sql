-- =============================================================================
-- BORRADOR · Micro app 09 · Asistencia por QR con aviso a padres
-- Esquema: escolar. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists escolar;

create table if not exists escolar.aulas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  hora_ingreso time not null,
  hora_corte  time not null,
  creado_en   timestamptz not null default now()
);
create index if not exists aulas_empresa_idx on escolar.aulas (empresa_id);
alter table escolar.aulas enable row level security;
create policy aulas_lectura_empresa on escolar.aulas for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists escolar.apoderados (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  telefono    varchar(15) not null,
  acepta_whatsapp boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists apoderados_empresa_idx on escolar.apoderados (empresa_id);
alter table escolar.apoderados enable row level security;
create policy apoderados_lectura_empresa on escolar.apoderados for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists escolar.alumnos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  codigo      text not null,
  aula_id     uuid not null references escolar.aulas(id),
  apoderado_id uuid references escolar.apoderados(id),
  token_qr    text not null unique,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists alumnos_empresa_idx on escolar.alumnos (empresa_id);
alter table escolar.alumnos enable row level security;
create policy alumnos_lectura_empresa on escolar.alumnos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists escolar.dias_no_lectivos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  fecha       date not null,
  motivo      text,
  creado_en   timestamptz not null default now()
);
create index if not exists dias_no_lectivos_empresa_idx on escolar.dias_no_lectivos (empresa_id);
alter table escolar.dias_no_lectivos enable row level security;
create policy dias_no_lectivos_lectura_empresa on escolar.dias_no_lectivos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists escolar.registros (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  alumno_id   uuid not null references escolar.alumnos(id),
  fecha       date not null,
  ingreso_en  timestamptz not null,
  estado      text not null check (estado in ('puntual','tardanza')),
  registrado_por uuid references core.perfiles(id),
  creado_en   timestamptz not null default now()
);
create index if not exists registros_empresa_idx on escolar.registros (empresa_id);
alter table escolar.registros enable row level security;
create policy registros_lectura_empresa on escolar.registros for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists escolar.avisos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  alumno_id   uuid not null references escolar.alumnos(id),
  fecha       date not null,
  estado_envio text not null,
  creado_en   timestamptz not null default now()
);
create index if not exists avisos_empresa_idx on escolar.avisos (empresa_id);
alter table escolar.avisos enable row level security;
create policy avisos_lectura_empresa on escolar.avisos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema escolar to authenticated, service_role;
grant select on all tables in schema escolar to authenticated;
grant all on all tables in schema escolar to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
