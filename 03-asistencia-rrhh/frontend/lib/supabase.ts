'use client';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cliente: SupabaseClient | null = null;

/** Cliente del navegador (anon key). Solo para login y Realtime: los datos se piden al backend. */
export function supabase(): SupabaseClient {
  if (!cliente) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
    cliente = createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });
  }
  return cliente;
}
