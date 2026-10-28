# 03 · Modelo de datos (borrador) — Control de pensiones y cuotas

Esquema `pensiones`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008000400_pensiones.sql`](../database/borrador/20261008000400_pensiones.sql).

```mermaid
erDiagram
    RESPONSABLES ||--o{ CUENTAS : responsable_id
    CUENTAS ||--o{ CUOTAS : cuenta_id
    CONCEPTOS ||--o{ CUOTAS : concepto_id
    CUOTAS ||--o{ PAGOS : cuota_id
    PERFILES ||--o{ PAGOS : validado_por
    RESPONSABLES ||--o{ ENLACES : responsable_id
    RESPONSABLES {
        uuid id PK
        uuid empresa_id FK
        text nombre
        varchar documento
        varchar telefono
        text correo
    }
    CUENTAS {
        uuid id PK
        uuid empresa_id FK
        text codigo
        text descripcion
        text grupo
        uuid responsable_id FK
        boolean activo
    }
    CONCEPTOS {
        uuid id PK
        uuid empresa_id FK
        text nombre
        numeric monto
        text mora_tipo
        numeric mora_valor
    }
    CUOTAS {
        uuid id PK
        uuid empresa_id FK
        uuid cuenta_id FK
        uuid concepto_id FK
        text periodo
        date vence
        numeric monto
        numeric mora
        text estado
    }
    PAGOS {
        uuid id PK
        uuid empresa_id FK
        uuid cuota_id FK
        numeric monto
        text medio
        text voucher_url
        date pagado_en
        uuid validado_por FK
        text estado
    }
    ENLACES {
        uuid id PK
        uuid empresa_id FK
        uuid responsable_id FK
        text token_hash
        timestamptz expira
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
