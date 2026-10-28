'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { fechaLarga, hoyLima, horaLima } from '@/lib/formato';
import type { MarcacionFeed, ResumenLocal, Totales } from '@/lib/tipos';
import { KpiCard } from '@/components/KpiCard';
import { EstadoBadge } from '@/components/EstadoBadge';
import { Mapa } from '@/components/Mapa';
import { IndicadorVivo } from '@/components/IndicadorVivo';
import { useTiempoReal } from '@/components/useTiempoReal';

function DashboardGeneral() {
  const router = useRouter();
  const params = useSearchParams();
  const [fecha, setFecha] = useState(params.get('fecha') ?? hoyLima());
  const [resumen, setResumen] = useState<{ totales: Totales; locales: ResumenLocal[] } | null>(null);
  const [feed, setFeed] = useState<MarcacionFeed[]>([]);
  const [error, setError] = useState('');
  const esHoy = fecha === hoyLima();

  const cargar = useCallback(async () => {
    try {
      const [r, m] = await Promise.all([
        api<{ totales: Totales; locales: ResumenLocal[] }>(`/dashboard/resumen?fecha=${fecha}`),
        api<{ marcaciones: MarcacionFeed[] }>(`/dashboard/marcaciones?fecha=${fecha}&limite=25`),
      ]);
      setResumen(r);
      setFeed(m.marcaciones);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [fecha]);

  useEffect(() => { void cargar(); }, [cargar]);
  const conectado = useTiempoReal(() => { if (esHoy) void cargar(); });

  const nombreLocal = new Map(resumen?.locales.map((l) => [l.local_id, l.local_nombre]));
  const t = resumen?.totales;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-marino">Dashboard general</h1>
          <p className="text-sm text-slate-500">{fechaLarga(fecha)}</p>
        </div>
        <div className="flex items-center gap-3">
          {esHoy && <IndicadorVivo conectado={conectado} />}
          <input type="date" value={fecha} max={hoyLima()} onChange={(e) => setFecha(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm" aria-label="Fecha" />
        </div>
      </header>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard titulo="Asistencia" valor={t?.porcentaje_asistencia != null ? `${t.porcentaje_asistencia}%` : '—'} detalle={`${t?.presentes ?? 0} de ${t?.programados ?? 0} programados`} tono="ok" />
        <KpiCard titulo="Presentes" valor={t?.presentes ?? '—'} tono="ok" />
        <KpiCard titulo="Tardanzas" valor={t?.tardanzas ?? '—'} tono="alerta" />
        <KpiCard titulo="Sin marcar" valor={t?.sin_marcar ?? '—'} tono="error" detalle={esHoy ? 'Aún no registran entrada' : 'No registraron entrada'} />
        <KpiCard titulo="Fuera del local" valor={t?.observadas ?? '—'} tono="error" detalle="Marcaciones observadas" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="space-y-3 xl:col-span-3">
          <h2 className="font-display text-lg font-bold text-marino">Asistencia por local</h2>
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Local</th>
                  <th className="px-3 py-3 text-right">Programados</th>
                  <th className="px-3 py-3 text-right">Presentes</th>
                  <th className="px-3 py-3 text-right">Tardanzas</th>
                  <th className="px-3 py-3 text-right">Sin marcar</th>
                  <th className="px-4 py-3 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resumen?.locales.map((l) => (
                  <tr key={l.local_id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/dashboard/${l.local_id}?fecha=${fecha}`)}>
                    <td className="px-4 py-3 font-medium text-marino">
                      <Link href={`/dashboard/${l.local_id}?fecha=${fecha}`} className="hover:underline">{l.local_nombre}</Link>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{l.programados}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-emerald-700">{l.presentes}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-amber-700">{l.tardanzas}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-red-700">{l.sin_marcar}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{l.porcentaje_asistencia != null ? `${l.porcentaje_asistencia}%` : '—'}</td>
                  </tr>
                ))}
                {resumen && resumen.locales.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No hay locales para mostrar.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Mapa
            puntos={(resumen?.locales ?? []).map((l) => ({
              id: l.local_id, nombre: l.local_nombre, lat: l.lat, lng: l.lng, radio_m: l.radio_m,
              porcentaje: l.porcentaje_asistencia, etiqueta: `${l.presentes}/${l.programados} presentes`,
            }))}
            alHacerClic={(id) => router.push(`/dashboard/${id}?fecha=${fecha}`)}
          />
        </div>

        <div className="space-y-3 xl:col-span-2">
          <h2 className="font-display text-lg font-bold text-marino">Últimas marcaciones</h2>
          <ul className="divide-y divide-slate-100 rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {feed.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-marino">{m.colaborador_nombre}</p>
                  <p className="truncate text-xs text-slate-500">
                    {m.tipo === 'entrada' ? 'Entrada' : 'Salida'} · {nombreLocal.get(m.local_id) ?? 'Local'} · a {Math.round(m.distancia_m)} m
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm tabular-nums">{horaLima(m.marcado_en)}</p>
                  <EstadoBadge estado={m.estado} />
                </div>
              </li>
            ))}
            {feed.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-500">Sin marcaciones en esta fecha.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default function PaginaDashboard() {
  return (
    <Suspense>
      <DashboardGeneral />
    </Suspense>
  );
}
