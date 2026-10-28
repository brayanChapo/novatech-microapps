# 03 · Modelo de datos (borrador) — Cotizador con PDF

Esquema `cotizador`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008001300_cotizador.sql`](../database/borrador/20261008001300_cotizador.sql).

```mermaid
erDiagram
    PERFILES ||--o{ COTIZACIONES : vendedor_id
    COTIZACIONES ||--o{ COTIZACION_ITEMS : cotizacion_id
    ITEMS {
        uuid id PK
        uuid empresa_id FK
        text codigo
        text descripcion
        text unidad
        numeric precio
    }
    PLANTILLA {
        uuid id PK
        uuid empresa_id FK
        text logo_url
        text color
        text condiciones
        boolean afecto_igv
    }
    COTIZACIONES {
        uuid id PK
        uuid empresa_id FK
        integer numero
        integer version
        text cliente
        varchar cliente_documento
        integer validez_dias
        numeric descuento_pct
        numeric subtotal
        numeric igv
        numeric total
        text estado
        uuid vendedor_id FK
    }
    COTIZACION_ITEMS {
        uuid id PK
        uuid empresa_id FK
        uuid cotizacion_id FK
        text descripcion
        numeric cantidad
        numeric precio
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
