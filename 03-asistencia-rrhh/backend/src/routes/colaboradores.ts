import { Hono } from 'hono';
import { momentoLocal, restarDias } from '../domain/tiempo';
import type { UsuarioAutenticado } from '../domain/tipos';
import { ErrorNegocio } from '../lib/errores';
import { asistencia, core, supabaseAdmin, verificar } from '../lib/supabase';
import { esquemas, uuid, validar } from '../lib/validacion';
import { requiereRol, type Entorno } from '../middleware/auth';
import { SupabaseMarcacionRepo } from '../repos/supabase-marcacion.repo';

const repo = new SupabaseMarcacionRepo();

/** Verifica que local y horario existan y pertenezcan a la empresa del admin. */
async function validarLocalYHorario(empresaId: string, localId: string, horarioId: string) {
  const [local, horario] = await Promise.all([
    asistencia().from('locales').select('id').eq('id', localId).eq('empresa_id', empresaId).eq('activo', true).maybeSingle(),
    asistencia().from('horarios').select('id').eq('id', horarioId).eq('empresa_id', empresaId).maybeSingle(),
  ]);
  if (!verificar(local)) throw new ErrorNegocio('DATOS_INVALIDOS', 'El local no existe o está inactivo.', 400);
  if (!verificar(horario)) throw new ErrorNegocio('DATOS_INVALIDOS', 'El horario no existe.', 400);
}

/** Cierra la asignación abierta y crea la nueva desde hoy (conserva el historial). */
async function reasignar(usuario: UsuarioAutenticado, colaboradorId: string, localId: string, horarioId: string) {
  const hoy = momentoLocal(new Date(), await repo.zonaHoraria(usuario.empresa_id)).fecha;
  // Si la asignación abierta empezó hoy, se reemplaza; si empezó antes, se cierra ayer.
  verificar(
    await asistencia()
      .from('asignaciones')
      .delete()
      .eq('colaborador_id', colaboradorId)
      .eq('empresa_id', usuario.empresa_id)
      .is('vigente_hasta', null)
      .gte('vigente_desde', hoy),
  );
  verificar(
    await asistencia()
      .from('asignaciones')
      .update({ vigente_hasta: restarDias(hoy, 1) })
      .eq('colaborador_id', colaboradorId)
      .eq('empresa_id', usuario.empresa_id)
      .is('vigente_hasta', null),
  );
  return verificar(
    await asistencia()
      .from('asignaciones')
      .insert({
        empresa_id: usuario.empresa_id,
        colaborador_id: colaboradorId,
        local_id: localId,
        horario_id: horarioId,
        vigente_desde: hoy,
      })
      .select('id, local_id, horario_id, vigente_desde')
      .single(),
  );
}

async function perfilDeEmpresa(empresaId: string, id: string) {
  const perfil = verificar(
    await core().from('perfiles').select('id, rol').eq('id', id).eq('empresa_id', empresaId).maybeSingle(),
  ) as { id: string; rol: string } | null;
  if (!perfil) throw new ErrorNegocio('NO_ENCONTRADO', 'El colaborador no existe.', 404);
  return perfil;
}

export const rutasColaboradores = new Hono<Entorno>()
  .use('/colaboradores/*', requiereRol('admin'))
  .use('/colaboradores', requiereRol('admin'))

  /** Lista de usuarios de la empresa con su asignación vigente. */
  .get('/colaboradores', async (c) => {
    const usuario = c.get('usuario');
    const perfiles = verificar(
      await core()
        .from('perfiles')
        .select('id, nombre, documento, rol, activo, creado_en')
        .eq('empresa_id', usuario.empresa_id)
        .order('nombre'),
    ) as { id: string }[];

    const asignaciones = verificar(
      await asistencia()
        .from('asignaciones')
        .select('colaborador_id, vigente_desde, local:locales(id, nombre), horario:horarios(id, nombre)')
        .eq('empresa_id', usuario.empresa_id)
        .is('vigente_hasta', null),
    ) as { colaborador_id: string }[];
    const porColaborador = new Map(asignaciones.map((a) => [a.colaborador_id, a]));

    const supervision = verificar(
      await asistencia().from('supervisores_locales').select('supervisor_id, local_id').eq('empresa_id', usuario.empresa_id),
    ) as { supervisor_id: string; local_id: string }[];
    const localesDe = (id: string) => supervision.filter((s) => s.supervisor_id === id).map((s) => s.local_id);

    return c.json({
      colaboradores: perfiles.map((p) => ({
        ...p,
        asignacion: porColaborador.get(p.id) ?? null,
        locales_supervisados: localesDe(p.id),
      })),
    });
  })

  /** Alta de usuario: crea la cuenta en Auth, el perfil y (opcional) la asignación. */
  .post('/colaboradores', async (c) => {
    const usuario = c.get('usuario');
    const datos = validar(esquemas.colaborador, await c.req.json().catch(() => ({})));
    if ((datos.local_id && !datos.horario_id) || (!datos.local_id && datos.horario_id)) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Para asignar, envía local y horario juntos.', 400);
    }
    if (datos.local_id && datos.horario_id) {
      await validarLocalYHorario(usuario.empresa_id, datos.local_id, datos.horario_id);
    }

    const { data: creado, error } = await supabaseAdmin().auth.admin.createUser({
      email: datos.correo,
      password: datos.contrasena_temporal,
      email_confirm: true,
      user_metadata: { nombre: datos.nombre },
    });
    if (error || !creado.user) {
      const yaExiste = /already|registered|exists/i.test(error?.message ?? '');
      throw new ErrorNegocio(
        yaExiste ? 'CONFLICTO' : 'ERROR_INTERNO',
        yaExiste ? 'Ya existe un usuario con ese correo.' : 'No se pudo crear el usuario.',
        yaExiste ? 409 : 500,
      );
    }

    try {
      const perfil = verificar(
        await core()
          .from('perfiles')
          .insert({
            id: creado.user.id,
            empresa_id: usuario.empresa_id,
            nombre: datos.nombre,
            documento: datos.documento ?? null,
            rol: datos.rol,
          })
          .select('id, nombre, documento, rol, activo')
          .single(),
      );
      const asignacion =
        datos.local_id && datos.horario_id
          ? await reasignar(usuario, creado.user.id, datos.local_id, datos.horario_id)
          : null;
      return c.json({ colaborador: { ...perfil, asignacion } }, 201);
    } catch (e) {
      // Compensación: si falla el perfil, no dejamos una cuenta huérfana en Auth.
      await supabaseAdmin().auth.admin.deleteUser(creado.user.id);
      throw e;
    }
  })

  .patch('/colaboradores/:id', async (c) => {
    const usuario = c.get('usuario');
    const id = validar(uuid, c.req.param('id'));
    const cambios = validar(esquemas.colaboradorParcial, await c.req.json().catch(() => ({})));
    await perfilDeEmpresa(usuario.empresa_id, id);
    if (id === usuario.id && (cambios.activo === false || (cambios.rol && cambios.rol !== 'admin'))) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'No puedes desactivarte ni quitarte el rol de administrador.', 400);
    }
    const colaborador = verificar(
      await core()
        .from('perfiles')
        .update(cambios)
        .eq('id', id)
        .eq('empresa_id', usuario.empresa_id)
        .select('id, nombre, documento, rol, activo')
        .single(),
    );
    return c.json({ colaborador });
  })

  /** Asignar una nueva contraseña temporal (olvido de contraseña). */
  .put('/colaboradores/:id/contrasena', async (c) => {
    const usuario = c.get('usuario');
    const id = validar(uuid, c.req.param('id'));
    const { contrasena_temporal } = validar(esquemas.nuevaContrasena, await c.req.json().catch(() => ({})));
    await perfilDeEmpresa(usuario.empresa_id, id);
    const { error } = await supabaseAdmin().auth.admin.updateUserById(id, { password: contrasena_temporal });
    if (error) throw new ErrorNegocio('ERROR_INTERNO', 'No se pudo cambiar la contraseña.', 500);
    return c.json({ ok: true });
  })

  /** Cambiar local/horario del colaborador desde hoy. */
  .put('/colaboradores/:id/asignacion', async (c) => {
    const usuario = c.get('usuario');
    const id = validar(uuid, c.req.param('id'));
    const datos = validar(esquemas.asignacion, await c.req.json().catch(() => ({})));
    await perfilDeEmpresa(usuario.empresa_id, id);
    await validarLocalYHorario(usuario.empresa_id, datos.local_id, datos.horario_id);
    const asignacion = await reasignar(usuario, id, datos.local_id, datos.horario_id);
    return c.json({ asignacion });
  })

  /** Definir qué locales ve un supervisor en el dashboard. */
  .put('/colaboradores/:id/locales-supervisados', async (c) => {
    const usuario = c.get('usuario');
    const id = validar(uuid, c.req.param('id'));
    const { local_ids } = validar(esquemas.localesSupervisados, await c.req.json().catch(() => ({})));
    const perfil = await perfilDeEmpresa(usuario.empresa_id, id);
    if (perfil.rol !== 'supervisor') {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Solo los supervisores tienen locales supervisados.', 400);
    }
    const unicos = [...new Set(local_ids)];
    if (unicos.length) {
      const validos = verificar(
        await asistencia().from('locales').select('id').eq('empresa_id', usuario.empresa_id).in('id', unicos),
      ) as { id: string }[];
      if (validos.length !== unicos.length) throw new ErrorNegocio('DATOS_INVALIDOS', 'Hay locales que no existen.', 400);
    }
    verificar(await asistencia().from('supervisores_locales').delete().eq('supervisor_id', id).eq('empresa_id', usuario.empresa_id));
    if (unicos.length) {
      verificar(
        await asistencia()
          .from('supervisores_locales')
          .insert(unicos.map((local_id) => ({ supervisor_id: id, local_id, empresa_id: usuario.empresa_id }))),
      );
    }
    return c.json({ supervisor_id: id, local_ids: unicos });
  });
