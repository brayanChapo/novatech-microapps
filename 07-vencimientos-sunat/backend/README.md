# Backend · Vencimientos SUNAT + portal de documentos (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/cronograma/importar` | Cargar tabla oficial del año |
| GET | `/vencimientos?mes` | Tablero |
| POST | `/portal/:token/documentos` | Subida del cliente |
| PATCH | `/periodos/:id` | Cambiar estado / constancia |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- Correo transaccional
- Supabase Storage
- Tarea programada diaria (cron)

## Pruebas unitarias mínimas (antes del primer cliente)

- Validación de RUC
- Asignación de vencimiento por último dígito
- Reglas de alertas (5 y 2 días; 7 días al cliente)
- Transición a declarado solo con constancia
