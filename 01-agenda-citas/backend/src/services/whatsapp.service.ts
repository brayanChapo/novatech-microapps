import type { MensajeWhatsApp } from '../domain/tipos';
import { ErrorNegocio } from '../lib/errores';
import { agenda, verificar } from '../lib/supabase';
import type { CitaRepo } from '../repos/cita.repo';

/** Respuestas válidas del paciente (numérica o texto) */
const RESPUESTAS_CONFIRMAR = new Set(['1', 'confirmar', 'si', 'sí', 'yes']);
const RESPUESTAS_CANCELAR = new Set(['2', 'cancelar', 'no', 'cancel']);
const RESPUESTAS_REPROGRAMAR = new Set(['3', 'reprogramar', 'cambiar', 'reschedule']);

/**
 * Parsea el payload crudo del webhook de Meta.
 * Soporta el esquema estándar de WhatsApp Business Cloud API.
 */
export function parsearWebhookMeta(body: unknown): MensajeWhatsApp | null {
  if (typeof body !== 'object' || body === null) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- payload de Meta no tiene tipos
  const b = body as any;

  try {
    const entry = b?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const mensaje = value?.messages?.[0];

    if (!mensaje) return null;

    return {
      de: String(mensaje.from),
      cuerpo: String(mensaje.text?.body ?? '').trim(),
      timestamp: Number(mensaje.timestamp ?? 0),
      messageId: String(mensaje.id),
    };
  } catch {
    return null;
  }
}

/**
 * Caso de uso: procesar respuesta del paciente recibida por webhook de WhatsApp.
 *
 * 1. Parsear el body del webhook de Meta
 * 2. Identificar la empresa activa (busca en mensajes_whatsapp el número más reciente)
 * 3. Buscar la última cita activa del paciente por teléfono
 * 4. Actualizar el estado según la respuesta (1=confirmar, 2=cancelar, 3=reprogramar)
 */
export async function procesarRespuestaWhatsapp(
  mensajeRaw: unknown,
  repo: CitaRepo,
): Promise<{ procesado: boolean; accion: string }> {
  const mensaje = parsearWebhookMeta(mensajeRaw);
  if (!mensaje) return { procesado: false, accion: 'sin_mensaje' };

  const cuerpoNormalizado = mensaje.cuerpo.toLowerCase().trim();

  // Buscar la empresa a la que pertenece este teléfono (por mensajes_whatsapp enviados)
  const { data: ultimoMensaje } = await agenda()
    .from('mensajes_whatsapp')
    .select('empresa_id, cita_id')
    .eq('telefono', mensaje.de)
    .order('enviado_en', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!ultimoMensaje) {
    return { procesado: false, accion: 'empresa_no_encontrada' };
  }

  const empresaId = ultimoMensaje.empresa_id as string;

  // Buscar cita activa más reciente del paciente
  const { data: paciente } = await agenda()
    .from('pacientes')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('telefono', mensaje.de)
    .maybeSingle();

  if (!paciente) {
    return { procesado: false, accion: 'paciente_no_encontrado' };
  }

  const { data: cita } = await agenda()
    .from('citas')
    .select('id, estado')
    .eq('empresa_id', empresaId)
    .eq('paciente_id', paciente.id)
    .in('estado', ['reservada', 'confirmada'])
    .gte('inicio', new Date().toISOString())
    .order('inicio')
    .limit(1)
    .maybeSingle();

  if (!cita) {
    return { procesado: false, accion: 'cita_no_encontrada' };
  }

  const citaId = cita.id as string;

  if (RESPUESTAS_CONFIRMAR.has(cuerpoNormalizado)) {
    await repo.actualizarEstado(citaId, empresaId, 'confirmada');
    return { procesado: true, accion: 'confirmada' };
  }

  if (RESPUESTAS_CANCELAR.has(cuerpoNormalizado)) {
    await repo.actualizarEstado(citaId, empresaId, 'cancelada');
    return { procesado: true, accion: 'cancelada' };
  }

  if (RESPUESTAS_REPROGRAMAR.has(cuerpoNormalizado)) {
    // Por ahora solo registramos la intención; la reprogramación la hace recepción
    console.info('[whatsapp] Paciente solicita reprogramación', { cita_id: citaId });
    return { procesado: true, accion: 'reprogramacion_solicitada' };
  }

  return { procesado: false, accion: 'respuesta_no_reconocida' };
}
