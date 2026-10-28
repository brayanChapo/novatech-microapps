# 07 · Documento de implementación — Control de pensiones y cuotas

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `pensiones` con `supabase db push`; exponer `pensiones` en Settings → API.
2. Vercel `pensiones-cuotas-api` (Root: `04-pensiones-cuotas/backend`) y `pensiones-cuotas-web` (Root: `04-pensiones-cuotas/frontend`).
3. Dominios: `api-pensiones-cuotas.novatechconsulting.com.pe` y `pensiones-cuotas.novatechconsulting.com.pe`.
4. Verificar instalación como PWA en Android y iPhone.
5. WhatsApp: número del cliente verificado en Meta y plantillas aprobadas **antes** de la salida a producción (1–2 días).

## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
