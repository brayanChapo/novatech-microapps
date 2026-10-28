'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProveedorSesion, useSesion } from '@/lib/sesion';

const MENU = [
  { href: '/dashboard', texto: 'Dashboard', roles: ['admin', 'supervisor'] },
  { href: '/locales', texto: 'Locales', roles: ['admin'] },
  { href: '/colaboradores', texto: 'Colaboradores', roles: ['admin'] },
  { href: '/reportes', texto: 'Reportes', roles: ['admin', 'supervisor'] },
];

function Marco({ children }: { children: React.ReactNode }) {
  const { usuario, cargando, salir } = useSesion();
  const ruta = usePathname();
  if (cargando || !usuario) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Cargando…</div>;
  }
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-marino text-white md:fixed md:inset-y-0 md:w-60">
        <div className="px-5 py-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-turquesa">NovaTech</p>
          <p className="font-display text-lg font-bold">Asistencia</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {MENU.filter((m) => m.roles.includes(usuario.rol)).map((m) => {
            const activo = ruta === m.href || ruta.startsWith(`${m.href}/`);
            return (
              <Link key={m.href} href={m.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${activo ? 'bg-white/10 text-turquesa' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                {m.texto}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 py-4 text-xs text-slate-400 md:absolute md:bottom-0 md:block">
          <p className="font-medium text-slate-200">{usuario.nombre}</p>
          <p className="capitalize">{usuario.rol}</p>
          <button onClick={salir} className="mt-2 text-turquesa hover:underline">Cerrar sesión</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:ml-60 md:p-8">{children}</main>
    </div>
  );
}

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorSesion>
      <Marco>{children}</Marco>
    </ProveedorSesion>
  );
}
