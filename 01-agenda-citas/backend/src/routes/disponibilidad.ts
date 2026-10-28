import { Hono } from 'hono';
import { z } from 'zod';
import type { Entorno } from '../middleware/auth';
import { requiereRol } from '../lib/permisos';
import { ErrorNegocio } from '../lib/errores';
import { agenda, verificar } from '../lib/supabase';

const esquemaCrear = z.object({
  profesional_id: z.string().uuid({ message: 'profesional_id debe ser un UUID válido.' }),
  dia_semana: z
    .number({ message: 'dia_semana debe ser un número.' })
    .int()
    .min(1, 'dia_semana mínimo es 1 (lunes).')
    .max(7, 'dia_semana máximo es 7 (domingo).'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, { message: 'hora_inicio debe tener formato HH:MM.' }),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/, { message: 'hora_fin debe tener formato HH:MM.' }),
}).refine(
  (d) => d.hora_inicio < d.hora_fin,
  { message: 'hora_inicio debe ser anterior a hora_fin.' },
);

const esquemaActualizar = z.object({
  dia_semana: z.number().int().min(1).max(7).optional(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const rutasDisponibilidad = new Hono<Entorno>()
  /** GET /disponibilidad?profesional_id= — consultar disponibilidad */
  .get('/disponibilidad', async (c) => {
    const usuario = c.get('usuario');
    const profesionalId = c.req.query('profesional_id');

    let query = agenda()
      .from('disponibilidad')
      .select('*')
      .eq('empresa_id', usuario.empresa_id)
      .order('dia_semana')
      .order('hora_inicio');

    if (profesionalId) {
      query = query.eq('profesional_id', profesionalId);
    }

    const disponibilidad = verificar(await query);
    return c.json({ disponibilidad });
  })

  /** POST /disponibilidad — crear bloque de disponibilidad (admin) */
  .post('/disponibilidad', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');

    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'El cuerpo debe ser JSON válido.', 400);
    }

    const parsed = esquemaCrear.safeParse(bodyRaw);
    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Datos de disponibilidad inválidos.', 400, {
        errores: parsed.error.flatten().fieldErrors,
      });
    }

    const disponibilidad = verificar(
      await agenda()
        .from('disponibilidad')
        .insert({ empresa_id: usuario.empresa_id, ...parsed.data })
        .select()
        .single(),
    );

    return c.json({ disponibilidad }, 201);
  })

  /** PUT /disponibilidad/:id — reemplazar bloque (admin) */
  .put('/disponibilidad/:id', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');
    const { id } = c.req.param();

    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'El cuerpo debe ser JSON válido.', 400);
    }

    const parsed = esquemaActualizar.safeParse(bodyRaw);
    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Datos de actualización inválidos.', 400, {
        errores: parsed.error.flatten().fieldErrors,
      });
    }

    const disponibilidad = verificar(
      await agenda()
        .from('disponibilidad')
        .update(parsed.data)
        .eq('id', id)
        .eq('empresa_id', usuario.empresa_id)
        .select()
        .single(),
    );

    if (!disponibilidad) {
      throw new ErrorNegocio('NO_ENCONTRADO', 'Bloque de disponibilidad no encontrado.', 404);
    }

    return c.json({ disponibilidad });
  })

  /** DELETE /disponibilidad/:id — eliminar bloque (admin) */
  .delete('/disponibilidad/:id', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');
    const { id } = c.req.param();

    verificar(
      await agenda()
        .from('disponibilidad')
        .delete()
        .eq('id', id)
        .eq('empresa_id', usuario.empresa_id),
    );

    return c.json({ mensaje: 'Bloque de disponibilidad eliminado.' }, 200);
  });
