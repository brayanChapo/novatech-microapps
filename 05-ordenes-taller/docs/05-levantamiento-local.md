# 05 · Levantamiento local — Orden de trabajo con estado por WhatsApp

Mientras esté en estado *especificada*, no hay código que levantar. Al construirla, el procedimiento es **idéntico** al de la app de referencia: [`03-asistencia-rrhh/docs/05-levantamiento-local.md`](../../03-asistencia-rrhh/docs/05-levantamiento-local.md).

Resumen:

```bash
cd microapps
node scripts/db-sync.mjs && supabase start && supabase db reset && supabase test db
cd 05-ordenes-taller/backend  && cp .env.example .env       && npm install && npm test && npm run dev   # puerto 4005
cd 05-ordenes-taller/frontend && cp .env.example .env.local && npm install && npm run dev               # puerto 3005

```

**Puertos reservados para esta app:** API `4005`, web `3005` (así puedes correr varias micro apps a la vez).

Variables adicionales previstas: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`.
