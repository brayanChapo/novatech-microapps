# 03 · Modelo de datos (borrador) — Registro de visitas en portería con QR

Esquema `porteria`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008001500_porteria.sql`](../database/borrador/20261008001500_porteria.sql).

```mermaid
erDiagram
    PERFILES ||--o{ RESIDENTES : perfil_id
    UNIDADES ||--o{ RESIDENTES : unidad_id
    UNIDADES ||--o{ VISITAS : unidad_id
    PERFILES ||--o{ VISITAS : portero_id
    PERFILES ||--o{ SUSCRIPCIONES_PUSH : perfil_id
    UNIDADES {
        uuid id PK
        uuid empresa_id FK
        text codigo
        text torre
    }
    RESIDENTES {
        uuid id PK
        uuid empresa_id FK
        uuid perfil_id FK
        uuid unidad_id FK
        text nombre
        varchar telefono
    }
    VISITAS {
        uuid id PK
        uuid empresa_id FK
        uuid unidad_id FK
        text visitante
        varchar documento
        date fecha
        text token_qr
        text estado
        timestamptz ingreso_en
        timestamptz salida_en
        uuid portero_id FK
    }
    SUSCRIPCIONES_PUSH {
        uuid id PK
        uuid empresa_id FK
        uuid perfil_id FK
        text endpoint
        jsonb claves
    }
    PERFILES {
        uuid id PK
        text rol
    }
```

## Pendiente al construir

- Políticas RLS por rol (el borrador solo filtra por empresa).
- Índices para las consultas de reportes.
- Restricciones `unique` de negocio (p. ej. numeración por empresa).
