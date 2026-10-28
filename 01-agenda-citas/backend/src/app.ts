import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { config } from './config';
import { ErrorNegocio } from './lib/errores';
import { autenticar, type Entorno } from './middleware/auth';
import { rutasReservas } from './routes/reservas';
import { rutasCitas } from './routes/citas';
import { rutasPacientes } from './routes/pacientes';
import { rutasProfesionales } from './routes/profesionales';
import { rutasServicios } from './routes/servicios';
import { rutasDisponibilidad } from './routes/disponibilidad';
import { rutasWebhooks } from './routes/webhooks';
import { rutasCron } from './routes/cron';
import { rutasReportes } from './routes/reportes';
import { rutasConfiguracion } from './routes/configuracion';

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
app.get('/salud', (c) =>
  c.json({ ok: true, servicio: 'agenda', hora: new Date().toISOString() }),
);

// Rutas públicas con rate limit (sin auth)
app.route('/', rutasReservas);

// Webhooks sin JWT — verificación propia (token de Meta)
app.route('/', rutasWebhooks);

// Cron protegido con header X-Cron-Secret (sin JWT de usuario)
app.route('/', rutasCron);

// Todo lo demás requiere JWT de Supabase Auth
app.use('*', autenticar);
app.route('/', rutasCitas);
app.route('/', rutasPacientes);
app.route('/', rutasProfesionales);
app.route('/', rutasServicios);
app.route('/', rutasDisponibilidad);
app.route('/', rutasReportes);
app.route('/', rutasConfiguracion);

app.notFound((c) =>
  c.json({ error: { codigo: 'NO_ENCONTRADO', mensaje: 'Ruta no encontrada.' } }, 404),
);

app.onError((err, c) => {
  if (err instanceof ErrorNegocio) {
    return c.json(
      { error: { codigo: err.codigo, mensaje: err.message, detalle: err.detalle } },
      err.status,
    );
  }
  console.error('[error no controlado]', err);
  return c.json(
    { error: { codigo: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado. Inténtalo de nuevo.' } },
    500,
  );
});

export default app;
