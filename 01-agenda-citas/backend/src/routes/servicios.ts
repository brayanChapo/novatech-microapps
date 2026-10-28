import { Hono } from 'hono';
import { z } from 'zod';
import type { Entorno } from '../middleware/auth';
import { requiereRol } from '../lib/permisos';
import { ErrorNegocio } from '../lib/errores';
import { agenda, verificar } from '../lib/supabase';

const esquemaCrear = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  duracion_min: z
    .number({ message: 'duracion_min debe ser un número.' })
    .int()
    .min(5, 'La duración mínima es 5 minutos.')
    .max(480, 'La duración máxima es 480 minutos (8 horas).'),
  precio_referencial: z.number().nonnegative().nullable().optional(),
});

const esquemaActualizar = z.object({
  nombre: z.string().min(2).max(100).optional(),
  duracion_min: z.number().int().min(5).max(480).optional(),
  precio_referencial: z.number().nonnegative().nullable().optional(),
});

export const rutasServicios = new Hono<Entorno>()
  /** GET /servicios — listar servicios de la empresa */
  .get('/servicios', async (c) => {
    const usuario = c.get('usuario');

    const servicios = verificar(
      await agenda()
        .from('servicios')
        .select('*')
        .eq('empresa_id', usuario.empresa_id)
        .order('nombre'),
    );

    return c.json({ servicios });
  })

  /** POST /servicios — crear servicio (solo admin) */
  .post('/servicios', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');

    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'El cuerpo debe ser JSON válido.', 400);
    }

    const parsed = esquemaCrear.safeParse(bodyRaw);
    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Datos de servicio inválidos.', 400, {
        errores: parsed.error.flatten().fieldErrors,
      });
    }

    const servicio = verificar(
      await agenda()
        .from('servicios')
        .insert({ empresa_id: usuario.empresa_id, ...parsed.data })
        .select()
        .single(),
    );

    return c.json({ servicio }, 201);
  })

  /** PATCH /servicios/:id — actualizar servicio (solo admin) */
  .patch('/servicios/:id', requiereRol('admin'), async (c) => {
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

    const servicio = verificar(
      await agenda()
        .from('servicios')
        .update(parsed.data)
        .eq('id', id)
        .eq('empresa_id', usuario.empresa_id)
        .select()
        .single(),
    );

    if (!servicio) {
      throw new ErrorNegocio('NO_ENCONTRADO', 'Servicio no encontrado.', 404);
    }

    return c.json({ servicio });
  });
