# 07 · Documento de implementación — Rendición de gastos con foto de comprobante

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `gastos` con `supabase db push`; exponer `gastos` en Settings → API.
2. Vercel `rendicion-gastos-api` (Root: `11-rendicion-gastos/backend`) y `rendicion-gastos-web` (Root: `11-rendicion-gastos/frontend`).
3. Dominios: `api-rendicion-gastos.novatechconsulting.com.pe` y `rendicion-gastos.novatechconsulting.com.pe`.
4. Verificar instalación como PWA en Android y iPhone.


## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
