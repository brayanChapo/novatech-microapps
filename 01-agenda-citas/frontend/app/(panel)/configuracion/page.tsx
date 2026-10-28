'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { useSesion } from '@/lib/sesion';
import { redirect } from 'next/navigation';
import { Boton, Campo, Entrada, Selector, Spinner, Aviso } from '@/components/ui';

interface ConfigEmpresa {
  nombre_empresa: string;
  zona_horaria: string;
  telefono_contacto: string;
  correo_contacto: string;
  enlace_reserva_publico: string;
}

const ZONAS_HORARIAS = [
  { valor: 'America/Lima', etiqueta: 'Lima (UTC-5)' },
  { valor: 'America/Bogota', etiqueta: 'Bogotá (UTC-5)' },
  { valor: 'America/Santiago', etiqueta: 'Santiago (UTC-4/-3)' },
  { valor: 'America/Buenos_Aires', etiqueta: 'Buenos Aires (UTC-3)' },
  { valor: 'America/Mexico_City', etiqueta: 'Ciudad de México (UTC-6/-5)' },
];

export default function PaginaConfiguracion() {
  const { usuario } = useSesion();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ConfigEmpresa>();

  // Solo admin puede ver esta página
  useEffect(() => {
    if (usuario && usuario.rol !== 'admin') {
      redirect('/panel/agenda');
    }
  }, [usuario]);

  useEffect(() => {
    api<{ configuracion: ConfigEmpresa }>('/configuracion')
      .then((r) => reset(r.configuracion))
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, [reset]);

  async function guardar(datos: ConfigEmpresa) {
    setError('');
    setExito('');
    try {
      await api('/configuracion', { method: 'PATCH', body: JSON.stringify(datos) });
      setExito('Configuración guardada correctamente.');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (cargando) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-5 max-w-lg">
      <header>
        <h1 className="font-display text-2xl font-bold text-marino">Configuración</h1>
        <p className="text-sm text-slate-500">Datos de la empresa y preferencias del sistema</p>
      </header>

      {error && <Aviso tipo="error">{error}</Aviso>}
      {exito && <Aviso tipo="ok">{exito}</Aviso>}

      <form onSubmit={handleSubmit(guardar)} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 space-y-5">
        <Campo etiqueta="Nombre de la empresa">
          <Entrada
            {...register('nombre_empresa', { required: 'El nombre es obligatorio' })}
            placeholder="Clínica San Juan, Consultorio Dra. García…"
          />
          {errors.nombre_empresa && (
            <p role="alert" className="mt-1 text-xs text-red-600">{errors.nombre_empresa.message}</p>
          )}
        </Campo>

        <Campo etiqueta="Zona horaria">
          <Selector {...register('zona_horaria')}>
            {ZONAS_HORARIAS.map((z) => (
              <option key={z.valor} value={z.valor}>{z.etiqueta}</option>
            ))}
          </Selector>
        </Campo>

        <Campo etiqueta="Teléfono de contacto">
          <Entrada
            type="tel"
            {...register('telefono_contacto')}
            placeholder="+51 999 999 999"
          />
        </Campo>

        <Campo etiqueta="Correo de contacto">
          <Entrada
            type="email"
            {...register('correo_contacto')}
            placeholder="contacto@clinica.com"
          />
        </Campo>

        <Campo
          etiqueta="Enlace público de reservas"
          ayuda="Comparte este enlace con tus pacientes para que puedan reservar en línea"
        >
          <Entrada
            {...register('enlace_reserva_publico')}
            readOnly
            className="bg-slate-50 cursor-text"
          />
        </Campo>

        <div className="flex justify-end pt-2">
          <Boton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Boton>
        </div>
      </form>
    </div>
  );
}
