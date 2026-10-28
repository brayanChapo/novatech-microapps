import { Hono } from 'hono';
import { verificarWebhookToken } from '../lib/whatsapp';
import { ErrorNegocio } from '../lib/errores';
import { SupabaseCitaRepo } from '../repos/supabase-cita.repo';
import { procesarRespuestaWhatsapp } from '../services/whatsapp.service';

const repo = new SupabaseCitaRepo();

export const rutasWebhooks = new Hono()
  /**
   * GET /webhooks/whatsapp — verificación de webhook de Meta.
   * Meta llama a este endpoint con hub.mode, hub.challenge y hub.verify_token
   * cuando se registra o se actualiza el webhook en el panel de Meta Developers.
   */
  .get('/webhooks/whatsapp', (c) => {
    const mode = c.req.query('hub.mode');
    const challenge = c.req.query('hub.challenge');
    const token = c.req.query('hub.verify_token') ?? '';

    if (mode !== 'subscribe') {
      throw new ErrorNegocio('WEBHOOK_INVALIDO', 'Modo de verificación inválido.', 400);
    }

    if (!verificarWebhookToken(token)) {
      throw new ErrorNegocio('WEBHOOK_INVALIDO', 'Token de verificación incorrecto.', 403);
    }

    // Meta espera recibir solo el challenge en texto plano
    return c.text(challenge ?? '');
  })

  /**
   * POST /webhooks/whatsapp — recibe mensajes y respuestas del paciente.
   * Procesa respuestas de tipo 1 (confirmar), 2 (cancelar), 3 (reprogramar).
   */
  .post('/webhooks/whatsapp', async (c) => {
    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      // Meta puede enviar cuerpos vacíos para verificar conectividad
      return c.json({ ok: true });
    }

    const resultado = await procesarRespuestaWhatsapp(bodyRaw, repo);

    // Meta siempre espera 200; los errores internos se registran en logs
    return c.json({ ok: true, ...resultado });
  });
