-- =============================================================================
-- Datos de DEMOSTRACIÓN · Agenda de citas (solo entornos local y demo)
-- NUNCA ejecutar en producción.
-- Empresa demo: reutiliza el UUID '00000000-0000-0000-0000-00000000e001'
-- definido en 03-asistencia-rrhh/database/seed.sql (ya existe en core.empresas).
-- =============================================================================

-- La empresa demo ya fue insertada por el seed de app 03 o el seed de core.
-- Solo la referenciamos aquí; el on conflict evita duplicados si se ejecuta solo.
insert into core.empresas (id, nombre, ruc, zona_horaria) values
  ('00000000-0000-0000-0000-00000000e001', 'Empresa Demo S.A.C.', null, 'America/Lima')
on conflict (id) do nothing;

-- =============================================================================
-- PROFESIONALES (3 dentistas)
-- =============================================================================
insert into agenda.profesionales (id, empresa_id, nombre, especialidad, activo) values
  ('a0000000-0000-0000-0000-00000000pro1', '00000000-0000-0000-0000-00000000e001',
   'Dr. Carlos Mendoza',    'Dentista General',  true),
  ('a0000000-0000-0000-0000-00000000pro2', '00000000-0000-0000-0000-00000000e001',
   'Dra. Lucía Paredes',    'Ortodoncia',        true),
  ('a0000000-0000-0000-0000-00000000pro3', '00000000-0000-0000-0000-00000000e001',
   'Dr. Fernando Castillo', 'Endodoncia',        true)
on conflict (id) do nothing;

-- =============================================================================
-- SERVICIOS (5 tratamientos dentales)
-- =============================================================================
insert into agenda.servicios (id, empresa_id, nombre, duracion_min, precio_referencial) values
  ('a0000000-0000-0000-0000-00000000srv1', '00000000-0000-0000-0000-00000000e001',
   'Limpieza dental',          30,  80.00),
  ('a0000000-0000-0000-0000-00000000srv2', '00000000-0000-0000-0000-00000000e001',
   'Consulta general',         45, 100.00),
  ('a0000000-0000-0000-0000-00000000srv3', '00000000-0000-0000-0000-00000000e001',
   'Ortodoncia – revisión',    30, 120.00),
  ('a0000000-0000-0000-0000-00000000srv4', '00000000-0000-0000-0000-00000000e001',
   'Extracción simple',        60, 150.00),
  ('a0000000-0000-0000-0000-00000000srv5', '00000000-0000-0000-0000-00000000e001',
   'Endodoncia',               90, 350.00)
on conflict (id) do nothing;

-- =============================================================================
-- DISPONIBILIDAD: Lun–Vie, bloque 9:00-13:00 y 15:00-19:00 por cada profesional
-- dia_semana ISO: 1=lun, 2=mar, 3=mié, 4=jue, 5=vie
-- =============================================================================
insert into agenda.disponibilidad
  (id, empresa_id, profesional_id, dia_semana, hora_inicio, hora_fin)
select
  gen_random_uuid(),
  '00000000-0000-0000-0000-00000000e001',
  prof.id,
  dia.dia,
  bloque.hora_inicio::time,
  bloque.hora_fin::time
from
  (values
    ('a0000000-0000-0000-0000-00000000pro1'),
    ('a0000000-0000-0000-0000-00000000pro2'),
    ('a0000000-0000-0000-0000-00000000pro3')
  ) as prof(id)
cross join
  (values (1),(2),(3),(4),(5)) as dia(dia)
cross join
  (values ('09:00', '13:00'), ('15:00', '19:00')) as bloque(hora_inicio, hora_fin)
on conflict do nothing;

-- =============================================================================
-- PACIENTES (10 pacientes demo)
-- =============================================================================
insert into agenda.pacientes
  (id, empresa_id, nombre, telefono, documento, acepta_whatsapp)
values
  ('a0000000-0000-0000-0000-00000000pac1', '00000000-0000-0000-0000-00000000e001',
   'María García López',    '51987001001', '71234001', true),
  ('a0000000-0000-0000-0000-00000000pac2', '00000000-0000-0000-0000-00000000e001',
   'José Torres Ríos',      '51987001002', '71234002', true),
  ('a0000000-0000-0000-0000-00000000pac3', '00000000-0000-0000-0000-00000000e001',
   'Ana Flores Díaz',       '51987001003', '71234003', false),
  ('a0000000-0000-0000-0000-00000000pac4', '00000000-0000-0000-0000-00000000e001',
   'Luis Ramírez Vega',     '51987001004', '71234004', true),
  ('a0000000-0000-0000-0000-00000000pac5', '00000000-0000-0000-0000-00000000e001',
   'Carmen Huanca Soto',    '51987001005', '71234005', true),
  ('a0000000-0000-0000-0000-00000000pac6', '00000000-0000-0000-0000-00000000e001',
   'Roberto Salas Peña',    '51987001006', '71234006', true),
  ('a0000000-0000-0000-0000-00000000pac7', '00000000-0000-0000-0000-00000000e001',
   'Sofía Medina Ccori',    '51987001007', '71234007', true),
  ('a0000000-0000-0000-0000-00000000pac8', '00000000-0000-0000-0000-00000000e001',
   'Diego Quispe Mamani',   '51987001008', '71234008', false),
  ('a0000000-0000-0000-0000-00000000pac9', '00000000-0000-0000-0000-00000000e001',
   'Valeria Rojas Aguirre', '51987001009', '71234009', true),
  ('a0000000-0000-0000-0000-00000000pa10', '00000000-0000-0000-0000-00000000e001',
   'Andrés Chávez León',    '51987001010', '71234010', true)
on conflict (id) do nothing;

-- =============================================================================
-- CITAS (10 citas en distintos estados)
-- Fechas relativas a una semana de trabajo de ejemplo (2026-11-03 al 2026-11-07)
-- =============================================================================
insert into agenda.citas
  (id, empresa_id, profesional_id, servicio_id, paciente_id,
   inicio, fin, estado, origen,
   recordatorio_enviado, recordatorio_enviado_en,
   cancelado_motivo, asistencia_marcada_en)
values
  -- Cita 1: reservada (futura)
  ('a0000000-0000-0000-0000-000000000c01',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro1',
   'a0000000-0000-0000-0000-00000000srv1',
   'a0000000-0000-0000-0000-00000000pac1',
   '2026-11-03 09:00:00+00', '2026-11-03 09:30:00+00',
   'reservada', 'publico', false, null, null, null),

  -- Cita 2: confirmada con recordatorio enviado
  ('a0000000-0000-0000-0000-000000000c02',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro1',
   'a0000000-0000-0000-0000-00000000srv2',
   'a0000000-0000-0000-0000-00000000pac2',
   '2026-11-03 10:00:00+00', '2026-11-03 10:45:00+00',
   'confirmada', 'recepcion', true, '2026-11-02 10:00:00+00', null, null),

  -- Cita 3: asistio
  ('a0000000-0000-0000-0000-000000000c03',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro2',
   'a0000000-0000-0000-0000-00000000srv3',
   'a0000000-0000-0000-0000-00000000pac3',
   '2026-11-03 09:00:00+00', '2026-11-03 09:30:00+00',
   'asistio', 'recepcion', true, '2026-11-02 09:00:00+00', null, '2026-11-03 09:05:00+00'),

  -- Cita 4: cancelada por el paciente
  ('a0000000-0000-0000-0000-000000000c04',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro1',
   'a0000000-0000-0000-0000-00000000srv4',
   'a0000000-0000-0000-0000-00000000pac4',
   '2026-11-04 11:00:00+00', '2026-11-04 12:00:00+00',
   'cancelada', 'publico', false, null, 'Paciente no puede asistir ese día', null),

  -- Cita 5: no_asistio
  ('a0000000-0000-0000-0000-000000000c05',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro3',
   'a0000000-0000-0000-0000-00000000srv5',
   'a0000000-0000-0000-0000-00000000pac5',
   '2026-11-04 09:00:00+00', '2026-11-04 10:30:00+00',
   'no_asistio', 'publico', true, '2026-11-03 09:00:00+00', null, null),

  -- Cita 6: reservada futura
  ('a0000000-0000-0000-0000-000000000c06',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro2',
   'a0000000-0000-0000-0000-00000000srv3',
   'a0000000-0000-0000-0000-00000000pac6',
   '2026-11-05 15:00:00+00', '2026-11-05 15:30:00+00',
   'reservada', 'publico', false, null, null, null),

  -- Cita 7: confirmada
  ('a0000000-0000-0000-0000-000000000c07',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro3',
   'a0000000-0000-0000-0000-00000000srv5',
   'a0000000-0000-0000-0000-00000000pac7',
   '2026-11-05 09:00:00+00', '2026-11-05 10:30:00+00',
   'confirmada', 'recepcion', false, null, null, null),

  -- Cita 8: asistio
  ('a0000000-0000-0000-0000-000000000c08',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro1',
   'a0000000-0000-0000-0000-00000000srv1',
   'a0000000-0000-0000-0000-00000000pac8',
   '2026-11-06 09:00:00+00', '2026-11-06 09:30:00+00',
   'asistio', 'recepcion', true, '2026-11-05 09:00:00+00', null, '2026-11-06 09:03:00+00'),

  -- Cita 9: reservada
  ('a0000000-0000-0000-0000-000000000c09',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro2',
   'a0000000-0000-0000-0000-00000000srv3',
   'a0000000-0000-0000-0000-00000000pac9',
   '2026-11-07 15:00:00+00', '2026-11-07 15:30:00+00',
   'reservada', 'publico', false, null, null, null),

  -- Cita 10: confirmada con recordatorio enviado
  ('a0000000-0000-0000-0000-000000000c10',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-00000000pro3',
   'a0000000-0000-0000-0000-00000000srv5',
   'a0000000-0000-0000-0000-00000000pa10',
   '2026-11-07 09:00:00+00', '2026-11-07 10:30:00+00',
   'confirmada', 'publico', true, '2026-11-06 09:00:00+00', null, null)
on conflict (id) do nothing;

-- =============================================================================
-- MENSAJES DE WHATSAPP (5 mensajes de ejemplo)
-- =============================================================================
insert into agenda.mensajes_whatsapp
  (id, empresa_id, cita_id, plantilla, telefono, estado, meta_message_id, tipo, error_detalle, enviado_en)
values
  -- Confirmación para cita 2
  ('a0000000-0000-0000-0000-000000000m01',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-000000000c02',
   'confirmacion_cita_v1',
   '51987001002', 'enviado', 'wamid.demo001', 'confirmacion', null,
   '2026-11-02 10:00:00+00'),

  -- Recordatorio para cita 3 (asistio)
  ('a0000000-0000-0000-0000-000000000m02',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-000000000c03',
   'recordatorio_24h_v1',
   '51987001003', 'enviado', 'wamid.demo002', 'recordatorio', null,
   '2026-11-02 09:00:00+00'),

  -- Recordatorio para cita 5 (no_asistio)
  ('a0000000-0000-0000-0000-000000000m03',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-000000000c05',
   'recordatorio_24h_v1',
   '51987001005', 'enviado', 'wamid.demo003', 'recordatorio', null,
   '2026-11-03 09:00:00+00'),

  -- Confirmación para cita 8 (asistio)
  ('a0000000-0000-0000-0000-000000000m04',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-000000000c08',
   'confirmacion_cita_v1',
   '51987001008', 'enviado', 'wamid.demo004', 'confirmacion', null,
   '2026-11-05 09:00:00+00'),

  -- Mensaje con error de API Meta (para prueba de error_detalle)
  ('a0000000-0000-0000-0000-000000000m05',
   '00000000-0000-0000-0000-00000000e001',
   'a0000000-0000-0000-0000-000000000c09',
   'recordatorio_24h_v1',
   '51987001009', 'error', null, 'recordatorio',
   '{"code":131030,"title":"Recipient phone number not in allowed list","details":"demo mode"}',
   '2026-11-06 15:00:00+00')
on conflict (id) do nothing;
