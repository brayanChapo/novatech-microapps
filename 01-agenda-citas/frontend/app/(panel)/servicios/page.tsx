'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import type { Servicio } from '@/lib/tipos';
import { formatearDuracion } from '@/lib/formato';
import { Boton, Campo, Entrada, Modal, Spinner, Aviso } from '@/components/ui';

interface FormServicio {
  nombre: string;
  duracion_min: number;
  precio_referencial: string;
}

export default function PaginaServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [editando, setEditando] = useState<Servicio | null>(null);
  const [creando, setCreando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await api<{ servicios: Servicio[] }>('/servicios');
      setServicios(r.servicios);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargar(); }, []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormServicio>({
    defaultValues: { nombre: '', duracion_min: 30, precio_referencial: '' },
  });

  function abrirCrear() {
    reset({ nombre: '', duracion_min: 30, precio_referencial: '' });
    setCreando(true);
    setEditando(null);
  }

  function abrirEditar(s: Servicio) {
    reset({
      nombre: s.nombre,
      duracion_min: s.duracion_min,
      precio_referencial: s.precio_referencial ? String(s.precio_referencial) : '',
    });
    setEditando(s);
    setCreando(false);
  }

  async function guardar(datos: FormServicio) {
    setError('');
    setExito('');
    const body = {
      nombre: datos.nombre,
      duracion_min: Number(datos.duracion_min),
      precio_referencial: datos.precio_referencial ? Number(datos.precio_referencial) : null,
    };
    try {
      if (editando) {
        await api(`/servicios/${editando.id}`, { method: 'PATCH', body: JSON.stringify(body) });
        setExito('Servicio actualizado correctamente.');
      } else {
        await api('/servicios', { method: 'POST', body: JSON.stringify(body) });
        setExito('Servicio creado correctamente.');
      }
      setCreando(false);
      setEditando(null);
      void cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-marino">Servicios</h1>
        <Boton type="button" onClick={abrirCrear}>+ Nuevo servicio</Boton>
      </header>

      {error && <Aviso tipo="error">{error}</Aviso>}
      {exito && <Aviso tipo="ok">{exito}</Aviso>}

      {cargando ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Servicio</th>
                <th scope="col" className="px-3 py-3">Duración</th>
                <th scope="col" className="hidden px-3 py-3 sm:table-cell text-right">Precio ref.</th>
                <th scope="col" className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {servicios.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-marino">{s.nombre}</td>
                  <td className="px-3 py-3 text-slate-600">{formatearDuracion(s.duracion_min)}</td>
                  <td className="hidden px-3 py-3 text-right tabular-nums text-slate-600 sm:table-cell">
                    {s.precio_referencial ? `S/ ${Number(s.precio_referencial).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => abrirEditar(s)}
                      className="text-sm text-turquesa hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {servicios.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No hay servicios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(creando || editando) && (
        <Modal
          titulo={editando ? 'Editar servicio' : 'Nuevo servicio'}
          onCerrar={() => { setCreando(false); setEditando(null); }}
        >
          <form onSubmit={handleSubmit(guardar)} className="space-y-4">
            <Campo etiqueta="Nombre del servicio">
              <Entrada
                {...register('nombre', { required: 'El nombre es obligatorio' })}
                placeholder="Consulta general, Limpieza dental…"
              />
              {errors.nombre && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
              )}
            </Campo>

            <Campo etiqueta="Duración (minutos)" ayuda="Determina los bloques disponibles en la agenda">
              <Entrada
                type="number"
                min="5"
                step="5"
                {...register('duracion_min', {
                  required: true,
                  min: { value: 5, message: 'Mínimo 5 minutos' },
                })}
              />
              {errors.duracion_min && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.duracion_min.message}</p>
              )}
            </Campo>

            <Campo etiqueta="Precio referencial en soles (opcional)">
              <Entrada
                type="number"
                min="0"
                step="0.50"
                placeholder="0.00"
                {...register('precio_referencial')}
              />
            </Campo>

            <div className="flex justify-end gap-2 pt-2">
              <Boton
                type="button"
                variante="secundario"
                onClick={() => { setCreando(false); setEditando(null); }}
              >
                Cancelar
              </Boton>
              <Boton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando…' : 'Guardar'}
              </Boton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
