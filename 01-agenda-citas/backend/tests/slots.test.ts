import { describe, it, expect } from 'vitest';
import { calcularSlots, diaSemanaISO } from '../src/domain/slots';
import type { Disponibilidad } from '../src/domain/tipos';

// Lunes 10 de noviembre de 2025 (UTC)
const LUNES = new Date(Date.UTC(2025, 10, 10));

function disponibilidadLunes(horaInicio: string, horaFin: string): Disponibilidad[] {
  return [
    {
      id: 'disp-1',
      empresa_id: 'emp-1',
      profesional_id: 'prof-1',
      dia_semana: 1, // lunes
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      creado_en: '2025-01-01T00:00:00Z',
    },
  ];
}

describe('calcularSlots', () => {
  it('devuelve array vacío si no hay disponibilidad el día consultado', () => {
    // Disponibilidad solo para martes (2), consultando lunes (1)
    const disponibilidad: Disponibilidad[] = [
      {
        id: 'disp-2',
        empresa_id: 'emp-1',
        profesional_id: 'prof-1',
        dia_semana: 2,
        hora_inicio: '09:00',
        hora_fin: '17:00',
        creado_en: '2025-01-01T00:00:00Z',
      },
    ];

    const slots = calcularSlots(disponibilidad, [], LUNES, 30);
    expect(slots).toHaveLength(0);
  });

  it('genera slots correctos para un bloque de 2 horas con duracion 30 min', () => {
    const disponibilidad = disponibilidadLunes('09:00', '11:00');
    const slots = calcularSlots(disponibilidad, [], LUNES, 30);

    expect(slots).toHaveLength(4); // 09:00-09:30, 09:30-10:00, 10:00-10:30, 10:30-11:00
    expect(slots.every((s) => s.disponible)).toBe(true);
    expect(slots[0]?.inicio.getUTCHours()).toBe(14); // 09:00 Lima = 14:00 UTC (UTC-5)
    expect(slots[3]?.fin.getUTCHours()).toBe(16);    // 11:00 Lima = 16:00 UTC
  });

  it('marca como no disponible el slot que se solapa con cita existente', () => {
    const disponibilidad = disponibilidadLunes('09:00', '11:00');

    // Cita que ocupa el primer slot: 09:00-09:30 Lima = 14:00-14:30 UTC
    const citas = [
      {
        inicio: new Date(Date.UTC(2025, 10, 10, 14, 0, 0)), // 09:00 Lima
        fin: new Date(Date.UTC(2025, 10, 10, 14, 30, 0)),   // 09:30 Lima
      },
    ];

    const slots = calcularSlots(disponibilidad, citas, LUNES, 30);
    expect(slots[0]?.disponible).toBe(false);
    expect(slots[1]?.disponible).toBe(true);
    expect(slots[2]?.disponible).toBe(true);
    expect(slots[3]?.disponible).toBe(true);
  });

  it('marca múltiples slots como no disponibles cuando hay varias citas', () => {
    const disponibilidad = disponibilidadLunes('08:00', '12:00');

    const citas = [
      {
        inicio: new Date(Date.UTC(2025, 10, 10, 13, 0, 0)), // 08:00 Lima
        fin: new Date(Date.UTC(2025, 10, 10, 14, 0, 0)),    // 09:00 Lima — ocupa 2 slots
      },
      {
        inicio: new Date(Date.UTC(2025, 10, 10, 15, 30, 0)), // 10:30 Lima
        fin: new Date(Date.UTC(2025, 10, 10, 16, 0, 0)),     // 11:00 Lima — 1 slot
      },
    ];

    const slots = calcularSlots(disponibilidad, citas, LUNES, 30);
    // 8 slots en 4 horas (08:00-12:00), 30 min c/u
    expect(slots).toHaveLength(8);
    const noDisponibles = slots.filter((s) => !s.disponible);
    expect(noDisponibles).toHaveLength(3); // 08:00-08:30, 08:30-09:00, 10:30-11:00
  });

  it('devuelve vacío si la duración es mayor al bloque disponible', () => {
    const disponibilidad = disponibilidadLunes('09:00', '09:20');
    // Duración 30 min > 20 min de bloque
    const slots = calcularSlots(disponibilidad, [], LUNES, 30);
    expect(slots).toHaveLength(0);
  });

  it('devuelve vacío si duracion_min es 0 o negativo', () => {
    const disponibilidad = disponibilidadLunes('09:00', '17:00');
    expect(calcularSlots(disponibilidad, [], LUNES, 0)).toHaveLength(0);
    expect(calcularSlots(disponibilidad, [], LUNES, -10)).toHaveLength(0);
  });

  it('maneja múltiples bloques en el mismo día', () => {
    const disponibilidad: Disponibilidad[] = [
      {
        id: 'disp-m1',
        empresa_id: 'emp-1',
        profesional_id: 'prof-1',
        dia_semana: 1,
        hora_inicio: '09:00',
        hora_fin: '12:00',
        creado_en: '2025-01-01T00:00:00Z',
      },
      {
        id: 'disp-m2',
        empresa_id: 'emp-1',
        profesional_id: 'prof-1',
        dia_semana: 1,
        hora_inicio: '15:00',
        hora_fin: '17:00',
        creado_en: '2025-01-01T00:00:00Z',
      },
    ];

    const slots = calcularSlots(disponibilidad, [], LUNES, 60);
    // 3 slots de 09:00-12:00 + 2 slots de 15:00-17:00
    expect(slots).toHaveLength(5);
  });
});

describe('diaSemanaISO', () => {
  it('devuelve 1 para lunes', () => {
    expect(diaSemanaISO(new Date(Date.UTC(2025, 10, 10)))).toBe(1);
  });

  it('devuelve 7 para domingo', () => {
    expect(diaSemanaISO(new Date(Date.UTC(2025, 10, 16)))).toBe(7);
  });

  it('devuelve 6 para sábado', () => {
    expect(diaSemanaISO(new Date(Date.UTC(2025, 10, 15)))).toBe(6);
  });
});
