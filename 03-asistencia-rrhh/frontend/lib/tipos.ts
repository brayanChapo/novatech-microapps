export type Rol = 'admin' | 'supervisor' | 'colaborador';

export interface Usuario { id: string; empresa_id: string; nombre: string; rol: Rol }

export interface ResumenLocal {
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
  porcentaje_asistencia: number | null;
}

export interface Totales {
  locales: number;
  programados: number;
  presentes: number;
  tardanzas: number;
  sin_marcar: number;
  salidas: number;
  observadas: number;
  porcentaje_asistencia: number | null;
}

export interface MarcacionFeed {
  id: string;
  colaborador_id: string;
  colaborador_nombre: string;
  local_id: string;
  tipo: 'entrada' | 'salida';
  estado: string;
  marcado_en: string;
  distancia_m: number;
  dentro_geocerca: boolean;
}

export interface PersonaLocal {
  colaborador_id: string;
  nombre: string;
  documento: string | null;
  hora_entrada_prog: string | null;
  hora_salida_prog: string | null;
  entrada_en: string | null;
  estado_entrada: string | null;
  distancia_entrada: number | null;
  salida_en: string | null;
  estado_salida: string | null;
  situacion: 'sin_marcar' | 'en_local' | 'jornada_cerrada';
}

export interface Local {
  id: string;
  nombre: string;
  direccion: string | null;
  lat: number;
  lng: number;
  radio_m: number;
  activo: boolean;
}

export interface Horario {
  id: string;
  nombre: string;
  hora_entrada: string;
  hora_salida: string;
  tolerancia_min: number;
  dias_semana: number[];
}
