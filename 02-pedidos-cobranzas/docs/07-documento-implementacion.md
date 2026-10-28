# 07 · Documento de implementación — Toma de pedidos en ruta + cobranzas

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `pedidos` con `supabase db push`; exponer `pedidos` en Settings → API.
2. Vercel `pedidos-cobranzas-api` (Root: `02-pedidos-cobranzas/backend`) y `pedidos-cobranzas-web` (Root: `02-pedidos-cobranzas/frontend`).
3. Dominios: `api-pedidos-cobranzas.novatechconsulting.com.pe` y `pedidos-cobranzas.novatechconsulting.com.pe`.
4. App: EAS Build (APK para piloto, tiendas para producción).
5. WhatsApp: número del cliente verificado en Meta y plantillas aprobadas **antes** de la salida a producción (1–2 días).

## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
