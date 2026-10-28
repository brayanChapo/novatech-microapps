'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '@/lib/api';
import type { Profesional } from '@/lib/tipos';
import { Boton, Campo, Entrada, Modal, Spinner, Aviso } from '@/components/ui';

const schemaProfesional = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  especialidad: z.string().optional(),
  activo: z.boolean(),
});

type FormProfesional = z.infer<typeof schemaProfesional>;

export default function PaginaProfesionales() {
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [editando, setEditando] = useState<Profesional | null>(null);
  const [creando, setCreando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await api<{ profesionales: Profesional[] }>('/profesionales');
      setProfesionales(r.profesionales);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { void cargar(); }, []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormProfesional>({
    defaultValues: { nombre: '', especialidad: '', activo: true },
  });

  function abrirCrear() {
    reset({ nombre: '', especialidad: '', activo: true });
    setCreando(true);
    setEditando(null);
  }

  function abrirEditar(p: Profesional) {
    reset({ nombre: p.nombre, especialidad: p.especialidad ?? '', activo: p.activo });
    setEditando(p);
    setCreando(false);
  }

  async function guardar(datos: FormProfesional) {
    setError('');
    setExito('');
    try {
      if (editando) {
        await api(`/profesionales/${editando.id}`, {
          method: 'PATCH',
          body: JSON.stringify(datos),
        });
        setExito('Profesional actualizado correctamente.');
      } else {
        await api('/profesionales', {
          method: 'POST',
          body: JSON.stringify(datos),
        });
        setExito('Profesional creado correctamente.');
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
        <h1 className="font-display text-2xl font-bold text-marino">Profesionales</h1>
        <Boton type="button" onClick={abrirCrear}>+ Nuevo profesional</Boton>
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
                <th scope="col" className="px-4 py-3">Nombre</th>
                <th scope="col" className="hidden px-3 py-3 sm:table-cell">Especialidad</th>
                <th scope="col" className="px-3 py-3 text-center">Activo</th>
                <th scope="col" className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profesionales.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-marino">{p.nombre}</td>
                  <td className="hidden px-3 py-3 text-slate-600 sm:table-cell">{p.especialidad ?? '—'}</td>
                  <td className="px-3 py-3 text-center">
                    {p.activo ? (
                      <span className="text-verde font-medium">Sí</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="text-sm text-turquesa hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {profesionales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No hay profesionales registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(creando || editando) && (
        <Modal
          titulo={editando ? 'Editar profesional' : 'Nuevo profesional'}
          onCerrar={() => { setCreando(false); setEditando(null); }}
        >
          <form onSubmit={handleSubmit(guardar)} className="space-y-4">
            <Campo etiqueta="Nombre completo">
              <Entrada
                {...register('nombre', { required: 'El nombre es obligatorio' })}
                placeholder="Dr. Nombre Apellido"
              />
              {errors.nombre && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
              )}
            </Campo>

            <Campo etiqueta="Especialidad (opcional)">
              <Entrada {...register('especialidad')} placeholder="Medicina general, Odontología…" />
            </Campo>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('activo')} className="rounded" />
              <span>Profesional activo</span>
            </label>

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
