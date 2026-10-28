import { createMiddleware } from 'hono/factory';
import { ErrorNegocio } from '../lib/errores';

/** Entrada del contador en memoria */
interface Contador {
  intentos: number;
  ventanaExpira: number; // timestamp en ms
}

/** Almacenamiento en memoria (suficiente para el MVP — no se persiste entre reinicios) */
const contadoresPorIp = new Map<string, Contador>();
const contadoresPorTelefono = new Map<string, Contador>();

const MAX_POR_IP = 5;
const VENTANA_IP_MS = 10 * 60_000; // 10 minutos

const MAX_POR_TELEFONO = 3;
const VENTANA_TELEFONO_MS = 24 * 60 * 60_000; // 24 horas

/** Incrementa el contador y devuelve false si se excede el límite. */
function verificarLimite(
  mapa: Map<string, Contador>,
  clave: string,
  maximo: number,
  ventanaMs: number,
): boolean {
  const ahora = Date.now();
  const entrada = mapa.get(clave);

  if (!entrada || ahora > entrada.ventanaExpira) {
    // Primera petición o ventana expirada: reiniciar
    mapa.set(clave, { intentos: 1, ventanaExpira: ahora + ventanaMs });
    return true; // dentro del límite
  }

  if (entrada.intentos >= maximo) {
    return false; // límite excedido
  }

  entrada.intentos += 1;
  return true;
}

/** Extrae la IP real del request (considera proxy headers de Vercel). */
function obtenerIp(request: Request): string {
  return (
    (request.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ||
    'desconocida'
  );
}

/**
 * Middleware de rate limit por IP.
 * Máximo 5 intentos por IP en ventana de 10 minutos.
 */
export const rateLimitPorIp = createMiddleware(async (c, next) => {
  const ip = obtenerIp(c.req.raw);
  if (!verificarLimite(contadoresPorIp, ip, MAX_POR_IP, VENTANA_IP_MS)) {
    throw new ErrorNegocio(
      'RATE_LIMIT_IP',
      'Demasiadas solicitudes desde tu dirección IP. Espera unos minutos antes de intentarlo de nuevo.',
      429,
    );
  }
  await next();
});

/**
 * Middleware de rate limit por teléfono.
 * Máximo 3 reservas por teléfono en ventana de 24 horas.
 * Requiere que el body contenga { telefono: string }.
 */
export const rateLimitPorTelefono = createMiddleware(async (c, next) => {
  // Leer el body sin consumirlo (clonar para que el handler lo vuelva a leer)
  let telefono: string | null = null;
  try {
    const body = await c.req.raw.clone().json();
    if (typeof body === 'object' && body !== null && 'telefono' in body) {
      telefono = String(body.telefono);
    }
  } catch {
    // Body no JSON o vacío: el handler lo rechazará con Zod
  }

  if (telefono) {
    const claveNormalizada = telefono.replace(/\D/g, '');
    if (!verificarLimite(contadoresPorTelefono, claveNormalizada, MAX_POR_TELEFONO, VENTANA_TELEFONO_MS)) {
      throw new ErrorNegocio(
        'RATE_LIMIT_TELEFONO',
        'Este número de teléfono ha alcanzado el límite de reservas por hoy. Comunícate directamente con el consultorio.',
        429,
      );
    }
  }

  await next();
});

/**
 * Expone la función de verificación para tests unitarios.
 * No es para uso en producción fuera de este módulo.
 */
export { verificarLimite };
