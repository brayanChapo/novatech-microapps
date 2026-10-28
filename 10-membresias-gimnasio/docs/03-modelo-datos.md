# 03 · Modelo de datos (borrador) — Membresías con acceso por QR

Esquema `gimnasio`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008001000_gimnasio.sql`](../database/borrador/20261008001000_gimnasio.sql).

```mermaid
erDiagram
    SOCIOS ||--o{ PAGOS : socio_id
    PLANES ||--o{ PAGOS : plan_id
    SOCIOS ||--o{ INGRESOS : socio_id
    PLANES {
        uuid id PK
        uuid empresa_id FK
        text nombre
        integer dias
        integer sesiones
        numeric precio
    }
    SOCIOS {
        uuid id PK
        uuid empresa_id FK
        text nombre
        varchar documento
        varchar telefono
        date vence
        integer sesiones_restantes
        text secreto_qr
    }
    PAGOS {
        uuid id PK
        uuid empresa_id FK
        uuid socio_id FK
        uuid plan_id FK
        numeric monto
        text medio
    }
    INGRESOS {
        uuid id PK
        uuid empresa_id FK
        uuid socio_id FK
        boolean permitido
        text motivo
    }
```

## Pendiente al construir

- Políticas RLS por rol (el borrador solo filtra por empresa).
- Índices para las consultas de reportes.
- Restricciones `unique` de negocio (p. ej. numeración por empresa).
