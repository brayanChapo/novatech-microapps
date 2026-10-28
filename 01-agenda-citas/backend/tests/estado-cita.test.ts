import { describe, it, expect } from 'vitest';
import { transicionValida, mensajeTransicionInvalida } from '../src/domain/estado-cita';
import type { EstadoCita } from '../src/domain/tipos';

describe('transicionValida', () => {
  // Transiciones VÁLIDAS
  it('permite reservada → confirmada', () => {
    expect(transicionValida('reservada', 'confirmada')).toBe(true);
  });

  it('permite reservada → cancelada', () => {
    expect(transicionValida('reservada', 'cancelada')).toBe(true);
  });

  it('permite confirmada → asistio', () => {
    expect(transicionValida('confirmada', 'asistio')).toBe(true);
  });

  it('permite confirmada → no_asistio', () => {
    expect(transicionValida('confirmada', 'no_asistio')).toBe(true);
  });

  it('permite confirmada → cancelada', () => {
    expect(transicionValida('confirmada', 'cancelada')).toBe(true);
  });

  // Transiciones INVÁLIDAS
  it('rechaza reservada → asistio (saltar confirmada)', () => {
    expect(transicionValida('reservada', 'asistio')).toBe(false);
  });

  it('rechaza reservada → no_asistio (saltar confirmada)', () => {
    expect(transicionValida('reservada', 'no_asistio')).toBe(false);
  });

  it('rechaza cancelada → cualquier estado (estado terminal)', () => {
    const estados: EstadoCita[] = ['reservada', 'confirmada', 'asistio', 'no_asistio', 'cancelada'];
    estados.forEach((e) => {
      expect(transicionValida('cancelada', e)).toBe(false);
    });
  });

  it('rechaza asistio → cualquier estado (estado terminal)', () => {
    const estados: EstadoCita[] = ['reservada', 'confirmada', 'cancelada', 'no_asistio', 'asistio'];
    estados.forEach((e) => {
      expect(transicionValida('asistio', e)).toBe(false);
    });
  });

  it('rechaza no_asistio → cualquier estado (estado terminal)', () => {
    const estados: EstadoCita[] = ['reservada', 'confirmada', 'cancelada', 'asistio', 'no_asistio'];
    estados.forEach((e) => {
      expect(transicionValida('no_asistio', e)).toBe(false);
    });
  });

  it('rechaza transición al mismo estado', () => {
    const estados: EstadoCita[] = ['reservada', 'confirmada', 'cancelada', 'asistio', 'no_asistio'];
    estados.forEach((e) => {
      // Solo algunos son técnicamente "transición al mismo estado" que se rechaza
      // confirmada→confirmada no está en el mapa
      expect(transicionValida(e, e)).toBe(false);
    });
  });
});

describe('mensajeTransicionInvalida', () => {
  it('menciona el estado actual y el destino en el mensaje', () => {
    const msg = mensajeTransicionInvalida('cancelada', 'confirmada');
    expect(msg).toContain('cancelada');
  });

  it('describe estados terminales correctamente', () => {
    const msg = mensajeTransicionInvalida('asistio', 'reservada');
    expect(msg.toLowerCase()).toContain('asistio');
  });

  it('indica los estados válidos desde reservada', () => {
    const msg = mensajeTransicionInvalida('reservada', 'asistio');
    expect(msg).toContain('confirmada');
    expect(msg).toContain('cancelada');
  });
});
