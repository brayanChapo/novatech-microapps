# 03 · Modelo de datos (borrador) — Rendición de gastos con foto de comprobante

Esquema `gastos`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008001100_gastos.sql`](../database/borrador/20261008001100_gastos.sql).

```mermaid
erDiagram
    PERFILES ||--o{ RENDICIONES : colaborador_id
    PERFILES ||--o{ RENDICIONES : aprobador_id
    RENDICIONES ||--o{ GASTOS : rendicion_id
    PERFILES ||--o{ GASTOS : colaborador_id
    CATEGORIAS ||--o{ GASTOS : categoria_id
    CATEGORIAS {
        uuid id PK
        uuid empresa_id FK
        text nombre
        numeric tope_mensual
    }
    RENDICIONES {
        uuid id PK
        uuid empresa_id FK
        uuid colaborador_id FK
        text periodo
        text estado
        uuid aprobador_id FK
        text comentario
    }
    GASTOS {
        uuid id PK
        uuid empresa_id FK
        uuid rendicion_id FK
        uuid colaborador_id FK
        uuid categoria_id FK
        varchar ruc_emisor
        text serie_numero
        date fecha
        numeric monto
        text foto_url
        boolean excede_tope
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
