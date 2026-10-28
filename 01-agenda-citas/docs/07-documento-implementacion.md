# 07 · Documento de implementación — Agenda de citas + recordatorios WhatsApp

Sigue el mismo procedimiento que la app de referencia: [03 · implementación](../../03-asistencia-rrhh/docs/07-documento-implementacion.md).

## Producción (una vez)

1. Migración del esquema `agenda` con `supabase db push`; exponer `agenda` en Settings → API.
2. Vercel `agenda-citas-api` (Root: `01-agenda-citas/backend`) y `agenda-citas-web` (Root: `01-agenda-citas/frontend`).
3. Dominios: `api-agenda-citas.novatechconsulting.com.pe` y `agenda-citas.novatechconsulting.com.pe`.
4. Verificar instalación como PWA en Android y iPhone.
5. WhatsApp: número del cliente verificado en Meta y plantillas aprobadas **antes** de la salida a producción (1–2 días).

## Alta de cliente

- [ ] Contrato, ficha de alcance y acuerdo de datos firmados; 50 % pagado.
- [ ] Crear empresa en `core.empresas` y primer administrador.
- [ ] Cargar datos iniciales (CSV) con el cliente.
- [ ] Prueba en sitio con 2 usuarios reales.
- [ ] Capacitación de 1 hora + entrega del manual.
- [ ] Acta de conformidad → 50 % restante → plan mensual.
