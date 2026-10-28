import type {
  ConfiguracionAsistencia,
  EstadoMarcacion,
  Horario,
  Local,
  Marcacion,
  TipoMarcacion,
} from '../domain/tipos';

export interface Asignacion {
  local: Local;
  horario: Horario;
}

export interface NuevaMarcacion {
  empresa_id: string;
  colaborador_id: string;
  local_id: string;
  tipo: TipoMarcacion;
  marcado_en: string;
  fecha_local: string;
  lat: number;
  lng: number;
  precision_m: number;
  distancia_m: number;
  dentro_geocerca: boolean;
  estado: EstadoMarcacion;
  ubicacion_simulada: boolean;
  dispositivo: Record<string, unknown>;
}

/**
 * Puerto de acceso a datos para el caso de uso de marcación.
 * Implementación real: SupabaseMarcacionRepo. En pruebas: repositorio en memoria.
 */
export interface MarcacionRepo {
  zonaHoraria(empresaId: string): Promise<string>;
  configuracion(empresaId: string): Promise<ConfiguracionAsistencia>;
  asignacionVigente(colaboradorId: string, fecha: string): Promise<Asignacion | null>;
  marcacionesDelDia(colaboradorId: string, fecha: string): Promise<Marcacion[]>;
  /** Debe lanzar ErrorNegocio('MARCACION_DUPLICADA') si viola el índice único. */
  insertar(nueva: NuevaMarcacion): Promise<Marcacion>;
}

export const CONFIGURACION_POR_DEFECTO: ConfiguracionAsistencia = {
  precision_max_m: 50,
  politica_fuera_geocerca: 'rechazar',
  permitir_ubicacion_simulada: false,
};
