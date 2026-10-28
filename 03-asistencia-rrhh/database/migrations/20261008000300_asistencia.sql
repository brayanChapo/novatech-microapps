-- =============================================================================
-- MICRO APP 03 · ASISTENCIA (RR.HH.)
-- Marcación por celular con geocerca por local + dashboard por local.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists asistencia;

-- -----------------------------------------------------------------------------
-- Configuración por empresa
-- -----------------------------------------------------------------------------
create table if not exists asistencia.configuracion (
  empresa_id                   uuid primary key references core.empresas(id) on delete cascade,
  precision_max_m              integer not null default 50 check (precision_max_m between 5 and 500),
  politica_fuera_geocerca      text not null default 'rechazar'
                               check (politica_fuera_geocerca in ('rechazar', 'observar')),
  permitir_ubicacion_simulada  boolean not null default false,
  actualizado_en               timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Locales (sedes) con su geocerca circular
-- -----------------------------------------------------------------------------
create table if not exists asistencia.locales (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  direccion   text,
  lat         double precision not null check (lat between -90 and 90),
  lng         double precision not null check (lng between -180 and 180),
  radio_m     integer not null default 100 check (radio_m between 20 and 2000),
  activo      boolean not null default true,
  creado_en   timestamptz not null default now(),
  unique (empresa_id, nombre)
);
create index if not exists locales_empresa_idx on asistencia.locales (empresa_id);

-- -----------------------------------------------------------------------------
-- Horarios (turnos)
-- dias_semana usa ISO: 1 = lunes ... 7 = domingo
-- -----------------------------------------------------------------------------
create table if not exists asistencia.horarios (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references core.empresas(id) on delete cascade,
  nombre          text not null,
  hora_entrada    time not null,
  hora_salida     time not null,
  tolerancia_min  integer not null default 10 check (tolerancia_min between 0 and 120),
  dias_semana     smallint[] not null default '{1,2,3,4,5}',
  creado_en       timestamptz not null default now(),
  check (hora_salida > hora_entrada),
  check (dias_semana <@ '{1,2,3,4,5,6,7}'::smallint[] and cardinality(dias_semana) > 0),
  unique (empresa_id, nombre)
);

-- -----------------------------------------------------------------------------
-- Asignación colaborador → local + horario (una vigente a la vez)
-- -----------------------------------------------------------------------------
create table if not exists asistencia.asignaciones (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references core.empresas(id) on delete cascade,
  colaborador_id  uuid not null references core.perfiles(id) on delete cascade,
  local_id        uuid not null references asistencia.locales(id) on delete restrict,
  horario_id      uuid not null references asistencia.horarios(id) on delete restrict,
  vigente_desde   date not null default current_date,
  vigente_hasta   date,
  creado_en       timestamptz not null default now(),
  check (vigente_hasta is null or vigente_hasta >= vigente_desde)
);
create unique index if not exists asignaciones_una_abierta_idx
  on asistencia.asignaciones (colaborador_id) where vigente_hasta is null;
create index if not exists asignaciones_local_idx on asistencia.asignaciones (local_id);

-- -----------------------------------------------------------------------------
-- Supervisores por local (el supervisor solo ve sus locales)
-- -----------------------------------------------------------------------------
create table if not exists asistencia.supervisores_locales (
  supervisor_id  uuid not null references core.perfiles(id) on delete cascade,
  local_id       uuid not null references asistencia.locales(id) on delete cascade,
  empresa_id     uuid not null references core.empresas(id) on delete cascade,
  primary key (supervisor_id, local_id)
);

-- -----------------------------------------------------------------------------
-- Marcaciones (solo el backend inserta; el cliente NUNCA escribe directo)
-- -----------------------------------------------------------------------------
create table if not exists asistencia.marcaciones (
  id                  uuid primary key default gen_random_uuid(),
  empresa_id          uuid not null references core.empresas(id) on delete cascade,
  colaborador_id      uuid not null references core.perfiles(id) on delete cascade,
  local_id            uuid not null references asistencia.locales(id) on delete restrict,
  tipo                text not null check (tipo in ('entrada', 'salida')),
  marcado_en          timestamptz not null default now(),   -- hora del SERVIDOR
  fecha_local         date not null,                        -- fecha en la zona horaria de la empresa
  lat                 double precision not null,
  lng                 double precision not null,
  precision_m         real not null,
  distancia_m         real not null,
  dentro_geocerca     boolean not null,
  estado              text not null check (estado in
                        ('a_tiempo', 'tardanza', 'salida', 'salida_anticipada', 'observada', 'extra')),
  ubicacion_simulada  boolean not null default false,
  dispositivo         jsonb not null default '{}'::jsonb,
  creado_en           timestamptz not null default now()
);
-- Máximo una entrada y una salida por colaborador y día (protege contra doble toque)
create unique index if not exists marcaciones_unica_por_dia_idx
  on asistencia.marcaciones (colaborador_id, fecha_local, tipo);
create index if not exists marcaciones_local_fecha_idx
  on asistencia.marcaciones (empresa_id, local_id, fecha_local);
create index if not exists marcaciones_colaborador_idx
  on asistencia.marcaciones (colaborador_id, marcado_en desc);

-- =============================================================================
-- RLS
-- =============================================================================
alter table asistencia.configuracion        enable row level security;
alter table asistencia.locales              enable row level security;
alter table asistencia.horarios             enable row level security;
alter table asistencia.asignaciones         enable row level security;
alter table asistencia.supervisores_locales enable row level security;
alter table asistencia.marcaciones          enable row level security;

drop policy if exists configuracion_lectura on asistencia.configuracion;
create policy configuracion_lectura on asistencia.configuracion
  for select to authenticated using (empresa_id = core.empresa_actual());

drop policy if exists locales_lectura on asistencia.locales;
create policy locales_lectura on asistencia.locales
  for select to authenticated using (empresa_id = core.empresa_actual());

drop policy if exists horarios_lectura on asistencia.horarios;
create policy horarios_lectura on asistencia.horarios
  for select to authenticated using (empresa_id = core.empresa_actual());

drop policy if exists supervisores_locales_lectura on asistencia.supervisores_locales;
create policy supervisores_locales_lectura on asistencia.supervisores_locales
  for select to authenticated
  using (empresa_id = core.empresa_actual()
         and (supervisor_id = auth.uid() or core.rol_actual() = 'admin'));

drop policy if exists asignaciones_lectura on asistencia.asignaciones;
create policy asignaciones_lectura on asistencia.asignaciones
  for select to authenticated
  using (
    empresa_id = core.empresa_actual() and (
      colaborador_id = auth.uid()
      or core.rol_actual() = 'admin'
      or (core.rol_actual() = 'supervisor' and local_id in (
            select sl.local_id from asistencia.supervisores_locales sl
            where sl.supervisor_id = auth.uid()))
    )
  );

-- Usado también por Supabase Realtime: cada usuario solo recibe lo que puede ver.
drop policy if exists marcaciones_lectura on asistencia.marcaciones;
create policy marcaciones_lectura on asistencia.marcaciones
  for select to authenticated
  using (
    empresa_id = core.empresa_actual() and (
      colaborador_id = auth.uid()
      or core.rol_actual() = 'admin'
      or (core.rol_actual() = 'supervisor' and local_id in (
            select sl.local_id from asistencia.supervisores_locales sl
            where sl.supervisor_id = auth.uid()))
    )
  );

-- Sin políticas de INSERT/UPDATE/DELETE: solo service_role (backend) escribe.

-- =============================================================================
-- Funciones de consulta para el dashboard (solo backend)
-- =============================================================================

-- Resumen por local para una fecha.
-- "sin_marcar" = programados para ese día que aún no registran entrada.
create or replace function asistencia.resumen_por_local(
  p_empresa uuid,
  p_fecha   date,
  p_locales uuid[] default null
)
returns table (
  local_id     uuid,
  local_nombre text,
  lat          double precision,
  lng          double precision,
  radio_m      integer,
  programados  bigint,
  presentes    bigint,
  tardanzas    bigint,
  sin_marcar   bigint,
  salidas      bigint,
  observadas   bigint
)
language sql stable
set search_path = ''
as $$
  with locs as (
    select l.id, l.nombre, l.lat, l.lng, l.radio_m
    from asistencia.locales l
    where l.empresa_id = p_empresa and l.activo
      and (p_locales is null or l.id = any (p_locales))
  ),
  prog as (
    select a.colaborador_id, a.local_id
    from asistencia.asignaciones a
    join asistencia.horarios h on h.id = a.horario_id
    join core.perfiles p on p.id = a.colaborador_id and p.activo
    where a.empresa_id = p_empresa
      and a.vigente_desde <= p_fecha
      and (a.vigente_hasta is null or a.vigente_hasta >= p_fecha)
      and extract(isodow from p_fecha)::smallint = any (h.dias_semana)
  ),
  marc as (
    select m.colaborador_id, m.local_id, m.tipo, m.estado
    from asistencia.marcaciones m
    where m.empresa_id = p_empresa and m.fecha_local = p_fecha
  )
  select
    l.id, l.nombre, l.lat, l.lng, l.radio_m,
    (select count(*) from prog where prog.local_id = l.id),
    (select count(*) from marc where marc.local_id = l.id and marc.tipo = 'entrada'),
    (select count(*) from marc where marc.local_id = l.id and marc.estado = 'tardanza'),
    (select count(*) from prog
       where prog.local_id = l.id
         and not exists (select 1 from marc
                         where marc.colaborador_id = prog.colaborador_id
                           and marc.tipo = 'entrada')),
    (select count(*) from marc where marc.local_id = l.id and marc.tipo = 'salida'),
    (select count(*) from marc where marc.local_id = l.id and marc.estado = 'observada')
  from locs l
  order by l.nombre
$$;

-- Detalle de un local: una fila por persona programada o que marcó ese día.
create or replace function asistencia.detalle_local(
  p_empresa uuid,
  p_local   uuid,
  p_fecha   date
)
returns table (
  colaborador_id     uuid,
  nombre             text,
  documento          text,
  hora_entrada_prog  time,
  hora_salida_prog   time,
  entrada_en         timestamptz,
  estado_entrada     text,
  distancia_entrada  real,
  salida_en          timestamptz,
  estado_salida      text,
  situacion          text
)
language sql stable
set search_path = ''
as $$
  with prog as (
    select a.colaborador_id, h.hora_entrada, h.hora_salida
    from asistencia.asignaciones a
    join asistencia.horarios h on h.id = a.horario_id
    where a.empresa_id = p_empresa and a.local_id = p_local
      and a.vigente_desde <= p_fecha
      and (a.vigente_hasta is null or a.vigente_hasta >= p_fecha)
      and extract(isodow from p_fecha)::smallint = any (h.dias_semana)
  ),
  personas as (
    select prog.colaborador_id from prog
    union
    select m.colaborador_id from asistencia.marcaciones m
    where m.empresa_id = p_empresa and m.local_id = p_local and m.fecha_local = p_fecha
  )
  select
    p.id, p.nombre, p.documento::text,
    prog.hora_entrada, prog.hora_salida,
    e.marcado_en, e.estado, e.distancia_m,
    s.marcado_en, s.estado,
    case
      when e.id is null then 'sin_marcar'
      when s.id is not null then 'jornada_cerrada'
      else 'en_local'
    end
  from personas x
  join core.perfiles p on p.id = x.colaborador_id
  left join prog on prog.colaborador_id = x.colaborador_id
  left join lateral (
    select m.id, m.marcado_en, m.estado, m.distancia_m from asistencia.marcaciones m
    where m.colaborador_id = x.colaborador_id and m.fecha_local = p_fecha
      and m.local_id = p_local and m.tipo = 'entrada'
    limit 1
  ) e on true
  left join lateral (
    select m.id, m.marcado_en, m.estado from asistencia.marcaciones m
    where m.colaborador_id = x.colaborador_id and m.fecha_local = p_fecha
      and m.local_id = p_local and m.tipo = 'salida'
    limit 1
  ) s on true
  order by p.nombre
$$;

-- =============================================================================
-- Permisos
-- =============================================================================
grant usage on schema asistencia to authenticated, service_role;
grant select on all tables in schema asistencia to authenticated;
grant all on all tables in schema asistencia to service_role;
revoke execute on function asistencia.resumen_por_local(uuid, date, uuid[]) from public;
revoke execute on function asistencia.detalle_local(uuid, uuid, date) from public;
grant execute on function asistencia.resumen_por_local(uuid, date, uuid[]) to service_role;
grant execute on function asistencia.detalle_local(uuid, uuid, date) to service_role;

-- =============================================================================
-- Realtime: el dashboard escucha nuevas marcaciones al instante
-- =============================================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'asistencia' and tablename = 'marcaciones'
    ) then
      alter publication supabase_realtime add table asistencia.marcaciones;
    end if;
  end if;
end $$;
