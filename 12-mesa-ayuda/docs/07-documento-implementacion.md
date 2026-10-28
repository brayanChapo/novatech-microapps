# 07 · Documento de implementación — Mesa de ayuda interna (tickets)

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `ayuda` con `supabase db push`; exponer `ayuda` en Settings → API.
2. Vercel `mesa-ayuda-api` (Root: `12-mesa-ayuda/backend`) y `mesa-ayuda-web` (Root: `12-mesa-ayuda/frontend`).
3. Dominios: `api-mesa-ayuda.novatechconsulting.com.pe` y `mesa-ayuda.novatechconsulting.com.pe`.
4. Verificar instalación como PWA en Android y iPhone.


## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
