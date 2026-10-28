# Backend · Cotizador con PDF (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/cotizaciones` | Crear |
| POST | `/cotizaciones/:id/version` | Nueva versión |
| GET | `/cotizaciones/:id.pdf` | PDF |
| PATCH | `/cotizaciones/:id/estado` | Estado |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- Generación de PDF
- Correo
- Enlace wa.me

## Pruebas unitarias mínimas (antes del primer cliente)

- Cálculo de subtotal, descuento, IGV y redondeo
- Versionado
- Vencimiento por validez
- Numeración por empresa y año
