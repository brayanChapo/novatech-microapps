import { describe, expect, it } from 'vitest';
import { diasEntre, minutosDeHora, momentoLocal, restarDias } from '../src/domain/tiempo';

describe('momentoLocal (America/Lima, UTC-5)', () => {
  it('convierte la hora UTC a hora de Lima', () => {
    const m = momentoLocal(new Date('2026-10-08T13:25:00Z'));
    expect(m.fecha).toBe('2026-10-08');
    expect(m.hora).toBe('08:25');
    expect(m.minutos).toBe(8 * 60 + 25);
    expect(m.diaIso).toBe(4); // jueves
  });

  it('antes de las 05:00 UTC todavía es el día anterior en Lima', () => {
    const m = momentoLocal(new Date('2026-10-09T03:30:00Z'));
    expect(m.fecha).toBe('2026-10-08');
    expect(m.hora).toBe('22:30');
  });

  it('medianoche local es 00:00, no 24:00', () => {
    const m = momentoLocal(new Date('2026-10-11T05:00:00Z'));
    expect(m.hora).toBe('00:00');
    expect(m.minutos).toBe(0);
    expect(m.diaIso).toBe(7); // domingo
  });
});

describe('utilidades de fecha', () => {
  it('minutosDeHora acepta HH:MM y HH:MM:SS', () => {
    expect(minutosDeHora('08:30')).toBe(510);
    expect(minutosDeHora('17:30:00')).toBe(1050);
  });

  it('minutosDeHora rechaza valores inválidos', () => {
    expect(() => minutosDeHora('abc')).toThrow();
  });

  it('restarDias cruza meses y años', () => {
    expect(restarDias('2026-03-01', 1)).toBe('2026-02-28');
    expect(restarDias('2027-01-01', 1)).toBe('2026-12-31');
  });

  it('diasEntre', () => {
    expect(diasEntre('2026-10-01', '2026-10-31')).toBe(30);
    expect(diasEntre('2026-10-02', '2026-10-01')).toBe(-1);
  });
});
