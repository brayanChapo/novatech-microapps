# 03 · Modelo de datos (borrador) — Prueba de entrega (foto, firma, GPS)

Esquema `entregas`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008000800_entregas.sql`](../database/borrador/20261008000800_entregas.sql).

```mermaid
erDiagram
    PERFILES ||--o{ ENTREGAS : repartidor_id
    ENTREGAS ||--o{ EVIDENCIAS : entrega_id
    ENTREGAS {
        uuid id PK
        uuid empresa_id FK
        text numero_pedido
        uuid repartidor_id FK
        date fecha
        text destinatario
        text direccion
        varchar telefono
        double lat_destino
        double lng_destino
        text estado
    }
    EVIDENCIAS {
        uuid id PK
        uuid empresa_id FK
        uuid entrega_id FK
        text resultado
        text recibe_nombre
        text firma_url
        text foto_url
        double lat
        double lng
        real precision_m
        text motivo
        timestamptz registrado_en
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
