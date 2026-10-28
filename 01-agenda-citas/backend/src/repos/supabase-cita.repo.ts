import { agenda, verificar } from '../lib/supabase';
import type { Cita, CitaConPaciente, EstadoCita, Disponibilidad, Paciente, Profesional, Servicio } from '../domain/tipos';
import { transicionValida, mensajeTransicionInvalida } from '../domain/estado-cita';
import { ErrorNegocio } from '../lib/errores';
import type { CitaRepo, CrearCitaInput, UpsertPacienteInput } from './cita.repo';

export class SupabaseCitaRepo implements CitaRepo {
  async citasPorProfesionalYFecha(empresaId: string, profesionalId: string, fecha: Date): Promise<Cita[]> {
    const fechaStr = fecha.toISOString().split('T')[0] ?? '';
    // Inicio del día UTC
    const desdeUtc = `${fechaStr}T00:00:00.000Z`;
    const hastaUtc = `${fechaStr}T23:59:59.999Z`;

    return verificar(
      await agenda()
        .from('citas')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('profesional_id', profesionalId)
        .neq('estado', 'cancelada')
        .gte('inicio', desdeUtc)
        .lte('inicio', hastaUtc)
        .order('inicio'),
    ) as Cita[];
  }

  async crearCita(datos: CrearCitaInput): Promise<Cita> {
    // Verificar solapamiento antes de insertar
    const solapadas = verificar(
      await agenda()
        .from('citas')
        .select('id')
        .eq('empresa_id', datos.empresa_id)
        .eq('profesional_id', datos.profesional_id)
        .neq('estado', 'cancelada')
        .lt('inicio', datos.fin.toISOString())
        .gt('fin', datos.inicio.toISOString()),
    ) as Array<{ id: string }>;

    if (solapadas.length > 0) {
      throw new ErrorNegocio(
        'SLOT_NO_DISPONIBLE',
        'El slot solicitado ya no está disponible. Elige otro horario.',
        409,
      );
    }

    const fila = verificar(
      await agenda()
        .from('citas')
        .insert({
          empresa_id: datos.empresa_id,
          profesional_id: datos.profesional_id,
          servicio_id: datos.servicio_id,
          paciente_id: datos.paciente_id,
          inicio: datos.inicio.toISOString(),
          fin: datos.fin.toISOString(),
          estado: 'reservada',
          origen: datos.origen,
          recordatorio_enviado: false,
          recordatorio_enviado_en: null,
        })
        .select()
        .single(),
    );

    return fila as Cita;
  }

  async actualizarEstado(
    id: string,
    empresaId: string,
    estado: EstadoCita,
    extra: Record<string, unknown> = {},
  ): Promise<Cita> {
    // Cargar estado actual para validar la transición
    const actual = await this.porId(id, empresaId);
    if (!actual) {
      throw new ErrorNegocio('NO_ENCONTRADO', 'Cita no encontrada.', 404);
    }

    if (!transicionValida(actual.estado, estado)) {
      throw new ErrorNegocio(
        'TRANSICION_INVALIDA',
        mensajeTransicionInvalida(actual.estado, estado),
        422,
      );
    }

    const fila = verificar(
      await agenda()
        .from('citas')
        .update({ estado, ...extra })
        .eq('id', id)
        .eq('empresa_id', empresaId)
        .select()
        .single(),
    );

    return fila as Cita;
  }

  async citasPendientesRecordatorio(empresaId: string): Promise<CitaConPaciente[]> {
    const ahora = new Date();
    const en25h = new Date(ahora.getTime() + 25 * 60 * 60_000);

    const filas = verificar(
      await agenda()
        .from('citas')
        .select(`
          *,
          paciente:pacientes(nombre, telefono, acepta_whatsapp),
          profesional:profesionales(nombre),
          servicio:servicios(nombre, duracion_min)
        `)
        .eq('empresa_id', empresaId)
        .eq('recordatorio_enviado', false)
        .in('estado', ['reservada', 'confirmada'])
        .gte('inicio', ahora.toISOString())
        .lte('inicio', en25h.toISOString()),
    );

    return filas as unknown as CitaConPaciente[];
  }

  async marcarRecordatorioEnviado(id: string, empresaId: string): Promise<void> {
    verificar(
      await agenda()
        .from('citas')
        .update({ recordatorio_enviado: true, recordatorio_enviado_en: new Date().toISOString() })
        .eq('id', id)
        .eq('empresa_id', empresaId),
    );
  }

  async porId(id: string, empresaId: string): Promise<Cita | null> {
    const { data } = await agenda()
      .from('citas')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .maybeSingle();

    return (data as Cita | null) ?? null;
  }

  async citasPorFecha(
    empresaId: string,
    desde: Date,
    hasta: Date,
    profesionalId?: string,
  ): Promise<Cita[]> {
    let query = agenda()
      .from('citas')
      .select('*')
      .eq('empresa_id', empresaId)
      .gte('inicio', desde.toISOString())
      .lte('inicio', hasta.toISOString())
      .order('inicio');

    if (profesionalId) {
      query = query.eq('profesional_id', profesionalId);
    }

    return verificar(await query) as Cita[];
  }

  async disponibilidadPorProfesional(
    empresaId: string,
    profesionalId: string,
  ): Promise<Disponibilidad[]> {
    return verificar(
      await agenda()
        .from('disponibilidad')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('profesional_id', profesionalId)
        .order('dia_semana')
        .order('hora_inicio'),
    ) as Disponibilidad[];
  }

  async upsertPaciente(datos: UpsertPacienteInput): Promise<Paciente> {
    // Buscar primero por teléfono + empresa
    const { data: existente } = await agenda()
      .from('pacientes')
      .select('*')
      .eq('empresa_id', datos.empresa_id)
      .eq('telefono', datos.telefono)
      .maybeSingle();

    if (existente) return existente as Paciente;

    // Crear nuevo
    const fila = verificar(
      await agenda()
        .from('pacientes')
        .insert({
          empresa_id: datos.empresa_id,
          nombre: datos.nombre,
          telefono: datos.telefono,
          acepta_whatsapp: true,
        })
        .select()
        .single(),
    );

    return fila as Paciente;
  }

  async buscarPacientes(empresaId: string, q: string): Promise<Paciente[]> {
    const termino = `%${q}%`;
    return verificar(
      await agenda()
        .from('pacientes')
        .select('*')
        .eq('empresa_id', empresaId)
        .or(`nombre.ilike.${termino},telefono.ilike.${termino}`)
        .limit(50),
    ) as Paciente[];
  }

  async profesionalPorId(empresaId: string, profesionalId: string): Promise<Profesional | null> {
    const { data } = await agenda()
      .from('profesionales')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('id', profesionalId)
      .maybeSingle();

    return (data as Profesional | null) ?? null;
  }

  async profesionales(empresaId: string): Promise<Profesional[]> {
    return verificar(
      await agenda()
        .from('profesionales')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('activo', true)
        .order('nombre'),
    ) as Profesional[];
  }

  async servicios(empresaId: string): Promise<Servicio[]> {
    return verificar(
      await agenda()
        .from('servicios')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('nombre'),
    ) as Servicio[];
  }

  async registrarEnvioWA(datos: {
    empresa_id: string;
    cita_id: string | null;
    plantilla: string;
    telefono: string;
    meta_message_id: string;
  }): Promise<void> {
    verificar(
      await agenda()
        .from('mensajes_whatsapp')
        .insert({
          empresa_id: datos.empresa_id,
          cita_id: datos.cita_id,
          plantilla: datos.plantilla,
          telefono: datos.telefono,
          estado: 'enviado',
          meta_message_id: datos.meta_message_id,
          enviado_en: new Date().toISOString(),
        }),
    );
  }
}
