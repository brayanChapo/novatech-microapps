'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import type { Profesional, Servicio, SlotDisponible } from '@/lib/tipos';
import { formatearHora } from '@/lib/formato';
import { Modal, Boton, Campo, Entrada, Selector, Aviso, Spinner } from '@/components/ui';

interface Props {
  profesionales: Profesional[];
  onCerrar: () => void;
  onCreada: () => void;
}

interface FormNuevaCita {
  profesional_id: string;
  servicio_id: string;
  fecha: string;
  inicio: string;
  nombre_paciente: string;
  telefono_paciente: string;
}

export function NuevaCitaModal({ profesionales, onCerrar, onCreada }: Props) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormNuevaCita>({
    defaultValues: { profesional_id: '', servicio_id: '', fecha: '', inicio: '' },
  });

  const profesionalId = watch('profesional_id');
  const servicioId = watch('servicio_id');
  const fecha = watch('fecha');

  // Cargar servicios
  useEffect(() => {
    api<{ servicios: Servicio[] }>('/servicios')
      .then((r) => setServicios(r.servicios))
      .catch((e: Error) => setError(e.message));
  }, []);

  // Cargar slots cuando cambian profesional/servicio/fecha
  useEffect(() => {
    if (!profesionalId || !fecha) return;
    setCargandoSlots(true);
    const q = new URLSearchParams({ profesional_id: profesionalId, fecha });
    if (servicioId) q.set('servicio_id', servicioId);
    api<{ slots: SlotDisponible[] }>(`/reservas/slots?${q.toString()}`)
      .then((r) => setSlots(r.slots))
      .catch(() => setSlots([]))
      .finally(() => setCargandoSlots(false));
  }, [profesionalId, servicioId, fecha]);

  async function guardar(datos: FormNuevaCita) {
    setError('');
    try {
      await api('/citas', {
        method: 'POST',
        body: JSON.stringify({
          profesional_id: datos.profesional_id,
          servicio_id: datos.servicio_id || undefined,
          inicio: datos.inicio,
          nombre_paciente: datos.nombre_paciente.trim(),
          telefono_paciente: datos.telefono_paciente.trim(),
          origen: 'panel',
        }),
      });
      onCreada();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <Modal titulo="Nueva cita" onCerrar={onCerrar}>
      <form onSubmit={handleSubmit(guardar)} className="space-y-4">
        <Campo etiqueta="Profesional">
          <Selector {...register('profesional_id', { required: 'Selecciona un profesional' })}>
            <option value="">— Elige un profesional —</option>
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </Selector>
          {errors.profesional_id && (
            <p role="alert" className="mt-1 text-xs text-red-600">{errors.profesional_id.message}</p>
          )}
        </Campo>

        <Campo etiqueta="Servicio (opcional)">
          <Selector {...register('servicio_id')}>
            <option value="">— Sin servicio específico —</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} ({s.duracion_min} min)
              </option>
            ))}
          </Selector>
        </Campo>

        <Campo etiqueta="Fecha">
          <Entrada type="date" min={hoy} {...register('fecha', { required: 'Selecciona una fecha' })} />
          {errors.fecha && (
            <p role="alert" className="mt-1 text-xs text-red-600">{errors.fecha.message}</p>
          )}
        </Campo>

        {profesionalId && fecha && (
          <Campo etiqueta="Horario disponible">
            {cargandoSlots ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner tamanio="sm" />
                <span className="text-xs text-slate-500">Cargando horarios…</span>
              </div>
            ) : (
              <Selector {...register('inicio', { required: 'Selecciona un horario' })}>
                <option value="">— Elige un horario —</option>
                {slots.map((s) => (
                  <option key={s.inicio} value={s.inicio}>
                    {formatearHora(new Date(s.inicio))}
                  </option>
                ))}
              </Selector>
            )}
            {errors.inicio && (
              <p role="alert" className="mt-1 text-xs text-red-600">{errors.inicio.message}</p>
            )}
          </Campo>
        )}

        <Campo etiqueta="Nombre del paciente">
          <Entrada
            type="text"
            placeholder="Nombre completo"
            {...register('nombre_paciente', { required: 'El nombre es obligatorio' })}
          />
          {errors.nombre_paciente && (
            <p role="alert" className="mt-1 text-xs text-red-600">{errors.nombre_paciente.message}</p>
          )}
        </Campo>

        <Campo etiqueta="Teléfono del paciente">
          <Entrada
            type="tel"
            placeholder="+51 999 999 999"
            {...register('telefono_paciente', { required: 'El teléfono es obligatorio' })}
          />
          {errors.telefono_paciente && (
            <p role="alert" className="mt-1 text-xs text-red-600">{errors.telefono_paciente.message}</p>
          )}
        </Campo>

        {error && <Aviso tipo="error">{error}</Aviso>}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando…' : 'Crear cita'}
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
