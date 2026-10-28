/**
 * Distancia (Haversine) para MOSTRAR al usuario cuánto le falta para llegar.
 * La validación oficial la hace SIEMPRE el backend con la misma fórmula.
 */
const RADIO_TIERRA_M = 6_371_008.8;
const aRad = (g: number) => (g * Math.PI) / 180;

export function distanciaMetros(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = aRad(b.lat - a.lat);
  const dLng = aRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aRad(a.lat)) * Math.cos(aRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatoDistancia(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}
