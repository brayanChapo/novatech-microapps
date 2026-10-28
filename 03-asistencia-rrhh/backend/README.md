# Backend · API de Asistencia

API REST en **Hono** (TypeScript) que valida y registra marcaciones, alimenta el dashboard y administra locales, horarios y usuarios.

```bash
cp .env.example .env     # completar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
npm install
npm test                 # 49 pruebas
npm run dev              # http://localhost:4000
npm run seed:demo        # usuarios demo (solo local)
```

| Carpeta | Contenido |
|---|---|
| `src/domain/` | Lógica pura y probada: geocerca (Haversine), zona horaria, reglas de estado |
| `src/services/` | Casos de uso (`registrarMarcacion`, `estadoDelDia`) independientes de la BD |
| `src/repos/` | Puerto `MarcacionRepo` + implementación Supabase |
| `src/routes/` | Endpoints HTTP |
| `src/middleware/auth.ts` | JWT de Supabase → perfil (empresa y rol) |
| `src/lib/` | Validación Zod, errores, CSV, permisos, cliente Supabase |
| `api/index.ts` | Entrada para Vercel |
| `tests/` | Vitest |

**Reglas para modificar:** la lógica de negocio va en `domain/` o `services/` con su prueba; las rutas solo validan, llaman al servicio y responden. Toda consulta con `service_role` **debe** filtrar por `usuario.empresa_id`.

Documentación: [API](../docs/04-api.md) · [Arquitectura](../docs/02-arquitectura.md) · [Pruebas](../docs/06-pruebas.md)
