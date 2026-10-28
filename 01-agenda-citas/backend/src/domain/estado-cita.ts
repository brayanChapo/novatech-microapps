import type { EstadoCita } from './tipos';

export type { EstadoCita };

/**
 * Mapa de transiciones válidas.
 * Clave: estado actual → Valor: estados destino permitidos.
 */
const TRANSICIONES: Record<EstadoCita, EstadoCita[]> = {
  reservada:   ['confirmada', 'cancelada'],
  confirmada:  ['asistio', 'no_asistio', 'cancelada'],
  cancelada:   [],
  asistio:     [],
  no_asistio:  [],
};

/**
 * Devuelve true si la transición de `actual` a `siguiente` está permitida.
 * Función PURA: sin efectos secundarios, sin I/O.
 */
export function transicionValida(actual: EstadoCita, siguiente: EstadoCita): boolean {
  return (TRANSICIONES[actual] ?? []).includes(siguiente);
}

/** Mensajes de error en español para transiciones inválidas */
export function mensajeTransicionInvalida(actual: EstadoCita, siguiente: EstadoCita): string {
  if (actual === siguiente) return `La cita ya se encuentra en estado "${actual}".`;
  const permitidos = TRANSICIONES[actual] ?? [];
  if (permitidos.length === 0) return `Una cita en estado "${actual}" no puede cambiar de estado.`;
  return `No se puede pasar de "${actual}" a "${siguiente}". Estados válidos desde "${actual}": ${permitidos.join(', ')}.`;
}
