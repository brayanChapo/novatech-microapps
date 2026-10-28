import { Hono } from 'hono';
import { z } from 'zod';
import type { Entorno } from '../middleware/auth';
import { requiereRol } from '../lib/permisos';
import { ErrorNegocio } from '../lib/errores';
import { agenda, verificar } from '../lib/supabase';

const esquemaCrear = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  telefono: z.string().min(7).max(15),
  documento: z.string().max(15).optional(),
  acepta_whatsapp: z.boolean().default(true),
});

const esquemaActualizar = z.object({
  nombre: z.string().min(2).max(100).optional(),
  telefono: z.string().min(7).max(15).optional(),
  documento: z.string().max(15).nullable().optional(),
  acepta_whatsapp: z.boolean().optional(),
});

export const rutasPacientes = new Hono<Entorno>()
  /** GET /pacientes?q= — búsqueda por nombre o teléfono */
  .get('/pacientes', requiereRol('admin', 'recepcion'), async (c) => {
    const usuario = c.get('usuario');
    const q = c.req.query('q') ?? '';

    if (q.length < 2) {
      return c.json({ pacientes: [] });
    }

    const termino = `%${q}%`;
    const pacientes = verificar(
      await agenda()
        .from('pacientes')
        .select('*')
        .eq('empresa_id', usuario.empresa_id)
        .or(`nombre.ilike.${termino},telefono.ilike.${termino}`)
        .limit(50)
        .order('nombre'),
    );

    return c.json({ pacientes });
  })

  /** POST /pacientes — crear paciente manualmente */
  .post('/pacientes', requiereRol('admin', 'recepcion'), async (c) => {
    const usuario = c.get('usuario');

    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'El cuerpo debe ser JSON válido.', 400);
    }

    const parsed = esquemaCrear.safeParse(bodyRaw);
    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Datos de paciente inválidos.', 400, {
        errores: parsed.error.flatten().fieldErrors,
      });
    }

    const paciente = verificar(
      await agenda()
        .from('pacientes')
        .insert({ empresa_id: usuario.empresa_id, ...parsed.data })
        .select()
        .single(),
    );

    return c.json({ paciente }, 201);
  })

  /** PATCH /pacientes/:id — actualizar datos del paciente */
  .patch('/pacientes/:id', requiereRol('admin', 'recepcion'), async (c) => {
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

    const paciente = verificar(
      await agenda()
        .from('pacientes')
        .update(parsed.data)
        .eq('id', id)
        .eq('empresa_id', usuario.empresa_id)
        .select()
        .single(),
    );

    if (!paciente) {
      throw new ErrorNegocio('NO_ENCONTRADO', 'Paciente no encontrado.', 404);
    }

    return c.json({ paciente });
  });
