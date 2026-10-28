import { redirect } from 'next/navigation';

/**
 * Raíz del sitio: redirige siempre al panel principal.
 * El layout del panel valida la sesión y redirige a /login si no hay usuario.
 */
export default function PaginaRaiz() {
  redirect('/panel/agenda');
}
