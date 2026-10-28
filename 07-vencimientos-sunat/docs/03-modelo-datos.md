# 03 · Modelo de datos (borrador) — Vencimientos SUNAT + portal de documentos

Esquema `contable`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008000700_contable.sql`](../database/borrador/20261008000700_contable.sql).

```mermaid
erDiagram
    CLIENTES ||--o{ PERIODOS_CLIENTE : cliente_id
    PERIODOS_CLIENTE ||--o{ DOCUMENTOS : periodo_cliente_id
    CLIENTES {
        uuid id PK
        uuid empresa_id FK
        varchar ruc
        text razon_social
        text regimen
        text correo
        boolean activo
    }
    CRONOGRAMA_SUNAT {
        uuid id PK
        uuid empresa_id FK
        integer anio
        text periodo
        smallint ultimo_digito
        date vence
    }
    PERIODOS_CLIENTE {
        uuid id PK
        uuid empresa_id FK
        uuid cliente_id FK
        text periodo
        date vence
        text estado
        text constancia_url
    }
    DOCUMENTOS {
        uuid id PK
        uuid empresa_id FK
        uuid periodo_cliente_id FK
        text nombre_archivo
        text url
        text tipo
        text subido_por
    }
```

## Pendiente al construir

- Políticas RLS por rol (el borrador solo filtra por empresa).
- Índices para las consultas de reportes.
- Restricciones `unique` de negocio (p. ej. numeración por empresa).
