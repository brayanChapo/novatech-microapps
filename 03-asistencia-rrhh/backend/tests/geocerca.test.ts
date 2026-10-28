import { describe, expect, it } from 'vitest';
import { distanciaMetros, evaluarGeocerca } from '../src/domain/geocerca';

const MIRAFLORES = { lat: -12.1211, lng: -77.0297 };

describe('distanciaMetros', () => {
  it('es 0 para el mismo punto', () => {
    expect(distanciaMetros(MIRAFLORES, MIRAFLORES)).toBe(0);
  });

  it('1 milésima de grado de latitud ≈ 111 m', () => {
    const d = distanciaMetros(MIRAFLORES, { lat: MIRAFLORES.lat + 0.001, lng: MIRAFLORES.lng });
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });

  it('Miraflores → San Isidro está entre 3 y 4 km', () => {
    const d = distanciaMetros(MIRAFLORES, { lat: -12.0918, lng: -77.0349 });
    expect(d).toBeGreaterThan(3000);
    expect(d).toBeLessThan(4000);
  });

  it('es simétrica', () => {
    const otro = { lat: -12.0464, lng: -76.9446 };
    expect(distanciaMetros(MIRAFLORES, otro)).toBeCloseTo(distanciaMetros(otro, MIRAFLORES), 6);
  });
});

describe('evaluarGeocerca', () => {
  const base = { centro: MIRAFLORES, radio_m: 100, precisionMax_m: 50 };

  it('dentro cuando la distancia es menor al radio', () => {
    const r = evaluarGeocerca({ ...base, posicion: { lat: -12.1213, lng: -77.0297 }, precision_m: 10 });
    expect(r.dentro).toBe(true);
    expect(r.distancia_m).toBeLessThan(30);
  });

  it('fuera cuando la distancia supera el radio', () => {
    const r = evaluarGeocerca({ ...base, posicion: { lat: -12.1231, lng: -77.0297 }, precision_m: 10 });
    expect(r.dentro).toBe(false);
    expect(r.distancia_m).toBeGreaterThan(200);
  });

  it('el borde exacto del radio cuenta como dentro', () => {
    const r = evaluarGeocerca({ ...base, radio_m: 1000, posicion: MIRAFLORES, precision_m: 5 });
    expect(r.dentro).toBe(true);
  });

  it('marca precisión insuficiente si supera el máximo', () => {
    expect(evaluarGeocerca({ ...base, posicion: MIRAFLORES, precision_m: 51 }).precisionSuficiente).toBe(false);
    expect(evaluarGeocerca({ ...base, posicion: MIRAFLORES, precision_m: 50 }).precisionSuficiente).toBe(true);
  });
});
