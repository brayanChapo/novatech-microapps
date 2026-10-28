'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatearFechaLima } from '@/lib/formato';
import type { Cita, Profesional } from '@/lib/tipos';
import { CalendarioSemana } from '@/components/CalendarioSemana';
import { CitaModal } from '@/components/CitaModal';
import { Spinner, Aviso, Boton } from '@/components/ui';

function obtenerLunesDe(fecha: Date): Date {
  const d = new Date(fecha);
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sumarDias(fecha: Date, dias: number): Date {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

function formatearIso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

function AgendaProfesional() {
  const params = useParams<{ profesionalId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const semanaParam = searchParams.get('semana');
  const [lunes, setLunes] = useState<Date>(() => {
    if (semanaParam) return obtenerLunesDe(new Date(`${semanaParam}T12:00:00`));
    return obtenerLunesDe(new Date());
  });

  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  const domingo = sumarDias(lunes, 6);

  useEffect(() => {
    api<{ profesional: Profesional }>(`/profesionales/${params.profesionalId}`)
      .then((r) => setProfesional(r.profesional))
      .catch((e: Error) => setError(e.message));
  }, [params.profesionalId]);

  const cargarCitas = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const query = new URLSearchParams({
        desde: formatearIso(lunes),
        hasta: formatearIso(domingo),
        profesional_id: params.profesionalId,
      });
      const r = await api<{ citas: Cita[] }>(`/citas?${query.toString()}`);
      setCitas(r.citas);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [lunes, domingo, params.profesionalId]);

  useEffect(() => { void cargarCitas(); }, [cargarCitas]);

  function navegar(dias: number) {
    const nuevaFecha = sumarDias(lunes, dias);
    setLunes(nuevaFecha);
    router.push(`/panel/agenda/${params.profesionalId}?semana=${formatearIso(nuevaFecha)}`);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/panel/agenda" className="text-sm text-verde hover:underline">
            ← Todas las agendas
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-marino">
            {profesional ? profesional.nombre : 'Cargando…'}
          </h1>
          {profesional?.especialidad && (
            <p className="text-sm text-slate-500">{profesional.especialidad}</p>
          )}
          <p className="text-sm text-slate-500">
            {formatearFechaLima(lunes)} — {formatearFechaLima(domingo)}
          </p>
        </div>
      </header>

      <div className="flex items-center gap-1">
        <button
          onClick={() => navegar(-7)}
          aria-label="Semana anterior"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          ←
        </button>
        <button
          onClick={() => {
            const hoy = obtenerLunesDe(new Date());
            setLunes(hoy);
            router.push(`/panel/agenda/${params.profesionalId}?semana=${formatearIso(hoy)}`);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Hoy
        </button>
        <button
          onClick={() => navegar(7)}
          aria-label="Semana siguiente"
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          →
        </button>
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}

      {cargando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <CalendarioSemana
          lunes={lunes}
          citas={citas}
          onClickCita={setCitaSeleccionada}
        />
      )}

      {citaSeleccionada && (
        <CitaModal
          cita={citaSeleccionada}
          onCerrar={() => setCitaSeleccionada(null)}
          onActualizar={() => { setCitaSeleccionada(null); void cargarCitas(); }}
        />
      )}
    </div>
  );
}

export default function PaginaAgendaProfesional() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
      <AgendaProfesional />
    </Suspense>
  );
}
