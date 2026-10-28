import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

// ─── Campo (wrapper de label) ────────────────────────────────────────────────
export const Campo = ({
  etiqueta,
  children,
  ayuda,
}: {
  etiqueta: string;
  children: ReactNode;
  ayuda?: string;
}) => (
  <label className="block text-sm">
    <span className="font-medium text-slate-700">{etiqueta}</span>
    <div className="mt-1">{children}</div>
    {ayuda && <span className="mt-1 block text-xs text-slate-500">{ayuda}</span>}
  </label>
);

// ─── Inputs base ─────────────────────────────────────────────────────────────
const baseInput =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-verde focus:ring-2 focus:ring-verde/30';

export const Entrada = (p: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={`${baseInput} ${p.className ?? ''}`} />
);

export const Selector = (p: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className={`${baseInput} ${p.className ?? ''}`} />
);

// ─── Botón ────────────────────────────────────────────────────────────────────
export const Boton = ({
  variante = 'primario',
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'peligro' }) => (
  <button
    {...p}
    className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60 transition-colors ${
      variante === 'primario'
        ? 'bg-verde text-white hover:bg-verde-oscuro'
        : variante === 'peligro'
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-white text-marino ring-1 ring-slate-300 hover:bg-slate-50'
    } ${p.className ?? ''}`}
  />
);

// ─── Tarjeta ──────────────────────────────────────────────────────────────────
export const Tarjeta = ({ titulo, children }: { titulo?: string; children: ReactNode }) => (
  <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    {titulo && <h2 className="mb-4 font-display text-lg font-bold text-marino">{titulo}</h2>}
    {children}
  </section>
);

// ─── Aviso ────────────────────────────────────────────────────────────────────
export const Aviso = ({ tipo, children }: { tipo: 'error' | 'ok'; children: ReactNode }) => (
  <p
    role={tipo === 'error' ? 'alert' : 'status'}
    className={`rounded-lg px-4 py-3 text-sm ${
      tipo === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
    }`}
  >
    {children}
  </p>
);

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const Spinner = ({ tamanio = 'md' }: { tamanio?: 'sm' | 'md' | 'lg' }) => {
  const tam = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[tamanio];
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block ${tam} animate-spin rounded-full border-2 border-slate-200 border-t-verde`}
    />
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({
  titulo,
  children,
  onCerrar,
}: {
  titulo: string;
  children: ReactNode;
  onCerrar: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-4 sm:items-center sm:pb-0"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-titulo"
    onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
  >
    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="modal-titulo" className="font-display text-lg font-bold text-marino">
          {titulo}
        </h2>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({
  tono,
  children,
}: {
  tono: 'gris' | 'verde' | 'rojo' | 'azul' | 'naranja' | 'amarillo';
  children: ReactNode;
}) => {
  const colores = {
    gris: 'bg-slate-100 text-slate-600',
    verde: 'bg-emerald-100 text-emerald-700',
    rojo: 'bg-red-100 text-red-700',
    azul: 'bg-blue-100 text-blue-800',
    naranja: 'bg-orange-100 text-orange-700',
    amarillo: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colores[tono]}`}>
      {children}
    </span>
  );
};
