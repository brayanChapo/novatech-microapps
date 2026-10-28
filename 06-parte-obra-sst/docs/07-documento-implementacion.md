# 07 · Documento de implementación — Parte diario de obra + checklist SST

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `obra` con `supabase db push`; exponer `obra` en Settings → API.
2. Vercel `parte-obra-sst-api` (Root: `06-parte-obra-sst/backend`) y `parte-obra-sst-web` (Root: `06-parte-obra-sst/frontend`).
3. Dominios: `api-parte-obra-sst.novatechconsulting.com.pe` y `parte-obra-sst.novatechconsulting.com.pe`.
4. App: EAS Build (APK para piloto, tiendas para producción).


## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
