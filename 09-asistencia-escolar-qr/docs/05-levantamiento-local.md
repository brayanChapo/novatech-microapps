# 05 · Levantamiento local — Asistencia por QR con aviso a padres

Mientras esté en estado *especificada*, no hay código que levantar. Al construirla, el procedimiento es **idéntico** al de la app de referencia: [`03-asistencia-rrhh/docs/05-levantamiento-local.md`](../../03-asistencia-rrhh/docs/05-levantamiento-local.md).

Resumen:

```bash
cd microapps
node scripts/db-sync.mjs && supabase start && supabase db reset && supabase test db
cd 09-asistencia-escolar-qr/backend  && cp .env.example .env       && npm install && npm test && npm run dev   # puerto 4009
cd 09-asistencia-escolar-qr/frontend && cp .env.example .env.local && npm install && npm run dev               # puerto 3009
cd 09-asistencia-escolar-qr/mobile && cp .env.example .env && npm install && npx expo start
```

**Puertos reservados para esta app:** API `4009`, web `3009` (así puedes correr varias micro apps a la vez).

Variables adicionales previstas: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`.
