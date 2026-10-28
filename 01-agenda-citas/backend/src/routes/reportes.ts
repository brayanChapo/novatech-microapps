import { Hono } from 'hono';
import { z } from 'zod';
import type { Entorno } from '../middleware/auth';
import { requiereRol } from '../lib/permisos';
import { ErrorNegocio } from '../lib/errores';
import { agenda, verificar } from '../lib/supabase';

const esquemaReporte = z.object({
  mes: z.coerce.number().int().min(1).max(12),
  anio: z.coerce.number().int().min(2020).max(2100),
  formato: z.enum(['json', 'csv']).default('json'),
});

interface FilaReporte {
  id: string;
  inicio: string;
  estado: string;
  profesional: string | null;
  servicio: string | null;
  paciente: string | null;
}

export const rutasReportes = new Hono<Entorno>()
  /** GET /reportes/asistencia?mes=&anio=&formato= */
  .get('/reportes/asistencia', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');

    const parsed = esquemaReporte.safeParse({
      mes: c.req.query('mes'),
      anio: c.req.query('anio'),
      formato: c.req.query('formato') ?? 'json',
    });

    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Parámetros de reporte inválidos.', 400, {
        errores: parsed.error.flatten().fieldErrors,
      });
    }

    const { mes, anio, formato } = parsed.data;

    // Calcular rango UTC del mes
    const inicio = new Date(Date.UTC(anio, mes - 1, 1));
    const fin = new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999)); // último día del mes

    const filas = verificar(
      await agenda()
        .from('citas')
        .select(`
          id,
          inicio,
          estado,
          profesional:profesionales(nombre),
          servicio:servicios(nombre),
          paciente:pacientes(nombre)
        `)
        .eq('empresa_id', usuario.empresa_id)
        .gte('inicio', inicio.toISOString())
        .lte('inicio', fin.toISOString())
        .order('inicio'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- supabase retorna any en joins
    ) as any[];

    const datos: FilaReporte[] = filas.map((f) => ({
      id: f.id,
      inicio: f.inicio,
      estado: f.estado,
      profesional: f.profesional?.nombre ?? null,
      servicio: f.servicio?.nombre ?? null,
      paciente: f.paciente?.nombre ?? null,
    }));

    if (formato === 'csv') {
      const cabeceras = ['id', 'inicio', 'estado', 'profesional', 'servicio', 'paciente'];
      const lineas = [
        cabeceras.join(','),
        ...datos.map((d) =>
          cabeceras
            .map((k) => {
              const val = d[k as keyof FilaReporte] ?? '';
              return `"${String(val).replace(/"/g, '""')}"`;
            })
            .join(','),
        ),
      ];

      c.header('Content-Type', 'text/csv; charset=utf-8');
      c.header('Content-Disposition', `attachment; filename="asistencia_${anio}_${mes}.csv"`);
      return c.body(lineas.join('\n'));
    }

    return c.json({
      mes,
      anio,
      total: datos.length,
      asistio: datos.filter((d) => d.estado === 'asistio').length,
      no_asistio: datos.filter((d) => d.estado === 'no_asistio').length,
      cancelada: datos.filter((d) => d.estado === 'cancelada').length,
      citas: datos,
    });
  });
