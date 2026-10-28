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
    params.get('motivo') === 'colaborador' ? 'Los colaboradores marcan desde la app móvil. El panel es solo para administradores y supervisores.' : '',
  );
  const [enviando, setEnviando] = useState(false);

  async function ingresar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    const { error } = await supabase().auth.signInWithPassword({ email: correo.trim(), password: clave });
    setEnviando(false);
    if (error) return setError('Correo o contraseña incorrectos.');
    router.replace('/dashboard');
  }

  return (
    <main className="min-h-screen grid place-items-center bg-marino px-4">
      <form onSubmit={ingresar} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <p className="font-mono text-xs uppercase tracking-widest text-turquesa-oscuro">NovaTech · Asistencia</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-marino">Panel de control</h1>
        <label className="mt-6 block text-sm font-medium" htmlFor="correo">Correo</label>
        <input id="correo" type="email" required autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-turquesa-oscuro focus:ring-2 focus:ring-turquesa/40" />
        <label className="mt-4 block text-sm font-medium" htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" required autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-turquesa-oscuro focus:ring-2 focus:ring-turquesa/40" />
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={enviando} className="mt-6 w-full rounded-lg bg-marino py-2.5 font-medium text-white hover:bg-marino-2 disabled:opacity-60">
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
