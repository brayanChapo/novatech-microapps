import { evaluarGeocerca } from '../domain/geocerca';
import { calcularEstado, siguienteTipo } from '../domain/reglas';
import { momentoLocal } from '../domain/tiempo';
import type { Marcacion, TipoMarcacion, UsuarioAutenticado } from '../domain/tipos';
import { ErrorNegocio } from '../lib/errores';
import type { Asignacion, MarcacionRepo } from '../repos/marcacion.repo';

export interface EntradaMarcacion {
  tipo?: TipoMarcacion;
  lat: number;
  lng: number;
  precision_m: number;
  ubicacion_simulada: boolean;
  dispositivo?: Record<string, unknown>;
}

export interface ResultadoMarcacion {
  marcacion: Marcacion;
  mensaje: string;
}

const ETIQUETA_ESTADO: Record<Marcacion['estado'], string> = {
  a_tiempo: 'a tiempo',
  tardanza: 'con tardanza',
  salida: '',
  salida_anticipada: 'antes de la hora de salida',
  observada: 'fuera del local (observada)',
  extra: 'en día no programado',
};

/**
 * Caso de uso principal: registrar una marcación desde el celular.
 * Toda la validación ocurre aquí, en el servidor. El celular solo envía su posición.
 */
export async function registrarMarcacion(
  repo: MarcacionRepo,
  usuario: UsuarioAutenticado,
  entrada: EntradaMarcacion,
  ahora: Date = new Date(),
): Promise<ResultadoMarcacion> {
  const zona = await repo.zonaHoraria(usuario.empresa_id);
  const momento = momentoLocal(ahora, zona);

  const [config, asignacion, delDia] = await Promise.all([
    repo.configuracion(usuario.empresa_id),
    repo.asignacionVigente(usuario.id, momento.fecha),
    repo.marcacionesDelDia(usuario.id, momento.fecha),
  ]);

  if (!asignacion) {
    throw new ErrorNegocio('SIN_ASIGNACION', 'No tienes un local asignado. Comunícate con tu administrador.', 422);
  }

  if (entrada.ubicacion_simulada && !config.permitir_ubicacion_simulada) {
    throw new ErrorNegocio(
      'UBICACION_SIMULADA',
      'Se detectó una ubicación simulada en el celular. Desactiva las apps de ubicación falsa e inténtalo de nuevo.',
      422,
    );
  }

  const geo = evaluarGeocerca({
    posicion: { lat: entrada.lat, lng: entrada.lng },
    centro: asignacion.local,
    radio_m: asignacion.local.radio_m,
    precision_m: entrada.precision_m,
    precisionMax_m: config.precision_max_m,
  });

  if (!geo.precisionSuficiente) {
    throw new ErrorNegocio(
      'PRECISION_INSUFICIENTE',
      `La señal GPS es imprecisa (±${Math.round(entrada.precision_m)} m). Acércate a una ventana o sal al exterior y vuelve a intentarlo.`,
      422,
      { precision_m: entrada.precision_m, precision_max_m: config.precision_max_m },
    );
  }

  if (!geo.dentro && config.politica_fuera_geocerca === 'rechazar') {
    throw new ErrorNegocio(
      'FUERA_DE_GEOCERCA',
      `Estás a ${Math.round(geo.distancia_m)} m de ${asignacion.local.nombre}. Debes estar dentro de ${asignacion.local.radio_m} m para marcar.`,
      422,
      { distancia_m: geo.distancia_m, radio_m: asignacion.local.radio_m, local: asignacion.local.nombre },
    );
  }

  const esperado = siguienteTipo(delDia);
  if (esperado === null) {
    throw new ErrorNegocio('JORNADA_COMPLETA', 'Ya registraste tu entrada y tu salida de hoy.', 409);
  }
  if (entrada.tipo && entrada.tipo !== esperado) {
    throw new ErrorNegocio(
      'SECUENCIA_INVALIDA',
      esperado === 'entrada' ? 'Primero debes marcar tu entrada.' : 'Tu entrada ya está registrada; ahora corresponde marcar la salida.',
      409,
    );
  }

  const estado = calcularEstado({
    tipo: esperado,
    minutosLocal: momento.minutos,
    diaIso: momento.diaIso,
    horario: asignacion.horario,
    dentroGeocerca: geo.dentro,
  });

  const marcacion = await repo.insertar({
    empresa_id: usuario.empresa_id,
    colaborador_id: usuario.id,
    local_id: asignacion.local.id,
    tipo: esperado,
    marcado_en: ahora.toISOString(),
    fecha_local: momento.fecha,
    lat: entrada.lat,
    lng: entrada.lng,
    precision_m: entrada.precision_m,
    distancia_m: geo.distancia_m,
    dentro_geocerca: geo.dentro,
    estado,
    ubicacion_simulada: entrada.ubicacion_simulada,
    dispositivo: entrada.dispositivo ?? {},
  });

  const detalle = ETIQUETA_ESTADO[estado];
  const mensaje = `${esperado === 'entrada' ? 'Entrada' : 'Salida'} registrada a las ${momento.hora} en ${asignacion.local.nombre}${detalle ? ` ${detalle}` : ''}.`;
  return { marcacion, mensaje };
}

export interface EstadoDelDia {
  fecha: string;
  hora_servidor: string;
  /** Para que la app muestre si la precisión del GPS es suficiente y si puede marcar fuera del local. */
  reglas: { precision_max_m: number; politica_fuera_geocerca: 'rechazar' | 'observar' };
  asignacion: Asignacion | null;
  marcaciones: Marcacion[];
  siguiente: TipoMarcacion | null;
}

/** Lo que la app móvil necesita para pintar la pantalla de marcación. */
export async function estadoDelDia(
  repo: MarcacionRepo,
  usuario: UsuarioAutenticado,
  ahora: Date = new Date(),
): Promise<EstadoDelDia> {
  const zona = await repo.zonaHoraria(usuario.empresa_id);
  const momento = momentoLocal(ahora, zona);
  const [asignacion, marcaciones, config] = await Promise.all([
    repo.asignacionVigente(usuario.id, momento.fecha),
    repo.marcacionesDelDia(usuario.id, momento.fecha),
    repo.configuracion(usuario.empresa_id),
  ]);
  return {
    fecha: momento.fecha,
    hora_servidor: momento.hora,
    reglas: { precision_max_m: config.precision_max_m, politica_fuera_geocerca: config.politica_fuera_geocerca },
    asignacion,
    marcaciones,
    siguiente: asignacion ? siguienteTipo(marcaciones) : null,
  };
}
