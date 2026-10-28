'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProveedorSesion, useSesion } from '@/lib/sesion';

const MENU = [
  { href: '/panel/agenda', icono: '📅', texto: 'Agenda', roles: ['admin', 'recepcion', 'profesional'] },
  { href: '/panel/pacientes', icono: '👥', texto: 'Pacientes', roles: ['admin', 'recepcion'] },
  { href: '/panel/profesionales', icono: '👨‍⚕️', texto: 'Profesionales', roles: ['admin'] },
  { href: '/panel/servicios', icono: '⚙️', texto: 'Servicios', roles: ['admin'] },
  { href: '/panel/reportes', icono: '📊', texto: 'Reportes', roles: ['admin', 'recepcion'] },
  { href: '/panel/configuracion', icono: '🔧', texto: 'Configuración', roles: ['admin'] },
];

function Marco({ children }: { children: React.ReactNode }) {
  const { usuario, cargando, salir } = useSesion();
  const ruta = usePathname();

  if (cargando || !usuario) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">
        <p>Cargando…</p>
      </div>
    );
  }

  const menuFiltrado = MENU.filter((m) => m.roles.includes(usuario.rol));

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar */}
      <aside className="bg-marino text-white md:fixed md:inset-y-0 md:w-64">
        <div className="px-5 py-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-verde-claro">NovaTech</p>
          <p className="font-display text-lg font-bold">Agenda</p>
        </div>

        <nav aria-label="Menú principal" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {menuFiltrado.map((m) => {
            const activo = ruta === m.href || ruta.startsWith(`${m.href}/`);
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={activo ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                  activo
                    ? 'bg-white/10 text-verde-claro'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span aria-hidden="true">{m.icono}</span>
                {m.texto}
              </Link>
            );
          })}
        </nav>

        <div className="hidden px-5 py-4 text-xs text-slate-400 md:absolute md:bottom-0 md:block">
          <p className="font-medium text-slate-200">{usuario.nombre}</p>
          <p className="capitalize">{usuario.rol}</p>
          <button
            onClick={salir}
            className="mt-2 text-verde-claro hover:underline focus:outline-none focus:ring-2 focus:ring-verde-claro/50 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="min-w-0 flex-1 p-4 md:ml-64 md:p-8">{children}</main>
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
