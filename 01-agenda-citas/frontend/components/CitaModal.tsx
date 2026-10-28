'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { Cita } from '@/lib/tipos';
import { formatearFechaLima, formatearHora, formatearDuracion } from '@/lib/formato';
import { EstadoBadge } from '@/components/EstadoBadge';
import { Modal, Boton, Aviso } from '@/components/ui';
import { useSesion } from '@/lib/sesion';

interface Props {
  cita: Cita;
  onCerrar: () => void;
  onActualizar: () => void;
}

type AccionCita = 'confirmar' | 'cancelar' | 'asistio' | 'no_asistio';

const ACCIONES_POR_ESTADO: Record<string, AccionCita[]> = {
  reservada: ['confirmar', 'cancelar'],
  confirmada: ['asistio', 'no_asistio', 'cancelar'],
  asistio: [],
  no_asistio: [],
  cancelada: [],
};

const LABELS_ACCION: Record<AccionCita, string> = {
  confirmar: 'Confirmar cita',
  cancelar: 'Cancelar cita',
  asistio: 'Marcó asistencia',
  no_asistio: 'No asistió',
};

const ESTADO_RESULTANTE: Record<AccionCita, string> = {
  confirmar: 'confirmada',
  cancelar: 'cancelada',
  asistio: 'asistio',
  no_asistio: 'no_asistio',
};

export function CitaModal({ cita, onCerrar, onActualizar }: Props) {
  const { usuario } = useSesion();
  const [error, setError] = useState('');
  const [ejecutando, setEjecutando] = useState<AccionCita | null>(null);

  const acciones = ACCIONES_POR_ESTADO[cita.estado] ?? [];

  async function ejecutarAccion(accion: AccionCita) {
    setError('');
    setEjecutando(accion);
    try {
      await api(`/citas/${cita.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: ESTADO_RESULTANTE[accion] }),
      });
      onActualizar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEjecutando(null);
    }
  }

  const puedeActuar = usuario?.rol === 'admin' || usuario?.rol === 'recepcion' || usuario?.rol === 'profesional';

  return (
    <Modal titulo="Detalle de la cita" onCerrar={onCerrar}>
      {/* Datos principales */}
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Estado</dt>
          <dd><EstadoBadge estado={cita.estado} /></dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Fecha</dt>
          <dd className="font-medium text-slate-800">{formatearFechaLima(new Date(cita.inicio))}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Hora</dt>
          <dd className="font-medium text-slate-800 tabular-nums">{formatearHora(new Date(cita.inicio))}</dd>
        </div>
        {cita.fin && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Duración</dt>
            <dd className="font-medium text-slate-800">
              {formatearDuracion(
                Math.round((new Date(cita.fin).getTime() - new Date(cita.inicio).getTime()) / 60000)
              )}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-slate-500">Paciente</dt>
          <dd className="font-medium text-slate-800">{cita.paciente_nombre ?? '—'}</dd>
        </div>
        {cita.paciente_telefono && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Teléfono</dt>
            <dd className="font-medium text-slate-800 tabular-nums">{cita.paciente_telefono}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-slate-500">Profesional</dt>
          <dd className="font-medium text-slate-800">{cita.profesional_nombre ?? '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Servicio</dt>
          <dd className="font-medium text-slate-800">{cita.servicio_nombre ?? '—'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Origen</dt>
          <dd className="text-slate-600 capitalize">{cita.origen === 'web' ? 'Reserva online' : 'Panel interno'}</dd>
        </div>
      </dl>

      {error && (
        <div className="mt-4">
          <Aviso tipo="error">{error}</Aviso>
        </div>
      )}

      {/* Acciones */}
      {puedeActuar && acciones.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {acciones.map((accion) => (
            <Boton
              key={accion}
              type="button"
              variante={accion === 'cancelar' ? 'peligro' : accion === 'confirmar' ? 'primario' : 'secundario'}
              disabled={ejecutando !== null}
              onClick={() => ejecutarAccion(accion)}
            >
              {ejecutando === accion ? 'Actualizando…' : LABELS_ACCION[accion]}
            </Boton>
          ))}
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cerrar
          </Boton>
        </div>
      )}

      {(!puedeActuar || acciones.length === 0) && (
        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cerrar
          </Boton>
        </div>
      )}
    </Modal>
  );
}
