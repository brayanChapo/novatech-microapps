# 05 · Levantamiento local — Toma de pedidos en ruta + cobranzas

Mientras esté en estado *especificada*, no hay código que levantar. Al construirla, el procedimiento es **idéntico** al de la app de referencia: [`03-asistencia-rrhh/docs/05-levantamiento-local.md`](../../03-asistencia-rrhh/docs/05-levantamiento-local.md).

Resumen:

```bash
cd microapps
node scripts/db-sync.mjs && supabase start && supabase db reset && supabase test db
cd 02-pedidos-cobranzas/backend  && cp .env.example .env       && npm install && npm test && npm run dev   # puerto 4002
cd 02-pedidos-cobranzas/frontend && cp .env.example .env.local && npm install && npm run dev               # puerto 3002
cd 02-pedidos-cobranzas/mobile && cp .env.example .env && npm install && npx expo start
```

**Puertos reservados para esta app:** API `4002`, web `3002` (así puedes correr varias micro apps a la vez).

Variables adicionales previstas: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`.
