# Backend · Parte diario de obra + checklist SST (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/sync/partes` | Subir partes (idempotente) |
| POST | `/sync/inspecciones` | Subir inspecciones |
| POST | `/fotos/url-subida` | URL firmada para subir foto |
| GET | `/obras/:id/reporte-semanal.pdf?semana` | PDF |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- Supabase Storage (fotos y firmas)
- Generación de PDF
- Correo (alertas)

## Pruebas unitarias mínimas (antes del primer cliente)

- Avance acumulado por partida
- Conteo de críticos no conformes
- Cierre de parte y bloqueo de edición
- Idempotencia de sincronización
