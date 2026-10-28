import { Hono } from 'hono';
import { z } from 'zod';
import type { Entorno } from '../middleware/auth';
import { requiereRol } from '../lib/permisos';
import { ErrorNegocio } from '../lib/errores';
import { core, verificar } from '../lib/supabase';

const esquemaActualizar = z.object({
  nombre: z.string().min(2).max(200).optional(),
  zona_horaria: z.string().max(50).optional(),
  telefono_contacto: z.string().max(20).optional(),
  email_contacto: z.string().email('Email inválido.').optional(),
});

export const rutasConfiguracion = new Hono<Entorno>()
  /** GET /configuracion — obtener configuración de la empresa actual */
  .get('/configuracion', async (c) => {
    const usuario = c.get('usuario');

    const { data: empresa } = await core()
      .from('empresas')
      .select('id, nombre, zona_horaria, telefono_contacto, email_contacto, activo')
      .eq('id', usuario.empresa_id)
      .maybeSingle();

    if (!empresa) {
      throw new ErrorNegocio('NO_ENCONTRADO', 'Configuración de empresa no encontrada.', 404);
    }

    return c.json({ configuracion: empresa });
  })

  /** PATCH /configuracion — actualizar configuración (solo admin) */
  .patch('/configuracion', requiereRol('admin'), async (c) => {
    const usuario = c.get('usuario');

    let bodyRaw: unknown;
    try {
      bodyRaw = await c.req.json();
    } catch {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'El cuerpo debe ser JSON válido.', 400);
    }

    const parsed = esquemaActualizar.safeParse(bodyRaw);
    if (!parsed.success) {
      throw new ErrorNegocio('DATOS_INVALIDOS', 'Datos de configuración inválidos.', 400, {
        errores: parsed.error.flatten().fieldErrors,
      });
    }

    const empresa = verificar(
      await core()
        .from('empresas')
        .update(parsed.data)
        .eq('id', usuario.empresa_id)
        .select()
        .single(),
    );

    return c.json({ configuracion: empresa, mensaje: 'Configuración actualizada correctamente.' });
  });
