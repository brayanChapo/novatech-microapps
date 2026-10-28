import type { Cita, CitaConPaciente, EstadoCita, Paciente, Profesional, Servicio, Disponibilidad } from '../domain/tipos';

/** Input para crear una cita nueva */
export interface CrearCitaInput {
  empresa_id: string;
  profesional_id: string;
  servicio_id: string;
  paciente_id: string;
  inicio: Date;
  fin: Date;
  origen: 'publico' | 'interno';
}

/** Input para crear o encontrar un paciente por teléfono */
export interface UpsertPacienteInput {
  empresa_id: string;
  nombre: string;
  telefono: string;
}

/** Interfaz del repositorio de citas — solo contrato, sin implementación */
export interface CitaRepo {
  /** Citas activas de un profesional en una fecha (estado != cancelada) */
  citasPorProfesionalYFecha(empresaId: string, profesionalId: string, fecha: Date): Promise<Cita[]>;

  /** Crea la cita de forma atómica — debe verificar solapamiento internamente */
  crearCita(datos: CrearCitaInput): Promise<Cita>;

  /** Actualiza el estado de una cita verificando la transición y el empresa_id */
  actualizarEstado(id: string, empresaId: string, estado: EstadoCita, extra?: Record<string, unknown>): Promise<Cita>;

  /** Citas pendientes de recordatorio: no enviado, inicio entre ahora y ahora+25h */
  citasPendientesRecordatorio(empresaId: string): Promise<CitaConPaciente[]>;

  /** Marca el recordatorio como enviado */
  marcarRecordatorioEnviado(id: string, empresaId: string): Promise<void>;

  /** Busca una cita por ID y empresa */
  porId(id: string, empresaId: string): Promise<Cita | null>;

  /** Citas de una empresa en un rango de fechas */
  citasPorFecha(empresaId: string, desde: Date, hasta: Date, profesionalId?: string): Promise<Cita[]>;

  /** Disponibilidad semanal del profesional */
  disponibilidadPorProfesional(empresaId: string, profesionalId: string): Promise<Disponibilidad[]>;

  /** Busca o crea un paciente por teléfono en la empresa */
  upsertPaciente(datos: UpsertPacienteInput): Promise<Paciente>;

  /** Busca pacientes por nombre o teléfono */
  buscarPacientes(empresaId: string, q: string): Promise<Paciente[]>;

  /** Datos de un profesional */
  profesionalPorId(empresaId: string, profesionalId: string): Promise<Profesional | null>;

  /** Todos los profesionales activos de la empresa */
  profesionales(empresaId: string): Promise<Profesional[]>;

  /** Servicios activos de la empresa */
  servicios(empresaId: string): Promise<Servicio[]>;

  /** Registra el envío de un mensaje WhatsApp */
  registrarEnvioWA(datos: {
    empresa_id: string;
    cita_id: string | null;
    plantilla: string;
    telefono: string;
    meta_message_id: string;
  }): Promise<void>;
}
