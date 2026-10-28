# Guía para el área de desarrollo — Micro apps NovaTech

> **Emitido por:** Gerencia de Proyectos · **Fecha:** 8 de octubre de 2026 · **Versión:** 1.0
> **Para:** todo el que programe, pruebe o despliegue una micro app de NovaTech.
> **Lectura obligatoria** antes del primer commit.

---

## 0. Resumen en 10 líneas

1. Todo vive en **un solo repositorio**: `novatech-consulting/microapps` (esta carpeta).
2. Hay **15 micro apps**, una carpeta cada una (`01-…` a `15-…`), con `backend/`, `frontend/`, `mobile/`, `database/` y `docs/`.
3. **La 03 (Asistencia) está construida y probada**: es la prioridad actual y el **patrón de referencia** para todas las demás.
4. Las otras 14 están **especificadas** (requerimientos, modelo de datos en borrador, pruebas, manual). Se construyen **bajo demanda**.
5. **Una sola cuenta de empresa** en GitHub, Vercel y Supabase. **Un solo proyecto Supabase compartido**; cada app tiene su esquema.
6. **Toda tabla tiene `empresa_id` y RLS.** Toda consulta del backend filtra por `empresa_id`. Sin excepción.
7. **Solo el backend escribe** en la base de datos (con `service_role`). Web y móvil leen/escriben a través de la API.
8. Lógica de negocio en `src/domain` y `src/services`, **con pruebas**. Las rutas solo validan y delegan.
9. Nada se fusiona a `main` sin **CI en verde** y **revisión** de otra persona.
10. Textos para el usuario **en español claro**; códigos de error en mayúsculas (`FUERA_DE_GEOCERCA`).

---

## 1. Prioridad actual: Asistencia (app 03)

Por decisión de Dirección, la **primera micro app es la 03 · Asistencia** (marcación por celular con geocerca por local + dashboard general y por local en tiempo real). El código de la Fase 1 ya está en [`03-asistencia-rrhh/`](03-asistencia-rrhh/).

### Lo que ya está hecho

| Capa | Estado | Pruebas |
|---|---|---|
| Base de datos (esquemas `core` + `asistencia`, RLS, funciones de dashboard, Realtime) | ✅ | 8 pgTAP en verde |
| Backend (API Hono: marcación, dashboard, locales, horarios, colaboradores, reportes CSV) | ✅ | 49 Vitest en verde |
| Frontend (login, dashboard general, detalle por local, mapa, tiempo real, administración, reportes) | ✅ build OK | 4 Vitest en verde |
| Móvil (Expo: login, GPS en vivo, distancia al local, marcar, historial) | ✅ typecheck + bundle Android OK | 3 node:test en verde |
| Documentación (requerimientos, arquitectura, modelo, API, levantamiento, pruebas, implementación, manual, privacidad) | ✅ | — |

### Lo que falta para el primer cliente (backlog priorizado)

| # | Tarea | Responsable sugerido | Estimado |
|---|---|---|---|
| A-1 | Levantar todo en local siguiendo [05-levantamiento-local](03-asistencia-rrhh/docs/05-levantamiento-local.md) y reportar cualquier paso que falle | Desarrollo | 4 h |
| A-2 | Probar con **celular físico** Android y iPhone (casos P-01 a P-23 de [06-pruebas](03-asistencia-rrhh/docs/06-pruebas.md)) | Desarrollo + PM | 6 h |
| A-3 | Configurar ESLint + Prettier en backend, frontend y móvil; agregar `npm run lint` al CI | Desarrollo | 3 h |
| A-4 | Crear cuenta Expo de NovaTech, `eas init`, build **preview (APK)** | Desarrollo | 3 h |
| A-5 | Desplegar entorno **demo** (Vercel + Supabase) con datos de demostración para ventas | Desarrollo | 4 h |
| A-6 | Video demo de 2 minutos (marcar desde el celular → dashboard en vivo) | PM | 2 h |
| A-7 | Política de privacidad pública + texto para el reglamento del cliente (revisión legal) | Dirección | — |
| A-8 | Prueba de carga (300 marcaciones en 5 min) contra demo | Desarrollo | 3 h |
| A-9 | Proveedor de teselas de mapa si el uso supera la política de OpenStreetMap | Desarrollo | 2 h |
| A-10 | Fase 2: vacaciones/permisos y cola sin conexión (solo con cliente que lo pida) | — | 40 h |

---

## 2. Cuentas y accesos (una sola por servicio)

| Servicio | Cuenta | Plan | Quién es dueño |
|---|---|---|---|
| GitHub | Organización `novatech-consulting` | Gratis | Alfredo y Diego (2 dueños) |
| Vercel | Equipo `novatech` | Pro (US$20/mes por asiento que despliega) — al firmar el primer cliente | Alfredo y Diego |
| Supabase | Organización `NovaTech` · proyecto `produccion-compartida` (+ org gratuita `NovaTech Dev` para demo/pruebas) | Pro (US$25/mes) al primer cliente | Alfredo y Diego |
| Expo | Cuenta `novatech` | Gratis (EAS con cuota gratuita) | Alfredo |
| Meta (WhatsApp) | Business Manager de NovaTech | Pago por mensaje | Alfredo |

Reglas:

- Registrar todo con correo **@novatechconsulting.com.pe**, nunca personal.
- **Verificación en dos pasos** obligatoria.
- **Proyecto Supabase adicional = ≈US$10/mes.** Solo se crea uno dedicado para clientes en plan Pro o datos sensibles (app 14). Nunca uno por app.
- Las llaves (`service_role`, tokens de WhatsApp) solo en variables de entorno de Vercel/EAS marcadas como *Sensitive*. **Jamás en Git**.

---

## 3. Estructura del repositorio

```
microapps/
├── GUIA-DESARROLLO.md          ← este documento
├── README.md                   ← índice de micro apps y estado
├── package.json                ← scripts db:sync / db:reset / db:test
├── .github/workflows/ci.yml    ← pruebas en cada PR
├── scripts/db-sync.mjs         ← junta migraciones/pruebas/semillas de todas las apps en supabase/
├── scripts/nueva-app.mjs       ← crea el esqueleto de código de una app especificada
├── supabase/config.toml        ← configuración local del proyecto compartido
├── plataforma/                 ← esquema core + módulos y convenciones compartidas
├── 00-consola-novatech/        ← panel interno de NovaTech (especificado)
├── 01-agenda-citas/            ← especificada
├── 02-pedidos-cobranzas/       ← especificada
├── 03-asistencia-rrhh/         ← ✅ IMPLEMENTADA (referencia)
│   ├── backend/  frontend/  mobile/  database/  docs/
├── 04-pensiones-cuotas/ … 15-porteria-visitas/   ← especificadas
```

Cada micro app tiene la misma forma:

| Carpeta | Contiene |
|---|---|
| `backend/` | API Hono (TypeScript) |
| `frontend/` | Web Next.js (dashboard / administración / PWA) |
| `mobile/` | App Expo **o** README que explica por qué es PWA |
| `database/` | `migrations/` (se aplican), `borrador/` (no se aplican), `seed.sql`, `tests/` pgTAP |
| `docs/` | 01 requerimientos · 02 arquitectura · 03 modelo de datos · 04 API · 05 levantamiento local · 06 pruebas · 07 implementación · 08 manual de usuario · 09 seguridad (si aplica) |

---

## 4. Stack y versiones

| Capa | Tecnología | Versión probada |
|---|---|---|
| Runtime | Node.js | 22 LTS (mínimo 20) |
| API | Hono + @hono/node-server + Zod | Hono 4.x, Zod 4.x |
| Datos | Supabase (PostgreSQL + Auth + Realtime + Storage) | Postgres 17 |
| Web | Next.js (App Router) + React + Tailwind CSS + Leaflet | Next 16, React 19, Tailwind 4 |
| Móvil | Expo (React Native) + expo-location | SDK 57 |
| Pruebas | Vitest (backend/web), node:test (móvil), pgTAP (BD) | Vitest 5 |
| Lenguaje | TypeScript estricto | — |
| Hosting | Vercel (API y web), EAS (móvil) | — |

**No agregar dependencias** sin justificarlo en el PR (tamaño, mantenimiento, licencia, costo).

---

## 5. Reglas de arquitectura (no negociables)

| # | Regla | Por qué |
|---|---|---|
| R1 | **Multi-cliente:** toda tabla con `empresa_id` + RLS; todo query del backend con `.eq('empresa_id', usuario.empresa_id)` | El backend usa `service_role`, que **omite RLS**. Un filtro olvidado = fuga de datos entre clientes |
| R2 | Web y móvil **no escriben** en Supabase; solo la API | Las reglas de negocio no se pueden saltar desde un cliente manipulado |
| R3 | La **hora oficial** la pone el servidor (UTC) y se convierte con la zona de la empresa (`America/Lima`) | El celular puede tener otra hora |
| R4 | Validar **todas** las entradas con Zod en el backend | Seguridad y mensajes claros |
| R5 | Errores con formato `{ error: { codigo, mensaje, detalle } }`, mensaje en español para el usuario final | Consistencia entre apps |
| R6 | Lógica de negocio en funciones puras (`domain/`) y casos de uso con repositorio inyectable (`services/`) | Se prueba sin base de datos |
| R7 | **Un esquema por app** en el proyecto Supabase compartido | Costo y orden |
| R8 | Ubicación del usuario **solo cuando realiza la acción** (no en segundo plano) | Privacidad, Ley 29733, aprobación en tiendas |
| R9 | WhatsApp solo para **excepciones** (faltas, vencimientos, cambios de estado); lo demás por correo o push | Cada mensaje cuesta |
| R10 | Mapas con OpenStreetMap/Leaflet; nada de servicios de pago sin aprobación | Costos |
| R11 | Cada micro app expone `<esquema>.uso_diario(fecha)` con **solo conteos por empresa** (usuarios activos, métrica principal, mensajes WhatsApp) | Alimenta la [Consola NovaTech](00-consola-novatech/) sin exponer datos personales |

---

## 6. Entornos

| Entorno | Supabase | API / Web | Datos |
|---|---|---|---|
| **Local** | `supabase start` (Docker) | `localhost:40NN` / `localhost:30NN` (NN = número de app) | Semillas demo |
| **Demo** (ventas) | Org gratuita `NovaTech Dev` | Vercel, rama `demo` | Datos ficticios marcados como demo |
| **Producción** | `produccion-compartida` | Vercel, rama `main` | Clientes reales |

Variables: cada carpeta tiene `.env.example`. Copiar a `.env` / `.env.local`. **Nunca** subir `.env`.

---

## 7. Flujo de trabajo con Git

1. Crear rama desde `main`: `feat/03-reporte-mensual`, `fix/03-hora-tardanza`, `docs/01-manual`.
2. Commits pequeños con mensaje convencional en español:
   - `feat(asistencia): exportar CSV por local`
   - `fix(asistencia): tolerancia se comparaba en UTC`
   - `docs(agenda): completar manual de usuario`
3. Abrir **Pull Request** con: qué cambia, cómo probarlo, capturas si es visual, y si hay migración.
4. **CI en verde** (typecheck, pruebas, build, pgTAP) + **1 aprobación**.
5. *Squash and merge* a `main` → Vercel despliega automáticamente.
6. Cambios de base de datos en producción: `supabase db push` lo ejecuta **solo** el líder técnico después del merge.

---

## 8. Cómo construir una micro app especificada (01, 02, 04…15)

1. **Validar alcance** con el cliente usando `docs/01-requerimientos.md` (marcar los checks del final). Firmar ficha.
2. **Copiar el esqueleto** de la 03 con el script (funciona en Windows, macOS y Linux):
   ```bash
   node scripts/nueva-app.mjs 01-agenda-citas
   ```
   Copia `backend/` y `frontend/` (y `mobile/` si la app usa Expo) **sin** `node_modules`, builds, `.env` ni la lógica propia de asistencia, y conserva lo reutilizable: `lib/`, `middleware/`, `app.ts`, `config.ts`, `components/ui.tsx`, `KpiCard`, `lib/api.ts`, `lib/sesion.tsx`. No sobrescribe los README ni la documentación de la app. Después: cambiar puertos (`40NN`, `30NN`), el menú en `frontend/app/(panel)/layout.tsx` y, en móvil, nombre/paquete/permisos en `app.json`.
3. **Base de datos:** revisar `database/borrador/*.sql`, completar RLS por rol, mover a `database/migrations/`, escribir `database/tests/rls_<esquema>.test.sql`, agregar el esquema a `supabase/config.toml` → `[api] schemas`.
4. **Dominio primero:** escribir las funciones puras y sus pruebas (lista en `docs/06-pruebas.md`).
5. **Servicios y rutas** siguiendo `docs/` → `backend/README.md` (endpoints previstos).
6. **Frontend** con las pantallas de `frontend/README.md`.
7. **Móvil** solo si `mobile/README.md` dice "Expo".
8. **Actualizar documentación:** cambiar estado en `README.md` de la app a ✅, completar `04-api.md`, manual con capturas.
9. **Definición de terminado** (sección 10).

---

## 9. Cómo levantar todo en local (resumen)

```bash
git clone git@github.com:novatech-consulting/microapps.git && cd microapps
npm run db:reset                      # sincroniza migraciones + supabase db reset (requiere supabase start)
npm run db:test                       # pruebas pgTAP
cd 03-asistencia-rrhh/backend && cp .env.example .env && npm install && npm test && npm run seed:demo && npm run dev
```

Guía detallada con problemas frecuentes: [03-asistencia-rrhh/docs/05-levantamiento-local.md](03-asistencia-rrhh/docs/05-levantamiento-local.md).

---

## 10. Definición de terminado (DoD)

Una funcionalidad está terminada solo si:

- [ ] Cumple los criterios de aceptación del requerimiento.
- [ ] Tiene pruebas unitarias de su lógica (cobertura ≥ 80 % en `domain/` y `services/`).
- [ ] Si toca BD: migración + prueba pgTAP de aislamiento.
- [ ] `npm run typecheck`, `npm test` y `npm run build` en verde (CI).
- [ ] Funciona en celular (360 px) y escritorio; probado en Android **y** iPhone si es móvil.
- [ ] Mensajes de error en español y entendibles para un usuario no técnico.
- [ ] Documentación actualizada (`docs/`).
- [ ] Revisada y aprobada por otra persona.

---

## 11. Checklist de seguridad en cada PR

- [ ] ¿Toda consulta con `service_role` filtra por `empresa_id`?
- [ ] ¿Las rutas nuevas tienen `requiereRol(...)` correcto?
- [ ] ¿Se valida la entrada con Zod?
- [ ] ¿No se expone `service_role` ni otra llave al frontend/móvil?
- [ ] ¿Las nuevas tablas tienen RLS y prueba pgTAP?
- [ ] ¿No se registran datos personales en logs (`console.log` con DNI, teléfonos, coordenadas)?
- [ ] ¿Los archivos subidos van a Storage **privado** con URL firmada?

---

## 12. Despliegue

| Qué | Cómo |
|---|---|
| API y web | Automático en Vercel al fusionar a `main` (un proyecto Vercel por app y capa; *Root Directory* = carpeta de la app) |
| Base de datos | `node scripts/db-sync.mjs && supabase db push` (líder técnico) |
| Móvil | `eas build` (preview → APK interno; production → tiendas) |
| Reversión | Vercel → *Promote* versión anterior; BD → migración correctiva |

Detalle: [03-asistencia-rrhh/docs/07-documento-implementacion.md](03-asistencia-rrhh/docs/07-documento-implementacion.md).

---

## 13. Convenciones de código

- **Idioma:** dominio de negocio en español (`registrarMarcacion`, `localesPermitidos`); términos técnicos en inglés cuando son estándar (`middleware`, `hook`).
- **TypeScript estricto**; prohibido `any` salvo con comentario justificando.
- Funciones pequeñas; un archivo por responsabilidad.
- Fechas: guardar en UTC (`timestamptz`), mostrar en `America/Lima`.
- Dinero: `numeric(12,2)` en BD; en TS, redondear a 2 decimales solo al mostrar.
- Comentarios: explicar el **por qué**, no el qué.

---

## 14. Seguimiento y reporte

- **Reunión semanal (lunes, 30 min):** avance, bloqueos, siguientes tareas.
- **Registro de horas** por app y tarea (para medir el costo real frente a la estimación del portafolio).
- Bloqueos que duren más de 1 día → avisar al Gerente de Proyectos el mismo día.

---

## 15. Contactos

| Rol | Persona | Para |
|---|---|---|
| Director / líder técnico | Alfredo Chapoñan | Arquitectura, accesos, despliegue a producción |
| Subdirector | Diego Chapoñan | Contratos, soporte a clientes |
| Gerente de Proyectos | Pablo Velásquez | Prioridades, alcance, cronograma, pruebas de aceptación |
