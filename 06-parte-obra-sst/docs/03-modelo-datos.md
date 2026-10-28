# 03 · Modelo de datos (borrador) — Parte diario de obra + checklist SST

Esquema `obra`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008000600_obra.sql`](../database/borrador/20261008000600_obra.sql).

```mermaid
erDiagram
    OBRAS ||--o{ PARTIDAS : obra_id
    OBRAS ||--o{ PARTES : obra_id
    PERFILES ||--o{ PARTES : firmado_por
    PARTES ||--o{ PARTE_AVANCES : parte_id
    PARTIDAS ||--o{ PARTE_AVANCES : partida_id
    OBRAS ||--o{ INSPECCIONES : obra_id
    PLANTILLAS_CHECKLIST ||--o{ INSPECCIONES : plantilla_id
    OBRAS ||--o{ FOTOS : obra_id
    OBRAS {
        uuid id PK
        uuid empresa_id FK
        text nombre
        text cliente
        double lat
        double lng
        boolean activo
    }
    PARTIDAS {
        uuid id PK
        uuid empresa_id FK
        uuid obra_id FK
        text codigo
        text descripcion
        text unidad
        numeric metrado
    }
    PARTES {
        uuid id PK
        uuid empresa_id FK
        uuid obra_id FK
        date fecha
        text clima
        text incidencias
        uuid firmado_por FK
        text firma_url
        boolean cerrado
    }
    PARTE_AVANCES {
        uuid id PK
        uuid empresa_id FK
        uuid parte_id FK
        uuid partida_id FK
        numeric avance_pct
    }
    PLANTILLAS_CHECKLIST {
        uuid id PK
        uuid empresa_id FK
        text nombre
        jsonb items
    }
    INSPECCIONES {
        uuid id PK
        uuid empresa_id FK
        uuid obra_id FK
        uuid plantilla_id FK
        jsonb respuestas
        integer criticos_no_conformes
        text firma_url
    }
    FOTOS {
        uuid id PK
        uuid empresa_id FK
        uuid obra_id FK
        text origen
        uuid origen_id
        text url
        double lat
        double lng
        timestamptz tomada_en
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
