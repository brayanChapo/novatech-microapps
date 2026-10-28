import { minutosDeHora } from './tiempo';
import type { EstadoMarcacion, Horario, TipoMarcacion } from './tipos';

/**
 * Secuencia del día (fase 1): una entrada y luego una salida.
 * Devuelve el tipo que corresponde marcar, o null si la jornada ya está cerrada.
 */
export function siguienteTipo(marcacionesDelDia: { tipo: TipoMarcacion }[]): TipoMarcacion | null {
  const tieneEntrada = marcacionesDelDia.some((m) => m.tipo === 'entrada');
  const tieneSalida = marcacionesDelDia.some((m) => m.tipo === 'salida');
  if (!tieneEntrada) return 'entrada';
  if (!tieneSalida) return 'salida';
  return null;
}

/**
 * Estado de la marcación según horario, geocerca y política de la empresa.
 * - Entrada después de hora_entrada + tolerancia  → tardanza
 * - Salida antes de hora_salida                   → salida_anticipada
 * - Día no programado en el horario               → extra
 * - Fuera de geocerca con política "observar"     → observada (prevalece sobre todo)
 */
export function calcularEstado(params: {
  tipo: TipoMarcacion;
  minutosLocal: number;
  diaIso: number;
  horario: Pick<Horario, 'hora_entrada' | 'hora_salida' | 'tolerancia_min' | 'dias_semana'>;
  dentroGeocerca: boolean;
}): EstadoMarcacion {
  const { tipo, minutosLocal, diaIso, horario, dentroGeocerca } = params;

  if (!dentroGeocerca) return 'observada';
  if (!horario.dias_semana.includes(diaIso)) return 'extra';

  if (tipo === 'entrada') {
    const limite = minutosDeHora(horario.hora_entrada) + horario.tolerancia_min;
    return minutosLocal > limite ? 'tardanza' : 'a_tiempo';
  }
  return minutosLocal < minutosDeHora(horario.hora_salida) ? 'salida_anticipada' : 'salida';
}
