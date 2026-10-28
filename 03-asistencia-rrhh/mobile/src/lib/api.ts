import { supabase } from './supabase';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ErrorApi extends Error {
  constructor(public codigo: string, mensaje: string, public status: number, public detalle?: Record<string, unknown>) {
    super(mensaje);
  }
}

export async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new ErrorApi('NO_AUTENTICADO', 'Inicia sesión para continuar.', 401);

  let res: Response;
  try {
    res = await fetch(`${BASE}${ruta}`, {
      ...opciones,
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  } catch {
    throw new ErrorApi('SIN_CONEXION', 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.', 0);
  }

  const cuerpo = (await res.json().catch(() => null)) as
    | (T & { error?: { codigo: string; mensaje: string; detalle?: Record<string, unknown> } })
    | null;
  if (!res.ok) {
    throw new ErrorApi(cuerpo?.error?.codigo ?? 'ERROR', cuerpo?.error?.mensaje ?? `Error ${res.status}`, res.status, cuerpo?.error?.detalle);
  }
  return cuerpo as T;
}

// ---------- Tipos de respuesta ----------
export interface Marcacion {
  id: string;
  tipo: 'entrada' | 'salida';
  estado: string;
  marcado_en: string;
  distancia_m: number;
}

export interface EstadoHoy {
  usuario: { id: string; nombre: string; rol: string };
  fecha: string;
  hora_servidor: string;
  reglas: { precision_max_m: number; politica_fuera_geocerca: 'rechazar' | 'observar' };
  asignacion: {
    local: { id: string; nombre: string; lat: number; lng: number; radio_m: number };
    horario: { nombre: string; hora_entrada: string; hora_salida: string; tolerancia_min: number };
  } | null;
  marcaciones: Marcacion[];
  siguiente: 'entrada' | 'salida' | null;
}
