export type CodigoError =
  | 'NO_AUTENTICADO'
  | 'SIN_PERMISO'
  | 'PERFIL_INACTIVO'
  | 'SLOT_NO_DISPONIBLE'
  | 'RATE_LIMIT_IP'
  | 'RATE_LIMIT_TELEFONO'
  | 'TRANSICION_INVALIDA'
  | 'WEBHOOK_INVALIDO'
  | 'DATOS_INVALIDOS'
  | 'NO_ENCONTRADO'
  | 'CONFLICTO'
  | 'ERROR_INTERNO';

/** Error de negocio con mensaje entendible para el usuario final (en español). */
export class ErrorNegocio extends Error {
  constructor(
    public readonly codigo: CodigoError,
    mensaje: string,
    public readonly status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 = 422,
    public readonly detalle?: Record<string, unknown>,
  ) {
    super(mensaje);
    this.name = 'ErrorNegocio';
  }
}
