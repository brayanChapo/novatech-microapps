import { debeEnviarRecordatorio } from '../domain/recordatorio';
import type { CitaRepo } from '../repos/cita.repo';
import { enviarPlantilla } from '../lib/whatsapp';

export interface ResultadoProcesamiento {
  procesadas: number;
  enviados: number;
  errores: number;
}

/**
 * Caso de uso: procesar y enviar recordatorios de citas próximas.
 *
 * 1. Obtener citas pendientes de recordatorio (recordatorio_enviado = false, inicio ≤ now()+25h)
 * 2. Para cada cita: evaluar si corresponde enviar según regla 24h/2h
 * 3. Enviar plantilla WA "recordatorio_cita" solo a pacientes que aceptan WA
 * 4. Marcar cita como recordatorio_enviado = true
 */
export async function procesarRecordatorios(
  empresaId: string,
  repo: CitaRepo,
  ahora: Date = new Date(),
): Promise<ResultadoProcesamiento> {
  const citas = await repo.citasPendientesRecordatorio(empresaId);

  let enviados = 0;
  let errores = 0;

  for (const cita of citas) {
    try {
      // La cita puede no tener paciente con acepta_whatsapp
      if (!cita.paciente.acepta_whatsapp) {
        // Igual marcamos como "enviado" para no reintentarlo
        await repo.marcarRecordatorioEnviado(cita.id, empresaId);
        continue;
      }

      const inicioCita = new Date(cita.inicio);
      const creadaEn = new Date(cita.creado_en);

      const resultado = debeEnviarRecordatorio(inicioCita, ahora, creadaEn, cita.recordatorio_enviado);

      if (!resultado.debe) {
        // No es momento de enviar aún; el cron volverá a intentar
        continue;
      }

      const fechaFormateada = new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(inicioCita);

      const telefonoLimpio = cita.paciente.telefono.replace(/\D/g, '');

      const messageId = await enviarPlantilla(telefonoLimpio, 'recordatorio_cita', [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: cita.paciente.nombre },
            { type: 'text', text: cita.profesional.nombre },
            { type: 'text', text: cita.servicio.nombre },
            { type: 'text', text: fechaFormateada },
            { type: 'text', text: resultado.tipo === '24h' ? '24 horas' : '2 horas' },
          ],
        },
      ]);

      await repo.registrarEnvioWA({
        empresa_id: empresaId,
        cita_id: cita.id,
        plantilla: 'recordatorio_cita',
        telefono: telefonoLimpio,
        meta_message_id: messageId,
      });

      await repo.marcarRecordatorioEnviado(cita.id, empresaId);
      enviados += 1;
    } catch (err) {
      console.error('[recordatorio] Error al procesar cita', { cita_id: cita.id, error: err });
      errores += 1;
    }
  }

  return { procesadas: citas.length, enviados, errores };
}
