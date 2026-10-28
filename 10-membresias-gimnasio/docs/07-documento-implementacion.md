# 07 · Documento de implementación — Membresías con acceso por QR

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `gimnasio` con `supabase db push`; exponer `gimnasio` en Settings → API.
2. Vercel `membresias-gimnasio-api` (Root: `10-membresias-gimnasio/backend`) y `membresias-gimnasio-web` (Root: `10-membresias-gimnasio/frontend`).
3. Dominios: `api-membresias-gimnasio.novatechconsulting.com.pe` y `membresias-gimnasio.novatechconsulting.com.pe`.
4. Verificar instalación como PWA en Android y iPhone.
5. WhatsApp: número del cliente verificado en Meta y plantillas aprobadas **antes** de la salida a producción (1–2 días).

## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
