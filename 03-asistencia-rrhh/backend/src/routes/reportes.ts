import { Hono } from 'hono';
import { diasEntre, momentoLocal } from '../domain/tiempo';
import { aCsv } from '../lib/csv';
import { ErrorNegocio } from '../lib/errores';
import { asegurarAccesoLocal, localesPermitidos } from '../lib/permisos';
import { asistencia, core, verificar } from '../lib/supabase';
import { fechaIso, uuid, validar } from '../lib/validacion';
import { requiereRol, type Entorno } from '../middleware/auth';
import { SupabaseMarcacionRepo } from '../repos/supabase-marcacion.repo';

const repo = new SupabaseMarcacionRepo();
const MAX_DIAS = 93;

const ESTADOS: Record<string, string> = {
  a_tiempo: 'A tiempo',
  tardanza: 'Tardanza',
  salida: 'Salida',
  salida_anticipada: 'Salida anticipada',
  observada: 'Observada (fuera de local)',
  extra: 'Día no programado',
};

interface FilaReporte {
  colaborador_id: string;
  local_id: string;
  tipo: string;
  estado: string;
  marcado_en: string;
  fecha_local: string;
  distancia_m: number;
  precision_m: number;
  dentro_geocerca: boolean;
  ubicacion_simulada: boolean;
}

export const rutasReportes = new Hono<Entorno>().get(
  '/reportes/marcaciones.csv',
  requiereRol('admin', 'supervisor'),
  async (c) => {
    const usuario = c.get('usuario');
    const desde = validar(fechaIso, c.req.query('desde'));
    const hasta = validar(fechaIso, c.req.query('hasta'));
    const dias = diasEntre(desde, hasta);
    if (dias < 0) throw new ErrorNegocio('DATOS_INVALIDOS', 'La fecha inicial debe ser anterior a la final.', 400);
    if (dias > MAX_DIAS) throw new ErrorNegocio('DATOS_INVALIDOS', `El rango máximo es de ${MAX_DIAS} días.`, 400);

    let locales = await localesPermitidos(usuario);
    const localId = c.req.query('local_id');
    if (localId) {
      validar(uuid, localId);
      await asegurarAccesoLocal(usuario, localId);
      locales = [localId];
    }

    let q = asistencia()
      .from('marcaciones')
      .select('colaborador_id, local_id, tipo, estado, marcado_en, fecha_local, distancia_m, precision_m, dentro_geocerca, ubicacion_simulada')
      .eq('empresa_id', usuario.empresa_id)
      .gte('fecha_local', desde)
      .lte('fecha_local', hasta)
      .order('marcado_en')
      .limit(50_000);
    if (locales) q = q.in('local_id', locales.length ? locales : ['00000000-0000-0000-0000-000000000000']);
    const filas = verificar(await q) as FilaReporte[];

    const [perfiles, listaLocales, zona] = await Promise.all([
      core().from('perfiles').select('id, nombre, documento').eq('empresa_id', usuario.empresa_id),
      asistencia().from('locales').select('id, nombre').eq('empresa_id', usuario.empresa_id),
      repo.zonaHoraria(usuario.empresa_id),
    ]);
    const personas = new Map((verificar(perfiles) as { id: string; nombre: string; documento: string | null }[]).map((p) => [p.id, p]));
    const nombresLocal = new Map((verificar(listaLocales) as { id: string; nombre: string }[]).map((l) => [l.id, l.nombre]));

    const csv = aCsv(
      ['Fecha', 'Hora', 'Tipo', 'Estado', 'Colaborador', 'Documento', 'Local', 'Distancia (m)', 'Precisión GPS (m)', 'Dentro del local', 'Ubicación simulada'],
      filas.map((f) => {
        const p = personas.get(f.colaborador_id);
        return [
          f.fecha_local,
          momentoLocal(new Date(f.marcado_en), zona).hora,
          f.tipo === 'entrada' ? 'Entrada' : 'Salida',
          ESTADOS[f.estado] ?? f.estado,
          p?.nombre ?? '—',
          p?.documento ?? '',
          nombresLocal.get(f.local_id) ?? '—',
          Math.round(f.distancia_m),
          Math.round(f.precision_m),
          f.dentro_geocerca ? 'Sí' : 'No',
          f.ubicacion_simulada ? 'Sí' : 'No',
        ];
      }),
    );

    return c.body(csv, 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="asistencia_${desde}_${hasta}.csv"`,
    });
  },
);
