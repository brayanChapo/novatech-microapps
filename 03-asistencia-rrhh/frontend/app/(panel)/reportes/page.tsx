'use client';
import { useEffect, useState } from 'react';
import { api, descargar } from '@/lib/api';
import { hoyLima } from '@/lib/formato';
import type { Local } from '@/lib/tipos';
import { Aviso, Boton, Campo, Entrada, Selector, Tarjeta } from '@/components/ui';

function primeroDelMes(fecha: string) { return `${fecha.slice(0, 8)}01`; }

export default function PaginaReportes() {
  const hoy = hoyLima();
  const [desde, setDesde] = useState(primeroDelMes(hoy));
  const [hasta, setHasta] = useState(hoy);
  const [localId, setLocalId] = useState('');
  const [locales, setLocales] = useState<Local[]>([]);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    api<{ locales: Local[] }>('/locales').then((r) => setLocales(r.locales)).catch((e: Error) => setError(e.message));
  }, []);

  async function exportar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setDescargando(true);
    try {
      const q = new URLSearchParams({ desde, hasta, ...(localId ? { local_id: localId } : {}) });
      await descargar(`/reportes/marcaciones.csv?${q}`, `asistencia_${desde}_${hasta}.csv`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-marino">Reportes</h1>
      {error && <Aviso tipo="error">{error}</Aviso>}
      <Tarjeta titulo="Exportar marcaciones (Excel / CSV)">
        <form onSubmit={exportar} className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Desde"><Entrada type="date" required value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} /></Campo>
          <Campo etiqueta="Hasta"><Entrada type="date" required value={hasta} min={desde} max={hoy} onChange={(e) => setHasta(e.target.value)} /></Campo>
          <Campo etiqueta="Local">
            <Selector value={localId} onChange={(e) => setLocalId(e.target.value)}>
              <option value="">Todos</option>
              {locales.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </Selector>
          </Campo>
          <p className="text-xs text-slate-500 sm:col-span-3">Rango máximo: 93 días. El archivo se abre directamente en Excel.</p>
          <div className="sm:col-span-3"><Boton disabled={descargando}>{descargando ? 'Generando…' : 'Descargar CSV'}</Boton></div>
        </form>
      </Tarjeta>
    </div>
  );
}
