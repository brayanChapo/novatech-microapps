# 05 · Levantamiento local — Parte diario de obra + checklist SST

Mientras esté en estado *especificada*, no hay código que levantar. Al construirla, el procedimiento es **idéntico** al de la app de referencia: [`03-asistencia-rrhh/docs/05-levantamiento-local.md`](../../03-asistencia-rrhh/docs/05-levantamiento-local.md).

Resumen:

```bash
cd microapps
node scripts/db-sync.mjs && supabase start && supabase db reset && supabase test db
cd 06-parte-obra-sst/backend  && cp .env.example .env       && npm install && npm test && npm run dev   # puerto 4006
cd 06-parte-obra-sst/frontend && cp .env.example .env.local && npm install && npm run dev               # puerto 3006
cd 06-parte-obra-sst/mobile && cp .env.example .env && npm install && npx expo start
```

**Puertos reservados para esta app:** API `4006`, web `3006` (así puedes correr varias micro apps a la vez).

Variables adicionales previstas: `RESEND_API_KEY`.
