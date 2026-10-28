# 07 · Documento de implementación — Asistencia por QR con aviso a padres

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `escolar` con `supabase db push`; exponer `escolar` en Settings → API.
2. Vercel `asistencia-escolar-qr-api` (Root: `09-asistencia-escolar-qr/backend`) y `asistencia-escolar-qr-web` (Root: `09-asistencia-escolar-qr/frontend`).
3. Dominios: `api-asistencia-escolar-qr.novatechconsulting.com.pe` y `asistencia-escolar-qr.novatechconsulting.com.pe`.
4. App: EAS Build (APK para piloto, tiendas para producción).
5. WhatsApp: número del cliente verificado en Meta y plantillas aprobadas **antes** de la salida a producción (1–2 días).

## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
