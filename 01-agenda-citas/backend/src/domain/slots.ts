import type { Disponibilidad, SlotDisponible } from './tipos';

/** Cita mínima necesaria para calcular ocupación */
export interface CitaOcupada {
  inicio: Date;
  fin: Date;
}

/**
 * Calcula los slots disponibles para un profesional en una fecha dada.
 * Función PURA: sin efectos secundarios, sin I/O.
 *
 * @param disponibilidad  Bloques semanales del profesional
 * @param citasExistentes Citas ya reservadas/confirmadas en esa fecha
 * @param fecha           Fecha local (hora 00:00:00 UTC del día consultado)
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

    // Construir Date para el inicio y fin del bloque en la misma fecha
    const inicioBloque = new Date(fecha);
    inicioBloque.setUTCHours(hIni, mIni, 0, 0);

    const finBloque = new Date(fecha);
    finBloque.setUTCHours(hFin, mFin, 0, 0);

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
