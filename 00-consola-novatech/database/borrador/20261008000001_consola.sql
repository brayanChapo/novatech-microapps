-- =============================================================================
-- BORRADOR · 00 Consola NovaTech (panel interno)
-- Esquema: consola. NO se aplica automáticamente (está en database/borrador/).
-- Depende de: core (plataforma) y de cada micro app que reporte uso.
--
-- Principio: la consola guarda datos COMERCIALES de NovaTech (clientes, contratos,
-- comprobantes, pagos) y CONTEOS de uso por empresa. Nunca datos personales de los
-- trabajadores/pacientes/alumnos de los clientes.
-- =============================================================================

create schema if not exists consola;

-- Personal de NovaTech con acceso a la consola (no pertenecen a ninguna empresa cliente)
create table if not exists consola.staff (
  usuario_id  uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null,
  rol         text not null check (rol in ('direccion', 'operaciones', 'lectura')),
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

-- Catálogo de productos y lista de precios (con historial de vigencia)
create table if not exists consola.productos (
  codigo     text primary key,             -- '03-asistencia-rrhh'
  nombre     text not null,
  esquema    text,                          -- esquema de BD de la app (para recolectar uso)
  activo     boolean not null default true
);

create table if not exists consola.precios (
  producto        text not null references consola.productos(codigo),
  plan            text not null check (plan in ('basico', 'estandar', 'pro')),
  precio_mensual  numeric(12,2) not null check (precio_mensual >= 0),
  implementacion  numeric(12,2) not null check (implementacion >= 0),
  wa_incluidos    integer not null default 0,
  vigente_desde   date not null,
  primary key (producto, plan, vigente_desde)
);

-- Clientes comerciales (incluye prospectos que aún no tienen empresa en core)
create table if not exists consola.clientes (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid unique references core.empresas(id),   -- se llena al aprovisionar
  razon_social text not null,
  ruc         varchar(11) check (ruc is null or ruc ~ '^[0-9]{11}$'),
  contacto    text,
  telefono    varchar(15),
  correo      text,
  nicho       text,
  origen      text,                                       -- LinkedIn, referido, Workana…
  estado      text not null default 'prospecto' check (estado in ('prospecto', 'activo', 'baja')),
  fecha_alta  date,
  creado_en   timestamptz not null default now()
);

create table if not exists consola.contratos (
  id                 uuid primary key default gen_random_uuid(),
  cliente_id         uuid not null references consola.clientes(id),
  producto           text not null references consola.productos(codigo),
  plan               text not null check (plan in ('basico', 'estandar', 'pro')),
  precio_mensual     numeric(12,2) not null,                -- congelado al firmar
  descuento_mensual  numeric(5,4) not null default 0 check (descuento_mensual between 0 and 1),
  implementacion     numeric(12,2) not null,
  descuento_impl     numeric(5,4) not null default 0 check (descuento_impl between 0 and 1),
  wa_incluidos       integer not null default 0,
  fecha_firma        date not null,
  inicio_plan        date,
  fecha_baja         date,
  estado             text not null default 'implementacion' check (estado in ('implementacion', 'activo', 'baja')),
  creado_en          timestamptz not null default now(),
  check (fecha_baja is null or inicio_plan is null or fecha_baja >= inicio_plan)
);
create index if not exists contratos_cliente_idx on consola.contratos (cliente_id);

-- Registro de comprobantes (la emisión electrónica la hace el proveedor autorizado por SUNAT)
create table if not exists consola.comprobantes (
  id             uuid primary key default gen_random_uuid(),
  cliente_id     uuid not null references consola.clientes(id),
  contrato_id    uuid references consola.contratos(id),
  serie_numero   text not null unique,                    -- F001-000123
  fecha_emision  date not null,
  concepto       text not null check (concepto in ('impl_inicial', 'impl_final', 'plan_mensual', 'excedente_whatsapp', 'horas_adicionales', 'otro')),
  periodo        text,                                    -- '2026-10' para planes y excedentes
  monto          numeric(12,2) not null check (monto >= 0),
  igv            numeric(12,2) not null,
  total          numeric(12,2) generated always as (monto + igv) stored,
  vence          date not null,
  estado         text not null default 'pendiente' check (estado in ('pendiente', 'pagado', 'anulado')),
  pdf_url        text,
  creado_en      timestamptz not null default now()
);
create index if not exists comprobantes_fecha_idx on consola.comprobantes (fecha_emision);

create table if not exists consola.pagos (
  id              uuid primary key default gen_random_uuid(),
  comprobante_id  uuid not null references consola.comprobantes(id),
  fecha           date not null,
  monto           numeric(12,2) not null check (monto > 0),
  medio           text not null check (medio in ('transferencia', 'yape', 'plin', 'efectivo', 'otro')),
  referencia      text,
  creado_en       timestamptz not null default now()
);

-- Conteos diarios de uso por empresa y producto (sin datos personales)
create table if not exists consola.uso_diario (
  fecha       date not null,
  empresa_id  uuid not null references core.empresas(id),
  producto    text not null references consola.productos(codigo),
  metrica     text not null,          -- 'usuarios_activos', 'marcaciones', 'mensajes_whatsapp', 'errores_api'…
  valor       bigint not null,
  primary key (fecha, empresa_id, producto, metrica)
);

create table if not exists consola.notas (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references consola.clientes(id),
  autor_id    uuid references consola.staff(usuario_id),
  tipo        text not null default 'comercial' check (tipo in ('comercial', 'soporte', 'cobranza')),
  texto       text not null,
  creado_en   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indicadores
-- -----------------------------------------------------------------------------
-- Ingreso mensual recurrente (MRR) a una fecha
create or replace function consola.mrr(p_fecha date)
returns numeric
language sql stable set search_path = ''
as $$
  select round(coalesce(sum(c.precio_mensual * (1 - c.descuento_mensual)), 0), 2)
  from consola.contratos c
  where c.inicio_plan is not null and c.inicio_plan <= p_fecha
    and (c.fecha_baja is null or c.fecha_baja > p_fecha)
$$;

-- KPIs del día y del mes de la fecha de corte
create or replace function consola.kpis(p_fecha date)
returns table (
  clientes_activos bigint, prospectos bigint,
  contratos_hoy bigint, contratos_mes bigint, bajas_mes bigint,
  mrr numeric, facturado_hoy numeric, facturado_mes numeric,
  cobrado_mes numeric, por_cobrar numeric, vencido numeric
)
language sql stable set search_path = ''
as $$
  with lim as (select date_trunc('month', p_fecha)::date as ini, (date_trunc('month', p_fecha) + interval '1 month - 1 day')::date as fin)
  select
    (select count(*) from consola.clientes where estado = 'activo'),
    (select count(*) from consola.clientes where estado = 'prospecto'),
    (select count(*) from consola.contratos where fecha_firma = p_fecha),
    (select count(*) from consola.contratos, lim where fecha_firma between lim.ini and p_fecha),
    (select count(*) from consola.contratos, lim where fecha_baja between lim.ini and p_fecha),
    consola.mrr(p_fecha),
    (select coalesce(sum(monto), 0) from consola.comprobantes where fecha_emision = p_fecha and estado <> 'anulado'),
    (select coalesce(sum(monto), 0) from consola.comprobantes, lim where fecha_emision between lim.ini and lim.fin and estado <> 'anulado'),
    (select coalesce(sum(p.monto), 0) from consola.pagos p, lim where p.fecha between lim.ini and p_fecha),
    (select coalesce(sum(c.total - coalesce((select sum(monto) from consola.pagos where comprobante_id = c.id), 0)), 0)
       from consola.comprobantes c where c.estado = 'pendiente'),
    (select coalesce(sum(c.total - coalesce((select sum(monto) from consola.pagos where comprobante_id = c.id), 0)), 0)
       from consola.comprobantes c where c.estado = 'pendiente' and c.vence < p_fecha)
$$;

-- -----------------------------------------------------------------------------
-- Contrato de uso: cada micro app expone <esquema>.uso_diario(fecha)
-- que devuelve SOLO conteos por empresa. Ejemplo para Asistencia:
-- (al construir, mover a una migración de 03-asistencia-rrhh)
-- -----------------------------------------------------------------------------
create or replace function asistencia.uso_diario(p_fecha date)
returns table (empresa_id uuid, metrica text, valor bigint)
language sql stable set search_path = ''
as $$
  select m.empresa_id, 'marcaciones', count(*) from asistencia.marcaciones m
  where m.fecha_local = p_fecha group by m.empresa_id
  union all
  select m.empresa_id, 'usuarios_activos', count(distinct m.colaborador_id) from asistencia.marcaciones m
  where m.fecha_local = p_fecha group by m.empresa_id
  union all
  select l.empresa_id, 'locales_activos', count(*) from asistencia.locales l
  where l.activo group by l.empresa_id
$$;

-- Recolector: llama a la función de uso de cada producto con esquema registrado
create or replace function consola.recolectar_uso(p_fecha date)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  p record;
  n integer := 0;
  filas integer;
begin
  for p in select codigo, esquema from consola.productos where activo and esquema is not null loop
    if exists (select 1 from pg_proc pr join pg_namespace ns on ns.oid = pr.pronamespace
               where ns.nspname = p.esquema and pr.proname = 'uso_diario') then
      execute format(
        'insert into consola.uso_diario (fecha, empresa_id, producto, metrica, valor)
         select $1, u.empresa_id, $2, u.metrica, u.valor from %I.uso_diario($1) u
         on conflict (fecha, empresa_id, producto, metrica) do update set valor = excluded.valor',
        p.esquema) using p_fecha, p.codigo;
      get diagnostics filas = row_count;
      n := n + filas;
    end if;
  end loop;
  return n;
end $$;

-- Programar cada noche a las 00:15 hora de Lima (05:15 UTC) con pg_cron en Supabase:
-- select cron.schedule('consola-uso-diario', '15 5 * * *', $$ select consola.recolectar_uso(((now() at time zone 'America/Lima')::date - 1)) $$);

-- -----------------------------------------------------------------------------
-- Seguridad: RLS activo SIN políticas → ningún usuario de clientes puede leer nada.
-- Solo el backend de la consola (service_role) accede, y verifica consola.staff.
-- -----------------------------------------------------------------------------
alter table consola.staff        enable row level security;
alter table consola.productos    enable row level security;
alter table consola.precios      enable row level security;
alter table consola.clientes     enable row level security;
alter table consola.contratos    enable row level security;
alter table consola.comprobantes enable row level security;
alter table consola.pagos        enable row level security;
alter table consola.uso_diario   enable row level security;
alter table consola.notas        enable row level security;

revoke all on schema consola from public;
grant usage on schema consola to service_role;
grant all on all tables in schema consola to service_role;
grant execute on all functions in schema consola to service_role;
revoke execute on function asistencia.uso_diario(date) from public;
grant execute on function asistencia.uso_diario(date) to service_role;
