import { config } from '../config';
import { ErrorNegocio } from './errores';

interface RespuestaResend {
  id?: string;
  error?: { name: string; message: string };
}

/**
 * Envía un correo electrónico usando la API HTTP de Resend (sin SDK).
 * El remitente se configura en el panel de Resend; aquí solo definimos destinatario y contenido.
 *
 * @param para   Dirección de correo destino
 * @param asunto Asunto del correo
 * @param html   Cuerpo HTML del correo
 */
export async function enviarCorreo(para: string, asunto: string, html: string): Promise<void> {
  const url = 'https://api.resend.com/emails';

  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Agenda NovaTech <agenda@novatechconsulting.com.pe>',
        to: [para],
        subject: asunto,
        html,
      }),
    });
  } catch (err) {
    console.error('[resend] Error de red al enviar correo', { asunto });
    throw new ErrorNegocio('ERROR_INTERNO', 'No se pudo enviar el correo electrónico.', 500);
  }

  const datos = (await respuesta.json()) as RespuestaResend;

  if (!respuesta.ok || datos.error) {
    console.error('[resend] Error de API', { status: respuesta.status, error: datos.error, asunto });
    throw new ErrorNegocio('ERROR_INTERNO', 'Error al enviar el correo electrónico.', 500, {
      resend_error: datos.error,
    });
  }
}
