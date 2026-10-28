# 07 · Documento de implementación — Asistencia

Cubre (A) la **puesta en producción de la plataforma** (una sola vez) y (B) el **alta de cada cliente nuevo** (cada venta).

---

## A. Puesta en producción (una sola vez)

### A1. Base de datos — Supabase `produccion-compartida`

1. En la organización Supabase de NovaTech (plan Pro), usar el proyecto **produccion-compartida**. Región: `sa-east-1` (São Paulo), la más cercana a Lima.
2. **Settings → API → Exposed schemas:** agregar `core` y `asistencia`.
3. Vincular y aplicar migraciones desde la raíz del monorepo:

```bash
supabase login
supabase link --project-ref <ref-produccion>
node scripts/db-sync.mjs
supabase db push            # aplica SOLO migraciones (no ejecuta seed.sql)
```

4. **Authentication → Providers → Email:** habilitado. **Allow new users to sign up: OFF**.
5. **Authentication → URL configuration:** Site URL `https://asistencia.novatechconsulting.com.pe`.
6. **Database → Replication:** confirmar que `asistencia.marcaciones` está en `supabase_realtime`.
7. **Backups:** verificar copias diarias (incluidas en Pro).

> ❌ Nunca ejecutar `seed.sql` ni `npm run seed:demo` en producción.

### A2. API — Vercel `asistencia-api`

| Configuración | Valor |
|---|---|
| Repositorio | `novatech-consulting/microapps` |
| Root Directory | `03-asistencia-rrhh/backend` |
| Framework preset | Other |
| Node.js | 22.x |
| Variables | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (marcar como *Sensitive*), `CORS_ORIGINS=https://asistencia.novatechconsulting.com.pe` |
| Dominio | `api-asistencia.novatechconsulting.com.pe` |

DNS en Cloudflare: `CNAME api-asistencia → cname.vercel-dns.com` (proxy desactivado / nube gris).

Verificación: `curl https://api-asistencia.novatechconsulting.com.pe/salud` → `{"ok":true,...}`.

### A3. Dashboard — Vercel `asistencia-web`

| Configuración | Valor |
|---|---|
| Root Directory | `03-asistencia-rrhh/frontend` |
| Framework | Next.js |
| Variables | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL=https://api-asistencia.novatechconsulting.com.pe` |
| Dominio | `asistencia.novatechconsulting.com.pe` |

### A4. App móvil — Expo EAS

```bash
cd 03-asistencia-rrhh/mobile
npm i -g eas-cli && eas login
eas init                                   # crea el projectId en la cuenta Expo de NovaTech
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value https://<ref>.supabase.co
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <anon>
eas secret:create --name EXPO_PUBLIC_API_URL --value https://api-asistencia.novatechconsulting.com.pe
eas build -p android --profile preview      # APK para pilotos (instalación directa)
eas build -p android --profile production   # AAB para Google Play
eas build -p ios --profile production       # requiere cuenta Apple Developer (US$99/año)
```

> El comando exacto de secretos/variables puede variar según la versión de `eas-cli`; revisar `eas env --help` si `secret:create` no existe.

**Distribución recomendada:**

| Etapa | Android | iPhone |
|---|---|---|
| Piloto (1–2 clientes) | APK directo (enlace de EAS) | TestFlight |
| Producción | Google Play (cuenta única US$25) | App Store |

**Ficha de tienda (Play / App Store):** declarar uso de ubicación "solo mientras se usa la app" con finalidad "verificar asistencia en el local de trabajo". Publicar política de privacidad en `novatechconsulting.com.pe/privacidad-asistencia`.

### A5. Monitoreo

- Monitor de disponibilidad gratuito (p. ej. UptimeRobot) a `/salud` cada 5 min con aviso por correo.
- Revisar **Vercel → Logs** filtrando `[error no controlado]` semanalmente.
- Supabase → Reports: uso de base de datos y Realtime al mes.

---

## B. Alta de un cliente nuevo (cada venta)

Tiempo estimado: **1 día hábil** + capacitación.

### B1. Antes (comercial)

- [ ] Contrato y ficha de alcance firmados; 50 % pagado.
- [ ] Acuerdo de tratamiento de datos (ver doc 09) firmado.
- [ ] Recibir del cliente: lista de locales (nombre, dirección, ubicación en Google Maps), horarios y lista de colaboradores (nombre, DNI, correo, local, horario), y quién será administrador.

Plantilla de carga: `locales.csv` (`nombre;direccion;lat;lng;radio_m`) y `colaboradores.csv` (`nombre;documento;correo;rol;local;horario`).

### B2. Crear la empresa (NovaTech)

En Supabase → SQL Editor (producción):

```sql
insert into core.empresas (nombre, ruc) values ('Cliente S.A.C.', '20123456789') returning id;
insert into asistencia.configuracion (empresa_id) values ('<id>');   -- reglas por defecto
```

Crear el **primer administrador** del cliente con la API (o Studio → Authentication → Add user) y su perfil:

```sql
-- después de crear el usuario en Authentication (copiar su UUID)
insert into core.perfiles (id, empresa_id, nombre, rol) values ('<uuid-usuario>', '<id-empresa>', 'Nombre Admin', 'admin');
```

### B3. Configurar (con el admin del cliente, en el dashboard)

1. **Locales:** crear cada local. Recomendación de radio: 80–150 m en ciudad; 200–300 m en almacenes o zonas industriales.
2. **Horarios:** crear los turnos.
3. **Colaboradores:** crear usuarios con contraseña temporal y asignar local + horario.
4. **Supervisores:** asignar sus locales.

### B4. Validación en sitio

- [ ] Visitar al menos 1 local: confirmar el punto y el radio caminando hasta el borde.
- [ ] 2 colaboradores marcan con éxito (Android y iPhone).
- [ ] El admin ve las marcaciones en vivo.
- [ ] Ejecutar los casos P-10 a P-18 de [06-pruebas.md](06-pruebas.md).

### B5. Capacitación (1 hora)

- 15 min colaboradores: instalar app, iniciar sesión, marcar, historial.
- 30 min admin/supervisores: dashboard, detalle por local, administración, reportes.
- 15 min preguntas. Entregar el [manual de usuario](08-manual-usuario.md) en PDF.

### B6. Salida a producción

- [ ] Acta de conformidad firmada → cobrar 50 % restante.
- [ ] 2 semanas de acompañamiento cercano (revisión diaria del dashboard y de errores en logs).
- [ ] Pasar al plan mensual contratado.

## C. Reversión (rollback)

| Componente | Cómo revertir |
|---|---|
| API / Dashboard | Vercel → Deployments → versión anterior → *Promote to Production* (segundos) |
| Base de datos | Las migraciones solo agregan; para revertir, crear una migración nueva que deshaga. En emergencia, restaurar backup diario (pérdida ≤ 24 h). |
| App | Publicar la versión anterior con EAS Update o nuevo build. |

## D. Checklist de versión

- [ ] CI en verde (tests + typecheck + build).
- [ ] Migraciones probadas con `supabase db reset` en local.
- [ ] `supabase test db` en verde.
- [ ] Integración manual P-01 a P-23 (al menos las afectadas por el cambio).
- [ ] Changelog actualizado en el PR.
