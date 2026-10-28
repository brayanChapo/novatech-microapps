import { Hono } from 'hono';
import { momentoLocal } from '../domain/tiempo';
import { ErrorNegocio } from '../lib/errores';
import { asegurarAccesoLocal, localesPermitidos } from '../lib/permisos';
import { asistencia, core, verificar } from '../lib/supabase';
import { fechaIso, uuid, validar } from '../lib/validacion';
import { requiereRol, type Entorno } from '../middleware/auth';
import { SupabaseMarcacionRepo } from '../repos/supabase-marcacion.repo';

const repo = new SupabaseMarcacionRepo();

interface FilaResumen {
  local_id: string;
  local_nombre: string;
  lat: number;
  lng: number;
  radio_m: number;
  programados: number;
  presentes: number;
  tardanzas: number;
  sin_marcar: number;
  salidas: number;
  observadas: number;
}

async function fechaConsulta(empresaId: string, valor?: string): Promise<string> {
  if (valor) return validar(fechaIso, valor);
  return momentoLocal(new Date(), await repo.zonaHoraria(empresaId)).fecha;
}

export const rutasDashboard = new Hono<Entorno>()
  .use('/dashboard/*', requiereRol('admin', 'supervisor'))

  /** Dashboard general: indicadores por local y totales de la empresa. */
  .get('/dashboard/resumen', async (c) => {
    const usuario = c.get('usuario');
    const fecha = await fechaConsulta(usuario.empresa_id, c.req.query('fecha'));
    const permitidos = await localesPermitidos(usuario);

    if (permitidos && permitidos.length === 0) {
      return c.json({ fecha, totales: totales([]), locales: [] });
    }

    const filas = (verificar(
      await asistencia().rpc('resumen_por_local', {
        p_empresa: usuario.empresa_id,
        p_fecha: fecha,
        p_locales: permitidos,
      }),
    ) ?? []) as FilaResumen[];

    const locales = filas.map((f) => ({
      ...f,
      programados: Number(f.programados),
      presentes: Number(f.presentes),
      tardanzas: Number(f.tardanzas),
      sin_marcar: Number(f.sin_marcar),
      salidas: Number(f.salidas),
      observadas: Number(f.observadas),
      porcentaje_asistencia: f.programados > 0 ? Math.round((Number(f.presentes) / Number(f.programados)) * 100) : null,
    }));
    return c.json({ fecha, totales: totales(locales), locales });
  })

  /** Detalle de un local: quién llegó, quién falta y a qué hora. */
  .get('/dashboard/locales/:localId', async (c) => {
    const usuario = c.get('usuario');
    const localId = validar(uuid, c.req.param('localId'));
    await asegurarAccesoLocal(usuario, localId);
    const fecha = await fechaConsulta(usuario.empresa_id, c.req.query('fecha'));

    const local = verificar(
      await asistencia()
        .from('locales')
        .select('id, nombre, direccion, lat, lng, radio_m, activo')
        .eq('id', localId)
        .eq('empresa_id', usuario.empresa_id)
        .maybeSingle(),
    );
    if (!local) throw new ErrorNegocio('NO_ENCONTRADO', 'El local no existe.', 404);

    const personas = verificar(
      await asistencia().rpc('detalle_local', { p_empresa: usuario.empresa_id, p_local: localId, p_fecha: fecha }),
    );
    return c.json({ fecha, local, personas: personas ?? [] });
  })

  /** Últimas marcaciones (carga inicial del feed en vivo; luego el front escucha Realtime). */
  .get('/dashboard/marcaciones', async (c) => {
    const usuario = c.get('usuario');
    const fecha = await fechaConsulta(usuario.empresa_id, c.req.query('fecha'));
    const localId = c.req.query('local_id');
    const limite = Math.min(Number(c.req.query('limite') ?? 50) || 50, 200);

    let filtroLocales = await localesPermitidos(usuario);
    if (localId) {
      validar(uuid, localId);
      await asegurarAccesoLocal(usuario, localId);
      filtroLocales = [localId];
    }

    let consulta = asistencia()
      .from('marcaciones')
      .select('id, colaborador_id, local_id, tipo, estado, marcado_en, distancia_m, dentro_geocerca, precision_m')
      .eq('empresa_id', usuario.empresa_id)
      .eq('fecha_local', fecha)
      .order('marcado_en', { ascending: false })
      .limit(limite);
    if (filtroLocales) consulta = consulta.in('local_id', filtroLocales);

    const marcaciones = verificar(await consulta) as { colaborador_id: string; local_id: string }[];
    const nombres = await nombresPorId(usuario.empresa_id, marcaciones.map((m) => m.colaborador_id));
    return c.json({
      fecha,
      marcaciones: marcaciones.map((m) => ({ ...m, colaborador_nombre: nombres.get(m.colaborador_id) ?? '—' })),
    });
  });

/** PostgREST no une tablas entre esquemas: se resuelven los nombres en una segunda consulta. */
export async function nombresPorId(empresaId: string, ids: string[]): Promise<Map<string, string>> {
  const unicos = [...new Set(ids)];
  if (unicos.length === 0) return new Map();
  const filas = verificar(
    await core().from('perfiles').select('id, nombre').eq('empresa_id', empresaId).in('id', unicos),
  ) as { id: string; nombre: string }[];
  return new Map(filas.map((f) => [f.id, f.nombre]));
}

function totales(locales: Pick<FilaResumen, 'programados' | 'presentes' | 'tardanzas' | 'sin_marcar' | 'salidas' | 'observadas'>[]) {
  const suma = (k: keyof (typeof locales)[number]) => locales.reduce((s, l) => s + Number(l[k]), 0);
  const programados = suma('programados');
  const presentes = suma('presentes');
  return {
    locales: locales.length,
    programados,
    presentes,
    tardanzas: suma('tardanzas'),
    sin_marcar: suma('sin_marcar'),
    salidas: suma('salidas'),
    observadas: suma('observadas'),
    porcentaje_asistencia: programados > 0 ? Math.round((presentes / programados) * 100) : null,
  };
}
