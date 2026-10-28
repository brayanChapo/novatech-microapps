import { Hono } from 'hono';
import { config } from '../config';
import { ErrorNegocio } from '../lib/errores';
import { core, verificar } from '../lib/supabase';
import { SupabaseCitaRepo } from '../repos/supabase-cita.repo';
import { procesarRecordatorios } from '../services/recordatorio.service';

const repo = new SupabaseCitaRepo();

export const rutasCron = new Hono()
  /**
   * GET /cron/recordatorios — enviado por Vercel Cron cada hora.
   * Protegido con header X-Cron-Secret para evitar ejecuciones no autorizadas.
   *
   * Itera todas las empresas activas y procesa sus recordatorios pendientes.
   */
  .get('/cron/recordatorios', async (c) => {
    // Verificar el secret del cron
    const secretHeader = c.req.header('X-Cron-Secret') ?? c.req.header('Authorization');
    const secretEsperado = `Bearer ${config.cronSecret}`;

    if (secretHeader !== secretEsperado) {
      throw new ErrorNegocio('SIN_PERMISO', 'Acceso no autorizado al cron.', 401);
    }

    // Obtener todas las empresas activas
    const empresas = verificar(
      await core()
        .from('empresas')
        .select('id')
        .eq('activo', true),
    ) as Array<{ id: string }>;

    let totalProcesadas = 0;
    let totalEnviados = 0;
    let totalErrores = 0;

    for (const empresa of empresas) {
      try {
        const resultado = await procesarRecordatorios(empresa.id, repo);
        totalProcesadas += resultado.procesadas;
        totalEnviados += resultado.enviados;
        totalErrores += resultado.errores;
      } catch (err) {
        console.error('[cron] Error al procesar empresa', { empresa_id: empresa.id, error: err });
        totalErrores += 1;
      }
    }

    return c.json({
      ok: true,
      procesadas: totalProcesadas,
      enviados: totalEnviados,
      errores: totalErrores,
      empresas: empresas.length,
      hora: new Date().toISOString(),
    });
  });
