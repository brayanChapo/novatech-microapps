const ZONA = 'America/Lima';

/** Fecha de hoy (YYYY-MM-DD) en hora de Lima. */
export function hoyLima(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora);
}

/** Hora HH:MM en Lima a partir de un timestamp ISO. */
export function horaLima(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-PE', { timeZone: ZONA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
}

/** 'HH:MM:SS' → 'HH:MM' */
export const horaCorta = (h: string | null | undefined) => (h ? h.slice(0, 5) : '—');

export function fechaLarga(fecha: string): string {
  const texto = new Intl.DateTimeFormat('es-PE', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(`${fecha}T12:00:00Z`));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export const ESTADOS: Record<string, { texto: string; tono: 'ok' | 'alerta' | 'error' | 'neutro' | 'info' }> = {
  a_tiempo: { texto: 'A tiempo', tono: 'ok' },
  tardanza: { texto: 'Tardanza', tono: 'alerta' },
  salida: { texto: 'Salida', tono: 'neutro' },
  salida_anticipada: { texto: 'Salida anticipada', tono: 'alerta' },
  observada: { texto: 'Fuera del local', tono: 'error' },
  extra: { texto: 'Día no programado', tono: 'info' },
  sin_marcar: { texto: 'Sin marcar', tono: 'error' },
  en_local: { texto: 'En el local', tono: 'ok' },
  jornada_cerrada: { texto: 'Jornada cerrada', tono: 'neutro' },
};

export const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
