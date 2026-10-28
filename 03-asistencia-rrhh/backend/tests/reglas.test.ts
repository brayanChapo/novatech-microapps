import { describe, expect, it } from 'vitest';
import { calcularEstado, siguienteTipo } from '../src/domain/reglas';

const horario = { hora_entrada: '08:30', hora_salida: '17:30', tolerancia_min: 10, dias_semana: [1, 2, 3, 4, 5] };
const jueves = 4;
const min = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

describe('siguienteTipo', () => {
  it('sin marcaciones → entrada', () => expect(siguienteTipo([])).toBe('entrada'));
  it('con entrada → salida', () => expect(siguienteTipo([{ tipo: 'entrada' }])).toBe('salida'));
  it('con entrada y salida → null (jornada completa)', () =>
    expect(siguienteTipo([{ tipo: 'entrada' }, { tipo: 'salida' }])).toBeNull());
});

describe('calcularEstado', () => {
  const base = { horario, diaIso: jueves, dentroGeocerca: true };

  it('entrada antes de la hora → a tiempo', () =>
    expect(calcularEstado({ ...base, tipo: 'entrada', minutosLocal: min('08:15') })).toBe('a_tiempo'));

  it('entrada dentro de la tolerancia (08:40) → a tiempo', () =>
    expect(calcularEstado({ ...base, tipo: 'entrada', minutosLocal: min('08:40') })).toBe('a_tiempo'));

  it('entrada un minuto después de la tolerancia (08:41) → tardanza', () =>
    expect(calcularEstado({ ...base, tipo: 'entrada', minutosLocal: min('08:41') })).toBe('tardanza'));

  it('salida antes de la hora → salida anticipada', () =>
    expect(calcularEstado({ ...base, tipo: 'salida', minutosLocal: min('17:00') })).toBe('salida_anticipada'));

  it('salida a la hora o después → salida', () =>
    expect(calcularEstado({ ...base, tipo: 'salida', minutosLocal: min('17:30') })).toBe('salida'));

  it('sábado sin programación → extra', () =>
    expect(calcularEstado({ ...base, diaIso: 6, tipo: 'entrada', minutosLocal: min('09:00') })).toBe('extra'));

  it('fuera de geocerca (política observar) → observada', () =>
    expect(calcularEstado({ ...base, dentroGeocerca: false, tipo: 'entrada', minutosLocal: min('08:00') })).toBe('observada'));
});
