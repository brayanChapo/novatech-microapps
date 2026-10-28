# Backend · Historia clínica simple (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| GET | `/pacientes/:id/historia` | Ver historia (registra en bitácora) |
| POST | `/pacientes/:id/evoluciones` | Nueva evolución |
| POST | `/evoluciones/:id/firmar` | Firmar |
| POST | `/evoluciones/:id/adendas` | Adenda |
| GET | `/pacientes/:id/historia.pdf` | Exportar |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- Generación de PDF
- Supabase Storage privado

## Pruebas unitarias mínimas (antes del primer cliente)

- RLS: recepción no lee evoluciones
- Evolución firmada inmutable
- Bitácora en cada lectura
- Exportación PDF completa
