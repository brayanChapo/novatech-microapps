import { describe, it, expect } from 'vitest';
import { formatearFechaLima, formatearHora, formatearDuracion, hoyLima } from '@/lib/formato';

describe('formatearFechaLima', () => {
  it('formatea una fecha correctamente en español', () => {
    // 5 de noviembre de 2026, UTC-5 (Lima)
    const fecha = new Date('2026-11-05T15:00:00Z');
    const resultado = formatearFechaLima(fecha);
    expect(resultado).toContain('noviembre');
    expect(resultado).toContain('2026');
    expect(resultado).toContain('5');
  });

  it('inicia con mayúscula', () => {
    const fecha = new Date('2026-03-09T12:00:00Z');
    const resultado = formatearFechaLima(fecha);
    expect(resultado[0]).toMatch(/[A-Z]/);
  });

  it('incluye el día de la semana', () => {
    // 5 de noviembre de 2026 es jueves
    const fecha = new Date('2026-11-05T15:00:00Z');
    const resultado = formatearFechaLima(fecha);
    // "jueves" en español
    expect(resultado.toLowerCase()).toContain('jueves');
  });
});

describe('formatearHora', () => {
  it('formatea la hora en formato 12 horas AM', () => {
    // 10:30 AM Lima = 15:30 UTC
    const fecha = new Date('2026-11-05T15:30:00Z');
    const resultado = formatearHora(fecha);
    expect(resultado).toContain('10:30');
  });

  it('formatea la hora PM correctamente', () => {
    // 3:00 PM Lima = 20:00 UTC
    const fecha = new Date('2026-11-05T20:00:00Z');
    const resultado = formatearHora(fecha);
    expect(resultado).toContain('3:00');
  });
});

describe('formatearDuracion', () => {
  it('retorna "45 min" para 45 minutos', () => {
    expect(formatearDuracion(45)).toBe('45 min');
  });

  it('retorna "1 h" para 60 minutos exactos', () => {
    expect(formatearDuracion(60)).toBe('1 h');
  });

  it('retorna "1 h 30 min" para 90 minutos', () => {
    expect(formatearDuracion(90)).toBe('1 h 30 min');
  });

  it('retorna "2 h 15 min" para 135 minutos', () => {
    expect(formatearDuracion(135)).toBe('2 h 15 min');
  });

  it('retorna "0 min" para 0 minutos', () => {
    expect(formatearDuracion(0)).toBe('0 min');
  });

  it('retorna "30 min" para 30 minutos', () => {
    expect(formatearDuracion(30)).toBe('30 min');
  });
});

describe('hoyLima', () => {
  it('retorna una cadena en formato YYYY-MM-DD', () => {
    const resultado = hoyLima();
    expect(resultado).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('retorna la fecha correcta para un instante dado', () => {
    // 2026-11-05 a mediodía UTC es 2026-11-05 en Lima (UTC-5)
    const fecha = new Date('2026-11-05T17:00:00Z');
    expect(hoyLima(fecha)).toBe('2026-11-05');
  });
});
