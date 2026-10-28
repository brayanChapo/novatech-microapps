# Backend · Rendición de gastos con foto de comprobante (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/gastos` | Registrar |
| POST | `/rendiciones/:id/enviar` | Enviar |
| PATCH | `/rendiciones/:id` | Aprobar/rechazar |
| GET | `/exportaciones/contable.csv` | Exportar |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- Supabase Storage
- Correo

## Pruebas unitarias mínimas (antes del primer cliente)

- Validación de RUC
- Cálculo de tope mensual
- Duplicados
- El aprobador no aprueba lo suyo
