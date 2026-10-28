# 05 · Levantamiento local — Agenda de citas + recordatorios WhatsApp

Mientras esté en estado *especificada*, no hay código que levantar. Al construirla, el procedimiento es **idéntico** al de la app de referencia: [`03-asistencia-rrhh/docs/05-levantamiento-local.md`](../../03-asistencia-rrhh/docs/05-levantamiento-local.md).

Resumen:

```bash
cd microapps
node scripts/db-sync.mjs && supabase start && supabase db reset && supabase test db
cd 01-agenda-citas/backend  && cp .env.example .env       && npm install && npm test && npm run dev   # puerto 4001
cd 01-agenda-citas/frontend && cp .env.example .env.local && npm install && npm run dev               # puerto 3001

```

**Puertos reservados para esta app:** API `4001`, web `3001` (así puedes correr varias micro apps a la vez).

Variables adicionales previstas: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `RESEND_API_KEY`.
