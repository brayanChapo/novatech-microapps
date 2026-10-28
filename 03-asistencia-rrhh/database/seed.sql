-- =============================================================================
-- Datos de DEMOSTRACIÓN · Asistencia (solo entornos local y demo, nunca producción)
-- Los usuarios (auth.users + perfiles + asignaciones) se crean con:
--   cd 03-asistencia-rrhh/backend && npm run seed:demo
-- Coordenadas aproximadas de zonas de Lima, solo para pruebas.
-- =============================================================================

insert into core.empresas (id, nombre, ruc, zona_horaria) values
  ('00000000-0000-0000-0000-00000000e001', 'Empresa Demo S.A.C.', null, 'America/Lima')
on conflict (id) do nothing;

insert into asistencia.configuracion (empresa_id, precision_max_m, politica_fuera_geocerca, permitir_ubicacion_simulada) values
  ('00000000-0000-0000-0000-00000000e001', 50, 'rechazar', false)
on conflict (empresa_id) do nothing;

insert into asistencia.locales (id, empresa_id, nombre, direccion, lat, lng, radio_m) values
  ('00000000-0000-0000-0000-0000000010c1', '00000000-0000-0000-0000-00000000e001', 'Sede Miraflores',  'Av. Larco (demo), Miraflores',      -12.121100, -77.029700, 120),
  ('00000000-0000-0000-0000-0000000010c2', '00000000-0000-0000-0000-00000000e001', 'Sede San Isidro',  'Av. Javier Prado (demo), San Isidro', -12.091800, -77.034900, 100),
  ('00000000-0000-0000-0000-0000000010c3', '00000000-0000-0000-0000-00000000e001', 'Almacén Ate',      'Carretera Central (demo), Ate',      -12.046400, -76.944600, 250)
on conflict (id) do nothing;

insert into asistencia.horarios (id, empresa_id, nombre, hora_entrada, hora_salida, tolerancia_min, dias_semana) values
  ('00000000-0000-0000-0000-0000000040a1', '00000000-0000-0000-0000-00000000e001', 'Oficina L-V 08:30-17:30', '08:30', '17:30', 10, '{1,2,3,4,5}'),
  ('00000000-0000-0000-0000-0000000040a2', '00000000-0000-0000-0000-00000000e001', 'Almacén L-S 07:00-16:00', '07:00', '16:00', 5,  '{1,2,3,4,5,6}')
on conflict (id) do nothing;
