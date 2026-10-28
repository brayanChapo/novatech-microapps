'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DIAS, horaCorta } from '@/lib/formato';
import type { Horario, Local, Rol } from '@/lib/tipos';
import { Aviso, Boton, Campo, Entrada, Selector, Tarjeta } from '@/components/ui';

interface Colaborador {
  id: string;
  nombre: string;
  documento: string | null;
  rol: Rol;
  activo: boolean;
  asignacion: { local: { id: string; nombre: string } | null; horario: { id: string; nombre: string } | null } | null;
  locales_supervisados: string[];
}

const NUEVO = { nombre: '', documento: '', correo: '', contrasena_temporal: '', rol: 'colaborador' as Rol, local_id: '', horario_id: '' };
const NUEVO_HORARIO = { nombre: '', hora_entrada: '08:30', hora_salida: '17:30', tolerancia_min: '10', dias_semana: [1, 2, 3, 4, 5] };

export default function PaginaColaboradores() {
  const [lista, setLista] = useState<Colaborador[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [form, setForm] = useState(NUEVO);
  const [formHorario, setFormHorario] = useState(NUEVO_HORARIO);
  const [supervisando, setSupervisando] = useState<{ id: string; locales: string[] } | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [c, l, h] = await Promise.all([
        api<{ colaboradores: Colaborador[] }>('/colaboradores'),
        api<{ locales: Local[] }>('/locales'),
        api<{ horarios: Horario[] }>('/horarios'),
      ]);
      setLista(c.colaboradores);
      setLocales(l.locales.filter((x) => x.activo));
      setHorarios(h.horarios);
    } catch (e) {
      setMensaje({ tipo: 'error', texto: (e as Error).message });
    }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  const accion = async (fn: () => Promise<unknown>, ok: string) => {
    setMensaje(null);
    try { await fn(); setMensaje({ tipo: 'ok', texto: ok }); await cargar(); }
    catch (e) { setMensaje({ tipo: 'error', texto: (e as Error).message }); }
  };

  const crear = (e: React.FormEvent) => {
    e.preventDefault();
    void accion(async () => {
      await api('/colaboradores', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          documento: form.documento || undefined,
          local_id: form.local_id || undefined,
          horario_id: form.horario_id || undefined,
        }),
      });
      setForm(NUEVO);
    }, `Usuario creado. Comparte el correo y la contraseña temporal con ${form.nombre}.`);
  };

  const crearHorario = (e: React.FormEvent) => {
    e.preventDefault();
    void accion(async () => {
      await api('/horarios', { method: 'POST', body: JSON.stringify({ ...formHorario, tolerancia_min: Number(formHorario.tolerancia_min) }) });
      setFormHorario(NUEVO_HORARIO);
    }, 'Horario creado.');
  };

  const reasignar = (id: string, local_id: string, horario_id: string) =>
    accion(() => api(`/colaboradores/${id}/asignacion`, { method: 'PUT', body: JSON.stringify({ local_id, horario_id }) }), 'Asignación actualizada desde hoy.');

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-marino">Colaboradores</h1>
      {mensaje && <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Tarjeta titulo="Nuevo usuario">
            <form onSubmit={crear} className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Nombre completo"><Entrada required minLength={2} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Campo>
              <Campo etiqueta="DNI / documento (opcional)"><Entrada maxLength={15} value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} /></Campo>
              <Campo etiqueta="Correo (usuario de acceso)"><Entrada required type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></Campo>
              <Campo etiqueta="Contraseña temporal" ayuda="Mínimo 8 caracteres.">
                <Entrada required minLength={8} type="text" autoComplete="off" value={form.contrasena_temporal} onChange={(e) => setForm({ ...form, contrasena_temporal: e.target.value })} />
              </Campo>
              <Campo etiqueta="Rol">
                <Selector value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
                  <option value="colaborador">Colaborador (marca desde el celular)</option>
                  <option value="supervisor">Supervisor (ve sus locales)</option>
                  <option value="admin">Administrador</option>
                </Selector>
              </Campo>
              <div />
              <Campo etiqueta="Local asignado">
                <Selector value={form.local_id} onChange={(e) => setForm({ ...form, local_id: e.target.value })}>
                  <option value="">— Sin asignar —</option>
                  {locales.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </Selector>
              </Campo>
              <Campo etiqueta="Horario">
                <Selector value={form.horario_id} onChange={(e) => setForm({ ...form, horario_id: e.target.value })}>
                  <option value="">— Sin asignar —</option>
                  {horarios.map((h) => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                </Selector>
              </Campo>
              <div className="sm:col-span-2"><Boton>Crear usuario</Boton></div>
            </form>
          </Tarjeta>
        </div>

        <Tarjeta titulo="Horarios">
          <ul className="mb-4 space-y-2 text-sm">
            {horarios.map((h) => (
              <li key={h.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="font-medium text-marino">{h.nombre}</p>
                <p className="font-mono text-xs text-slate-600">
                  {horaCorta(h.hora_entrada)}–{horaCorta(h.hora_salida)} · tolerancia {h.tolerancia_min} min · {h.dias_semana.map((d) => DIAS[d - 1]).join(' ')}
                </p>
              </li>
            ))}
          </ul>
          <form onSubmit={crearHorario} className="space-y-3">
            <Campo etiqueta="Nombre"><Entrada required value={formHorario.nombre} onChange={(e) => setFormHorario({ ...formHorario, nombre: e.target.value })} placeholder="Turno mañana" /></Campo>
            <div className="grid grid-cols-3 gap-2">
              <Campo etiqueta="Entrada"><Entrada type="time" required value={formHorario.hora_entrada} onChange={(e) => setFormHorario({ ...formHorario, hora_entrada: e.target.value })} /></Campo>
              <Campo etiqueta="Salida"><Entrada type="time" required value={formHorario.hora_salida} onChange={(e) => setFormHorario({ ...formHorario, hora_salida: e.target.value })} /></Campo>
              <Campo etiqueta="Tolerancia"><Entrada type="number" min={0} max={120} value={formHorario.tolerancia_min} onChange={(e) => setFormHorario({ ...formHorario, tolerancia_min: e.target.value })} /></Campo>
            </div>
            <fieldset className="flex flex-wrap gap-2 text-xs">
              {DIAS.map((d, i) => {
                const n = i + 1;
                const on = formHorario.dias_semana.includes(n);
                return (
                  <button type="button" key={d} aria-pressed={on}
                    onClick={() => setFormHorario({ ...formHorario, dias_semana: on ? formHorario.dias_semana.filter((x) => x !== n) : [...formHorario.dias_semana, n] })}
                    className={`rounded-full px-2.5 py-1 ring-1 ${on ? 'bg-marino text-white ring-marino' : 'ring-slate-300'}`}>{d}</button>
                );
              })}
            </fieldset>
            <Boton variante="secundario">Agregar horario</Boton>
          </form>
        </Tarjeta>
      </div>

      <Tarjeta titulo={`Usuarios (${lista.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="py-2">Nombre</th><th>Rol</th><th>Local</th><th>Horario</th><th>Estado</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((c) => (
                <tr key={c.id} className={c.activo ? '' : 'opacity-60'}>
                  <td className="py-3 font-medium text-marino">{c.nombre}<p className="text-xs font-normal text-slate-500">{c.documento}</p></td>
                  <td className="capitalize">{c.rol}</td>
                  <td>
                    {c.rol === 'colaborador' ? (
                      <Selector aria-label={`Local de ${c.nombre}`} value={c.asignacion?.local?.id ?? ''} className="min-w-40"
                        onChange={(e) => {
                          const horario = c.asignacion?.horario?.id ?? horarios[0]?.id;
                          if (e.target.value && horario) void reasignar(c.id, e.target.value, horario);
                        }}>
                        <option value="" disabled>— Sin asignar —</option>
                        {locales.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                      </Selector>
                    ) : c.rol === 'supervisor' ? (
                      <Boton variante="secundario" onClick={() => setSupervisando({ id: c.id, locales: c.locales_supervisados })}>Locales que supervisa ({c.locales_supervisados.length})</Boton>
                    ) : '—'}
                  </td>
                  <td>
                    {c.rol === 'colaborador' ? (
                      <Selector aria-label={`Horario de ${c.nombre}`} value={c.asignacion?.horario?.id ?? ''} className="min-w-40"
                        onChange={(e) => {
                          const local = c.asignacion?.local?.id;
                          if (local && e.target.value) void reasignar(c.id, local, e.target.value);
                        }}>
                        <option value="" disabled>— Sin asignar —</option>
                        {horarios.map((h) => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                      </Selector>
                    ) : '—'}
                  </td>
                  <td>{c.activo ? 'Activo' : 'Inactivo'}</td>
                  <td className="space-x-2 whitespace-nowrap text-right">
                    <Boton variante="secundario"
                      onClick={() => {
                        const clave = window.prompt(`Nueva contraseña temporal para ${c.nombre} (mínimo 8 caracteres):`);
                        if (clave) void accion(() => api(`/colaboradores/${c.id}/contrasena`, { method: 'PUT', body: JSON.stringify({ contrasena_temporal: clave }) }), 'Contraseña actualizada. Compártela por un canal privado.');
                      }}>
                      Nueva contraseña
                    </Boton>
                    <Boton variante="secundario"
                      onClick={() => accion(() => api(`/colaboradores/${c.id}`, { method: 'PATCH', body: JSON.stringify({ activo: !c.activo }) }), c.activo ? 'Usuario desactivado.' : 'Usuario activado.')}>
                      {c.activo ? 'Desactivar' : 'Activar'}
                    </Boton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      {supervisando && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="font-display text-lg font-bold text-marino">Locales que supervisa</h3>
            <div className="my-4 space-y-2">
              {locales.map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={supervisando.locales.includes(l.id)}
                    onChange={(e) => setSupervisando({
                      ...supervisando,
                      locales: e.target.checked ? [...supervisando.locales, l.id] : supervisando.locales.filter((x) => x !== l.id),
                    })} />
                  {l.nombre}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Boton variante="secundario" onClick={() => setSupervisando(null)}>Cancelar</Boton>
              <Boton onClick={() => {
                const s = supervisando;
                setSupervisando(null);
                void accion(() => api(`/colaboradores/${s.id}/locales-supervisados`, { method: 'PUT', body: JSON.stringify({ local_ids: s.locales }) }), 'Locales del supervisor actualizados.');
              }}>Guardar</Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
