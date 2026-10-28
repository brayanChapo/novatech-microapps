-- =============================================================================
-- BORRADOR · Micro app 12 · Mesa de ayuda interna (tickets)
-- Esquema: ayuda. NO se aplica automáticamente (está en database/borrador/).
-- Al iniciar el desarrollo: revisar, mover a database/migrations/ y escribir pruebas pgTAP.
-- Depende de: plataforma/database/migrations/20261008000000_core.sql
-- =============================================================================

create schema if not exists ayuda;

create table if not exists ayuda.categorias (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  nombre      text not null,
  agente_defecto_id uuid references core.perfiles(id),
  creado_en   timestamptz not null default now()
);
create index if not exists categorias_empresa_idx on ayuda.categorias (empresa_id);
alter table ayuda.categorias enable row level security;
create policy categorias_lectura_empresa on ayuda.categorias for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists ayuda.tickets (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  numero      integer not null,
  solicitante_id uuid not null references core.perfiles(id),
  agente_id   uuid references core.perfiles(id),
  categoria_id uuid references ayuda.categorias(id),
  prioridad   text not null check (prioridad in ('baja','media','alta','critica')),
  titulo      text not null,
  descripcion text not null,
  estado      text not null default 'abierto',
  primera_respuesta_en timestamptz,
  resuelto_en timestamptz,
  creado_en   timestamptz not null default now()
);
create index if not exists tickets_empresa_idx on ayuda.tickets (empresa_id);
alter table ayuda.tickets enable row level security;
create policy tickets_lectura_empresa on ayuda.tickets for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists ayuda.comentarios (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  ticket_id   uuid not null references ayuda.tickets(id),
  autor_id    uuid not null references core.perfiles(id),
  texto       text not null,
  interno     boolean not null default false,
  creado_en   timestamptz not null default now()
);
create index if not exists comentarios_empresa_idx on ayuda.comentarios (empresa_id);
alter table ayuda.comentarios enable row level security;
create policy comentarios_lectura_empresa on ayuda.comentarios for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

create table if not exists ayuda.eventos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references core.empresas(id) on delete cascade,
  ticket_id   uuid not null references ayuda.tickets(id),
  estado      text not null,
  usuario_id  uuid references core.perfiles(id),
  creado_en   timestamptz not null default now()
);
create index if not exists eventos_empresa_idx on ayuda.eventos (empresa_id);
alter table ayuda.eventos enable row level security;
create policy eventos_lectura_empresa on ayuda.eventos for select to authenticated
  using (empresa_id = core.empresa_actual());  -- TODO: restringir por rol si aplica

grant usage on schema ayuda to authenticated, service_role;
grant select on all tables in schema ayuda to authenticated;
grant all on all tables in schema ayuda to service_role;

-- Escrituras: solo el backend (service_role). No crear políticas de INSERT/UPDATE para clientes.
