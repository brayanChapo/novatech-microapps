'use client';
import { useEffect, useState } from 'react';
import type { SlotDisponible } from '@/lib/tipos';
import { formatearHora } from '@/lib/formato';
import { Spinner } from '@/components/ui';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

interface Props {
  empresaId: string;
  profesionalId: string;
  servicioId: string;
  fecha: string;
  seleccionado: SlotDisponible | null;
  onSeleccionar: (slot: SlotDisponible) => void;
}

export function SlotPicker({ empresaId, profesionalId, servicioId, fecha, seleccionado, onSeleccionar }: Props) {
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profesionalId || !fecha || !empresaId) return;
    setCargando(true);
    setError('');

    const query = new URLSearchParams({
      empresa_id: empresaId,
      profesional_id: profesionalId,
      fecha,
      ...(servicioId ? { servicio_id: servicioId } : {}),
    });

    fetch(`${BASE}/reservas/slots?${query.toString()}`)
      .then(async (res) => {
        const cuerpo = await res.json() as { slots?: SlotDisponible[]; error?: { mensaje: string } };
        if (!res.ok) throw new Error(cuerpo.error?.mensaje ?? 'No se pudieron cargar los horarios.');
        setSlots(cuerpo.slots ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, [profesionalId, servicioId, fecha]);

  if (cargando) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
        <Spinner tamanio="sm" />
        <span>Cargando horarios disponibles…</span>
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
        No hay horarios disponibles para esta fecha. Elige otro día.
      </p>
    );
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">
        Horarios disponibles ({slots.length})
      </legend>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Horarios disponibles">
        {slots.map((slot) => {
          const estaSeleccionado = seleccionado?.inicio === slot.inicio;
          return (
            <button
              key={slot.inicio}
              type="button"
              role="option"
              aria-selected={estaSeleccionado}
              onClick={() => onSeleccionar(slot)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-verde/50 ${
                estaSeleccionado
                  ? 'border-verde bg-verde text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-verde hover:bg-verde-fondo'
              }`}
            >
              {formatearHora(new Date(slot.inicio))}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
