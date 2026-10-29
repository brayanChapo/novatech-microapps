-- Seed de datos de prueba para App 01 · Agenda de Citas (entorno local)
-- Empresa de ejemplo
insert into core.empresas (id, nombre, ruc) values
  ('11111111-1111-4111-8111-111111111111', 'Clínica Demo NovaTech', '20600000001')
on conflict do nothing;

-- Profesionales
insert into agenda.profesionales (id, empresa_id, nombre, especialidad) values
  ('a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1', '11111111-1111-4111-8111-111111111111', 'Dr. Carlos Mendoza', 'Medicina General'),
  ('b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2', '11111111-1111-4111-8111-111111111111', 'Dra. Ana Torres', 'Psicología')
on conflict do nothing;

-- Servicios
insert into agenda.servicios (id, empresa_id, nombre, duracion_min, precio_referencial) values
  ('c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c3c3', '11111111-1111-4111-8111-111111111111', 'Consulta General', 30, 50.00),
  ('d4d4d4d4-d4d4-4d4d-8d4d-d4d4d4d4d4d4', '11111111-1111-4111-8111-111111111111', 'Sesión de Psicología', 60, 120.00)
on conflict do nothing;

-- Disponibilidad: lunes a viernes 09:00-17:00 para ambos profesionales
insert into agenda.disponibilidad (empresa_id, profesional_id, dia_semana, hora_inicio, hora_fin)
select
  '11111111-1111-4111-8111-111111111111',
  prof_id,
  dia,
  '09:00',
  '17:00'
from
  (values
    ('a1a1a1a1-a1a1-4a1a-8a1a-a1a1a1a1a1a1'::uuid),
    ('b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2'::uuid)
  ) as profs(prof_id),
  generate_series(1, 5) as dias(dia)
on conflict do nothing;
