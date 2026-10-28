'use client';
import { supabase } from './supabase';

export class ErrorApi extends Error {
  constructor(public codigo: string, mensaje: string, public status: number, public detalle?: unknown) {
    super(mensaje);
  }
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function token(): Promise<string> {
  const { data } = await supabase().auth.getSession();
  if (!data.session) throw new ErrorApi('NO_AUTENTICADO', 'Inicia sesión para continuar.', 401);
  return data.session.access_token;
}

/** Llama al backend con el JWT de la sesión. Lanza ErrorApi con el mensaje en español del servidor. */
export async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${ruta}`, {
    ...opciones,
    headers: {
      Authorization: `Bearer ${await token()}`,
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...opciones.headers,
    },
  });
  if (!res.ok) {
    const cuerpo = (await res.json().catch(() => null)) as { error?: { codigo: string; mensaje: string; detalle?: unknown } } | null;
    throw new ErrorApi(
      cuerpo?.error?.codigo ?? 'ERROR',
      cuerpo?.error?.mensaje ?? `Error ${res.status}`,
      res.status,
      cuerpo?.error?.detalle,
    );
  }
  return res.json() as Promise<T>;
}

/** Descarga un archivo (CSV) respetando la autenticación. */
export async function descargar(ruta: string, nombre: string): Promise<void> {
  const res = await fetch(`${BASE}${ruta}`, { headers: { Authorization: `Bearer ${await token()}` } });
  if (!res.ok) {
    const cuerpo = (await res.json().catch(() => null)) as { error?: { mensaje: string } } | null;
    throw new ErrorApi('ERROR', cuerpo?.error?.mensaje ?? 'No se pudo descargar.', res.status);
  }
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
