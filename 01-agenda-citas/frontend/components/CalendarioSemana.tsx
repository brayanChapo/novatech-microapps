'use client';
import type { Cita } from '@/lib/tipos';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HORA_INICIO = 8;   // 8:00 AM
const HORA_FIN = 20;     // 8:00 PM
const HORAS = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => i + HORA_INICIO);

// Colores de estado para los bloques de la agenda
const COLORES_ESTADO: Record<string, string> = {
  reservada: 'bg-slate-200 text-slate-700 border-slate-300',
  confirmada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelada: 'bg-red-100 text-red-700 border-red-200 line-through opacity-60',
  asistio: 'bg-blue-100 text-blue-800 border-blue-300',
  no_asistio: 'bg-orange-100 text-orange-700 border-orange-300',
  reprogramada: 'bg-amber-100 text-amber-800 border-amber-300',
};

function sumarDias(fecha: Date, dias: number): Date {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return d;
}

function formatearDiaMes(fecha: Date): string {
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(fecha);
}

function esHoy(fecha: Date): boolean {
  const hoy = new Date();
  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
}

interface Props {
  lunes: Date;
  citas: Cita[];
  onClickCita: (cita: Cita) => void;
}

export function CalendarioSemana({ lunes, citas, onClickCita }: Props) {
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));

  // Agrupa citas por día (ISO date) y hora
  const citasPorDia = new Map<string, Cita[]>();
  for (const cita of citas) {
    const fecha = cita.inicio.slice(0, 10);
    const lista = citasPorDia.get(fecha) ?? [];
    lista.push(cita);
    citasPorDia.set(fecha, lista);
  }

  function citasEnSlot(dia: Date, hora: number): Cita[] {
    const fechaStr = dia.toISOString().slice(0, 10);
    return (citasPorDia.get(fechaStr) ?? []).filter((c) => {
      const h = new Date(c.inicio).getHours();
      return h === hora;
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      {/* Cabecera de días */}
      <div className="grid grid-cols-[60px_repeat(7,minmax(100px,1fr))] border-b border-slate-200">
        <div className="py-3 px-2 text-xs text-slate-400 text-center" aria-hidden="true" />
        {dias.map((dia, i) => (
          <div
            key={i}
            className={`py-3 px-2 text-center ${esHoy(dia) ? 'bg-verde-fondo' : ''}`}
          >
            <p className={`text-xs font-medium uppercase tracking-wide ${esHoy(dia) ? 'text-verde-oscuro' : 'text-slate-500'}`}>
              {DIAS_SEMANA[i]}
            </p>
            <p className={`text-sm font-bold ${esHoy(dia) ? 'text-verde' : 'text-marino'}`}>
              {formatearDiaMes(dia)}
            </p>
          </div>
        ))}
      </div>

      {/* Cuadrícula de horas */}
      <div
        role="grid"
        aria-label="Vista de agenda semanal"
        className="divide-y divide-slate-100"
      >
        {HORAS.map((hora) => (
          <div
            key={hora}
            role="row"
            className="grid grid-cols-[60px_repeat(7,minmax(100px,1fr))]"
          >
            {/* Etiqueta de hora */}
            <div
              role="rowheader"
              className="flex items-start justify-end pr-3 pt-1 text-xs tabular-nums text-slate-400"
              aria-label={`${hora}:00`}
            >
              {hora}:00
            </div>

            {/* Celdas por día */}
            {dias.map((dia, diaIdx) => {
              const slotCitas = citasEnSlot(dia, hora);
              const esHoyDia = esHoy(dia);
              return (
                <div
                  key={diaIdx}
                  role="gridcell"
                  className={`min-h-[56px] border-l border-slate-100 p-1 ${esHoyDia ? 'bg-verde-fondo/40' : ''}`}
                >
                  {slotCitas.map((cita) => {
                    const clases = COLORES_ESTADO[cita.estado] ?? 'bg-slate-100 text-slate-700 border-slate-200';
                    return (
                      <button
                        key={cita.id}
                        onClick={() => onClickCita(cita)}
                        className={`w-full rounded border text-left text-xs px-1.5 py-1 mb-1 leading-tight truncate focus:outline-none focus:ring-2 focus:ring-verde/50 ${clases}`}
                        aria-label={`Cita: ${cita.paciente_nombre ?? 'Paciente'}, ${cita.servicio_nombre ?? 'Servicio'}, ${cita.estado}`}
                      >
                        <span className="block font-medium truncate">{cita.paciente_nombre ?? 'Paciente'}</span>
                        <span className="block truncate opacity-80">{cita.servicio_nombre ?? 'Servicio'}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
