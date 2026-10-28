'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Local } from '@/lib/tipos';
import { Mapa } from '@/components/Mapa';
import { Aviso, Boton, Campo, Entrada, Tarjeta } from '@/components/ui';

const VACIO = { nombre: '', direccion: '', lat: '', lng: '', radio_m: '100' };

export default function PaginaLocales() {
  const [locales, setLocales] = useState<Local[]>([]);
  const [form, setForm] = useState(VACIO);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try { setLocales((await api<{ locales: Local[] }>('/locales')).locales); }
    catch (e) { setMensaje({ tipo: 'error', texto: (e as Error).message }); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  function usarMiUbicacion() {
    if (!navigator.geolocation) return setMensaje({ tipo: 'error', texto: 'El navegador no permite obtener la ubicación.' });
    navigator.geolocation.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) })),
      () => setMensaje({ tipo: 'error', texto: 'No se pudo obtener tu ubicación. Revisa los permisos del navegador.' }),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await api('/locales', {
        method: 'POST',
        body: JSON.stringify({
          nombre: form.nombre, direccion: form.direccion || undefined,
          lat: Number(form.lat), lng: Number(form.lng), radio_m: Number(form.radio_m),
        }),
      });
      setForm(VACIO);
      setMensaje({ tipo: 'ok', texto: 'Local creado.' });
      await cargar();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: (e as Error).message });
    } finally {
      setGuardando(false);
    }
  }

  async function actualizar(id: string, cambios: Partial<Local>) {
    try {
      await api(`/locales/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) });
      await cargar();
    } catch (e) {
      setMensaje({ tipo: 'error', texto: (e as Error).message });
    }
  }

  const vistaPrevia = form.lat && form.lng && !Number.isNaN(Number(form.lat)) && !Number.isNaN(Number(form.lng))
    ? [{ id: 'nuevo', nombre: form.nombre || 'Nuevo local', lat: Number(form.lat), lng: Number(form.lng), radio_m: Number(form.radio_m) || 100 }]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-marino">Locales y geocercas</h1>
      {mensaje && <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Tarjeta titulo="Nuevo local">
          <form onSubmit={crear} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Campo etiqueta="Nombre"><Entrada required minLength={2} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Sede Miraflores" /></Campo></div>
            <div className="sm:col-span-2"><Campo etiqueta="Dirección (opcional)"><Entrada value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></Campo></div>
            <Campo etiqueta="Latitud"><Entrada required inputMode="decimal" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="-12.121100" /></Campo>
            <Campo etiqueta="Longitud"><Entrada required inputMode="decimal" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="-77.029700" /></Campo>
            <Campo etiqueta="Radio de la geocerca (m)" ayuda="Entre 20 y 2000 m. Recomendado: 80–150 m en ciudad.">
              <Entrada required type="number" min={20} max={2000} value={form.radio_m} onChange={(e) => setForm({ ...form, radio_m: e.target.value })} />
            </Campo>
            <div className="flex items-end"><Boton type="button" variante="secundario" onClick={usarMiUbicacion} className="w-full">Usar mi ubicación actual</Boton></div>
            <p className="text-xs text-slate-500 sm:col-span-2">También puedes hacer clic en el mapa para fijar el punto.</p>
            <div className="sm:col-span-2"><Boton disabled={guardando}>{guardando ? 'Guardando…' : 'Crear local'}</Boton></div>
          </form>
        </Tarjeta>
        <Mapa
          puntos={[...locales.filter((l) => l.activo), ...vistaPrevia]}
          alElegirPunto={(lat, lng) => setForm((f) => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }))}
          alto={430}
        />
      </div>

      <Tarjeta titulo="Locales registrados">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="py-2">Nombre</th><th>Coordenadas</th><th>Radio (m)</th><th>Estado</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locales.map((l) => (
                <tr key={l.id}>
                  <td className="py-3 font-medium text-marino">{l.nombre}<p className="text-xs font-normal text-slate-500">{l.direccion}</p></td>
                  <td className="font-mono text-xs">{l.lat.toFixed(5)}, {l.lng.toFixed(5)}</td>
                  <td>
                    <input type="number" min={20} max={2000} defaultValue={l.radio_m} aria-label={`Radio de ${l.nombre}`}
                      onBlur={(e) => Number(e.target.value) !== l.radio_m && actualizar(l.id, { radio_m: Number(e.target.value) })}
                      className="w-24 rounded border border-slate-300 px-2 py-1" />
                  </td>
                  <td>{l.activo ? <span className="text-emerald-700">Activo</span> : <span className="text-slate-500">Inactivo</span>}</td>
                  <td className="text-right">
                    <Boton variante="secundario" onClick={() => actualizar(l.id, { activo: !l.activo })}>{l.activo ? 'Desactivar' : 'Activar'}</Boton>
                  </td>
                </tr>
              ))}
              {locales.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-500">Aún no hay locales.</td></tr>}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}
