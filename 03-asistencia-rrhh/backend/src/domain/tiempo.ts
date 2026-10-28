/**
 * Utilidades de fecha/hora en la zona horaria de la empresa.
 * Regla: la hora oficial de una marcación es SIEMPRE la del servidor, nunca la del celular.
 */

const DIAS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export interface MomentoLocal {
  /** Fecha local en formato YYYY-MM-DD */
  fecha: string;
  /** Minutos transcurridos desde la medianoche local */
  minutos: number;
  /** Día ISO: 1 = lunes ... 7 = domingo */
  diaIso: number;
  /** Hora local HH:MM */
  hora: string;
}

export function momentoLocal(instante: Date, zonaHoraria = 'America/Lima'): MomentoLocal {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHoraria,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(instante);

  const v = (tipo: Intl.DateTimeFormatPartTypes) => partes.find((p) => p.type === tipo)?.value ?? '';
  const horas = Number(v('hour'));
  const minutos = Number(v('minute'));
  return {
    fecha: `${v('year')}-${v('month')}-${v('day')}`,
    minutos: horas * 60 + minutos,
    diaIso: DIAS[v('weekday')] ?? 0,
    hora: `${v('hour')}:${v('minute')}`,
  };
}

/** Convierte 'HH:MM' o 'HH:MM:SS' a minutos desde la medianoche. */
export function minutosDeHora(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) {
    throw new Error(`Hora inválida: ${hora}`);
  }
  return h * 60 + m;
}

/** Resta días a una fecha YYYY-MM-DD (sin depender de la zona horaria del servidor). */
export function restarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

/** Días entre dos fechas YYYY-MM-DD (hasta - desde). */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(`${hasta}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`)) / 86_400_000);
}
