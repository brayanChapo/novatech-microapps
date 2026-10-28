# 07 · Documento de implementación — Cotizador con PDF

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `cotizador` con `supabase db push`; exponer `cotizador` en Settings → API.
2. Vercel `cotizador-pdf-api` (Root: `13-cotizador-pdf/backend`) y `cotizador-pdf-web` (Root: `13-cotizador-pdf/frontend`).
3. Dominios: `api-cotizador-pdf.novatechconsulting.com.pe` y `cotizador-pdf.novatechconsulting.com.pe`.
4. Verificar instalación como PWA en Android y iPhone.


## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
