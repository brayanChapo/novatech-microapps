import type { Coordenada } from './tipos';

/** Radio medio de la Tierra en metros (IUGG). */
export const RADIO_TIERRA_M = 6_371_008.8;

const aRad = (grados: number) => (grados * Math.PI) / 180;

/** Distancia en metros entre dos coordenadas (fórmula de Haversine). */
export function distanciaMetros(a: Coordenada, b: Coordenada): number {
  const dLat = aRad(b.lat - a.lat);
  const dLng = aRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(a.lat)) * Math.cos(aRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface ResultadoGeocerca {
  distancia_m: number;
  dentro: boolean;
  precisionSuficiente: boolean;
}

/**
 * Evalúa si una posición está dentro de la geocerca circular de un local.
 * - dentro: la distancia al centro es menor o igual al radio del local.
 * - precisionSuficiente: el GPS reporta una precisión aceptable (en metros).
 */
export function evaluarGeocerca(params: {
  posicion: Coordenada;
  centro: Coordenada;
  radio_m: number;
  precision_m: number;
  precisionMax_m: number;
}): ResultadoGeocerca {
  const distancia_m = Math.round(distanciaMetros(params.posicion, params.centro) * 10) / 10;
  return {
    distancia_m,
    dentro: distancia_m <= params.radio_m,
    precisionSuficiente: params.precision_m <= params.precisionMax_m,
  };
}
