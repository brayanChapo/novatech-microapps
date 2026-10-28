import { describe, expect, it } from 'vitest';
import { fechaLarga, horaCorta, horaLima, hoyLima } from '../lib/formato';

describe('formato (hora de Lima)', () => {
  it('hoyLima usa la fecha de Lima aunque en UTC ya sea el día siguiente', () => {
    expect(hoyLima(new Date('2026-10-09T03:00:00Z'))).toBe('2026-10-08');
  });
  it('horaLima convierte UTC a hora local', () => {
    expect(horaLima('2026-10-08T13:47:00Z')).toBe('08:47');
    expect(horaLima(null)).toBe('—');
  });
  it('horaCorta recorta segundos', () => {
    expect(horaCorta('08:30:00')).toBe('08:30');
  });
  it('fechaLarga en español con mayúscula inicial', () => {
    expect(fechaLarga('2026-10-08')).toMatch(/^Jueves, 8 de octubre de 2026$/);
  });
});
