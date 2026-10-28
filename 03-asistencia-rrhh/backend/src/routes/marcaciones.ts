import { Hono } from 'hono';
import type { Entorno } from '../middleware/auth';
import { asistencia, verificar } from '../lib/supabase';
import { esquemas, fechaIso, validar } from '../lib/validacion';
import { SupabaseMarcacionRepo } from '../repos/supabase-marcacion.repo';
import { estadoDelDia, registrarMarcacion } from '../services/marcacion.service';
import { momentoLocal, restarDias } from '../domain/tiempo';

const repo = new SupabaseMarcacionRepo();

export const rutasMarcaciones = new Hono<Entorno>()
  /** Estado del día para la app móvil: local asignado, horario y siguiente marcación. */
  .get('/yo', async (c) => {
    const usuario = c.get('usuario');
    const estado = await estadoDelDia(repo, usuario);
    return c.json({ usuario, ...estado });
  })

  /** Registrar entrada/salida. El servidor valida geocerca, precisión, secuencia y hora. */
  .post('/marcaciones', async (c) => {
    const entrada = validar(esquemas.marcacion, await c.req.json().catch(() => ({})));
    const resultado = await registrarMarcacion(repo, c.get('usuario'), entrada);
    return c.json(resultado, 201);
  })

  /** Historial propio (por defecto últimos 30 días). */
  .get('/marcaciones/mias', async (c) => {
    const usuario = c.get('usuario');
    const zona = await repo.zonaHoraria(usuario.empresa_id);
    const hoy = momentoLocal(new Date(), zona).fecha;
    const hasta = validar(fechaIso, c.req.query('hasta') ?? hoy);
    const desde = validar(fechaIso, c.req.query('desde') ?? restarDias(hasta, 30));

    const marcaciones = verificar(
      await asistencia()
        .from('marcaciones')
        .select('id, tipo, estado, marcado_en, fecha_local, distancia_m, dentro_geocerca, local:locales(nombre)')
        .eq('colaborador_id', usuario.id)
        .gte('fecha_local', desde)
        .lte('fecha_local', hasta)
        .order('marcado_en', { ascending: false })
        .limit(200),
    );
    return c.json({ desde, hasta, marcaciones });
  });
