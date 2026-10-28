import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { ErrorNegocio } from './errores';

let cliente: SupabaseClient | null = null;

/**
 * Cliente con service_role: omite RLS. Solo existe en el backend.
 * Por eso TODA consulta debe filtrar explícitamente por empresa_id del usuario autenticado.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cliente;
}

export const asistencia = () => supabaseAdmin().schema('asistencia');
export const core = () => supabaseAdmin().schema('core');

/** Convierte un error de PostgREST en ErrorNegocio con mensaje claro. */
export function verificar<T>(resultado: { data: T; error: { code?: string; message: string } | null }): T {
  if (resultado.error) {
    if (resultado.error.code === '23505') {
      throw new ErrorNegocio('CONFLICTO', 'El registro ya existe.', 409);
    }
    if (resultado.error.code === '23503') {
      throw new ErrorNegocio('CONFLICTO', 'El registro está relacionado con otros datos y no puede modificarse así.', 409);
    }
    console.error('[supabase]', resultado.error);
    throw new ErrorNegocio('ERROR_INTERNO', 'Error al acceder a la base de datos.', 500);
  }
  return resultado.data;
}
