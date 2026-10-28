import { calcularSlots } from '../domain/slots';
import type { Cita } from '../domain/tipos';
import { ErrorNegocio } from '../lib/errores';
import { enviarPlantilla } from '../lib/whatsapp';
import type { CitaRepo } from '../repos/cita.repo';

export interface EntradaReserva {
  empresa_id: string;
  profesional_id: string;
  servicio_id: string;
  /** Fecha local "YYYY-MM-DD" en zona Lima */
  fecha: string;
  /** Hora inicio "HH:MM" en zona Lima */
  hora: string;
  nombre_paciente: string;
  telefono: string;
}

export interface ResultadoReserva {
  cita: Cita;
  mensaje: string;
}

/** Convierte fecha+hora Lima a Date UTC (Peru es UTC-5, sin horario de verano). */
function limaAUtc(fecha: string, hora: string): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number) as [number, number, number];
  const [hh, mm] = hora.split(':').map(Number) as [number, number];
  // UTC-5: sumar 5 horas
  return new Date(Date.UTC(anio, mes - 1, dia, hh + 5, mm, 0, 0));
}

/**
 * Caso de uso: crear una reserva pública.
 *
 * 1. Obtener disponibilidad y citas existentes del profesional
 * 2. Calcular slots libres con lógica de dominio pura
 * 3. Verificar que el slot solicitado está libre
 * 4. Buscar o crear paciente por teléfono
 * 5. Insertar cita (con verificación de solapamiento atómica en el repo)
 * 6. Enviar WhatsApp de confirmación si el paciente acepta
 * 7. Registrar el envío en la BD
 */
export async function crearReserva(entrada: EntradaReserva, repo: CitaRepo): Promise<ResultadoReserva> {
  // Obtener servicio para conocer duración
  const servicios = await repo.servicios(entrada.empresa_id);
  const servicio = servicios.find((s) => s.id === entrada.servicio_id);
  if (!servicio) {
    throw new ErrorNegocio('NO_ENCONTRADO', 'Servicio no encontrado.', 404);
  }

  // Verificar que el profesional existe y está activo
  const profesional = await repo.profesionalPorId(entrada.empresa_id, entrada.profesional_id);
  if (!profesional) {
    throw new ErrorNegocio('NO_ENCONTRADO', 'Profesional no encontrado.', 404);
  }

  const inicioCita = limaAUtc(entrada.fecha, entrada.hora);
  const finCita = new Date(inicioCita.getTime() + servicio.duracion_min * 60_000);

  // Calcular slots con lógica pura para verificar disponibilidad
  const fechaBase = new Date(Date.UTC(
    inicioCita.getUTCFullYear(),
    inicioCita.getUTCMonth(),
    inicioCita.getUTCDate(),
  ));

  const [disponibilidad, citasExistentes] = await Promise.all([
    repo.disponibilidadPorProfesional(entrada.empresa_id, entrada.profesional_id),
    repo.citasPorProfesionalYFecha(entrada.empresa_id, entrada.profesional_id, fechaBase),
  ]);

  const slots = calcularSlots(
    disponibilidad,
    citasExistentes.map((c) => ({ inicio: new Date(c.inicio), fin: new Date(c.fin) })),
    fechaBase,
    servicio.duracion_min,
  );

  const slotSolicitado = slots.find(
    (s) => s.inicio.getTime() === inicioCita.getTime() && s.disponible,
  );

  if (!slotSolicitado) {
    throw new ErrorNegocio(
      'SLOT_NO_DISPONIBLE',
      'El horario solicitado no está disponible. Por favor elige otro.',
      409,
    );
  }

  // Buscar o crear paciente
  const paciente = await repo.upsertPaciente({
    empresa_id: entrada.empresa_id,
    nombre: entrada.nombre_paciente,
    telefono: entrada.telefono,
  });

  // Crear cita (el repo verifica solapamiento de forma atómica)
  const cita = await repo.crearCita({
    empresa_id: entrada.empresa_id,
    profesional_id: entrada.profesional_id,
    servicio_id: entrada.servicio_id,
    paciente_id: paciente.id,
    inicio: inicioCita,
    fin: finCita,
    origen: 'publico',
  });

  // Enviar confirmación por WhatsApp si el paciente acepta
  if (paciente.acepta_whatsapp) {
    try {
      const telefonoLimpio = entrada.telefono.replace(/\D/g, '');
      const fechaFormateada = new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(inicioCita);

      const messageId = await enviarPlantilla(telefonoLimpio, 'confirmacion_cita', [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: paciente.nombre },
            { type: 'text', text: profesional.nombre },
            { type: 'text', text: servicio.nombre },
            { type: 'text', text: fechaFormateada },
          ],
        },
      ]);

      await repo.registrarEnvioWA({
        empresa_id: entrada.empresa_id,
        cita_id: cita.id,
        plantilla: 'confirmacion_cita',
        telefono: telefonoLimpio,
        meta_message_id: messageId,
      });
    } catch (err) {
      // El envío de WA es best-effort: la cita ya quedó creada
      console.error('[reserva] No se pudo enviar confirmación WA', { cita_id: cita.id, error: err });
    }
  }

  return {
    cita,
    mensaje: `Cita reservada con ${profesional.nombre} para el ${entrada.fecha} a las ${entrada.hora}. Te enviaremos un recordatorio por WhatsApp.`,
  };
}
