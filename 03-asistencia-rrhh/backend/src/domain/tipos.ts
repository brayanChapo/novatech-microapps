export type Rol = 'admin' | 'supervisor' | 'colaborador';
export type TipoMarcacion = 'entrada' | 'salida';
export type EstadoMarcacion =
  | 'a_tiempo'
  | 'tardanza'
  | 'salida'
  | 'salida_anticipada'
  | 'observada'
  | 'extra';
export type PoliticaFueraGeocerca = 'rechazar' | 'observar';

export interface Coordenada {
  lat: number;
  lng: number;
}

export interface Local extends Coordenada {
  id: string;
  nombre: string;
  radio_m: number;
}

export interface Horario {
  id: string;
  nombre: string;
  hora_entrada: string; // 'HH:MM' o 'HH:MM:SS'
  hora_salida: string;
  tolerancia_min: number;
  dias_semana: number[]; // ISO 1..7
}

export interface ConfiguracionAsistencia {
  precision_max_m: number;
  politica_fuera_geocerca: PoliticaFueraGeocerca;
  permitir_ubicacion_simulada: boolean;
}

export interface UsuarioAutenticado {
  id: string;
  empresa_id: string;
  nombre: string;
  rol: Rol;
}

export interface Marcacion {
  id: string;
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
}
