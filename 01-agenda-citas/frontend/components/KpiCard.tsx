export function KpiCard({
  titulo,
  valor,
  detalle,
  tono = 'neutro',
}: {
  titulo: string;
  valor: string | number;
  detalle?: string;
  tono?: 'neutro' | 'ok' | 'alerta' | 'error';
}) {
  const barra = {
    neutro: 'bg-marino',
    ok: 'bg-verde',
    alerta: 'bg-amber-500',
    error: 'bg-red-500',
  }[tono];

  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <span className={`absolute inset-y-0 left-0 w-1 ${barra}`} aria-hidden="true" />
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums text-marino">{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-slate-500">{detalle}</p>}
    </div>
  );
}
