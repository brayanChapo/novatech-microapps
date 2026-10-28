'use client';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { fechaLarga, horaCorta, horaLima, hoyLima } from '@/lib/formato';
import type { Local, PersonaLocal } from '@/lib/tipos';
import { KpiCard } from '@/components/KpiCard';
import { EstadoBadge } from '@/components/EstadoBadge';
import { Mapa } from '@/components/Mapa';
import { IndicadorVivo } from '@/components/IndicadorVivo';
import { useTiempoReal } from '@/components/useTiempoReal';

type Filtro = 'todos' | 'sin_marcar' | 'tardanza' | 'en_local';

function DetalleLocal() {
  const { localId } = useParams<{ localId: string }>();
  const params = useSearchParams();
  const [fecha, setFecha] = useState(params.get('fecha') ?? hoyLima());
  const [datos, setDatos] = useState<{ local: Local; personas: PersonaLocal[] } | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const esHoy = fecha === hoyLima();

  const cargar = useCallback(async () => {
    try {
      setDatos(await api(`/dashboard/locales/${localId}?fecha=${fecha}`));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [localId, fecha]);

  useEffect(() => { void cargar(); }, [cargar]);
  const conectado = useTiempoReal(() => { if (esHoy) void cargar(); }, localId);

  const personas = datos?.personas ?? [];
  const conteo = {
    programados: personas.filter((p) => p.hora_entrada_prog).length,
    presentes: personas.filter((p) => p.entrada_en).length,
    tardanzas: personas.filter((p) => p.estado_entrada === 'tardanza').length,
    sinMarcar: personas.filter((p) => p.situacion === 'sin_marcar').length,
    enLocal: personas.filter((p) => p.situacion === 'en_local').length,
  };

  const visibles = useMemo(() => personas.filter((p) => {
    if (busqueda && !`${p.nombre} ${p.documento ?? ''}`.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtro === 'sin_marcar') return p.situacion === 'sin_marcar';
    if (filtro === 'tardanza') return p.estado_entrada === 'tardanza';
    if (filtro === 'en_local') return p.situacion === 'en_local';
    return true;
  }), [personas, filtro, busqueda]);

  return (
    <div className="space-y-6">
      <Link href={`/dashboard?fecha=${fecha}`} className="text-sm text-turquesa-oscuro hover:underline">← Volver al dashboard general</Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-marino">{datos?.local.nombre ?? 'Local'}</h1>
          <p className="text-sm text-slate-500">
            <span>{fechaLarga(fecha)}</span>
            {datos?.local.direccion ? ` · ${datos.local.direccion}` : ''}
            {datos ? ` · Geocerca ${datos.local.radio_m} m` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {esHoy && <IndicadorVivo conectado={conectado} />}
          <input type="date" value={fecha} max={hoyLima()} onChange={(e) => setFecha(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" aria-label="Fecha" />
        </div>
      </header>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard titulo="Presentes" valor={`${conteo.presentes}/${conteo.programados}`} tono="ok" />
        <KpiCard titulo="En el local ahora" valor={conteo.enLocal} detalle="Con entrada y sin salida" />
        <KpiCard titulo="Tardanzas" valor={conteo.tardanzas} tono="alerta" />
        <KpiCard titulo="Sin marcar" valor={conteo.sinMarcar} tono="error" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            {(['todos', 'sin_marcar', 'tardanza', 'en_local'] as Filtro[]).map((f) => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`rounded-full px-3 py-1 text-sm ring-1 ${filtro === f ? 'bg-marino text-white ring-marino' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}>
                {{ todos: 'Todos', sin_marcar: 'Sin marcar', tardanza: 'Tardanzas', en_local: 'En el local' }[f]}
              </button>
            ))}
            <input placeholder="Buscar por nombre o documento" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              className="ml-auto w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm sm:w-64" />
          </div>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-3 py-3">Horario</th>
                  <th className="px-3 py-3">Entrada</th>
                  <th className="px-3 py-3">Salida</th>
                  <th className="px-4 py-3">Situación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibles.map((p) => (
                  <tr key={p.colaborador_id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-marino">{p.nombre}</p>
                      {p.documento && <p className="text-xs text-slate-500">{p.documento}</p>}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">
                      {p.hora_entrada_prog ? `${horaCorta(p.hora_entrada_prog)}–${horaCorta(p.hora_salida_prog)}` : 'No programado'}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-mono tabular-nums">{horaLima(p.entrada_en)}</p>
                      {p.estado_entrada && <EstadoBadge estado={p.estado_entrada} />}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-mono tabular-nums">{horaLima(p.salida_en)}</p>
                      {p.estado_salida && <EstadoBadge estado={p.estado_salida} />}
                    </td>
                    <td className="px-4 py-3"><EstadoBadge estado={p.situacion} /></td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nadie coincide con el filtro.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          {datos && (
            <Mapa puntos={[{ id: datos.local.id, nombre: datos.local.nombre, lat: datos.local.lat, lng: datos.local.lng, radio_m: datos.local.radio_m,
              porcentaje: conteo.programados ? Math.round((conteo.presentes / conteo.programados) * 100) : null }]} alto={320} />
          )}
        </div>
      </section>
    </div>
  );
}

export default function PaginaDetalleLocal() {
  return (
    <Suspense>
      <DetalleLocal />
    </Suspense>
  );
}
