import type { Disponibilidad, SlotDisponible } from './tipos';

/** Cita mínima necesaria para calcular ocupación */
export interface CitaOcupada {
  inicio: Date;
  fin: Date;
}

// Peru es UTC-5 sin horario de verano. Las horas en disponibilidad están en Lima.
const LIMA_OFFSET_H = 5;

/**
 * Calcula los slots disponibles para un profesional en una fecha dada.
 * Función PURA: sin efectos secundarios, sin I/O.
 *
 * @param disponibilidad  Bloques semanales del profesional (horas en tiempo Lima)
 * @param citasExistentes Citas ya reservadas/confirmadas en esa fecha (timestamps UTC)
 * @param fecha           Inicio del día UTC (p. ej. 2025-11-10T00:00:00Z)
 * @param duracionMin     Duración del servicio en minutos
 */
export function calcularSlots(
  disponibilidad: Disponibilidad[],
  citasExistentes: CitaOcupada[],
  fecha: Date,
  duracionMin: number,
): SlotDisponible[] {
  if (duracionMin <= 0) return [];

  // ISO día de semana: getDay() devuelve 0=domingo..6=sábado → mapear a 1=lunes..7=domingo
  const diaSemana = diaSemanaISO(fecha);

  // Filtrar solo bloques del día correspondiente
  const bloquesDelDia = disponibilidad.filter((d) => d.dia_semana === diaSemana);
  if (bloquesDelDia.length === 0) return [];

  const slots: SlotDisponible[] = [];

  for (const bloque of bloquesDelDia) {
    const [hIni, mIni] = bloque.hora_inicio.split(':').map(Number) as [number, number];
    const [hFin, mFin] = bloque.hora_fin.split(':').map(Number) as [number, number];

    // Convertir hora Lima → UTC sumando el offset (setUTCHours maneja rollover a día siguiente)
    const inicioBloque = new Date(fecha);
    inicioBloque.setUTCHours(hIni + LIMA_OFFSET_H, mIni, 0, 0);

    const finBloque = new Date(fecha);
    finBloque.setUTCHours(hFin + LIMA_OFFSET_H, mFin, 0, 0);

    if (inicioBloque >= finBloque) continue;

    // Generar slots de duracionMin dentro del bloque
    let cursor = new Date(inicioBloque);
    while (cursor.getTime() + duracionMin * 60_000 <= finBloque.getTime()) {
      const finSlot = new Date(cursor.getTime() + duracionMin * 60_000);
      const disponible = !hayConflicto(cursor, finSlot, citasExistentes);
      slots.push({ inicio: new Date(cursor), fin: finSlot, disponible });
      cursor = finSlot;
    }
  }

  return slots;
}

/** Retorna true si el slot [inicio, fin) se solapa con alguna cita existente. */
function hayConflicto(inicio: Date, fin: Date, citas: CitaOcupada[]): boolean {
  return citas.some((c) => inicio < c.fin && fin > c.inicio);
}

/** Convierte getDay() (0=domingo..6=sábado) al formato ISO 1=lunes..7=domingo. */
export function diaSemanaISO(fecha: Date): number {
  const d = fecha.getUTCDay(); // 0=dom
  return d === 0 ? 7 : d;
}
