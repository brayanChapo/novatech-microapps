# Frontend · Toma de pedidos en ruta + cobranzas (por construir)

Next.js + Tailwind con los mismos componentes base de [`03-asistencia-rrhh/frontend`](../../03-asistencia-rrhh/frontend/) (`components/ui.tsx`, `lib/api.ts`, `lib/sesion.tsx`, `KpiCard`).

## Pantallas

- App: ruta del día, catálogo, carrito, cobro, cola de sincronización
- Web: tablero de ventas, pedidos para almacén, cuentas por cobrar, validación de cobros, catálogo y precios

## Reglas

- Datos siempre por la API del backend; Supabase en el navegador solo para login (y Realtime si aplica).
- Responsive desde 360 px; sin desplazamiento horizontal de página.
- Textos en español claro; errores tal como los devuelve la API.
