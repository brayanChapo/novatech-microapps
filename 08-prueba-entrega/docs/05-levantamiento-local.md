# 05 · Levantamiento local — Prueba de entrega (foto, firma, GPS)

Mientras esté en estado *especificada*, no hay código que levantar. Al construirla, el procedimiento es **idéntico** al de la app de referencia: [`03-asistencia-rrhh/docs/05-levantamiento-local.md`](../../03-asistencia-rrhh/docs/05-levantamiento-local.md).

Resumen:

```bash
cd microapps
node scripts/db-sync.mjs && supabase start && supabase db reset && supabase test db
cd 08-prueba-entrega/backend  && cp .env.example .env       && npm install && npm test && npm run dev   # puerto 4008
cd 08-prueba-entrega/frontend && cp .env.example .env.local && npm install && npm run dev               # puerto 3008
cd 08-prueba-entrega/mobile && cp .env.example .env && npm install && npx expo start
```

**Puertos reservados para esta app:** API `4008`, web `3008` (así puedes correr varias micro apps a la vez).

Variables adicionales previstas: ninguna además de Supabase.
