# 03 · Modelo de datos (borrador) — Asistencia por QR con aviso a padres

Esquema `escolar`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008000900_escolar.sql`](../database/borrador/20261008000900_escolar.sql).

```mermaid
erDiagram
    AULAS ||--o{ ALUMNOS : aula_id
    APODERADOS ||--o{ ALUMNOS : apoderado_id
    ALUMNOS ||--o{ REGISTROS : alumno_id
    PERFILES ||--o{ REGISTROS : registrado_por
    ALUMNOS ||--o{ AVISOS : alumno_id
    AULAS {
        uuid id PK
        uuid empresa_id FK
        text nombre
        time hora_ingreso
        time hora_corte
    }
    APODERADOS {
        uuid id PK
        uuid empresa_id FK
        text nombre
        varchar telefono
        boolean acepta_whatsapp
    }
    ALUMNOS {
        uuid id PK
        uuid empresa_id FK
        text nombre
        text codigo
        uuid aula_id FK
        uuid apoderado_id FK
        text token_qr
        boolean activo
    }
    DIAS_NO_LECTIVOS {
        uuid id PK
        uuid empresa_id FK
        date fecha
        text motivo
    }
    REGISTROS {
        uuid id PK
        uuid empresa_id FK
        uuid alumno_id FK
        date fecha
        timestamptz ingreso_en
        text estado
        uuid registrado_por FK
    }
    AVISOS {
        uuid id PK
        uuid empresa_id FK
        uuid alumno_id FK
        date fecha
        text estado_envio
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
