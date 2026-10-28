import { createMiddleware } from 'hono/factory';
import type { Rol, UsuarioAutenticado } from '../domain/tipos';
import { ErrorNegocio } from '../lib/errores';
import { core, supabaseAdmin } from '../lib/supabase';

export type Entorno = { Variables: { usuario: UsuarioAutenticado } };

/** Valida el JWT de Supabase Auth y carga el perfil (empresa y rol) del usuario. */
export const autenticar = createMiddleware<Entorno>(async (c, next) => {
  const cabecera = c.req.header('Authorization') ?? '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : '';
  if (!token) throw new ErrorNegocio('NO_AUTENTICADO', 'Inicia sesión para continuar.', 401);

  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) {
    throw new ErrorNegocio('NO_AUTENTICADO', 'Tu sesión expiró. Vuelve a iniciar sesión.', 401);
  }

  const { data: perfil } = await core()
    .from('perfiles')
    .select('id, empresa_id, nombre, rol, activo')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!perfil || !perfil.activo) {
    throw new ErrorNegocio(
      'PERFIL_INACTIVO',
      'Tu usuario no está habilitado. Comunícate con tu administrador.',
      403,
    );
  }

  // Validar que el rol sea uno de los permitidos en la agenda
  const rolesValidos: Rol[] = ['admin', 'recepcion', 'profesional'];
  if (!rolesValidos.includes(perfil.rol as Rol)) {
    throw new ErrorNegocio('SIN_PERMISO', 'Tu rol no tiene acceso a esta aplicación.', 403);
  }

  c.set('usuario', {
    id: perfil.id as string,
    empresa_id: perfil.empresa_id as string,
    nombre: perfil.nombre as string,
    rol: perfil.rol as Rol,
  });
  await next();
});
