'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatearFechaLima } from '@/lib/formato';
import type { Cita, Profesional } from '@/lib/tipos';
import { CalendarioSemana } from '@/components/CalendarioSemana';
import { CitaModal } from '@/components/CitaModal';
import { NuevaCitaModal } from '@/components/NuevaCitaModal';
import { Boton, Selector, Spinner, Aviso } from '@/components/ui';
import { useSesion } from '@/lib/sesion';
import { KpiCard } from '@/components/KpiCard';

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

function AgendaGeneral() {
  const router = useRouter();
  const params = useSearchParams();
  const { usuario } = useSesion();

  const semanaParam = params.get('semana');
  const profParam = params.get('profesional') ?? '';

  const [lunes, setLunes] = useState<Date>(() => {
    if (semanaParam) return obtenerLunesDe(new Date(`${semanaParam}T12:00:00`));
    return obtenerLunesDe(new Date());
  });

  const [profesionalId, setProfesionalId] = useState(profParam);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [mostrarNuevaCita, setMostrarNuevaCita] = useState(false);

  const domingo = sumarDias(lunes, 6);

  // Cargar profesionales
  useEffect(() => {
    api<{ profesionales: Profesional[] }>('/profesionales')
      .then((r) => setProfesionales(r.profesionales))
      .catch((e: Error) => setError(e.message));
  }, []);

  const cargarCitas = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const query = new URLSearchParams({
        desde: formatearIso(lunes),
        hasta: formatearIso(domingo),
        ...(profesionalId ? { profesional_id: profesionalId } : {}),
      });
      const r = await api<{ citas: Cita[] }>(`/citas?${query.toString()}`);
      setCitas(r.citas);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [lunes, domingo, profesionalId]);

  useEffect(() => { void cargarCitas(); }, [cargarCitas]);

  function irSemanaAnterior() {
    const nuevaFecha = sumarDias(lunes, -7);
    setLunes(nuevaFecha);
    const p = new URLSearchParams(params.toString());
    p.set('semana', formatearIso(nuevaFecha));
    router.push(`/panel/agenda?${p.toString()}`);
  }

  function irSemanaSiguiente() {
    const nuevaFecha = sumarDias(lunes, 7);
    setLunes(nuevaFecha);
    const p = new URLSearchParams(params.toString());
    p.set('semana', formatearIso(nuevaFecha));
    router.push(`/panel/agenda?${p.toString()}`);
  }

  function cambiarProfesional(id: string) {
    setProfesionalId(id);
    const p = new URLSearchParams(params.toString());
    if (id) p.set('profesional', id); else p.delete('profesional');
    router.push(`/panel/agenda?${p.toString()}`);
  }

  // KPIs de la semana
  const total = citas.length;
  const confirmadas = citas.filter((c) => c.estado === 'confirmada').length;
  const canceladas = citas.filter((c) => c.estado === 'cancelada').length;
  const pendientes = citas.filter((c) => c.estado === 'reservada').length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-marino">Agenda</h1>
          <p className="text-sm text-slate-500">
            {formatearFechaLima(lunes)} — {formatearFechaLima(domingo)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(usuario?.rol === 'admin' || usuario?.rol === 'recepcion') && (
            <Boton type="button" onClick={() => setMostrarNuevaCita(true)}>
              + Nueva cita
            </Boton>
          )}
        </div>
      </header>

      {/* Controles de semana y profesional */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={irSemanaAnterior}
            aria-label="Semana anterior"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            ←
          </button>
          <button
            onClick={() => {
              const hoy = obtenerLunesDe(new Date());
              setLunes(hoy);
              const p = new URLSearchParams(params.toString());
              p.set('semana', formatearIso(hoy));
              router.push(`/panel/agenda?${p.toString()}`);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Hoy
          </button>
          <button
            onClick={irSemanaSiguiente}
            aria-label="Semana siguiente"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            →
          </button>
        </div>

        <Selector
          value={profesionalId}
          onChange={(e) => cambiarProfesional(e.target.value)}
          aria-label="Filtrar por profesional"
          className="max-w-xs"
        >
          <option value="">Todos los profesionales</option>
          {profesionales.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </Selector>
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumen de la semana">
        <KpiCard titulo="Citas esta semana" valor={total} tono="neutro" />
        <KpiCard titulo="Confirmadas" valor={confirmadas} tono="ok" />
        <KpiCard titulo="Pendientes" valor={pendientes} tono="alerta" />
        <KpiCard titulo="Canceladas" valor={canceladas} tono="error" />
      </section>

      {/* Calendario */}
      {cargando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <CalendarioSemana
          lunes={lunes}
          citas={citas}
          onClickCita={setCitaSeleccionada}
        />
      )}

      {/* Modal de detalle de cita */}
      {citaSeleccionada && (
        <CitaModal
          cita={citaSeleccionada}
          onCerrar={() => setCitaSeleccionada(null)}
          onActualizar={() => { setCitaSeleccionada(null); void cargarCitas(); }}
        />
      )}

      {/* Modal de nueva cita */}
      {mostrarNuevaCita && (
        <NuevaCitaModal
          profesionales={profesionales}
          onCerrar={() => setMostrarNuevaCita(false)}
          onCreada={() => { setMostrarNuevaCita(false); void cargarCitas(); }}
        />
      )}
    </div>
  );
}

export default function PaginaAgenda() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
      <AgendaGeneral />
    </Suspense>
  );
}
