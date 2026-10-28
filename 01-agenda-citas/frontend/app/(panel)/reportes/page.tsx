'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, descargar } from '@/lib/api';
import type { Profesional } from '@/lib/tipos';
import { KpiCard } from '@/components/KpiCard';
import { EstadoBadge } from '@/components/EstadoBadge';
import { Spinner, Aviso, Selector, Boton } from '@/components/ui';
import { formatearFechaLima, formatearHora } from '@/lib/formato';

interface FilaReporte {
  cita_id: string;
  inicio: string;
  profesional_nombre: string;
  paciente_nombre: string;
  servicio_nombre: string;
  estado: string;
}

interface ResumenReporte {
  total: number;
  confirmadas: number;
  asistio: number;
  no_asistio: number;
  canceladas: number;
  tasa_asistencia: number;
}

function ReportesInternos() {
  const router = useRouter();
  const params = useSearchParams();

  const hoy = new Date();
  const [mes, setMes] = useState(Number(params.get('mes') ?? hoy.getMonth() + 1));
  const [anio, setAnio] = useState(Number(params.get('anio') ?? hoy.getFullYear()));
  const [profesionalId, setProfesionalId] = useState(params.get('profesional') ?? '');

  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [filas, setFilas] = useState<FilaReporte[]>([]);
  const [resumen, setResumen] = useState<ResumenReporte | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    api<{ profesionales: Profesional[] }>('/profesionales')
      .then((r) => setProfesionales(r.profesionales))
      .catch((e: Error) => setError(e.message));
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const q = new URLSearchParams({
        mes: String(mes),
        anio: String(anio),
        ...(profesionalId ? { profesional_id: profesionalId } : {}),
      });
      const r = await api<{ filas: FilaReporte[]; resumen: ResumenReporte }>(
        `/reportes/asistencia?${q.toString()}`
      );
      setFilas(r.filas);
      setResumen(r.resumen);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [mes, anio, profesionalId]);

  useEffect(() => {
    void cargar();
    const q = new URLSearchParams({ mes: String(mes), anio: String(anio) });
    if (profesionalId) q.set('profesional', profesionalId);
    router.replace(`/panel/reportes?${q.toString()}`);
  }, [cargar, mes, anio, profesionalId, router]);

  async function exportarCsv() {
    setDescargando(true);
    try {
      const q = new URLSearchParams({ mes: String(mes), anio: String(anio) });
      if (profesionalId) q.set('profesional_id', profesionalId);
      await descargar(
        `/reportes/asistencia/csv?${q.toString()}`,
        `reporte-asistencia-${anio}-${String(mes).padStart(2, '0')}.csv`
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDescargando(false);
    }
  }

  const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const anios = Array.from({ length: 3 }, (_, i) => hoy.getFullYear() - i);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-marino">Reportes de asistencia</h1>
        <Boton
          type="button"
          variante="secundario"
          disabled={descargando || cargando}
          onClick={exportarCsv}
        >
          {descargando ? 'Descargando…' : 'Exportar CSV'}
        </Boton>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label htmlFor="mes-sel" className="sr-only">Mes</label>
          <Selector
            id="mes-sel"
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="max-w-[160px]"
          >
            {MESES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </Selector>
        </div>
        <div>
          <label htmlFor="anio-sel" className="sr-only">Año</label>
          <Selector
            id="anio-sel"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="max-w-[100px]"
          >
            {anios.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Selector>
        </div>
        <div>
          <label htmlFor="prof-sel" className="sr-only">Profesional</label>
          <Selector
            id="prof-sel"
            value={profesionalId}
            onChange={(e) => setProfesionalId(e.target.value)}
            className="max-w-xs"
          >
            <option value="">Todos los profesionales</option>
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </Selector>
        </div>
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}

      {/* KPIs */}
      {resumen && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Resumen del mes">
          <KpiCard titulo="Total citas" valor={resumen.total} tono="neutro" />
          <KpiCard titulo="Confirmadas" valor={resumen.confirmadas} tono="ok" />
          <KpiCard titulo="Asistió" valor={resumen.asistio} tono="ok" detalle={`${resumen.tasa_asistencia}% asistencia`} />
          <KpiCard titulo="No asistió" valor={resumen.no_asistio} tono="error" />
          <KpiCard titulo="Canceladas" valor={resumen.canceladas} tono="alerta" />
        </section>
      )}

      {cargando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Fecha</th>
                <th scope="col" className="px-3 py-3">Hora</th>
                <th scope="col" className="hidden px-3 py-3 sm:table-cell">Profesional</th>
                <th scope="col" className="hidden px-3 py-3 md:table-cell">Paciente</th>
                <th scope="col" className="hidden px-3 py-3 lg:table-cell">Servicio</th>
                <th scope="col" className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas.map((f) => (
                <tr key={f.cita_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">
                    {formatearFechaLima(new Date(f.inicio))}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-slate-700">
                    {formatearHora(new Date(f.inicio))}
                  </td>
                  <td className="hidden px-3 py-3 text-slate-700 sm:table-cell">{f.profesional_nombre}</td>
                  <td className="hidden px-3 py-3 text-slate-700 md:table-cell">{f.paciente_nombre}</td>
                  <td className="hidden px-3 py-3 text-slate-700 lg:table-cell">{f.servicio_nombre}</td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={f.estado} />
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Sin citas en el período seleccionado.
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

export default function PaginaReportes() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
      <ReportesInternos />
    </Suspense>
  );
}
