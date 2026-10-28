-- =============================================================================
-- Pruebas de aislamiento RLS · Asistencia (pgTAP)
-- Ejecutar con Supabase CLI:   supabase test db
-- En Postgres plano (CI):      ver database/tests/README.md
-- =============================================================================
begin;
create extension if not exists pgtap;
select plan(8);

-- ---------- Datos de prueba: 2 empresas, 4 usuarios ----------
insert into auth.users (id, email) values
  ('a0000000-0000-0000-0000-00000000000a', 'admin.a@test.pe'),
  ('a0000000-0000-0000-0000-00000000000c', 'colab.a@test.pe'),
  ('a0000000-0000-0000-0000-00000000000d', 'super.a@test.pe'),
  ('b0000000-0000-0000-0000-00000000000c', 'colab.b@test.pe');

insert into core.empresas (id, nombre) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Empresa A'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Empresa B');

insert into core.perfiles (id, empresa_id, nombre, rol) values
  ('a0000000-0000-0000-0000-00000000000a', 'aaaaaaaa-0000-0000-0000-000000000001', 'Admin A', 'admin'),
  ('a0000000-0000-0000-0000-00000000000c', 'aaaaaaaa-0000-0000-0000-000000000001', 'Colab A', 'colaborador'),
  ('a0000000-0000-0000-0000-00000000000d', 'aaaaaaaa-0000-0000-0000-000000000001', 'Super A', 'supervisor'),
  ('b0000000-0000-0000-0000-00000000000c', 'bbbbbbbb-0000-0000-0000-000000000001', 'Colab B', 'colaborador');

insert into asistencia.locales (id, empresa_id, nombre, lat, lng, radio_m) values
  ('aaaaaaaa-0000-0000-0000-0000000010c1', 'aaaaaaaa-0000-0000-0000-000000000001', 'A Local 1', -12.12, -77.03, 100),
  ('aaaaaaaa-0000-0000-0000-0000000010c2', 'aaaaaaaa-0000-0000-0000-000000000001', 'A Local 2', -12.09, -77.03, 100),
  ('bbbbbbbb-0000-0000-0000-0000000010c1', 'bbbbbbbb-0000-0000-0000-000000000001', 'B Local 1', -12.05, -76.94, 100);

insert into asistencia.supervisores_locales (supervisor_id, local_id, empresa_id) values
  ('a0000000-0000-0000-0000-00000000000d', 'aaaaaaaa-0000-0000-0000-0000000010c2', 'aaaaaaaa-0000-0000-0000-000000000001');

insert into asistencia.marcaciones
  (empresa_id, colaborador_id, local_id, tipo, fecha_local, lat, lng, precision_m, distancia_m, dentro_geocerca, estado) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000c', 'aaaaaaaa-0000-0000-0000-0000000010c1', 'entrada', '2026-10-08', -12.12, -77.03, 10, 5, true, 'a_tiempo'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000a', 'aaaaaaaa-0000-0000-0000-0000000010c2', 'entrada', '2026-10-08', -12.09, -77.03, 10, 5, true, 'a_tiempo'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-00000000000c', 'bbbbbbbb-0000-0000-0000-0000000010c1', 'entrada', '2026-10-08', -12.05, -76.94, 10, 5, true, 'a_tiempo');

-- ---------- Colaborador A ----------
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000c', true);
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);

select is((select count(*) from asistencia.marcaciones)::int, 1,
  'Colaborador A solo ve sus propias marcaciones');
select is((select count(*) from asistencia.locales)::int, 2,
  'Colaborador A ve los locales de su empresa y no los de B');
select throws_ok(
  $$ insert into asistencia.marcaciones (empresa_id, colaborador_id, local_id, tipo, fecha_local, lat, lng, precision_m, distancia_m, dentro_geocerca, estado)
     values ('aaaaaaaa-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-00000000000c', 'aaaaaaaa-0000-0000-0000-0000000010c1', 'salida', '2026-10-08', 0, 0, 1, 1, true, 'salida') $$,
  '42501', null,
  'Un usuario autenticado no puede insertar marcaciones directamente');

-- ---------- Admin A ----------
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000a', true);
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);
select is((select count(*) from asistencia.marcaciones)::int, 2,
  'Admin A ve todas las marcaciones de su empresa');
select is((select count(*) from asistencia.marcaciones where empresa_id = 'bbbbbbbb-0000-0000-0000-000000000001')::int, 0,
  'Admin A NO ve marcaciones de la empresa B');

-- ---------- Supervisor A (solo Local 2) ----------
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-00000000000d', true);
select set_config('request.jwt.claims', '{"sub":"a0000000-0000-0000-0000-00000000000d","role":"authenticated"}', true);
select is((select count(*) from asistencia.marcaciones)::int, 1,
  'Supervisor A solo ve marcaciones de los locales que supervisa');

-- ---------- Colaborador B ----------
select set_config('request.jwt.claim.sub', 'b0000000-0000-0000-0000-00000000000c', true);
select set_config('request.jwt.claims', '{"sub":"b0000000-0000-0000-0000-00000000000c","role":"authenticated"}', true);
select is((select count(*) from core.empresas)::int, 1,
  'Colaborador B solo ve su propia empresa');
select is((select count(*) from asistencia.marcaciones)::int, 1,
  'Colaborador B solo ve su marcación');

select * from finish();
rollback;
