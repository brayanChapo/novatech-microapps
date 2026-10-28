# 09 · Seguridad y privacidad — Asistencia

> Este documento resume medidas técnicas y puntos legales a considerar. **No reemplaza una revisión legal**: validar con un abogado antes del primer contrato.

## 1. Datos que se tratan

| Dato | Para qué | Cuándo se captura |
|---|---|---|
| Nombre, DNI, correo | Identificar al colaborador | Alta del usuario |
| Latitud, longitud, precisión | Verificar que está en su local | **Solo al tocar "Marcar"** |
| Indicador de ubicación simulada | Prevenir fraude | Al marcar |
| Modelo de celular, plataforma, versión de app | Soporte y auditoría | Al marcar |
| Hora de marcación | Control de asistencia | Al marcar (hora del servidor) |

**No se captura:** ubicación continua o en segundo plano, fotos, contactos, ni otra información del celular.

## 2. Marco legal en Perú (puntos a validar)

- **Ley N.° 29733**, Ley de Protección de Datos Personales, y su reglamento: la ubicación vinculada a una persona es dato personal. Se requiere **informar la finalidad** y contar con base legal/consentimiento.
- **Roles:** la empresa cliente es **titular del banco de datos** (responsable); NovaTech actúa como **encargado del tratamiento**. Formalizarlo en un **acuerdo de encargo de tratamiento** dentro del contrato.
- El cliente debe evaluar la **inscripción de su banco de datos** de personal ante la autoridad de protección de datos.
- **Registro de control de asistencia** (normativa laboral): el empleador debe llevar el registro y conservarlo. Confirmar con el asesor del cliente el plazo de conservación aplicable (la propuesta por defecto es 5 años).
- **Transferencia internacional:** los datos se alojan en Supabase (región São Paulo) y Vercel; mencionarlo en la política de privacidad.

## 3. Textos sugeridos

**Aviso en la app (permiso de ubicación):**
> "Usamos tu ubicación solo en el momento de marcar, para verificar que estás en tu local de trabajo."

**Cláusula para el reglamento interno / comunicación al trabajador (la emite el cliente):**
> "La empresa registra la asistencia mediante la aplicación Asistencia NovaTech. Al marcar entrada o salida, la aplicación registra la ubicación del dispositivo en ese momento con la única finalidad de verificar que la marcación se realiza en el local asignado. No se realiza seguimiento continuo de la ubicación. Los datos se conservan durante [5] años y puede ejercer sus derechos de acceso, rectificación, cancelación y oposición escribiendo a [correo del cliente]."

## 4. Medidas técnicas implementadas

| Riesgo | Medida |
|---|---|
| Una empresa ve datos de otra | RLS en todas las tablas + filtro `empresa_id` en cada consulta del backend + pruebas pgTAP |
| Cliente manipulado inserta marcaciones falsas | Sin políticas de INSERT para usuarios; solo el backend escribe |
| Marcar desde casa | Geocerca validada en el servidor |
| Fake GPS | `location.mocked` (Android) rechazado por defecto |
| Cambiar la hora del celular | Hora oficial del servidor |
| Doble marcación | Índice único por colaborador/día/tipo |
| Robo de credenciales | Contraseñas gestionadas por Supabase Auth (hash bcrypt); tokens de 1 h; registro público deshabilitado |
| Fuga de la llave maestra | `service_role` solo en variables de entorno del backend (Vercel *Sensitive*); nunca en web/móvil ni en Git |
| Inyección / datos malformados | Validación Zod; consultas parametrizadas de PostgREST |
| Inyección de fórmulas en CSV | Celdas que empiezan con `= + - @` se neutralizan |
| Sitios no autorizados llamando a la API | CORS con lista blanca |
| Cabeceras inseguras | `secureHeaders()` de Hono |

## 5. Limitaciones conocidas (comunicar al cliente)

- **iPhone no informa ubicación simulada** como Android; el riesgo de fake GPS en iOS es menor (requiere equipos modificados) pero existe.
- La precisión del GPS en interiores puede ser de 20–60 m; por eso el radio recomendado es de 80 m o más.
- Un colaborador podría prestar su celular y su contraseña a otro. Mitigación futura (Fase 2): vincular un dispositivo por usuario o foto de verificación.

## 6. Retención y eliminación

| Dato | Plazo propuesto | Al vencer |
|---|---|---|
| Marcaciones | 5 años | Eliminar o anonimizar lat/lng |
| Usuario cesado | Se desactiva; se conserva por el plazo legal | Eliminar perfil y cuenta |
| Fin del contrato con el cliente | Entregar exportación CSV completa | Eliminar datos de la empresa en 30 días y emitir constancia |

## 7. Respuesta a incidentes

1. Detectar (logs, alerta, reporte del cliente).
2. Contener: rotar `service_role` en Supabase y actualizar la variable en Vercel; desactivar usuarios comprometidos.
3. Evaluar alcance (qué empresas, qué datos).
4. Comunicar al cliente responsable en un máximo de 48 h con lo conocido.
5. Corregir, documentar y agregar una prueba que evite la repetición.
