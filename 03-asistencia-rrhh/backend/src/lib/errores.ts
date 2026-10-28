export type CodigoError =
  | 'NO_AUTENTICADO'
  | 'SIN_PERMISO'
  | 'PERFIL_INACTIVO'
  | 'SIN_ASIGNACION'
  | 'UBICACION_SIMULADA'
  | 'PRECISION_INSUFICIENTE'
  | 'FUERA_DE_GEOCERCA'
  | 'JORNADA_COMPLETA'
  | 'SECUENCIA_INVALIDA'
  | 'MARCACION_DUPLICADA'
  | 'DATOS_INVALIDOS'
  | 'NO_ENCONTRADO'
  | 'CONFLICTO'
  | 'ERROR_INTERNO';

/** Error de negocio con mensaje entendible para el usuario final (en español). */
export class ErrorNegocio extends Error {
  constructor(
    public readonly codigo: CodigoError,
    mensaje: string,
    public readonly status: 400 | 401 | 403 | 404 | 409 | 422 | 500 = 422,
    public readonly detalle?: Record<string, unknown>,
  ) {
    super(mensaje);
    this.name = 'ErrorNegocio';
  }
}
