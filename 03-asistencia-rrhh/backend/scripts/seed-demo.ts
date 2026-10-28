/**
 * Crea usuarios de DEMOSTRACIÓN en el Supabase LOCAL (o en el proyecto demo con --forzar).
 * Requiere haber aplicado migraciones y seed.sql (supabase db reset).
 *
 *   npm run seed:demo
 *
 * Contraseña de todos: SEED_PASSWORD (por defecto Demo2026!). Nunca usar en producción.
 */
import { asistencia, core, supabaseAdmin } from '../src/lib/supabase';
import { config } from '../src/config';

const EMPRESA = '00000000-0000-0000-0000-00000000e001';
const L = {
  miraflores: '00000000-0000-0000-0000-0000000010c1',
  sanIsidro: '00000000-0000-0000-0000-0000000010c2',
  ate: '00000000-0000-0000-0000-0000000010c3',
};
const H = { oficina: '00000000-0000-0000-0000-0000000040a1', almacen: '00000000-0000-0000-0000-0000000040a2' };
const PASSWORD = process.env.SEED_PASSWORD ?? 'Demo2026!';

const usuarios = [
  { correo: 'admin@demo.pe', nombre: 'Admin Demo', rol: 'admin' as const },
  { correo: 'supervisor@demo.pe', nombre: 'Sofía Supervisora', rol: 'supervisor' as const, supervisa: [L.miraflores, L.sanIsidro] },
  { correo: 'ana@demo.pe', nombre: 'Ana Torres', rol: 'colaborador' as const, local: L.miraflores, horario: H.oficina },
  { correo: 'luis@demo.pe', nombre: 'Luis Ramos', rol: 'colaborador' as const, local: L.miraflores, horario: H.oficina },
  { correo: 'carla@demo.pe', nombre: 'Carla Quispe', rol: 'colaborador' as const, local: L.sanIsidro, horario: H.oficina },
  { correo: 'jorge@demo.pe', nombre: 'Jorge Huamán', rol: 'colaborador' as const, local: L.sanIsidro, horario: H.oficina },
  { correo: 'rosa@demo.pe', nombre: 'Rosa Medina', rol: 'colaborador' as const, local: L.ate, horario: H.almacen },
  { correo: 'pedro@demo.pe', nombre: 'Pedro Salas', rol: 'colaborador' as const, local: L.ate, horario: H.almacen },
];

async function main() {
  const local = /127\.0\.0\.1|localhost/.test(config.supabaseUrl);
  if (!local && !process.argv.includes('--forzar')) {
    console.error('✖ SUPABASE_URL no es local. Usa --forzar solo para el proyecto DEMO, nunca producción.');
    process.exit(1);
  }

  const { data: lista } = await supabaseAdmin().auth.admin.listUsers({ perPage: 1000 });
  for (const u of usuarios) {
    let id = lista?.users.find((x) => x.email === u.correo)?.id;
    if (!id) {
      const { data, error } = await supabaseAdmin().auth.admin.createUser({
        email: u.correo, password: PASSWORD, email_confirm: true, user_metadata: { nombre: u.nombre },
      });
      if (error) throw error;
      id = data.user.id;
    }
    await core().from('perfiles').upsert({ id, empresa_id: EMPRESA, nombre: u.nombre, rol: u.rol });

    if ('local' in u && u.local) {
      await asistencia().from('asignaciones').delete().eq('colaborador_id', id);
      const { error } = await asistencia().from('asignaciones').insert({
        empresa_id: EMPRESA, colaborador_id: id, local_id: u.local, horario_id: u.horario, vigente_desde: '2026-01-01',
      });
      if (error) throw error;
    }
    if ('supervisa' in u && u.supervisa) {
      await asistencia().from('supervisores_locales').delete().eq('supervisor_id', id);
      await asistencia().from('supervisores_locales').insert(u.supervisa.map((local_id) => ({ supervisor_id: id, local_id, empresa_id: EMPRESA })));
    }
    console.log(`  ✔ ${u.rol.padEnd(11)} ${u.correo}`);
  }
  console.log(`\nListo. Contraseña de todos los usuarios demo: ${PASSWORD}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
