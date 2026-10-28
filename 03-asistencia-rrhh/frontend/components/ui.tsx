import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

export const Campo = ({ etiqueta, children, ayuda }: { etiqueta: string; children: ReactNode; ayuda?: string }) => (
  <label className="block text-sm">
    <span className="font-medium text-slate-700">{etiqueta}</span>
    <div className="mt-1">{children}</div>
    {ayuda && <span className="mt-1 block text-xs text-slate-500">{ayuda}</span>}
  </label>
);

const base = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-turquesa-oscuro focus:ring-2 focus:ring-turquesa/40';
export const Entrada = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${base} ${p.className ?? ''}`} />;
export const Selector = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={`${base} ${p.className ?? ''}`} />;

export const Boton = ({ variante = 'primario', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' }) => (
  <button {...p}
    className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 ${
      variante === 'primario' ? 'bg-marino text-white hover:bg-marino-2' : 'bg-white text-marino ring-1 ring-slate-300 hover:bg-slate-50'
    } ${p.className ?? ''}`} />
);

export const Tarjeta = ({ titulo, children }: { titulo?: string; children: ReactNode }) => (
  <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    {titulo && <h2 className="mb-4 font-display text-lg font-bold text-marino">{titulo}</h2>}
    {children}
  </section>
);

export const Aviso = ({ tipo, children }: { tipo: 'error' | 'ok'; children: ReactNode }) => (
  <p role={tipo === 'error' ? 'alert' : 'status'}
    className={`rounded-lg px-4 py-3 text-sm ${tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
    {children}
  </p>
);
