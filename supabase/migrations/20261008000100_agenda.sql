-- =============================================================================
-- MICRO APP 01 · AGENDA DE CITAS + RECORDATORIOS WHATSAPP
-- Esquema: agenda
-- Depende de: 20261008000000_core.sql
-- =============================================================================
-- Convenciones:
--   · Tablas en español, snake_case, plural
--   · Toda tabla lleva empresa_id, creado_en y RLS habilitado
--   · Solo service_role escribe (no hay policies INSERT/UPDATE/DELETE para authenticated)
--   · Montos: numeric(12,2) · Timestamps: timestamptz UTC
-- =============================================================================

create schema if not exists agenda;

-- =============================================================================
-- TABLAS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Profesionales (dentistas, médicos, etc.)
-- -----------------------------------------------------------------------------
create table if not exists agenda.profesionales (
  id           uuid        primary key default gen_random_uuid(),
  empresa_id   uuid        not null references core.empresas(id) on delete cascade,
  nombre       text        not null,
  especialidad text,
  activo       boolean     not null default true,
  creado_en    timestamptz not null default now()
);
create index if not exists profesionales_empresa_idx
  on agenda.profesionales (empresa_id);

-- -----------------------------------------------------------------------------
-- Servicios ofrecidos (limpieza, consulta, etc.)
-- -----------------------------------------------------------------------------
create table if not exists agenda.servicios (
  id                  uuid         primary key default gen_random_uuid(),
  empresa_id          uuid         not null references core.empresas(id) on delete cascade,
  nombre              text         not null,
  duracion_min        integer      not null check (duracion_min between 5 and 480),
  precio_referencial  numeric(12,2),
  creado_en           timestamptz  not null default now()
);
create index if not exists servicios_empresa_idx
  on agenda.servicios (empresa_id);

-- -----------------------------------------------------------------------------
-- Disponibilidad horaria semanal por profesional
-- dia_semana usa ISO: 1=lunes … 7=domingo
-- -----------------------------------------------------------------------------
create table if not exists agenda.disponibilidad (
  id             uuid        primary key default gen_random_uuid(),
  empresa_id     uuid        not null references core.empresas(id) on delete cascade,
  profesional_id uuid        not null references agenda.profesionales(id) on delete cascade,
  dia_semana     smallint    not null check (dia_semana between 1 and 7),
  hora_inicio    time        not null,
  hora_fin       time        not null,
  creado_en      timestamptz not null default now(),
  check (hora_fin > hora_inicio)
);
create index if not exists disponibilidad_empresa_idx
  on agenda.disponibilidad (empresa_id);
create index if not exists disponibilidad_profesional_dia_idx
  on agenda.disponibilidad (profesional_id, dia_semana);

-- -----------------------------------------------------------------------------
-- Pacientes (clientes del consultorio)
-- -----------------------------------------------------------------------------
create table if not exists agenda.pacientes (
  id               uuid         primary key default gen_random_uuid(),
  empresa_id       uuid         not null references core.empresas(id) on delete cascade,
  nombre           text         not null,
  telefono         varchar(15)  not null,
  documento        varchar(15),
  acepta_whatsapp  boolean      not null default true,
  creado_en        timestamptz  not null default now()
);
create index if not exists pacientes_empresa_idx
  on agenda.pacientes (empresa_id);
-- Para búsqueda y deduplicación por teléfono dentro de la empresa
create index if not exists pacientes_empresa_telefono_idx
  on agenda.pacientes (empresa_id, telefono);

-- -----------------------------------------------------------------------------
-- Citas
-- -----------------------------------------------------------------------------
create table if not exists agenda.citas (
  id                       uuid        primary key default gen_random_uuid(),
  empresa_id               uuid        not null references core.empresas(id) on delete cascade,
  profesional_id           uuid        not null references agenda.profesionales(id) on delete restrict,
  servicio_id              uuid        not null references agenda.servicios(id) on delete restrict,
  paciente_id              uuid        not null references agenda.pacientes(id) on delete restrict,
  inicio                   timestamptz not null,
  fin                      timestamptz not null,
  estado                   text        not null default 'reservada'
                           check (estado in ('reservada','confirmada','cancelada','asistio','no_asistio')),
  origen                   text        not null default 'publico',
  recordatorio_enviado     boolean     not null default false,
  recordatorio_enviado_en  timestamptz,
  cancelado_motivo         text,
  asistencia_marcada_en    timestamptz,
  creado_en                timestamptz not null default now(),
  check (fin > inicio),
  -- Evitar doble reserva: un profesional no puede tener dos citas al mismo tiempo
  unique (profesional_id, inicio)
);
-- Consulta de slots por profesional y día
create index if not exists citas_empresa_profesional_inicio_idx
  on agenda.citas (empresa_id, profesional_id, inicio);
-- Cron de recordatorios: busca citas pendientes de envío
create index if not exists citas_empresa_recordatorio_inicio_idx
  on agenda.citas (empresa_id, recordatorio_enviado, inicio);

-- -----------------------------------------------------------------------------
-- Mensajes de WhatsApp enviados por cita
-- -----------------------------------------------------------------------------
create table if not exists agenda.mensajes_whatsapp (
  id               uuid        primary key default gen_random_uuid(),
  empresa_id       uuid        not null references core.empresas(id) on delete cascade,
  cita_id          uuid        references agenda.citas(id) on delete set null,
  plantilla        text        not null,
  telefono         varchar(15) not null,
  estado           text        not null default 'enviado',
  meta_message_id  text,
  tipo             text        check (tipo in ('confirmacion','recordatorio','respuesta_webhook')),
  error_detalle    text,
  enviado_en       timestamptz not null default now(),
  creado_en        timestamptz not null default now()
);
-- Historial de mensajes por cita
create index if not exists mensajes_whatsapp_cita_id_idx
  on agenda.mensajes_whatsapp (cita_id);
create index if not exists mensajes_whatsapp_empresa_idx
  on agenda.mensajes_whatsapp (empresa_id);

-- -----------------------------------------------------------------------------
-- Bloqueos de agenda (vacaciones, feriados, bloqueos manuales)
-- -----------------------------------------------------------------------------
create table if not exists agenda.bloqueos (
  id             uuid        primary key default gen_random_uuid(),
  empresa_id     uuid        not null references core.empresas(id) on delete cascade,
  profesional_id uuid        not null references agenda.profesionales(id) on delete cascade,
  fecha_inicio   date        not null,
  fecha_fin      date        not null,
  motivo         text,
  creado_en      timestamptz not null default now(),
  check (fecha_fin >= fecha_inicio)
);
create index if not exists bloqueos_empresa_profesional_idx
  on agenda.bloqueos (empresa_id, profesional_id);
create index if not exists bloqueos_rango_idx
  on agenda.bloqueos (profesional_id, fecha_inicio, fecha_fin);

-- -----------------------------------------------------------------------------
-- Rate limit de reservas públicas (anti-spam)
-- -----------------------------------------------------------------------------
create table if not exists agenda.rate_limit_reservas (
  id              uuid        primary key default gen_random_uuid(),
  telefono        varchar(15),
  ip              inet,
  intentos        integer     not null default 1,
  ventana_inicio  timestamptz not null default now(),
  creado_en       timestamptz not null default now()
);
create index if not exists rate_limit_reservas_telefono_idx
  on agenda.rate_limit_reservas (telefono, ventana_inicio);
create index if not exists rate_limit_reservas_ip_idx
  on agenda.rate_limit_reservas (ip, ventana_inicio);

-- -----------------------------------------------------------------------------
-- Log de intentos de spam (auditoría)
-- -----------------------------------------------------------------------------
create table if not exists agenda.log_rate_limit (
  id         uuid        primary key default gen_random_uuid(),
  empresa_id uuid        references core.empresas(id) on delete set null,
  telefono   varchar(15),
  ip         inet,
  accion     text,
  creado_en  timestamptz not null default now()
);
create index if not exists log_rate_limit_empresa_idx
  on agenda.log_rate_limit (empresa_id, creado_en desc);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table agenda.profesionales      enable row level security;
alter table agenda.servicios          enable row level security;
alter table agenda.disponibilidad     enable row level security;
alter table agenda.pacientes          enable row level security;
alter table agenda.citas              enable row level security;
alter table agenda.mensajes_whatsapp  enable row level security;
alter table agenda.bloqueos           enable row level security;
alter table agenda.rate_limit_reservas enable row level security;
alter table agenda.log_rate_limit     enable row level security;

-- -----------------------------------------------------------------------------
-- Políticas SELECT: rol admin (ve todo de su empresa)
-- -----------------------------------------------------------------------------
drop policy if exists profesionales_select_admin on agenda.profesionales;
create policy profesionales_select_admin on agenda.profesionales
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'admin');

drop policy if exists servicios_select_admin on agenda.servicios;
create policy servicios_select_admin on agenda.servicios
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'admin');

drop policy if exists disponibilidad_select_admin on agenda.disponibilidad;
create policy disponibilidad_select_admin on agenda.disponibilidad
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'admin');

drop policy if exists pacientes_select_admin on agenda.pacientes;
create policy pacientes_select_admin on agenda.pacientes
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'admin');

drop policy if exists citas_select_admin on agenda.citas;
create policy citas_select_admin on agenda.citas
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'admin');

drop policy if exists mensajes_whatsapp_select_admin on agenda.mensajes_whatsapp;
create policy mensajes_whatsapp_select_admin on agenda.mensajes_whatsapp
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'admin');

drop policy if exists bloqueos_select_admin on agenda.bloqueos;
create policy bloqueos_select_admin on agenda.bloqueos
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'admin');

drop policy if exists log_rate_limit_select_admin on agenda.log_rate_limit;
create policy log_rate_limit_select_admin on agenda.log_rate_limit
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'admin');

-- -----------------------------------------------------------------------------
-- Políticas SELECT: rol recepcion (ve las tablas operativas, no logs técnicos)
-- recepcion mapea al valor 'colaborador' del check de core.perfiles.rol
-- -----------------------------------------------------------------------------
drop policy if exists profesionales_select_recepcion on agenda.profesionales;
create policy profesionales_select_recepcion on agenda.profesionales
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'colaborador');

drop policy if exists servicios_select_recepcion on agenda.servicios;
create policy servicios_select_recepcion on agenda.servicios
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'colaborador');

drop policy if exists disponibilidad_select_recepcion on agenda.disponibilidad;
create policy disponibilidad_select_recepcion on agenda.disponibilidad
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'colaborador');

drop policy if exists pacientes_select_recepcion on agenda.pacientes;
create policy pacientes_select_recepcion on agenda.pacientes
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'colaborador');

drop policy if exists citas_select_recepcion on agenda.citas;
create policy citas_select_recepcion on agenda.citas
  for select to authenticated
  using (empresa_id = core.empresa_actual() and core.rol_actual() = 'colaborador');

-- -----------------------------------------------------------------------------
-- Políticas SELECT: rol profesional (solo supervisor en core)
-- Ve únicamente las citas donde es el profesional asignado
-- -----------------------------------------------------------------------------
drop policy if exists citas_select_profesional on agenda.citas;
create policy citas_select_profesional on agenda.citas
  for select to authenticated
  using (
    empresa_id = core.empresa_actual()
    and core.rol_actual() = 'supervisor'
    and profesional_id in (
      select pr.id from agenda.profesionales pr
      where pr.empresa_id = core.empresa_actual()
        and pr.nombre = (select p.nombre from core.perfiles p where p.id = auth.uid())
    )
  );

-- Nota de diseño: el rol 'supervisor' de core.perfiles se usa para mapear al
-- profesional en la app agenda. Para un aislamiento más robusto se recomienda
-- agregar una columna perfil_id en agenda.profesionales en una migración futura.

-- Sin políticas INSERT / UPDATE / DELETE para authenticated:
-- solo service_role (backend) escribe, ya que omite RLS por diseño de Supabase.

-- =============================================================================
-- FUNCIONES RPC
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Slots disponibles para un profesional en una fecha dada
-- Usa security definer para poder leer agenda.disponibilidad y agenda.citas
-- con search_path vacío (buena práctica de seguridad).
-- -----------------------------------------------------------------------------
drop function if exists agenda.slots_disponibles(uuid, uuid, date);
create or replace function agenda.slots_disponibles(
  p_empresa_id      uuid,
  p_profesional_id  uuid,
  p_fecha           date
)
returns table(
  slot_inicio   timestamptz,
  slot_fin      timestamptz,
  disponible    boolean
)
language sql stable
security definer
set search_path = ''
as $$
  with disponibilidad_dia as (
    -- Bloques horarios del profesional para el día de semana de p_fecha
    select
      d.hora_inicio,
      d.hora_fin
    from agenda.disponibilidad d
    where d.empresa_id      = p_empresa_id
      and d.profesional_id  = p_profesional_id
      and d.dia_semana      = extract(isodow from p_fecha)::smallint
  ),
  duracion_servicio as (
    -- Obtiene la duración del primer servicio del profesional como granularidad de slot
    -- (el cliente puede pasar la duración directamente; aquí usamos 30 min por defecto)
    select 30 as minutos
  ),
  serie_slots as (
    -- Genera una serie de slots de 30 minutos dentro de cada bloque disponible
    select
      (p_fecha + d.hora_inicio + (n || ' minutes')::interval) at time zone 'UTC' as slot_inicio,
      (p_fecha + d.hora_inicio + ((n + (select minutos from duracion_servicio)) || ' minutes')::interval) at time zone 'UTC' as slot_fin
    from disponibilidad_dia d
    cross join generate_series(
      0,
      (extract(epoch from (d.hora_fin - d.hora_inicio)) / 60 - (select minutos from duracion_servicio))::int,
      (select minutos from duracion_servicio)
    ) as n
  ),
  citas_del_dia as (
    -- Citas ya reservadas para el profesional ese día
    select c.inicio, c.fin
    from agenda.citas c
    where c.empresa_id      = p_empresa_id
      and c.profesional_id  = p_profesional_id
      and c.inicio::date    = p_fecha
      and c.estado          not in ('cancelada')
  ),
  bloqueos_del_dia as (
    -- Bloqueos que cubren ese día
    select b.profesional_id
    from agenda.bloqueos b
    where b.empresa_id      = p_empresa_id
      and b.profesional_id  = p_profesional_id
      and b.fecha_inicio    <= p_fecha
      and b.fecha_fin       >= p_fecha
  )
  select
    s.slot_inicio,
    s.slot_fin,
    -- Un slot está disponible si no hay bloqueo y no hay cita que solape
    not exists (select 1 from bloqueos_del_dia)
    and not exists (
      select 1 from citas_del_dia c
      where c.inicio < s.slot_fin
        and c.fin    > s.slot_inicio
    ) as disponible
  from serie_slots s
  order by s.slot_inicio
$$;

-- -----------------------------------------------------------------------------
-- Citas pendientes de recordatorio (para el cron job)
-- Ventana: entre now() y now() + 25h (24h con 1h de margen)
-- -----------------------------------------------------------------------------
drop function if exists agenda.citas_pendientes_recordatorio(uuid);
create or replace function agenda.citas_pendientes_recordatorio(
  p_empresa_id uuid
)
returns table(
  cita_id           uuid,
  telefono          varchar,
  nombre_paciente   text,
  inicio            timestamptz,
  nombre_profesional text
)
language sql stable
security definer
set search_path = ''
as $$
  select
    c.id                  as cita_id,
    pac.telefono,
    pac.nombre            as nombre_paciente,
    c.inicio,
    pro.nombre            as nombre_profesional
  from agenda.citas c
  join agenda.pacientes    pac on pac.id = c.paciente_id
  join agenda.profesionales pro on pro.id = c.profesional_id
  where c.empresa_id            = p_empresa_id
    and c.recordatorio_enviado  = false
    and c.estado                not in ('cancelada', 'no_asistio')
    and c.inicio                > now()
    and c.inicio               <= now() + interval '25 hours'
    and pac.acepta_whatsapp     = true
  order by c.inicio
$$;

-- =============================================================================
-- PERMISOS
-- =============================================================================

grant usage on schema agenda to authenticated, service_role;
grant select on all tables in schema agenda to authenticated;
grant all on all tables in schema agenda to service_role;

-- Las funciones RPC solo las ejecuta el backend (service_role)
revoke execute on function agenda.slots_disponibles(uuid, uuid, date) from public;
revoke execute on function agenda.citas_pendientes_recordatorio(uuid) from public;
grant execute on function agenda.slots_disponibles(uuid, uuid, date) to service_role;
grant execute on function agenda.citas_pendientes_recordatorio(uuid) to service_role;
