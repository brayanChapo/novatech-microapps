-- =============================================================================
-- Pruebas de aislamiento RLS · Agenda de citas (pgTAP)
-- Ejecutar con Supabase CLI:   supabase test db
-- En Postgres plano (CI):      ver database/tests/README.md
-- =============================================================================
begin;
create extension if not exists pgtap;
select plan(17);

-- ---------- Datos de prueba: 2 empresas, 5 usuarios ----------
insert into auth.users (id, email) values
  ('c1000000-0000-0000-0000-000000000001', 'admin.a@agenda.test'),
  ('c1000000-0000-0000-0000-000000000002', 'recepcion.a@agenda.test'),
  ('c1000000-0000-0000-0000-000000000003', 'profesional.a1@agenda.test'),
  ('c1000000-0000-0000-0000-000000000004', 'profesional.a2@agenda.test'),
  ('c1000000-0000-0000-0000-000000000005', 'admin.b@agenda.test');

insert into core.empresas (id, nombre) values
  ('dddddddd-0000-0000-0000-000000000001', 'Clinica Demo A'),
  ('eeeeeeee-0000-0000-0000-000000000001', 'Clinica Demo B');

-- rol 'admin' → admin en la app agenda
-- rol 'colaborador' → recepción en la app agenda
-- rol 'supervisor' → profesional en la app agenda (según nota de diseño en la migración)
insert into core.perfiles (id, empresa_id, nombre, rol) values
  ('c1000000-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'Admin Clinica A',        'admin'),
  ('c1000000-0000-0000-0000-000000000002', 'dddddddd-0000-0000-0000-000000000001', 'Recepcion Clinica A',    'colaborador'),
  ('c1000000-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0000-000000000001', 'Dr. Carlos Mendoza',     'supervisor'),
  ('c1000000-0000-0000-0000-000000000004', 'dddddddd-0000-0000-0000-000000000001', 'Dra. Lucia Paredes',     'supervisor'),
  ('c1000000-0000-0000-0000-000000000005', 'eeeeeeee-0000-0000-0000-000000000001', 'Admin Clinica B',        'admin');

-- Profesionales: los nombres coinciden con los perfiles para que la policy supervisor funcione
insert into agenda.profesionales (id, empresa_id, nombre, especialidad, activo) values
  ('d1000000-0000-0000-0000-000000000p01', 'dddddddd-0000-0000-0000-000000000001', 'Dr. Carlos Mendoza',  'Dentista General', true),
  ('d1000000-0000-0000-0000-000000000p02', 'dddddddd-0000-0000-0000-000000000001', 'Dra. Lucia Paredes',  'Ortodoncia',       true),
  ('d1000000-0000-0000-0000-000000000p03', 'eeeeeeee-0000-0000-0000-000000000001', 'Dr. Dentista B',      'Dentista General', true);

insert into agenda.servicios (id, empresa_id, nombre, duracion_min, precio_referencial) values
  ('d1000000-0000-0000-0000-000000000s01', 'dddddddd-0000-0000-0000-000000000001', 'Limpieza A',    30,  80.00),
  ('d1000000-0000-0000-0000-000000000s02', 'eeeeeeee-0000-0000-0000-000000000001', 'Limpieza B',    30,  80.00);

insert into agenda.pacientes (id, empresa_id, nombre, telefono, acepta_whatsapp) values
  ('d1000000-0000-0000-0000-000000000q01', 'dddddddd-0000-0000-0000-000000000001', 'Paciente A1', '51900000001', true),
  ('d1000000-0000-0000-0000-000000000q02', 'dddddddd-0000-0000-0000-000000000001', 'Paciente A2', '51900000002', true),
  ('d1000000-0000-0000-0000-000000000q03', 'eeeeeeee-0000-0000-0000-000000000001', 'Paciente B1', '51900000003', true);

-- Citas: 2 de empresa A (una por cada profesional) y 1 de empresa B
insert into agenda.citas
  (id, empresa_id, profesional_id, servicio_id, paciente_id, inicio, fin, estado)
values
  ('d1000000-0000-0000-0000-000000000ci1', 'dddddddd-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000p01', 'd1000000-0000-0000-0000-000000000s01',
   'd1000000-0000-0000-0000-000000000q01',
   '2026-11-10 09:00:00+00', '2026-11-10 09:30:00+00', 'reservada'),
  ('d1000000-0000-0000-0000-000000000ci2', 'dddddddd-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000p02', 'd1000000-0000-0000-0000-000000000s01',
   'd1000000-0000-0000-0000-000000000q02',
   '2026-11-10 10:00:00+00', '2026-11-10 10:30:00+00', 'confirmada'),
  ('d1000000-0000-0000-0000-000000000ci3', 'eeeeeeee-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000p03', 'd1000000-0000-0000-0000-000000000s02',
   'd1000000-0000-0000-0000-000000000q03',
   '2026-11-10 09:00:00+00', '2026-11-10 09:30:00+00', 'reservada');

insert into agenda.mensajes_whatsapp
  (id, empresa_id, cita_id, plantilla, telefono, tipo, estado)
values
  ('d1000000-0000-0000-0000-000000000wh1', 'dddddddd-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000ci1', 'confirmacion_v1', '51900000001', 'confirmacion', 'enviado'),
  ('d1000000-0000-0000-0000-000000000wh2', 'eeeeeeee-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000ci3', 'confirmacion_v1', '51900000003', 'confirmacion', 'enviado');

-- =============================================================================
-- PRUEBA 1–3: Aislamiento entre empresas (admin de empresa A)
-- =============================================================================
set local role authenticated;
select set_config('request.jwt.claim.sub', 'c1000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

select is(
  (select count(*)::int from agenda.citas where empresa_id = 'eeeeeeee-0000-0000-0000-000000000001'),
  0,
  '1. Admin A NO puede ver citas de empresa B');

select is(
  (select count(*)::int from agenda.pacientes where empresa_id = 'eeeeeeee-0000-0000-0000-000000000001'),
  0,
  '2. Admin A NO puede ver pacientes de empresa B');

select is(
  (select count(*)::int from agenda.profesionales where empresa_id = 'eeeeeeee-0000-0000-0000-000000000001'),
  0,
  '3. Admin A NO puede ver profesionales de empresa B');

-- =============================================================================
-- PRUEBA 4–5: Admin de empresa A ve TODAS las citas de su empresa
-- =============================================================================
select is(
  (select count(*)::int from agenda.citas),
  2,
  '4. Admin A ve exactamente las 2 citas de su empresa');

select is(
  (select count(*)::int from agenda.pacientes),
  2,
  '5. Admin A ve exactamente los 2 pacientes de su empresa');

-- =============================================================================
-- PRUEBA 6: Rol profesional (supervisor) solo ve SUS citas
-- =============================================================================
set local role authenticated;
select set_config('request.jwt.claim.sub', 'c1000000-0000-0000-0000-000000000003', true);
select set_config('request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000003","role":"authenticated"}', true);

select is(
  (select count(*)::int from agenda.citas),
  1,
  '6. Profesional Dr. Carlos Mendoza solo ve sus propias citas');

-- =============================================================================
-- PRUEBA 7: Un profesional NO ve las citas de otro profesional de la misma empresa
-- =============================================================================
select is(
  (select count(*)::int from agenda.citas
   where profesional_id = 'd1000000-0000-0000-0000-000000000p02'),
  0,
  '7. Profesional Dr. Mendoza NO ve las citas de Dra. Paredes');

-- =============================================================================
-- PRUEBA 8: Rol recepcion ve citas de su empresa (no de otras)
-- =============================================================================
set local role authenticated;
select set_config('request.jwt.claim.sub', 'c1000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claims',
  '{"sub":"c1000000-0000-0000-0000-000000000002","role":"authenticated"}', true);

select is(
  (select count(*)::int from agenda.citas),
  2,
  '8. Recepcion A ve las 2 citas de su empresa');

select is(
  (select count(*)::int from agenda.citas where empresa_id = 'eeeeeeee-0000-0000-0000-000000000001'),
  0,
  '9. Recepcion A NO ve citas de empresa B');

-- =============================================================================
-- PRUEBA 10–12: Sin escritura directa para authenticated
-- =============================================================================
select throws_ok(
  $$ insert into agenda.citas
       (empresa_id, profesional_id, servicio_id, paciente_id, inicio, fin)
     values (
       'dddddddd-0000-0000-0000-000000000001',
       'd1000000-0000-0000-0000-000000000p01',
       'd1000000-0000-0000-0000-000000000s01',
       'd1000000-0000-0000-0000-000000000q01',
       '2026-11-11 09:00:00+00', '2026-11-11 09:30:00+00'
     ) $$,
  '42501', null,
  '10. Usuario autenticado NO puede insertar en agenda.citas directamente');

select throws_ok(
  $$ insert into agenda.pacientes (empresa_id, nombre, telefono)
     values ('dddddddd-0000-0000-0000-000000000001', 'Nuevo Paciente', '51900000099') $$,
  '42501', null,
  '11. Usuario autenticado NO puede insertar en agenda.pacientes directamente');

select throws_ok(
  $$ insert into agenda.mensajes_whatsapp (empresa_id, plantilla, telefono, tipo)
     values ('dddddddd-0000-0000-0000-000000000001', 'spam_template', '51900000099', 'confirmacion') $$,
  '42501', null,
  '12. Usuario autenticado NO puede insertar en agenda.mensajes_whatsapp directamente');

-- =============================================================================
-- PRUEBA 13–17: service_role accede a todo sin restricción
-- =============================================================================
set local role service_role;

select is(
  (select count(*)::int from agenda.citas),
  3,
  '13. service_role ve TODAS las citas de ambas empresas');

select is(
  (select count(*)::int from agenda.pacientes),
  3,
  '14. service_role ve TODOS los pacientes de ambas empresas');

select is(
  (select count(*)::int from agenda.profesionales),
  3,
  '15. service_role ve TODOS los profesionales de ambas empresas');

select is(
  (select count(*)::int from agenda.mensajes_whatsapp),
  2,
  '16. service_role ve TODOS los mensajes WhatsApp de ambas empresas');

-- service_role puede insertar sin error (RLS bypasseado)
select lives_ok(
  $$ insert into agenda.citas
       (empresa_id, profesional_id, servicio_id, paciente_id, inicio, fin, estado)
     values (
       'eeeeeeee-0000-0000-0000-000000000001',
       'd1000000-0000-0000-0000-000000000p03',
       'd1000000-0000-0000-0000-000000000s02',
       'd1000000-0000-0000-0000-000000000q03',
       '2026-11-11 09:00:00+00', '2026-11-11 09:30:00+00',
       'reservada'
     ) $$,
  '17. service_role puede insertar en agenda.citas sin restriccion de RLS');

select * from finish();
rollback;
