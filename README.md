# Micro apps NovaTech

Monorepo con las 15 micro apps del portafolio de **NovaTech Consulting**. Todas comparten arquitectura (Vercel + Supabase), convenciones y módulos.

👉 **Empieza por [GUIA-DESARROLLO.md](GUIA-DESARROLLO.md).**

## Estado

| # | Micro app | Nicho | Ola | Móvil | Estado | Implementación · plan Estándar |
|---|---|---|---|---|---|---|
| 00 | [Consola NovaTech (panel interno)](00-consola-novatech/) | Uso interno de NovaTech | — | — | 📝 Especificada (usar el Excel mientras tanto) | — |
| 01 | [Agenda de citas + recordatorios WhatsApp](01-agenda-citas/) | Salud privada (adaptable a barberías, spas, talleres) | 1 | PWA | 📝 Especificada | S/ 3,500 · S/ 300/mes |
| 02 | [Toma de pedidos en ruta + cobranzas](02-pedidos-cobranzas/) | Distribuidoras y mayoristas | 1 | Expo | 📝 Especificada | S/ 5,500 · S/ 400/mes |
| 03 | [Asistencia: marcación con geocerca + dashboard por local](03-asistencia-rrhh/) | Corporativo / RR.HH. | 1 | Expo | ✅ Implementada | S/ 5,000 · S/ 400/mes |
| 04 | [Control de pensiones y cuotas](04-pensiones-cuotas/) | Educación privada, condominios | 2 | PWA | 📝 Especificada | S/ 2,500 · S/ 300/mes |
| 05 | [Orden de trabajo con estado por WhatsApp](05-ordenes-taller/) | Talleres mecánicos | 2 | PWA | 📝 Especificada | S/ 2,500 · S/ 300/mes |
| 06 | [Parte diario de obra + checklist SST](06-parte-obra-sst/) | Construcción | 2 | Expo | 📝 Especificada | S/ 3,000 · S/ 200/mes |
| 07 | [Vencimientos SUNAT + portal de documentos](07-vencimientos-sunat/) | Contadores y estudios | 2 | PWA | 📝 Especificada | S/ 2,800 · S/ 200/mes |
| 08 | [Prueba de entrega (foto, firma, GPS)](08-prueba-entrega/) | Distribuidoras, courier | 2 | Expo | 📝 Especificada | S/ 1,800 · S/ 200/mes |
| 09 | [Asistencia por QR con aviso a padres](09-asistencia-escolar-qr/) | Educación privada | 3 | Expo | 📝 Especificada | S/ 2,000 · S/ 300/mes |
| 10 | [Membresías con acceso por QR](10-membresias-gimnasio/) | Gimnasios | 3 | PWA | 📝 Especificada | S/ 2,500 · S/ 300/mes |
| 11 | [Rendición de gastos con foto de comprobante](11-rendicion-gastos/) | Corporativo | 3 | PWA | 📝 Especificada | S/ 1,800 · S/ 200/mes |
| 12 | [Mesa de ayuda interna (tickets)](12-mesa-ayuda/) | Corporativo | 3 | PWA | 📝 Especificada | S/ 2,000 · S/ 200/mes |
| 13 | [Cotizador con PDF](13-cotizador-pdf/) | Construcción, servicios | 3 | PWA | 📝 Especificada | S/ 1,500 · S/ 200/mes |
| 14 | [Historia clínica simple](14-historia-clinica/) | Salud privada | 3 | PWA | 📝 Especificada | S/ 4,500 · S/ 450/mes |
| 15 | [Registro de visitas en portería con QR](15-porteria-visitas/) | Condominios, empresas | 3 | PWA | 📝 Especificada | S/ 1,800 · S/ 200/mes |

Precios sin IGV, según el portafolio aprobado.

## Referencia

- **App modelo:** [03 · Asistencia](03-asistencia-rrhh/) — código completo, pruebas y documentación.
- **Plataforma compartida:** [plataforma/](plataforma/) — esquema `core`, módulos y convenciones de base de datos.
- **Scripts:** `npm run db:sync` · `npm run db:reset` · `npm run db:test` · `node scripts/nueva-app.mjs <carpeta>` (esqueleto de una app nueva).
