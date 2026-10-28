# 03 · Modelo de datos (borrador) — Historia clínica simple

Esquema `clinica`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008001400_clinica.sql`](../database/borrador/20261008001400_clinica.sql).

```mermaid
erDiagram
    PACIENTES ||--o{ EVOLUCIONES : paciente_id
    PERFILES ||--o{ EVOLUCIONES : profesional_id
    EVOLUCIONES ||--o{ ADENDAS : evolucion_id
    PERFILES ||--o{ ADENDAS : profesional_id
    EVOLUCIONES ||--o{ ARCHIVOS : evolucion_id
    PERFILES ||--o{ BITACORA_ACCESOS : usuario_id
    PACIENTES ||--o{ BITACORA_ACCESOS : paciente_id
    PACIENTES {
        uuid id PK
        uuid empresa_id FK
        text nombre
        varchar documento
        date fecha_nacimiento
        text sexo
        varchar telefono
        text alergias
        text antecedentes
    }
    EVOLUCIONES {
        uuid id PK
        uuid empresa_id FK
        uuid paciente_id FK
        uuid profesional_id FK
        text motivo
        text examen
        text diagnostico_cie10
        text indicaciones
        timestamptz firmada_en
    }
    ADENDAS {
        uuid id PK
        uuid empresa_id FK
        uuid evolucion_id FK
        uuid profesional_id FK
        text texto
    }
    ARCHIVOS {
        uuid id PK
        uuid empresa_id FK
        uuid evolucion_id FK
        text url
        text tipo
    }
    BITACORA_ACCESOS {
        uuid id PK
        uuid empresa_id FK
        uuid usuario_id FK
        uuid paciente_id FK
        text accion
        inet ip
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
