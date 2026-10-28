import { Hono } from 'hono';
import { minutosDeHora } from '../domain/tiempo';
import { ErrorNegocio } from '../lib/errores';
import { asistencia, verificar } from '../lib/supabase';
import { esquemas, validar } from '../lib/validacion';
import { requiereRol, type Entorno } from '../middleware/auth';

const CAMPOS = 'id, nombre, hora_entrada, hora_salida, tolerancia_min, dias_semana';

export const rutasHorarios = new Hono<Entorno>()
  .get('/horarios', requiereRol('admin', 'supervisor'), async (c) => {
    const usuario = c.get('usuario');
    const horarios = verificar(
      await asistencia().from('horarios').select(CAMPOS).eq('empresa_id', usuario.empresa_id).order('nombre'),
    );
    return c.json({ horarios });
  })

  .post('/horarios', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');
    const datos = validar(esquemas.horario, await c.req.json().catch(() => ({})));
    if (minutosDeHora(datos.hora_salida) <= minutosDeHora(datos.hora_entrada)) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'La hora de salida debe ser posterior a la de entrada.', 400);
    }
    const horario = verificar(
      await asistencia()
        .from('horarios')
        .insert({ ...datos, dias_semana: [...new Set(datos.dias_semana)].sort(), empresa_id: usuario.empresa_id })
        .select(CAMPOS)
        .single(),
    );
    return c.json({ horario }, 201);
  });
