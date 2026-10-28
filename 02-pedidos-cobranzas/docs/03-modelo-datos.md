# 03 · Modelo de datos (borrador) — Toma de pedidos en ruta + cobranzas

Esquema `pedidos`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008000200_pedidos.sql`](../database/borrador/20261008000200_pedidos.sql).

```mermaid
erDiagram
    LISTAS_PRECIOS ||--o{ PRECIOS : lista_id
    PRODUCTOS ||--o{ PRECIOS : producto_id
    LISTAS_PRECIOS ||--o{ CLIENTES : lista_id
    PERFILES ||--o{ CLIENTES : vendedor_id
    CLIENTES ||--o{ PEDIDOS_CAB : cliente_id
    PERFILES ||--o{ PEDIDOS_CAB : vendedor_id
    PEDIDOS_CAB ||--o{ PEDIDOS_DET : pedido_id
    PRODUCTOS ||--o{ PEDIDOS_DET : producto_id
    CLIENTES ||--o{ COBROS : cliente_id
    PERFILES ||--o{ COBROS : vendedor_id
    CLIENTES ||--o{ VISITAS : cliente_id
    PERFILES ||--o{ VISITAS : vendedor_id
    PRODUCTOS {
        uuid id PK
        uuid empresa_id FK
        text codigo
        text nombre
        text unidad
        numeric stock_referencial
        text foto_url
        boolean activo
    }
    LISTAS_PRECIOS {
        uuid id PK
        uuid empresa_id FK
        text nombre
    }
    PRECIOS {
        uuid id PK
        uuid empresa_id FK
        uuid lista_id FK
        uuid producto_id FK
        numeric precio
    }
    CLIENTES {
        uuid id PK
        uuid empresa_id FK
        text razon_social
        varchar documento
        varchar telefono
        double lat
        double lng
        uuid lista_id FK
        uuid vendedor_id FK
        integer dias_credito
    }
    PEDIDOS_CAB {
        uuid id PK
        uuid empresa_id FK
        uuid cliente_id FK
        uuid vendedor_id FK
        timestamptz tomado_en
        timestamptz sincronizado_en
        text condicion
        numeric total
        text estado
        double lat
        double lng
    }
    PEDIDOS_DET {
        uuid id PK
        uuid empresa_id FK
        uuid pedido_id FK
        uuid producto_id FK
        numeric cantidad
        numeric precio_unitario
    }
    COBROS {
        uuid id PK
        uuid empresa_id FK
        uuid cliente_id FK
        uuid vendedor_id FK
        numeric monto
        text medio
        text voucher_url
        boolean validado
    }
    VISITAS {
        uuid id PK
        uuid empresa_id FK
        uuid cliente_id FK
        uuid vendedor_id FK
        double lat
        double lng
        text motivo_no_compra
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
