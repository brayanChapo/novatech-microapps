# 05 · Levantamiento local — Cotizador con PDF

Mientras esté en estado *especificada*, no hay código que levantar. Al construirla, el procedimiento es **idéntico** al de la app de referencia: [`03-asistencia-rrhh/docs/05-levantamiento-local.md`](../../03-asistencia-rrhh/docs/05-levantamiento-local.md).

Resumen:

```bash
cd microapps
node scripts/db-sync.mjs && supabase start && supabase db reset && supabase test db
cd 13-cotizador-pdf/backend  && cp .env.example .env       && npm install && npm test && npm run dev   # puerto 4013
cd 13-cotizador-pdf/frontend && cp .env.example .env.local && npm install && npm run dev               # puerto 3013

```

**Puertos reservados para esta app:** API `4013`, web `3013` (así puedes correr varias micro apps a la vez).

Variables adicionales previstas: `RESEND_API_KEY`.
