/** Roles válidos en la plataforma de agenda */
export type Rol = 'admin' | 'recepcion' | 'profesional';

/** Usuario decodificado del JWT de Supabase Auth */
export interface UsuarioAutenticado {
  id: string;
  empresa_id: string;
  nombre: string;
  rol: Rol;
}

/** Estado posible de una cita */
export type EstadoCita = 'reservada' | 'confirmada' | 'cancelada' | 'asistio' | 'no_asistio';

/** Profesional que presta servicios */
export interface Profesional {
  id: string;
  empresa_id: string;
  nombre: string;
  especialidad: string | null;
  activo: boolean;
  creado_en: string;
}

/** Servicio que ofrece el consultorio */
export interface Servicio {
  id: string;
  empresa_id: string;
  nombre: string;
  duracion_min: number;
  precio_referencial: number | null;
  creado_en: string;
}

/** Bloque de disponibilidad semanal de un profesional */
export interface Disponibilidad {
  id: string;
  empresa_id: string;
  profesional_id: string;
  /** 1=lunes … 7=domingo (ISO) */
  dia_semana: number;
  hora_inicio: string; // "HH:MM"
  hora_fin: string;    // "HH:MM"
  creado_en: string;
}

/** Paciente registrado */
export interface Paciente {
  id: string;
  empresa_id: string;
  nombre: string;
  telefono: string;
  documento: string | null;
  acepta_whatsapp: boolean;
  creado_en: string;
}

/** Cita médica */
export interface Cita {
  id: string;
  empresa_id: string;
  profesional_id: string;
  servicio_id: string;
  paciente_id: string;
  inicio: string; // ISO 8601 UTC
  fin: string;    // ISO 8601 UTC
  estado: EstadoCita;
  origen: string;
  recordatorio_enviado: boolean;
  recordatorio_enviado_en: string | null;
  creado_en: string;
}

/** Cita con datos del paciente para el cron de recordatorios */
export interface CitaConPaciente extends Cita {
  paciente: Pick<Paciente, 'nombre' | 'telefono' | 'acepta_whatsapp'>;
  profesional: Pick<Profesional, 'nombre'>;
  servicio: Pick<Servicio, 'nombre' | 'duracion_min'>;
}

/** Slot calculado por la lógica de dominio */
export interface SlotDisponible {
  inicio: Date;
  fin: Date;
  disponible: boolean;
}

/** Entrada cruda del webhook de WhatsApp (Meta) */
export interface MensajeWhatsApp {
  de: string;          // número E.164 sin '+'
  cuerpo: string;      // texto libre que envió el paciente
  timestamp: number;
  messageId: string;
}

/** Mensaje registrado en la BD */
export interface RegistroMensajeWA {
  id: string;
  empresa_id: string;
  cita_id: string | null;
  plantilla: string;
  telefono: string;
  estado: string;
  meta_message_id: string | null;
  enviado_en: string;
  creado_en: string;
}
