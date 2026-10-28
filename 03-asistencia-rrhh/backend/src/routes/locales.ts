import { Hono } from 'hono';
import { ErrorNegocio } from '../lib/errores';
import { localesPermitidos } from '../lib/permisos';
import { asistencia, verificar } from '../lib/supabase';
import { esquemas, uuid, validar } from '../lib/validacion';
import { requiereRol, type Entorno } from '../middleware/auth';

const CAMPOS = 'id, nombre, direccion, lat, lng, radio_m, activo, creado_en';

export const rutasLocales = new Hono<Entorno>()
  .get('/locales', requiereRol('admin', 'supervisor'), async (c) => {
    const usuario = c.get('usuario');
    const permitidos = await localesPermitidos(usuario);
    let q = asistencia().from('locales').select(CAMPOS).eq('empresa_id', usuario.empresa_id).order('nombre');
    if (permitidos) q = q.in('id', permitidos.length ? permitidos : ['00000000-0000-0000-0000-000000000000']);
    return c.json({ locales: verificar(await q) });
  })

  .post('/locales', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');
    const datos = validar(esquemas.local, await c.req.json().catch(() => ({})));
    const local = verificar(
      await asistencia().from('locales').insert({ ...datos, empresa_id: usuario.empresa_id }).select(CAMPOS).single(),
    );
    return c.json({ local }, 201);
  })

  .patch('/locales/:id', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');
    const id = validar(uuid, c.req.param('id'));
    const cambios = validar(esquemas.localParcial, await c.req.json().catch(() => ({})));

    const local = verificar(
      await asistencia()
        .from('locales')
        .update(cambios)
        .eq('id', id)
        .eq('empresa_id', usuario.empresa_id)
        .select(CAMPOS)
        .maybeSingle(),
    );
    if (!local) throw new ErrorNegocio('NO_ENCONTRADO', 'El local no existe.', 404);
    return c.json({ local });
  });
