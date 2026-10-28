import { beforeEach, describe, expect, it } from 'vitest';
import type { ConfiguracionAsistencia, Marcacion, UsuarioAutenticado } from '../src/domain/tipos';
import { ErrorNegocio } from '../src/lib/errores';
import { CONFIGURACION_POR_DEFECTO, type Asignacion, type MarcacionRepo, type NuevaMarcacion } from '../src/repos/marcacion.repo';
import { estadoDelDia, registrarMarcacion } from '../src/services/marcacion.service';

// ---------- Repositorio en memoria (sin base de datos) ----------
class RepoEnMemoria implements MarcacionRepo {
  config: ConfiguracionAsistencia = { ...CONFIGURACION_POR_DEFECTO };
  asignacion: Asignacion | null = {
    local: { id: 'local-1', nombre: 'Sede Miraflores', lat: -12.1211, lng: -77.0297, radio_m: 100 },
    horario: { id: 'h-1', nombre: 'Oficina', hora_entrada: '08:30:00', hora_salida: '17:30:00', tolerancia_min: 10, dias_semana: [1, 2, 3, 4, 5] },
  };
  marcaciones: Marcacion[] = [];

  async zonaHoraria() { return 'America/Lima'; }
  async configuracion() { return this.config; }
  async asignacionVigente() { return this.asignacion; }
  async marcacionesDelDia(colaboradorId: string, fecha: string) {
    return this.marcaciones.filter((m) => m.colaborador_id === colaboradorId && m.fecha_local === fecha);
  }
  async insertar(n: NuevaMarcacion): Promise<Marcacion> {
    if (this.marcaciones.some((m) => m.colaborador_id === n.colaborador_id && m.fecha_local === n.fecha_local && m.tipo === n.tipo)) {
      throw new ErrorNegocio('MARCACION_DUPLICADA', 'duplicada', 409);
    }
    const m: Marcacion = { id: `m-${this.marcaciones.length + 1}`, ...n };
    this.marcaciones.push(m);
    return m;
  }
}

const usuario: UsuarioAutenticado = { id: 'u-1', empresa_id: 'e-1', nombre: 'Ana', rol: 'colaborador' };
const EN_LOCAL = { lat: -12.1212, lng: -77.0297, precision_m: 12, ubicacion_simulada: false };
const LEJOS = { lat: -12.1250, lng: -77.0297, precision_m: 12, ubicacion_simulada: false }; // ~430 m
// Jueves 8 de octubre de 2026 (hora Lima = UTC-5)
const a = (horaLima: string) => new Date(`2026-10-08T${horaLima}:00-05:00`);

async function codigoDeError(p: Promise<unknown>): Promise<string> {
  try { await p; return 'SIN_ERROR'; } catch (e) { return (e as ErrorNegocio).codigo; }
}

describe('registrarMarcacion', () => {
  let repo: RepoEnMemoria;
  beforeEach(() => { repo = new RepoEnMemoria(); });

  it('registra la entrada a tiempo dentro del local', async () => {
    const r = await registrarMarcacion(repo, usuario, EN_LOCAL, a('08:20'));
    expect(r.marcacion.tipo).toBe('entrada');
    expect(r.marcacion.estado).toBe('a_tiempo');
    expect(r.marcacion.dentro_geocerca).toBe(true);
    expect(r.marcacion.fecha_local).toBe('2026-10-08');
    expect(r.mensaje).toContain('08:20');
    expect(r.mensaje).toContain('Sede Miraflores');
  });

  it('usa la hora del servidor y la guarda en UTC', async () => {
    const r = await registrarMarcacion(repo, usuario, EN_LOCAL, a('08:20'));
    expect(r.marcacion.marcado_en).toBe('2026-10-08T13:20:00.000Z');
  });

  it('marca tardanza después de la tolerancia', async () => {
    const r = await registrarMarcacion(repo, usuario, EN_LOCAL, a('08:45'));
    expect(r.marcacion.estado).toBe('tardanza');
  });

  it('después de la entrada, la siguiente marcación es la salida', async () => {
    await registrarMarcacion(repo, usuario, EN_LOCAL, a('08:20'));
    const r = await registrarMarcacion(repo, usuario, EN_LOCAL, a('17:35'));
    expect(r.marcacion.tipo).toBe('salida');
    expect(r.marcacion.estado).toBe('salida');
  });

  it('rechaza una tercera marcación en el día', async () => {
    await registrarMarcacion(repo, usuario, EN_LOCAL, a('08:20'));
    await registrarMarcacion(repo, usuario, EN_LOCAL, a('17:35'));
    expect(await codigoDeError(registrarMarcacion(repo, usuario, EN_LOCAL, a('18:00')))).toBe('JORNADA_COMPLETA');
  });

  it('rechaza si el tipo enviado no corresponde a la secuencia', async () => {
    expect(await codigoDeError(registrarMarcacion(repo, usuario, { ...EN_LOCAL, tipo: 'salida' }, a('08:20')))).toBe('SECUENCIA_INVALIDA');
  });

  it('rechaza fuera de la geocerca con política "rechazar" e informa la distancia', async () => {
    try {
      await registrarMarcacion(repo, usuario, LEJOS, a('08:20'));
      expect.unreachable();
    } catch (e) {
      const err = e as ErrorNegocio;
      expect(err.codigo).toBe('FUERA_DE_GEOCERCA');
      expect(Number(err.detalle?.distancia_m)).toBeGreaterThan(100);
      expect(repo.marcaciones).toHaveLength(0);
    }
  });

  it('con política "observar" registra la marcación como observada', async () => {
    repo.config = { ...repo.config, politica_fuera_geocerca: 'observar' };
    const r = await registrarMarcacion(repo, usuario, LEJOS, a('08:20'));
    expect(r.marcacion.estado).toBe('observada');
    expect(r.marcacion.dentro_geocerca).toBe(false);
  });

  it('rechaza señal GPS imprecisa', async () => {
    expect(await codigoDeError(registrarMarcacion(repo, usuario, { ...EN_LOCAL, precision_m: 120 }, a('08:20')))).toBe('PRECISION_INSUFICIENTE');
  });

  it('rechaza ubicación simulada (fake GPS)', async () => {
    expect(await codigoDeError(registrarMarcacion(repo, usuario, { ...EN_LOCAL, ubicacion_simulada: true }, a('08:20')))).toBe('UBICACION_SIMULADA');
  });

  it('permite ubicación simulada solo si la empresa lo habilita', async () => {
    repo.config = { ...repo.config, permitir_ubicacion_simulada: true };
    const r = await registrarMarcacion(repo, usuario, { ...EN_LOCAL, ubicacion_simulada: true }, a('08:20'));
    expect(r.marcacion.ubicacion_simulada).toBe(true);
  });

  it('rechaza si el colaborador no tiene local asignado', async () => {
    repo.asignacion = null;
    expect(await codigoDeError(registrarMarcacion(repo, usuario, EN_LOCAL, a('08:20')))).toBe('SIN_ASIGNACION');
  });

  it('la doble pulsación simultánea no duplica (índice único)', async () => {
    const resultados = await Promise.allSettled([
      registrarMarcacion(repo, usuario, EN_LOCAL, a('08:20')),
      registrarMarcacion(repo, usuario, EN_LOCAL, a('08:20')),
    ]);
    expect(resultados.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(repo.marcaciones).toHaveLength(1);
  });

  it('en sábado (no programado) registra como extra', async () => {
    const r = await registrarMarcacion(repo, usuario, EN_LOCAL, new Date('2026-10-10T09:00:00-05:00'));
    expect(r.marcacion.estado).toBe('extra');
  });
});

describe('estadoDelDia', () => {
  it('indica la siguiente marcación y el local asignado', async () => {
    const repo = new RepoEnMemoria();
    const e1 = await estadoDelDia(repo, usuario, a('07:50'));
    expect(e1.siguiente).toBe('entrada');
    expect(e1.asignacion?.local.nombre).toBe('Sede Miraflores');
    await registrarMarcacion(repo, usuario, EN_LOCAL, a('08:00'));
    const e2 = await estadoDelDia(repo, usuario, a('12:00'));
    expect(e2.siguiente).toBe('salida');
    expect(e2.marcaciones).toHaveLength(1);
  });

  it('sin asignación no ofrece marcar', async () => {
    const repo = new RepoEnMemoria();
    repo.asignacion = null;
    expect((await estadoDelDia(repo, usuario, a('08:00'))).siguiente).toBeNull();
  });
});
