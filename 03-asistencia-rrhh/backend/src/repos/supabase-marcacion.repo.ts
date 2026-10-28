import type { ConfiguracionAsistencia, Marcacion } from '../domain/tipos';
import { ErrorNegocio } from '../lib/errores';
import { asistencia, core, verificar } from '../lib/supabase';
import {
  CONFIGURACION_POR_DEFECTO,
  type Asignacion,
  type MarcacionRepo,
  type NuevaMarcacion,
} from './marcacion.repo';

export class SupabaseMarcacionRepo implements MarcacionRepo {
  async zonaHoraria(empresaId: string): Promise<string> {
    const data = verificar(
      await core().from('empresas').select('zona_horaria').eq('id', empresaId).maybeSingle(),
    ) as { zona_horaria: string } | null;
    return data?.zona_horaria ?? 'America/Lima';
  }

  async configuracion(empresaId: string): Promise<ConfiguracionAsistencia> {
    const data = verificar(
      await asistencia()
        .from('configuracion')
        .select('precision_max_m, politica_fuera_geocerca, permitir_ubicacion_simulada')
        .eq('empresa_id', empresaId)
        .maybeSingle(),
    ) as ConfiguracionAsistencia | null;
    return data ?? CONFIGURACION_POR_DEFECTO;
  }

  async asignacionVigente(colaboradorId: string, fecha: string): Promise<Asignacion | null> {
    const data = verificar(
      await asistencia()
        .from('asignaciones')
        .select(
          'local:locales(id, nombre, lat, lng, radio_m, activo), horario:horarios(id, nombre, hora_entrada, hora_salida, tolerancia_min, dias_semana)',
        )
        .eq('colaborador_id', colaboradorId)
        .lte('vigente_desde', fecha)
        .or(`vigente_hasta.is.null,vigente_hasta.gte.${fecha}`)
        .order('vigente_desde', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ) as { local: (Asignacion['local'] & { activo: boolean }) | null; horario: Asignacion['horario'] | null } | null;

    if (!data?.local || !data.horario || !data.local.activo) return null;
    const { activo: _activo, ...local } = data.local;
    return { local, horario: data.horario };
  }

  async marcacionesDelDia(colaboradorId: string, fecha: string): Promise<Marcacion[]> {
    return verificar(
      await asistencia()
        .from('marcaciones')
        .select('*')
        .eq('colaborador_id', colaboradorId)
        .eq('fecha_local', fecha)
        .order('marcado_en'),
    ) as Marcacion[];
  }

  async insertar(nueva: NuevaMarcacion): Promise<Marcacion> {
    const { data, error } = await asistencia().from('marcaciones').insert(nueva).select('*').single();
    if (error?.code === '23505') {
      throw new ErrorNegocio('MARCACION_DUPLICADA', `Tu ${nueva.tipo} de hoy ya estaba registrada.`, 409);
    }
    return verificar({ data, error }) as Marcacion;
  }
}
