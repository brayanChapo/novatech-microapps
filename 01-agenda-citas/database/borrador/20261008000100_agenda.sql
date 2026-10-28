-- =============================================================================
-- BORRADOR · Micro app 01 · Agenda de citas + recordatorios WhatsApp
-- Esquema: agenda. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists agenda;

create table if not exists agenda.profesionales (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  especialidad text,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists profesionales_empresa_idx on agenda.profesionales (empresa_id);
alter table agenda.profesionales enable row level security;
create policy profesionales_lectura_empresa on agenda.profesionales for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists agenda.servicios (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  duracion_min integer not null check (duracion_min between 5 and 480),
  precio_referencial numeric(10,2),
  creado_en   timestamptz not null default now()
);
create index if not exists servicios_empresa_idx on agenda.servicios (empresa_id);
alter table agenda.servicios enable row level security;
create policy servicios_lectura_empresa on agenda.servicios for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists agenda.disponibilidad (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  profesional_id uuid not null references agenda.profesionales(id),
  dia_semana  smallint not null check (dia_semana between 1 and 7),
  hora_inicio time not null,
  hora_fin    time not null,
  creado_en   timestamptz not null default now()
);
create index if not exists disponibilidad_empresa_idx on agenda.disponibilidad (empresa_id);
alter table agenda.disponibilidad enable row level security;
create policy disponibilidad_lectura_empresa on agenda.disponibilidad for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists agenda.pacientes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  telefono    varchar(15) not null,
  documento   varchar(15),
  acepta_whatsapp boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists pacientes_empresa_idx on agenda.pacientes (empresa_id);
alter table agenda.pacientes enable row level security;
create policy pacientes_lectura_empresa on agenda.pacientes for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists agenda.citas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  profesional_id uuid not null references agenda.profesionales(id),
  servicio_id uuid not null references agenda.servicios(id),
  paciente_id uuid not null references agenda.pacientes(id),
  inicio      timestamptz not null,
  fin         timestamptz not null,
  estado      text not null default 'reservada' check (estado in ('reservada','confirmada','cancelada','asistio','no_asistio')),
  origen      text not null default 'publico',
  creado_en   timestamptz not null default now()
);
create index if not exists citas_empresa_idx on agenda.citas (empresa_id);
alter table agenda.citas enable row level security;
create policy citas_lectura_empresa on agenda.citas for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists agenda.mensajes_whatsapp (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  cita_id     uuid references agenda.citas(id),
  plantilla   text not null,
  telefono    varchar(15) not null,
  estado      text not null default 'enviado',
  meta_message_id text,
  enviado_en  timestamptz not null default now(),
  creado_en   timestamptz not null default now()
);
create index if not exists mensajes_whatsapp_empresa_idx on agenda.mensajes_whatsapp (empresa_id);
alter table agenda.mensajes_whatsapp enable row level security;
create policy mensajes_whatsapp_lectura_empresa on agenda.mensajes_whatsapp for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema agenda to authenticated, service_role;
grant select on all tables in schema agenda to authenticated;
grant all on all tables in schema agenda to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
