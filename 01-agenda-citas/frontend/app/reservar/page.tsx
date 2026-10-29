'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlotPicker } from '@/components/SlotPicker';
import { Boton, Aviso, Campo, Entrada, Selector, Spinner } from '@/components/ui';
import { formatearFechaLima, formatearHora } from '@/lib/formato';
import type { Profesional, Servicio, SlotDisponible } from '@/lib/tipos';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';

async function fetchPublico<T>(ruta: string): Promise<T> {
  const res = await fetch(`${BASE}${ruta}`);
  if (!res.ok) {
    const cuerpo = (await res.json().catch(() => null)) as { error?: { mensaje: string } } | null;
    throw new Error(cuerpo?.error?.mensaje ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

type Paso = 1 | 2 | 3 | 4;

interface DatosPaciente {
  nombre: string;
  telefono: string;
}

interface CitaConfirmada {
  id: string;
  profesional_nombre: string;
  servicio_nombre: string;
  inicio: string;
}

function PasoIndicador({ actual, total }: { actual: Paso; total: number }) {
  return (
    <nav aria-label="Pasos de la reserva" className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          aria-current={n === actual ? 'step' : undefined}
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
            n < actual
              ? 'bg-verde text-white'
              : n === actual
                ? 'bg-verde text-white ring-2 ring-verde/40'
                : 'bg-slate-200 text-slate-500'
          }`}
        >
          {n < actual ? '✓' : n}
        </span>
      ))}
      <span className="ml-1 text-xs text-slate-500">Paso {actual} de {total}</span>
    </nav>
  );
}

function PaginaReservaInterna() {
  const params = useSearchParams();
  const empresaId = params.get('empresa') ?? '';

  const [paso, setPaso] = useState<Paso>(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Datos cargados
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  // Selecciones
  const [profesionalId, setProfesionalId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [slotSeleccionado, setSlotSeleccionado] = useState<SlotDisponible | null>(null);
  const [datosPaciente, setDatosPaciente] = useState<DatosPaciente>({ nombre: '', telefono: '' });

  // Resultado
  const [enviando, setEnviando] = useState(false);
  const [citaConfirmada, setCitaConfirmada] = useState<CitaConfirmada | null>(null);

  useEffect(() => {
    setCargando(true);
    const query = empresaId ? `?empresa_id=${empresaId}` : '';
    Promise.all([
      fetchPublico<{ profesionales: Profesional[] }>(`/profesionales${query}`),
      fetchPublico<{ servicios: Servicio[] }>(`/servicios${query}`),
    ])
      .then(([p, s]) => {
        setProfesionales(p.profesionales);
        setServicios(s.servicios);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setCargando(false));
  }, [empresaId]);

  // Fecha mínima = hoy
  const hoy = new Date().toISOString().slice(0, 10);

  async function confirmarReserva() {
    if (!slotSeleccionado) return;
    setEnviando(true);
    setError('');
    try {
      const res = await fetch(`${BASE}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profesional_id: profesionalId,
          servicio_id: servicioId,
          inicio: slotSeleccionado.inicio,
          nombre_paciente: datosPaciente.nombre.trim(),
          telefono_paciente: datosPaciente.telefono.trim(),
          empresa_id: empresaId || undefined,
        }),
      });
      const cuerpo = (await res.json()) as { cita?: CitaConfirmada; error?: { mensaje: string } };
      if (!res.ok) {
        if (res.status === 409) {
          setError('Ese horario ya no está disponible. Por favor elige otro slot.');
          setPaso(2);
          setSlotSeleccionado(null);
        } else if (res.status === 429) {
          setError('Has realizado demasiadas solicitudes. Por favor espera unos minutos antes de intentar nuevamente.');
        } else {
          setError(cuerpo.error?.mensaje ?? 'No fue posible confirmar la reserva. Inténtalo nuevamente.');
        }
        return;
      }
      if (cuerpo.cita) setCitaConfirmada(cuerpo.cita);
      setPaso(4);
    } catch {
      setError('Ocurrió un error de conexión. Verifica tu internet e inténtalo nuevamente.');
    } finally {
      setEnviando(false);
    }
  }

  const profesional = profesionales.find((p) => p.id === profesionalId);
  const servicio = servicios.find((s) => s.id === servicioId);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-verde-fondo px-4 py-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-6">
          <h1 className="font-display text-2xl font-bold text-marino">Reservar cita</h1>
          <p className="text-sm text-slate-500">Completa los pasos para agendar tu cita</p>
        </header>

        {paso < 4 && <PasoIndicador actual={paso} total={3} />}

        {error && (
          <div className="mb-4">
            <Aviso tipo="error">{error}</Aviso>
          </div>
        )}

        {/* PASO 1: Profesional y servicio */}
        {paso === 1 && (
          <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 font-display text-lg font-bold text-marino">
              Selecciona profesional y servicio
            </h2>

            <div className="space-y-4">
              <Campo etiqueta="Profesional">
                <Selector
                  value={profesionalId}
                  onChange={(e) => setProfesionalId(e.target.value)}
                  required
                >
                  <option value="">— Elige un profesional —</option>
                  {profesionales.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}{p.especialidad ? ` — ${p.especialidad}` : ''}
                    </option>
                  ))}
                </Selector>
              </Campo>

              <Campo etiqueta="Servicio">
                <Selector
                  value={servicioId}
                  onChange={(e) => setServicioId(e.target.value)}
                  required
                >
                  <option value="">— Elige un servicio —</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.duracion_min} min
                      {s.precio_referencial ? ` · S/ ${s.precio_referencial}` : ''})
                    </option>
                  ))}
                </Selector>
              </Campo>
            </div>

            <div className="mt-6 flex justify-end">
              <Boton
                type="button"
                disabled={!profesionalId || !servicioId}
                onClick={() => { setError(''); setPaso(2); }}
              >
                Siguiente
              </Boton>
            </div>
          </section>
        )}

        {/* PASO 2: Fecha y slot */}
        {paso === 2 && (
          <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 font-display text-lg font-bold text-marino">
              Elige fecha y horario
            </h2>

            <Campo etiqueta="Fecha">
              <Entrada
                type="date"
                value={fechaSeleccionada}
                min={hoy}
                onChange={(e) => {
                  setFechaSeleccionada(e.target.value);
                  setSlotSeleccionado(null);
                }}
              />
            </Campo>

            {fechaSeleccionada && (
              <div className="mt-4">
                <SlotPicker
                  empresaId={empresaId}
                  profesionalId={profesionalId}
                  servicioId={servicioId}
                  fecha={fechaSeleccionada}
                  seleccionado={slotSeleccionado}
                  onSeleccionar={setSlotSeleccionado}
                />
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Boton variante="secundario" type="button" onClick={() => { setError(''); setPaso(1); }}>
                Atrás
              </Boton>
              <Boton
                type="button"
                disabled={!slotSeleccionado}
                onClick={() => { setError(''); setPaso(3); }}
              >
                Siguiente
              </Boton>
            </div>
          </section>
        )}

        {/* PASO 3: Datos del paciente */}
        {paso === 3 && (
          <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 font-display text-lg font-bold text-marino">
              Tus datos
            </h2>

            {slotSeleccionado && (
              <div className="mb-5 rounded-lg bg-verde-fondo p-3 text-sm">
                <p className="font-medium text-verde-oscuro">Resumen de tu cita</p>
                <p className="text-slate-700">{profesional?.nombre} · {servicio?.nombre}</p>
                <p className="text-slate-700">
                  {formatearFechaLima(new Date(slotSeleccionado.inicio))} a las{' '}
                  {formatearHora(new Date(slotSeleccionado.inicio))}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Campo etiqueta="Nombre completo">
                <Entrada
                  type="text"
                  placeholder="Tu nombre completo"
                  value={datosPaciente.nombre}
                  onChange={(e) => setDatosPaciente((d) => ({ ...d, nombre: e.target.value }))}
                  required
                  autoComplete="name"
                />
              </Campo>

              <Campo
                etiqueta="Número de WhatsApp"
                ayuda="Recibirás la confirmación y el recordatorio en este número"
              >
                <Entrada
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={datosPaciente.telefono}
                  onChange={(e) => setDatosPaciente((d) => ({ ...d, telefono: e.target.value }))}
                  required
                  autoComplete="tel"
                />
              </Campo>
            </div>

            <div className="mt-6 flex justify-between">
              <Boton variante="secundario" type="button" onClick={() => { setError(''); setPaso(2); }}>
                Atrás
              </Boton>
              <Boton
                type="button"
                disabled={enviando || !datosPaciente.nombre.trim() || !datosPaciente.telefono.trim()}
                onClick={confirmarReserva}
              >
                {enviando ? 'Confirmando…' : 'Confirmar reserva'}
              </Boton>
            </div>
          </section>
        )}

        {/* PASO 4: Confirmación */}
        {paso === 4 && citaConfirmada && (
          <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-verde-fondo text-3xl">
              ✓
            </div>
            <h2 className="font-display text-xl font-bold text-marino">¡Cita confirmada!</h2>
            <p className="mt-2 text-sm text-slate-500">
              Recibirás un mensaje de WhatsApp con los detalles y un recordatorio 24 horas antes.
            </p>

            <div className="mt-6 rounded-lg bg-slate-50 p-4 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Profesional</span>
                <span className="font-medium text-slate-800">{citaConfirmada.profesional_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Servicio</span>
                <span className="font-medium text-slate-800">{citaConfirmada.servicio_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha</span>
                <span className="font-medium text-slate-800">
                  {formatearFechaLima(new Date(citaConfirmada.inicio))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hora</span>
                <span className="font-medium text-slate-800">
                  {formatearHora(new Date(citaConfirmada.inicio))}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Si necesitas cancelar o reprogramar, responde el mensaje de WhatsApp que recibirás.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

export default function PaginaReservar() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-verde-fondo">
        <Spinner />
      </div>
    }>
      <PaginaReservaInterna />
    </Suspense>
  );
}
