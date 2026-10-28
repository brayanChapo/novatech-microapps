import type { Rol } from '../domain/tipos';
import { ErrorNegocio } from './errores';
import type { Entorno } from '../middleware/auth';
import { createMiddleware } from 'hono/factory';

/**
 * Middleware que verifica que el usuario autenticado tenga uno de los roles indicados.
 * Debe usarse DESPUÉS del middleware `autenticar`.
 */
export const requiereRol = (...roles: Rol[]) =>
  createMiddleware<Entorno>(async (c, next) => {
    const usuario = c.get('usuario');
    if (!roles.includes(usuario.rol)) {
      throw new ErrorNegocio('SIN_PERMISO', 'No tienes permiso para esta acción.', 403);
    }
    await next();
  });
