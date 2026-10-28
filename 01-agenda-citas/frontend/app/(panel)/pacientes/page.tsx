'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Paciente } from '@/lib/tipos';
import { Spinner, Aviso, Entrada } from '@/components/ui';

function ListaPacientesInterna() {
  const router = useRouter();
  const params = useSearchParams();
  const [busqueda, setBusqueda] = useState(params.get('q') ?? '');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const query = busqueda.trim() ? `?q=${encodeURIComponent(busqueda.trim())}` : '';
      const r = await api<{ pacientes: Paciente[] }>(`/pacientes${query}`);
      setPacientes(r.pacientes);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [busqueda]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void cargar();
      const p = new URLSearchParams();
      if (busqueda.trim()) p.set('q', busqueda.trim());
      router.replace(`/panel/pacientes${busqueda.trim() ? `?${p.toString()}` : ''}`);
    }, 350);
    return () => clearTimeout(timeout);
  }, [busqueda, cargar, router]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-marino">Pacientes</h1>
      </header>

      <div className="max-w-sm">
        <label htmlFor="busqueda" className="sr-only">Buscar paciente</label>
        <Entrada
          id="busqueda"
          type="search"
          placeholder="Buscar por nombre, teléfono o documento…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}

      {cargando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Nombre</th>
                <th scope="col" className="px-3 py-3">Teléfono</th>
                <th scope="col" className="hidden px-3 py-3 sm:table-cell">Documento</th>
                <th scope="col" className="hidden px-3 py-3 md:table-cell text-center">WhatsApp</th>
                <th scope="col" className="hidden px-3 py-3 lg:table-cell text-right">Citas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacientes.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/panel/pacientes/${p.id}`}
                      className="font-medium text-marino hover:underline"
                    >
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-slate-700">{p.telefono}</td>
                  <td className="hidden px-3 py-3 text-slate-500 sm:table-cell">{p.documento ?? '—'}</td>
                  <td className="hidden px-3 py-3 text-center md:table-cell">
                    {p.acepta_whatsapp ? (
                      <span className="text-verde" aria-label="Acepta WhatsApp">✓</span>
                    ) : (
                      <span className="text-slate-400" aria-label="No acepta WhatsApp">—</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 text-right tabular-nums text-slate-700 lg:table-cell">
                    {p.total_citas ?? 0}
                  </td>
                </tr>
              ))}
              {pacientes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {busqueda ? 'No se encontraron pacientes con ese criterio.' : 'No hay pacientes registrados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PaginaPacientes() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
      <ListaPacientesInterna />
    </Suspense>
  );
}
