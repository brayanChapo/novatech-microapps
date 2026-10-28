import type { UsuarioAutenticado } from '../domain/tipos';
import { ErrorNegocio } from './errores';
import { asistencia, verificar } from './supabase';

/**
 * Locales que el usuario puede ver en el dashboard.
 * - admin: todos los de su empresa (null = sin filtro)
 * - supervisor: solo los asignados en supervisores_locales
 */
export async function localesPermitidos(usuario: UsuarioAutenticado): Promise<string[] | null> {
  if (usuario.rol === 'admin') return null;
  if (usuario.rol !== 'supervisor') throw new ErrorNegocio('SIN_PERMISO', 'No tienes permiso para esta acción.', 403);
  const filas = verificar(
    await asistencia()
      .from('supervisores_locales')
      .select('local_id')
      .eq('supervisor_id', usuario.id)
      .eq('empresa_id', usuario.empresa_id),
  ) as { local_id: string }[];
  return filas.map((f) => f.local_id);
}

export async function asegurarAccesoLocal(usuario: UsuarioAutenticado, localId: string): Promise<void> {
  const permitidos = await localesPermitidos(usuario);
  if (permitidos && !permitidos.includes(localId)) {
    throw new ErrorNegocio('SIN_PERMISO', 'No supervisas este local.', 403);
  }
}
