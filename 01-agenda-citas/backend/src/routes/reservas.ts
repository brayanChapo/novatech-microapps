import { Hono } from 'hono';
import { z } from 'zod';
import { rateLimitPorIp, rateLimitPorTelefono } from '../middleware/rate-limit';
import { calcularSlots } from '../domain/slots';
import { ErrorNegocio } from '../lib/errores';
import { SupabaseCitaRepo } from '../repos/supabase-cita.repo';
import { crearReserva } from '../services/reserva.service';

const repo = new SupabaseCitaRepo();

/** Esquema de validación para crear una reserva pública */
const esquemaReserva = z.object({
  empresa_id: z.string().uuid({ message: 'empresa_id debe ser un UUID válido.' }),
  profesional_id: z.string().uuid({ message: 'profesional_id debe ser un UUID válido.' }),
  servicio_id: z.string().uuid({ message: 'servicio_id debe ser un UUID válido.' }),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha debe tener formato YYYY-MM-DD.' }),
  hora: z.string().regex(/^\d{2}:\d{2}$/, { message: 'hora debe tener formato HH:MM.' }),
  nombre_paciente: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  telefono: z.string().min(7, 'El teléfono es demasiado corto.').max(15),
});

/** Esquema de validación para consultar slots */
const esquemaSlots = z.object({
  empresa_id: z.string().uuid(),
  profesional_id: z.string().uuid(),
  servicio_id: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const rutasReservas = new Hono()
  /** GET /reservas/slots — consulta pública de disponibilidad */
  .get('/reservas/slots', async (c) => {
    const parsed = esquemaSlots.safeParse({
      empresa_id: c.req.query('empresa_id'),
      profesional_id: c.req.query('profesional_id'),
      servicio_id: c.req.query('servicio_id'),
      fecha: c.req.query('fecha'),
    });

    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Parámetros de consulta inválidos.', 400, {
        errores: parsed.error.flatten().fieldErrors,
      });
    }

    const { empresa_id, profesional_id, servicio_id, fecha } = parsed.data;

    const servicios = await repo.servicios(empresa_id);
    const servicio = servicios.find((s) => s.id === servicio_id);
    if (!servicio) {
      throw new ErrorNegocio('NO_ENCONTRADO', 'Servicio no encontrado.', 404);
    }

    const [anio, mes, dia] = fecha.split('-').map(Number) as [number, number, number];
    const fechaBase = new Date(Date.UTC(anio, mes - 1, dia));

    const [disponibilidad, citasExistentes] = await Promise.all([
      repo.disponibilidadPorProfesional(empresa_id, profesional_id),
      repo.citasPorProfesionalYFecha(empresa_id, profesional_id, fechaBase),
    ]);

    const slots = calcularSlots(
      disponibilidad,
      citasExistentes.map((c) => ({ inicio: new Date(c.inicio), fin: new Date(c.fin) })),
      fechaBase,
      servicio.duracion_min,
    );

    return c.json({
      fecha,
      profesional_id,
      servicio_id,
      duracion_min: servicio.duracion_min,
      slots: slots.map((s) => ({
        inicio: s.inicio.toISOString(),
        fin: s.fin.toISOString(),
        disponible: s.disponible,
      })),
    });
  })

  /** POST /reservas — creación pública de cita con rate limit */
  .post('/reservas', rateLimitPorIp, rateLimitPorTelefono, async (c) => {
    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'El cuerpo de la solicitud debe ser JSON válido.', 400);
    }

    const parsed = esquemaReserva.safeParse(bodyRaw);
    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Datos de reserva inválidos.', 400, {
        errores: parsed.error.flatten().fieldErrors,
      });
    }

    const resultado = await crearReserva(parsed.data, repo);

    return c.json(
      {
        cita: resultado.cita,
        mensaje: resultado.mensaje,
      },
      201,
    );
  });
