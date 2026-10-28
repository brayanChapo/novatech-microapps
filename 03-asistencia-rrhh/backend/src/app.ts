import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { config } from './config';
import { ErrorNegocio } from './lib/errores';
import { autenticar, type Entorno } from './middleware/auth';
import { rutasColaboradores } from './routes/colaboradores';
import { rutasDashboard } from './routes/dashboard';
import { rutasHorarios } from './routes/horarios';
import { rutasLocales } from './routes/locales';
import { rutasMarcaciones } from './routes/marcaciones';
import { rutasReportes } from './routes/reportes';

export const app = new Hono<Entorno>();

app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: (origen) => (config.corsOrigins.includes(origen) ? origen : null),
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 600,
  }),
);

// Pública: monitoreo de disponibilidad
app.get('/salud', (c) => c.json({ ok: true, servicio: 'asistencia', hora: new Date().toISOString() }));

// Todo lo demás requiere sesión
app.use('*', autenticar);
app.route('/', rutasMarcaciones);
app.route('/', rutasDashboard);
app.route('/', rutasLocales);
app.route('/', rutasHorarios);
app.route('/', rutasColaboradores);
app.route('/', rutasReportes);

app.notFound((c) => c.json({ error: { codigo: 'NO_ENCONTRADO', mensaje: 'Ruta no encontrada.' } }, 404));

app.onError((err, c) => {
  if (err instanceof ErrorNegocio) {
    return c.json({ error: { codigo: err.codigo, mensaje: err.message, detalle: err.detalle } }, err.status);
  }
  console.error('[error no controlado]', err);
  return c.json({ error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado. Inténtalo de nuevo.' } }, 500);
});

export default app;
