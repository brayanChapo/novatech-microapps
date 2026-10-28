# 05 · Levantamiento local — Vencimientos SUNAT + portal de documentos

Mientras esté en estado *especificada*, no hay código que levantar. Al construirla, el procedimiento es **idéntico** al de la app de referencia: [`03-asistencia-rrhh/docs/05-levantamiento-local.md`](../../03-asistencia-rrhh/docs/05-levantamiento-local.md).

Resumen:

```bash
cd microapps
node scripts/db-sync.mjs && supabase start && supabase db reset && supabase test db
cd 07-vencimientos-sunat/backend  && cp .env.example .env       && npm install && npm test && npm run dev   # puerto 4007
cd 07-vencimientos-sunat/frontend && cp .env.example .env.local && npm install && npm run dev               # puerto 3007

```

**Puertos reservados para esta app:** API `4007`, web `3007` (así puedes correr varias micro apps a la vez).

Variables adicionales previstas: `RESEND_API_KEY`.
