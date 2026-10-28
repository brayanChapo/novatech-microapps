import { Hono } from 'hono';
import { z } from 'zod';
import type { Entorno } from '../middleware/auth';
import { requiereRol } from '../lib/permisos';
import { ErrorNegocio } from '../lib/errores';
import { SupabaseCitaRepo } from '../repos/supabase-cita.repo';
import type { EstadoCita } from '../domain/tipos';

const repo = new SupabaseCitaRepo();

const ESTADOS_VALIDOS: EstadoCita[] = ['reservada', 'confirmada', 'cancelada', 'asistio', 'no_asistio'];

const esquemaFiltros = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  profesional_id: z.string().uuid().optional(),
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const esquemaEstado = z.object({
  estado: z.enum(['reservada', 'confirmada', 'cancelada', 'asistio', 'no_asistio']),
});

export const rutasCitas = new Hono<Entorno>()
  /** GET /citas — listar citas del día o rango */
  .get('/citas', async (c) => {
    const usuario = c.get('usuario');
    const q = esquemaFiltros.safeParse({
      fecha: c.req.query('fecha'),
      profesional_id: c.req.query('profesional_id'),
      desde: c.req.query('desde'),
      hasta: c.req.query('hasta'),
    });

    if (!q.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Parámetros de consulta inválidos.', 400);
    }

    const hoy = new Date().toISOString().split('T')[0] ?? '';
    const fechaDesde = q.data.desde ?? q.data.fecha ?? hoy;
    const fechaHasta = q.data.hasta ?? q.data.fecha ?? hoy;

    const [anioD, mesD, diaD] = fechaDesde.split('-').map(Number) as [number, number, number];
    const [anioH, mesH, diaH] = fechaHasta.split('-').map(Number) as [number, number, number];
    const desde = new Date(Date.UTC(anioD, mesD - 1, diaD, 0, 0, 0));
    const hasta = new Date(Date.UTC(anioH, mesH - 1, diaH, 23, 59, 59));

    // El profesional solo ve sus propias citas
    const profesionalId =
      usuario.rol === 'profesional' ? usuario.id : q.data.profesional_id;

    const citas = await repo.citasPorFecha(usuario.empresa_id, desde, hasta, profesionalId);

    return c.json({ citas });
  })

  /** PATCH /citas/:id/estado — cambiar estado de una cita */
  .patch('/citas/:id/estado', requiereRol('admin', 'recepcion'), async (c) => {
    const usuario = c.get('usuario');
    const { id } = c.req.param();

    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'El cuerpo debe ser JSON válido.', 400);
    }

    const parsed = esquemaEstado.safeParse(bodyRaw);
    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', `Estado inválido. Valores válidos: ${ESTADOS_VALIDOS.join(', ')}.`, 400);
    }

    const cita = await repo.actualizarEstado(id, usuario.empresa_id, parsed.data.estado);
    return c.json({ cita });
  })

  /** PATCH /citas/:id/asistencia — marcar asistencia del paciente */
  .patch('/citas/:id/asistencia', requiereRol('admin', 'recepcion', 'profesional'), async (c) => {
    const usuario = c.get('usuario');
    const { id } = c.req.param();

    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'El cuerpo debe ser JSON válido.', 400);
    }

    const esquemaAsistencia = z.object({
      asistio: z.boolean({ message: 'asistio debe ser true o false.' }),
    });

    const parsed = esquemaAsistencia.safeParse(bodyRaw);
    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Campo asistio inválido.', 400);
    }

    const nuevoEstado: EstadoCita = parsed.data.asistio ? 'asistio' : 'no_asistio';
    const cita = await repo.actualizarEstado(id, usuario.empresa_id, nuevoEstado);

    return c.json({ cita });
  })

  /** DELETE /citas/:id — cancelar una cita (no elimina, cambia estado) */
  .delete('/citas/:id', requiereRol('admin', 'recepcion'), async (c) => {
    const usuario = c.get('usuario');
    const { id } = c.req.param();

    const cita = await repo.actualizarEstado(id, usuario.empresa_id, 'cancelada');
    return c.json({ cita, mensaje: 'Cita cancelada correctamente.' });
  });
