export function IndicadorVivo({ conectado }: { conectado: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium ring-1 ring-slate-200">
      <span className={`h-2 w-2 rounded-full ${conectado ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
      {conectado ? 'En vivo' : 'Actualización cada minuto'}
    </span>
  );
}
