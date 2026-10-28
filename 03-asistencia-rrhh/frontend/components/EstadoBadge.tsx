import { ESTADOS } from '@/lib/formato';

const TONOS = {
  ok: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  alerta: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  error: 'bg-red-50 text-red-700 ring-red-600/20',
  neutro: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
} as const;

export function EstadoBadge({ estado }: { estado: string | null | undefined }) {
  if (!estado) return <span className="text-slate-400">—</span>;
  const e = ESTADOS[estado] ?? { texto: estado, tono: 'neutro' as const };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONOS[e.tono]}`}>
      {e.texto}
    </span>
  );
}
