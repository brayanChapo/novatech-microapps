import { Hono } from 'hono';
import { z } from 'zod';
import type { Entorno } from '../middleware/auth';
import { requiereRol } from '../lib/permisos';
import { ErrorNegocio } from '../lib/errores';
import { agenda, verificar } from '../lib/supabase';

const esquemaCrear = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  especialidad: z.string().max(100).optional(),
  activo: z.boolean().default(true),
});

const esquemaActualizar = z.object({
  nombre: z.string().min(2).max(100).optional(),
  especialidad: z.string().max(100).nullable().optional(),
  activo: z.boolean().optional(),
});

export const rutasProfesionales = new Hono<Entorno>()
  /** GET /profesionales — listar profesionales activos */
  .get('/profesionales', async (c) => {
    const usuario = c.get('usuario');

    const profesionales = verificar(
      await agenda()
        .from('profesionales')
        .select('*')
        .eq('empresa_id', usuario.empresa_id)
        .eq('activo', true)
        .order('nombre'),
    );

    return c.json({ profesionales });
  })

  /** POST /profesionales — crear profesional (solo admin) */
  .post('/profesionales', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');

    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'El cuerpo debe ser JSON válido.', 400);
    }

    const parsed = esquemaCrear.safeParse(bodyRaw);
    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Datos de profesional inválidos.', 400, {
        errores: parsed.error.flatten().fieldErrors,
      });
    }

    const profesional = verificar(
      await agenda()
        .from('profesionales')
        .insert({ empresa_id: usuario.empresa_id, ...parsed.data })
        .select()
        .single(),
    );

    return c.json({ profesional }, 201);
  })

  /** PATCH /profesionales/:id — actualizar profesional (solo admin) */
  .patch('/profesionales/:id', requiereRol('admin'), async (c) => {
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

    const profesional = verificar(
      await agenda()
        .from('profesionales')
        .update(parsed.data)
        .eq('id', id)
        .eq('empresa_id', usuario.empresa_id)
        .select()
        .single(),
    );

    if (!profesional) {
      throw new ErrorNegocio('NO_ENCONTRADO', 'Profesional no encontrado.', 404);
    }

    return c.json({ profesional });
  });
