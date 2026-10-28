const ZONA = 'America/Lima';

/**
 * Formatea una fecha como "martes, 5 de noviembre de 2026" en hora de Lima.
 */
export function formatearFechaLima(fecha: Date): string {
  const texto = new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Formatea una hora como "10:30 AM" en hora de Lima.
 */
export function formatearHora(fecha: Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(fecha);
}

/**
 * Formatea una duración en minutos como "1 h 30 min" o "45 min".
 */
export function formatearDuracion(minutos: number): string {
  if (minutos <= 0) return '0 min';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD en zona Lima.
 */
export function hoyLima(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora);
}

/**
 * Retorna la hora en formato HH:MM desde un ISO string, en zona Lima.
 */
export function horaLima(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}
