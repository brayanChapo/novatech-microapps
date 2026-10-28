'use client';
import dynamic from 'next/dynamic';

/** Leaflet usa `window`: se carga solo en el navegador. */
export const Mapa = dynamic(() => import('./MapaLocales'), {
  ssr: false,
  loading: () => <div className="grid h-[360px] place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">Cargando mapa…</div>,
});
export type { PuntoMapa } from './MapaLocales';
