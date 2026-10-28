# 03 · Modelo de datos (borrador) — Mesa de ayuda interna (tickets)

Esquema `ayuda`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008001200_ayuda.sql`](../database/borrador/20261008001200_ayuda.sql).

```mermaid
erDiagram
    PERFILES ||--o{ CATEGORIAS : agente_defecto_id
    PERFILES ||--o{ TICKETS : solicitante_id
    PERFILES ||--o{ TICKETS : agente_id
    CATEGORIAS ||--o{ TICKETS : categoria_id
    TICKETS ||--o{ COMENTARIOS : ticket_id
    PERFILES ||--o{ COMENTARIOS : autor_id
    TICKETS ||--o{ EVENTOS : ticket_id
    PERFILES ||--o{ EVENTOS : usuario_id
    CATEGORIAS {
        uuid id PK
        uuid empresa_id FK
        text nombre
        uuid agente_defecto_id FK
    }
    TICKETS {
        uuid id PK
        uuid empresa_id FK
        integer numero
        uuid solicitante_id FK
        uuid agente_id FK
        uuid categoria_id FK
        text prioridad
        text titulo
        text descripcion
        text estado
        timestamptz primera_respuesta_en
        timestamptz resuelto_en
    }
    COMENTARIOS {
        uuid id PK
        uuid empresa_id FK
        uuid ticket_id FK
        uuid autor_id FK
        text texto
        boolean interno
    }
    EVENTOS {
        uuid id PK
        uuid empresa_id FK
        uuid ticket_id FK
        text estado
        uuid usuario_id FK
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
