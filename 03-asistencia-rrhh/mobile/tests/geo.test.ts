// Pruebas unitarias sin dependencias: node --test --experimental-strip-types tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanciaMetros, formatoDistancia } from '../src/lib/geo.ts';

test('distancia 0 en el mismo punto', () => {
  assert.equal(distanciaMetros({ lat: -12.1211, lng: -77.0297 }, { lat: -12.1211, lng: -77.0297 }), 0);
});

test('0.001° de latitud ≈ 111 m (igual que el backend)', () => {
  const d = distanciaMetros({ lat: -12.1211, lng: -77.0297 }, { lat: -12.1201, lng: -77.0297 });
  assert.ok(d > 110 && d < 112, `d=${d}`);
});

test('formato de distancia', () => {
  assert.equal(formatoDistancia(35.4), '35 m');
  assert.equal(formatoDistancia(1530), '1.5 km');
});
