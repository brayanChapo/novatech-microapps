import { config } from '../config';
import { ErrorNegocio } from './errores';

const GRAPH_API_VERSION = 'v18.0';

interface ComponenteWA {
  type: string;
  [key: string]: unknown;
}

interface RespuestaMetaWA {
  messages?: Array<{ id: string }>;
  error?: { message: string; code: number };
}

/**
 * Envía un mensaje de plantilla por WhatsApp Business Cloud API.
 * Solo se deben usar plantillas de utilidad aprobadas por Meta (RN-03 y ADR-04).
 *
 * @param telefono    Número en formato E.164 sin '+' (ej: "51987654321")
 * @param plantilla   Nombre de la plantilla aprobada (ej: "confirmacion_cita")
 * @param componentes Parámetros de la plantilla según estructura de Meta
 * @returns           El message_id devuelto por Meta
 */
export async function enviarPlantilla(
  telefono: string,
  plantilla: string,
  componentes: ComponenteWA[],
): Promise<string> {
  const phoneId = config.metaWaPhoneId;
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/messages`;

  const body = {
    messaging_product: 'whatsapp',
    to: telefono,
    type: 'template',
    template: {
      name: plantilla,
      language: { code: 'es' },
      components,
    },
  };

  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.metaWaToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('[whatsapp] Error de red al enviar plantilla', { plantilla, telefono: telefono.slice(-4) });
    throw new ErrorNegocio('ERROR_INTERNO', 'No se pudo enviar el mensaje de WhatsApp.', 500);
  }

  const datos = (await respuesta.json()) as RespuestaMetaWA;

  if (!respuesta.ok || datos.error) {
    console.error('[whatsapp] Error de Meta API', {
      status: respuesta.status,
      error: datos.error,
      plantilla,
    });
    throw new ErrorNegocio('ERROR_INTERNO', 'Error al enviar mensaje de WhatsApp.', 500, {
      meta_error: datos.error,
    });
  }

  const messageId = datos.messages?.[0]?.id;
  if (!messageId) {
    throw new ErrorNegocio('ERROR_INTERNO', 'Meta no devolvió el ID del mensaje.', 500);
  }

  return messageId;
}

/**
 * Verifica el token de webhook recibido de Meta en el handshake GET.
 * Compara con la variable de entorno META_WA_WEBHOOK_TOKEN.
 */
export function verificarWebhookToken(token: string): boolean {
  return token === config.metaWaWebhookToken;
}
