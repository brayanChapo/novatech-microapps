'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function FormularioLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(
    params.get('motivo') === 'sin-acceso'
      ? 'No tienes permisos para acceder al panel.'
      : '',
  );
  const [enviando, setEnviando] = useState(false);

  async function ingresar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    const { error: errAuth } = await supabase().auth.signInWithPassword({
      email: correo.trim(),
      password: clave,
    });
    setEnviando(false);
    if (errAuth) return setError('Correo o contraseña incorrectos.');
    router.replace('/panel/agenda');
  }

  return (
    <main className="min-h-screen grid place-items-center bg-verde-fondo px-4">
      <form onSubmit={ingresar} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-verde-oscuro">
          NovaTech · Agenda
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-marino">Panel de control</h1>

        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="correo">
          Correo electrónico
        </label>
        <input
          id="correo"
          type="email"
          required
          autoComplete="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-verde focus:ring-2 focus:ring-verde/30"
        />

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="clave">
          Contraseña
        </label>
        <input
          id="clave"
          type="password"
          required
          autoComplete="current-password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-verde focus:ring-2 focus:ring-verde/30"
        />

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-lg bg-verde py-2.5 font-medium text-white hover:bg-verde-oscuro disabled:opacity-60"
        >
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}
