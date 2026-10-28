# Backend · Membresías con acceso por QR (por construir)

Seguir la estructura de [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/): `src/domain` (lógica pura con pruebas), `src/services` (casos de uso con repositorio inyectable), `src/repos`, `src/routes`, `src/middleware/auth.ts`, `src/lib`.

## Endpoints previstos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Monitoreo |
| POST | `/pagos` | Registrar pago y extender vigencia |
| GET | `/socio/:token/qr` | Página del socio |
| POST | `/ingresos/validar` | Validar QR rotativo |
| GET | `/reportes/renovaciones` | Reporte |

Todas las rutas (excepto `/salud` y las marcadas como públicas) exigen JWT de Supabase y filtran por `empresa_id` del usuario.

## Integraciones

- WhatsApp Cloud API
- QR rotativo (TOTP)

## Pruebas unitarias mínimas (antes del primer cliente)

- Cálculo de nueva vigencia
- Descuento de sesiones (máx. 1/día)
- QR rotativo válido/expirado
- Rechazo de socio vencido
