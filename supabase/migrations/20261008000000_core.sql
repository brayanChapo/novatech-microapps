-- =============================================================================
-- PLATAFORMA NOVATECH · Esquema core (compartido por todas las micro apps)
-- Empresas cliente (tenants) y perfiles de usuario.
-- Regla de oro: TODA tabla de negocio lleva empresa_id y política RLS.
-- =============================================================================

create extension if not exists pgcrypto;

create schema if not exists core;

-- Empresas cliente (un registro por cliente de NovaTech)
create table if not exists core.empresas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  ruc           varchar(11) check (ruc is null or ruc ~ '^[0-9]{11}$'),
  zona_horaria  text not null default 'America/Lima',
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);

-- Perfil de cada usuario autenticado (1:1 con auth.users)
create table if not exists core.perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  empresa_id  uuid not null references core.empresas(id) on delete restrict,
  nombre      text not null,
  documento   varchar(15),
  rol         text not null check (rol in ('admin', 'supervisor', 'colaborador')),
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);
create index if not exists perfiles_empresa_idx on core.perfiles (empresa_id);

-- -----------------------------------------------------------------------------
-- Funciones auxiliares para RLS (security definer para evitar recursión)
-- -----------------------------------------------------------------------------
create or replace function core.empresa_actual()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select p.empresa_id from core.perfiles p where p.id = auth.uid() and p.activo
$$;

create or replace function core.rol_actual()
returns text
language sql stable security definer
set search_path = ''
as $$
  select p.rol from core.perfiles p where p.id = auth.uid() and p.activo
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table core.empresas enable row level security;
alter table core.perfiles enable row level security;

drop policy if exists empresas_lectura_propia on core.empresas;
create policy empresas_lectura_propia on core.empresas
  for select to authenticated
  using (id = core.empresa_actual());

drop policy if exists perfiles_lectura_misma_empresa on core.perfiles;
create policy perfiles_lectura_misma_empresa on core.perfiles
  for select to authenticated
  using (empresa_id = core.empresa_actual());

-- Escrituras: solo el backend (service_role, que omite RLS).

-- -----------------------------------------------------------------------------
-- Permisos
-- -----------------------------------------------------------------------------
grant usage on schema core to authenticated, service_role;
grant select on all tables in schema core to authenticated;
grant all on all tables in schema core to service_role;
grant execute on all functions in schema core to authenticated, service_role;
