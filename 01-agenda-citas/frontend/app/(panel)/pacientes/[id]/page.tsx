'use client';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Cita, Paciente } from '@/lib/tipos';
import { formatearFechaLima, formatearHora } from '@/lib/formato';
import { EstadoBadge } from '@/components/EstadoBadge';
import { Spinner, Aviso } from '@/components/ui';

function DetallePacienteInterna() {
  const params = useParams<{ id: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setCargando(true);
    Promise.all([
      api<{ paciente: Paciente }>(`/pacientes/${params.id}`),
      api<{ citas: Cita[] }>(`/citas?paciente_id=${params.id}`),
    ])
      .then(([p, c]) => {
        setPaciente(p.paciente);
        setCitas(c.citas);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, [params.id]);

  if (cargando) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (error) return <Aviso tipo="error">{error}</Aviso>;
  if (!paciente) return null;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/panel/pacientes" className="text-sm text-verde hover:underline">
          ← Pacientes
        </Link>
        <h1 className="mt-1 font-display text-2xl font-bold text-marino">{paciente.nombre}</h1>
      </header>

      {/* Datos del paciente */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 font-display text-lg font-bold text-marino">Datos</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Teléfono</dt>
            <dd className="font-medium text-slate-800">{paciente.telefono}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Documento</dt>
            <dd className="font-medium text-slate-800">{paciente.documento ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Acepta WhatsApp</dt>
            <dd className="font-medium text-slate-800">{paciente.acepta_whatsapp ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Total de citas</dt>
            <dd className="font-medium text-slate-800">{citas.length}</dd>
          </div>
        </dl>
      </section>

      {/* Historial de citas */}
      <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-display text-lg font-bold text-marino">Historial de citas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Fecha</th>
                <th scope="col" className="px-3 py-3">Hora</th>
                <th scope="col" className="hidden px-3 py-3 sm:table-cell">Profesional</th>
                <th scope="col" className="hidden px-3 py-3 md:table-cell">Servicio</th>
                <th scope="col" className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citas.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">
                    {formatearFechaLima(new Date(c.inicio))}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-slate-700">
                    {formatearHora(new Date(c.inicio))}
                  </td>
                  <td className="hidden px-3 py-3 text-slate-700 sm:table-cell">
                    {c.profesional_nombre ?? '—'}
                  </td>
                  <td className="hidden px-3 py-3 text-slate-700 md:table-cell">
                    {c.servicio_nombre ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={c.estado} />
                  </td>
                </tr>
              ))}
              {citas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Sin citas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function PaginaDetallePaciente() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
      <DetallePacienteInterna />
    </Suspense>
  );
}
