# Módulos compartidos

Cada módulo se construyó (o se construirá) **una vez** y se copia/adapta en las demás apps. Cuando un módulo se use en 3 o más apps, se extrae a un paquete `plataforma/paquetes/<modulo>`.

| # | Módulo | Implementación de referencia | Estado | Apps que lo usan |
|---|---|---|---|---|
| 1 | Usuarios, roles y login (Supabase Auth + `core.perfiles` + middleware JWT) | `03-asistencia-rrhh/backend/src/middleware/auth.ts`, `frontend/lib/sesion.tsx`, `mobile/App.tsx` | ✅ | Todas |
| 2 | Notificaciones WhatsApp (Cloud API, plantillas, webhook, registro de envíos) | Por construir con la app 01 | ⏳ | 01, 02, 04, 05, 09, 10, 15 |
| 3 | Formularios con foto, firma y GPS | GPS: `03-asistencia-rrhh/mobile/src/hooks/useUbicacionEnVivo.ts` · foto/firma: por construir con 06/08 | 🟡 | 02, 05, 06, 08, 11 |
| 4 | QR (generar/leer, tokens firmados) | Por construir con 09 | ⏳ | 09, 10, 15 |
| 5 | Agenda y reservas | Por construir con 01 | ⏳ | 01, 10 |
| 6 | Generación de PDF | Por construir con 05/13 | ⏳ | 05, 06, 09, 13, 14 |
| 7 | Tablero de indicadores (KPIs, tablas, mapa, tiempo real) | `03-asistencia-rrhh/frontend/components/{KpiCard,MapaLocales,useTiempoReal}` | ✅ | Todas |
| 8 | Pagos y deudas (vouchers Yape/Plin/transferencia) | Por construir con 04 | ⏳ | 02, 04, 10 |

Utilidades ya listas para copiar:

- `backend/src/lib/{errores,validacion,csv,supabase}.ts` — errores en español, validación Zod, CSV seguro para Excel, cliente `service_role`.
- `backend/src/domain/tiempo.ts` — fecha/hora en zona de la empresa (America/Lima).
- `frontend/components/ui.tsx` — Campo, Entrada, Selector, Boton, Tarjeta, Aviso.
