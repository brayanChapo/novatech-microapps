/** Resultado del cálculo de recordatorio */
export interface ResultadoRecordatorio {
  debe: boolean;
  tipo: '24h' | '2h';
}

const MS_24H = 24 * 60 * 60_000;
const MS_2H = 2 * 60 * 60_000;

/**
 * Decide si se debe enviar un recordatorio y de qué tipo.
 * Función PURA: sin efectos secundarios, sin I/O.
 *
 * Reglas (RN-02):
 * - Si la cita fue creada con > 24h de anticipación → recordatorio 24h antes del inicio.
 * - Si la cita fue creada con ≤ 24h de anticipación → recordatorio 2h antes del inicio.
 *
 * @param inicioCita  Fecha/hora de inicio de la cita (UTC)
 * @param ahora       Momento actual
 * @param creadoEn    Momento en que fue creada la cita
 * @param yaEnviado   Si el recordatorio ya fue enviado previamente
 */
export function debeEnviarRecordatorio(
  inicioCita: Date,
  ahora: Date,
  creadoEn: Date,
  yaEnviado: boolean,
): ResultadoRecordatorio {
  if (yaEnviado) return { debe: false, tipo: '24h' };

  const msHastaCita = inicioCita.getTime() - ahora.getTime();

  // La cita ya pasó o ya empezó
  if (msHastaCita < 0) return { debe: false, tipo: '24h' };

  const msAnticipacion = inicioCita.getTime() - creadoEn.getTime();
  const tipo: '24h' | '2h' = msAnticipacion > MS_24H ? '24h' : '2h';

  const ventana = tipo === '24h' ? MS_24H : MS_2H;

  // El recordatorio se envía cuando faltan ≤ ventana para la cita, con un margen de 1h para no re-enviar
  const margenMaximo = ventana;
  const margenMinimo = ventana - 60 * 60_000; // 1h antes del umbral

  const debe = msHastaCita <= margenMaximo && msHastaCita >= margenMinimo;

  return { debe, tipo };
}
