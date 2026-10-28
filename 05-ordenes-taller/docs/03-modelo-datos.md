# 03 · Modelo de datos (borrador) — Orden de trabajo con estado por WhatsApp

Esquema `taller`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008000500_taller.sql`](../database/borrador/20261008000500_taller.sql).

```mermaid
erDiagram
    VEHICULOS ||--o{ ORDENES : vehiculo_id
    PERFILES ||--o{ ORDENES : tecnico_id
    ORDENES ||--o{ ORDEN_ITEMS : orden_id
    ORDENES ||--o{ ORDEN_EVENTOS : orden_id
    PERFILES ||--o{ ORDEN_EVENTOS : usuario_id
    ORDENES ||--o{ ORDEN_FOTOS : orden_id
    VEHICULOS {
        uuid id PK
        uuid empresa_id FK
        varchar placa
        text marca
        text modelo
        integer anio
        text cliente_nombre
        varchar cliente_telefono
    }
    ORDENES {
        uuid id PK
        uuid empresa_id FK
        uuid vehiculo_id FK
        integer numero
        integer kilometraje
        text motivo
        text estado
        uuid tecnico_id FK
        timestamptz aprobado_en
        timestamptz entregado_en
    }
    ORDEN_ITEMS {
        uuid id PK
        uuid empresa_id FK
        uuid orden_id FK
        text tipo
        text descripcion
        numeric cantidad
        numeric precio
    }
    ORDEN_EVENTOS {
        uuid id PK
        uuid empresa_id FK
        uuid orden_id FK
        text estado
        uuid usuario_id FK
        text nota
        boolean notificado
    }
    ORDEN_FOTOS {
        uuid id PK
        uuid empresa_id FK
        uuid orden_id FK
        text url
        text etapa
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
