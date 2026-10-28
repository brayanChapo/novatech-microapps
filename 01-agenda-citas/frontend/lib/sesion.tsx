'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { supabase } from './supabase';
import type { Usuario } from './tipos';

interface Sesion {
  usuario: Usuario | null;
  cargando: boolean;
  salir: () => Promise<void>;
}

const Contexto = createContext<Sesion>({
  usuario: null,
  cargando: true,
  salir: async () => {},
});

/** Protege el panel: sin sesión activa redirige a /login. */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    (async () => {
      const { data } = await supabase().auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      try {
        const yo = await api<{ usuario: Usuario }>('/yo');
        if (!activo) return;
        setUsuario(yo.usuario);
      } catch {
        router.replace('/login');
      } finally {
        if (activo) setCargando(false);
      }
    })();

    const { data: sub } = supabase().auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') router.replace('/login');
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const salir = async () => {
    await supabase().auth.signOut();
  };

  return (
    <Contexto.Provider value={{ usuario, cargando, salir }}>
      {children}
    </Contexto.Provider>
  );
}

export const useSesion = () => useContext(Contexto);
