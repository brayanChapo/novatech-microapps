import { z } from 'zod';
import { ErrorNegocio } from './errores';

export function validar<T extends z.ZodType>(esquema: T, datos: unknown): z.infer<T> {
  const r = esquema.safeParse(datos);
  if (!r.success) {
    throw new ErrorNegocio('DATOS_INVALIDOS', 'Hay datos inválidos en la solicitud.', 400, {
      campos: r.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    });
  }
  return r.data;
}

export const fechaIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha YYYY-MM-DD');
export const uuid = z.string().uuid();
export const horaHHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora HH:MM');

export const esquemas = {
  marcacion: z.object({
    tipo: z.enum(['entrada', 'salida']).optional(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    precision_m: z.number().min(0).max(10_000),
    ubicacion_simulada: z.boolean().default(false),
    dispositivo: z
      .object({
        plataforma: z.string().max(20).optional(),
        modelo: z.string().max(80).optional(),
        version_app: z.string().max(20).optional(),
      })
      .optional(),
  }),
  local: z.object({
    nombre: z.string().trim().min(2).max(80),
    direccion: z.string().trim().max(200).optional(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    radio_m: z.number().int().min(20).max(2000).default(100),
  }),
  localParcial: z
    .object({
      nombre: z.string().trim().min(2).max(80),
      direccion: z.string().trim().max(200),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      radio_m: z.number().int().min(20).max(2000),
      activo: z.boolean(),
    })
    .partial()
    .refine((o) => Object.keys(o).length > 0, 'No hay cambios que guardar'),
  horario: z.object({
    nombre: z.string().trim().min(2).max(80),
    hora_entrada: horaHHMM,
    hora_salida: horaHHMM,
    tolerancia_min: z.number().int().min(0).max(120).default(10),
    dias_semana: z.array(z.number().int().min(1).max(7)).min(1).max(7).default([1, 2, 3, 4, 5]),
  }),
  colaborador: z.object({
    nombre: z.string().trim().min(2).max(120),
    documento: z.string().trim().max(15).optional(),
    correo: z.string().trim().toLowerCase().email(),
    contrasena_temporal: z.string().min(8).max(72),
    rol: z.enum(['admin', 'supervisor', 'colaborador']).default('colaborador'),
    local_id: uuid.optional(),
    horario_id: uuid.optional(),
  }),
  asignacion: z.object({ local_id: uuid, horario_id: uuid }),
  colaboradorParcial: z
    .object({
      nombre: z.string().trim().min(2).max(120),
      documento: z.string().trim().max(15),
      rol: z.enum(['admin', 'supervisor', 'colaborador']),
      activo: z.boolean(),
    })
    .partial()
    .refine((o) => Object.keys(o).length > 0, 'No hay cambios que guardar'),
  localesSupervisados: z.object({ local_ids: z.array(uuid).max(200) }),
  nuevaContrasena: z.object({ contrasena_temporal: z.string().min(8).max(72) }),
};
