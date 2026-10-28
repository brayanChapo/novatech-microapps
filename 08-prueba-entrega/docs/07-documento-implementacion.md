# 07 · Documento de implementación — Prueba de entrega (foto, firma, GPS)

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `entregas` con `supabase db push`; exponer `entregas` en Settings → API.
2. Vercel `prueba-entrega-api` (Root: `08-prueba-entrega/backend`) y `prueba-entrega-web` (Root: `08-prueba-entrega/frontend`).
3. Dominios: `api-prueba-entrega.novatechconsulting.com.pe` y `prueba-entrega.novatechconsulting.com.pe`.
4. App: EAS Build (APK para piloto, tiendas para producción).


## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
