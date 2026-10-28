import { describe, it, expect, vi, beforeEach } from 'vitest';
import { crearReserva } from '../src/services/reserva.service';
import type { CitaRepo } from '../src/repos/cita.repo';
import type { Cita, Disponibilidad, Paciente, Profesional, Servicio } from '../src/domain/tipos';
import { ErrorNegocio } from '../src/lib/errores';

// Mock del módulo whatsapp para no llamar a Meta en tests
vi.mock('../src/lib/whatsapp', () => ({
  enviarPlantilla: vi.fn().mockResolvedValue('meta-msg-id-123'),
  verificarWebhookToken: vi.fn().mockReturnValue(true),
}));

const EMPRESA_ID = 'empresa-uuid-1';
const PROF_ID = 'prof-uuid-1';
const SERV_ID = 'serv-uuid-1';
const PAC_ID = 'pac-uuid-1';

const profesionalMock: Profesional = {
  id: PROF_ID,
  empresa_id: EMPRESA_ID,
  nombre: 'Dr. Juan Pérez',
  especialidad: 'Medicina General',
  activo: true,
  creado_en: '2025-01-01T00:00:00Z',
};

const servicioMock: Servicio = {
  id: SERV_ID,
  empresa_id: EMPRESA_ID,
  nombre: 'Consulta General',
  duracion_min: 30,
  precio_referencial: 80,
  creado_en: '2025-01-01T00:00:00Z',
};

const pacienteMock: Paciente = {
  id: PAC_ID,
  empresa_id: EMPRESA_ID,
  nombre: 'María García',
  telefono: '51987654321',
  documento: null,
  acepta_whatsapp: true,
  creado_en: '2025-01-01T00:00:00Z',
};

// Disponibilidad: lunes de 09:00 a 18:00
const disponibilidadMock: Disponibilidad[] = [
  {
    id: 'disp-1',
    empresa_id: EMPRESA_ID,
    profesional_id: PROF_ID,
    dia_semana: 1, // lunes
    hora_inicio: '09:00',
    hora_fin: '18:00',
    creado_en: '2025-01-01T00:00:00Z',
  },
];

const citaMockCreada: Cita = {
  id: 'cita-uuid-1',
  empresa_id: EMPRESA_ID,
  profesional_id: PROF_ID,
  servicio_id: SERV_ID,
  paciente_id: PAC_ID,
  inicio: '2025-11-10T14:00:00.000Z', // 09:00 Lima = 14:00 UTC
  fin: '2025-11-10T14:30:00.000Z',
  estado: 'reservada',
  origen: 'publico',
  recordatorio_enviado: false,
  recordatorio_enviado_en: null,
  creado_en: '2025-11-10T13:00:00Z',
};

function crearRepoMock(overrides: Partial<CitaRepo> = {}): CitaRepo {
  return {
    servicios: vi.fn().mockResolvedValue([servicioMock]),
    profesionalPorId: vi.fn().mockResolvedValue(profesionalMock),
    disponibilidadPorProfesional: vi.fn().mockResolvedValue(disponibilidadMock),
    citasPorProfesionalYFecha: vi.fn().mockResolvedValue([]),
    upsertPaciente: vi.fn().mockResolvedValue(pacienteMock),
    crearCita: vi.fn().mockResolvedValue(citaMockCreada),
    registrarEnvioWA: vi.fn().mockResolvedValue(undefined),
    // métodos no usados en reserva.service pero requeridos por la interfaz
    actualizarEstado: vi.fn(),
    citasPendientesRecordatorio: vi.fn(),
    marcarRecordatorioEnviado: vi.fn(),
    porId: vi.fn(),
    citasPorFecha: vi.fn(),
    buscarPacientes: vi.fn(),
    profesionales: vi.fn(),
    ...overrides,
  };
}

describe('crearReserva', () => {
  const entradaBase = {
    empresa_id: EMPRESA_ID,
    profesional_id: PROF_ID,
    servicio_id: SERV_ID,
    fecha: '2025-11-10', // lunes
    hora: '09:00',       // Lima
    nombre_paciente: 'María García',
    telefono: '51987654321',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('happy path: crea la cita y retorna el resultado', async () => {
    const repo = crearRepoMock();

    const resultado = await crearReserva(entradaBase, repo);

    expect(resultado.cita.id).toBe('cita-uuid-1');
    expect(resultado.cita.estado).toBe('reservada');
    expect(resultado.mensaje).toContain('Dr. Juan Pérez');
    expect(repo.crearCita).toHaveBeenCalledOnce();
    expect(repo.upsertPaciente).toHaveBeenCalledWith({
      empresa_id: EMPRESA_ID,
      nombre: 'María García',
      telefono: '51987654321',
    });
  });

  it('lanza error 404 si el servicio no existe', async () => {
    const repo = crearRepoMock({
      servicios: vi.fn().mockResolvedValue([]), // sin servicios
    });

    await expect(crearReserva(entradaBase, repo)).rejects.toMatchObject({
      codigo: 'NO_ENCONTRADO',
      status: 404,
    });
  });

  it('lanza error 404 si el profesional no existe', async () => {
    const repo = crearRepoMock({
      profesionalPorId: vi.fn().mockResolvedValue(null),
    });

    await expect(crearReserva(entradaBase, repo)).rejects.toMatchObject({
      codigo: 'NO_ENCONTRADO',
      status: 404,
    });
  });

  it('lanza error 409 si el slot no está disponible (fuera de horario)', async () => {
    const repo = crearRepoMock({
      // Disponibilidad solo martes — lunes no tiene bloques
      disponibilidadPorProfesional: vi.fn().mockResolvedValue([
        {
          id: 'disp-2',
          empresa_id: EMPRESA_ID,
          profesional_id: PROF_ID,
          dia_semana: 2, // martes
          hora_inicio: '09:00',
          hora_fin: '17:00',
          creado_en: '2025-01-01T00:00:00Z',
        },
      ]),
    });

    await expect(crearReserva(entradaBase, repo)).rejects.toMatchObject({
      codigo: 'SLOT_NO_DISPONIBLE',
      status: 409,
    });
    expect(repo.crearCita).not.toHaveBeenCalled();
  });

  it('lanza error 409 si el slot ya está ocupado por otra cita', async () => {
    const repo = crearRepoMock({
      // Una cita que ocupa exactamente el slot 09:00-09:30 Lima (14:00-14:30 UTC)
      citasPorProfesionalYFecha: vi.fn().mockResolvedValue([
        {
          ...citaMockCreada,
          id: 'otra-cita',
          inicio: '2025-11-10T14:00:00.000Z',
          fin: '2025-11-10T14:30:00.000Z',
          estado: 'confirmada',
        },
      ]),
    });

    await expect(crearReserva(entradaBase, repo)).rejects.toMatchObject({
      codigo: 'SLOT_NO_DISPONIBLE',
      status: 409,
    });
    expect(repo.crearCita).not.toHaveBeenCalled();
  });

  it('no envía WA si el paciente no acepta whatsapp', async () => {
    const { enviarPlantilla } = await import('../src/lib/whatsapp');

    const repo = crearRepoMock({
      upsertPaciente: vi.fn().mockResolvedValue({
        ...pacienteMock,
        acepta_whatsapp: false,
      }),
    });

    const resultado = await crearReserva(entradaBase, repo);
    expect(resultado.cita).toBeDefined();
    expect(enviarPlantilla).not.toHaveBeenCalled();
  });

  it('instancia ErrorNegocio con el tipo correcto', () => {
    const err = new ErrorNegocio('SLOT_NO_DISPONIBLE', 'Slot ocupado', 409);
    expect(err).toBeInstanceOf(ErrorNegocio);
    expect(err.codigo).toBe('SLOT_NO_DISPONIBLE');
    expect(err.status).toBe(409);
    expect(err.message).toBe('Slot ocupado');
  });
});
