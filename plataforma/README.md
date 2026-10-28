# Plataforma compartida

Lo que **todas** las micro apps usan.

| Carpeta | Contenido |
|---|---|
| `database/migrations/20261008000000_core.sql` | Esquema `core`: empresas (clientes de NovaTech), perfiles (usuarios con empresa y rol) y funciones `core.empresa_actual()` / `core.rol_actual()` para RLS |
| [`docs/modulos-compartidos.md`](docs/modulos-compartidos.md) | Los 8 módulos reutilizables y dónde está su implementación de referencia |
| [`docs/convenciones-bd.md`](docs/convenciones-bd.md) | Reglas para escribir migraciones |

El esquema `core` se modifica **solo** con aprobación del líder técnico: un cambio aquí afecta a todas las apps.
