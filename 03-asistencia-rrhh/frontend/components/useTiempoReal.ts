'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Escucha nuevas marcaciones con Supabase Realtime y llama a `alCambiar` (con antirrebote).
 * RLS garantiza que solo llegan eventos de la empresa/locales que el usuario puede ver.
 * Como respaldo, refresca cada 60 s por si la conexión en vivo se cae.
 */
export function useTiempoReal(alCambiar: () => void, filtroLocalId?: string) {
  const [conectado, setConectado] = useState(false);
  const ref = useRef(alCambiar);
  ref.current = alCambiar;

  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const disparar = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => ref.current(), 800);
    };

    const canal = supabase()
      .channel(`marcaciones-${filtroLocalId ?? 'todas'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'asistencia',
          table: 'marcaciones',
          ...(filtroLocalId ? { filter: `local_id=eq.${filtroLocalId}` } : {}),
        },
        disparar,
      )
      .subscribe((estado) => setConectado(estado === 'SUBSCRIBED'));

    const respaldo = setInterval(() => ref.current(), 60_000);
    return () => {
      clearTimeout(temporizador);
      clearInterval(respaldo);
      supabase().removeChannel(canal);
    };
  }, [filtroLocalId]);

  return conectado;
}
