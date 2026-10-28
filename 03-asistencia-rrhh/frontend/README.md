# Frontend · Dashboard de Asistencia

Panel web (Next.js 16 + Tailwind 4 + Leaflet) para **administradores** y **supervisores**.

```bash
cp .env.example .env.local   # URL/anon key de Supabase y URL de la API
npm install
npm run dev                  # http://localhost:3000
npm test && npm run build
```

| Ruta | Qué muestra | Rol |
|---|---|---|
| `/dashboard` | KPIs, tabla y mapa por local, feed en vivo | admin, supervisor |
| `/dashboard/[localId]` | Personas del local: horario, entrada, salida, situación, filtros | admin, supervisor |
| `/locales` | Crear/editar locales y geocercas en el mapa | admin |
| `/colaboradores` | Usuarios, asignaciones, horarios, supervisores | admin |
| `/reportes` | Exportar CSV | admin, supervisor |

- **Datos:** siempre a través de la API (`lib/api.ts`), nunca escribiendo directo en Supabase.
- **Tiempo real:** `components/useTiempoReal.ts` escucha `INSERT` en `asistencia.marcaciones` vía Supabase Realtime (RLS filtra por empresa/local) y refresca con antirrebote; respaldo cada 60 s.
- **Mapa:** Leaflet + OpenStreetMap, cargado solo en el navegador (`components/Mapa.tsx`).
