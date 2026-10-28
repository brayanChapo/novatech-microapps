// ─── Modelos de dominio ───────────────────────────────────────────────────────

export interface Profesional {
  id: string;
  empresa_id: string;
  nombre: string;
  especialidad?: string | null;
  activo: boolean;
}

export interface Servicio {
  id: string;
  empresa_id: string;
  nombre: string;
  duracion_min: number;
  precio_referencial?: number | string | null;
}

export interface Paciente {
  id: string;
  empresa_id: string;
  nombre: string;
  telefono: string;
  documento?: string | null;
  acepta_whatsapp: boolean;
  total_citas?: number;
}

/** Estado posible de una cita */
export type EstadoCita = 'reservada' | 'confirmada' | 'cancelada' | 'asistio' | 'no_asistio' | 'reprogramada';

/** Origen de la cita */
export type OrigenCita = 'web' | 'panel';

export interface Cita {
  id: string;
  empresa_id: string;
  profesional_id: string;
  servicio_id?: string | null;
  paciente_id?: string | null;
  inicio: string;       // ISO 8601 UTC
  fin?: string | null;  // ISO 8601 UTC
  estado: EstadoCita;
  origen: OrigenCita;
  // Campos resueltos (joins que devuelve la API)
  profesional_nombre?: string | null;
  servicio_nombre?: string | null;
  paciente_nombre?: string | null;
  paciente_telefono?: string | null;
}

export interface SlotDisponible {
  inicio: string;  // ISO 8601 UTC
  fin: string;     // ISO 8601 UTC
}

// ─── Usuario autenticado ──────────────────────────────────────────────────────

export type RolUsuario = 'admin' | 'recepcion' | 'profesional';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  empresa_id: string;
}
