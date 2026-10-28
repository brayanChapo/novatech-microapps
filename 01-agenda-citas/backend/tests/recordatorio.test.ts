import { describe, it, expect } from 'vitest';
import { debeEnviarRecordatorio } from '../src/domain/recordatorio';

const MS_24H = 24 * 60 * 60_000;
const MS_2H = 2 * 60 * 60_000;
const MS_1H = 60 * 60_000;

describe('debeEnviarRecordatorio', () => {
  it('devuelve debe=false si el recordatorio ya fue enviado', () => {
    const inicio = new Date(Date.now() + MS_24H - MS_1H / 2);
    const ahora = new Date();
    const creadoEn = new Date(ahora.getTime() - 2 * MS_24H);

    const resultado = debeEnviarRecordatorio(inicio, ahora, creadoEn, true);
    expect(resultado.debe).toBe(false);
  });

  it('devuelve tipo=24h cuando la cita fue creada con > 24h de anticipación y está en ventana 24h', () => {
    const ahora = new Date();
    // Cita fue creada hace 2 días
    const creadoEn = new Date(ahora.getTime() - 2 * MS_24H);
    // Cita es en exactamente 23.5h (dentro de la ventana 24h-1h = 23h a 24h)
    const inicio = new Date(ahora.getTime() + MS_24H - MS_1H / 2);

    const resultado = debeEnviarRecordatorio(inicio, ahora, creadoEn, false);
    expect(resultado.debe).toBe(true);
    expect(resultado.tipo).toBe('24h');
  });

  it('devuelve tipo=2h cuando la cita fue creada con < 24h de anticipación y está en ventana 2h', () => {
    const ahora = new Date();
    // Cita fue creada hace 5 horas
    const creadoEn = new Date(ahora.getTime() - 5 * MS_1H);
    // Cita es en 1.5h (dentro de la ventana 2h-1h = 1h a 2h)
    const inicio = new Date(ahora.getTime() + MS_2H - MS_1H / 2);

    const resultado = debeEnviarRecordatorio(inicio, ahora, creadoEn, false);
    expect(resultado.debe).toBe(true);
    expect(resultado.tipo).toBe('2h');
  });

  it('devuelve debe=false si la cita es en más de 25h (fuera de ventana 24h)', () => {
    const ahora = new Date();
    const creadoEn = new Date(ahora.getTime() - 3 * MS_24H);
    // Cita en 26 horas — fuera de la ventana
    const inicio = new Date(ahora.getTime() + 26 * MS_1H);

    const resultado = debeEnviarRecordatorio(inicio, ahora, creadoEn, false);
    expect(resultado.debe).toBe(false);
  });

  it('devuelve debe=false si la cita ya pasó', () => {
    const ahora = new Date();
    const creadoEn = new Date(ahora.getTime() - 2 * MS_24H);
    const inicio = new Date(ahora.getTime() - MS_1H); // en el pasado

    const resultado = debeEnviarRecordatorio(inicio, ahora, creadoEn, false);
    expect(resultado.debe).toBe(false);
  });

  it('devuelve tipo=24h cuando la anticipación es exactamente 24h más 1 segundo', () => {
    const ahora = new Date();
    const creadoEn = new Date(ahora.getTime() - (MS_24H + 1000));
    const inicio = new Date(ahora.getTime() + MS_24H - MS_1H / 2);

    const resultado = debeEnviarRecordatorio(inicio, ahora, creadoEn, false);
    expect(resultado.tipo).toBe('24h');
  });
});
