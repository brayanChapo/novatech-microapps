# 03 · Modelo de datos (borrador) — Agenda de citas + recordatorios WhatsApp

Esquema `agenda`. Todas las tablas incluyen `id`, `empresa_id` y `creado_en`. SQL: [`database/borrador/20261008000100_agenda.sql`](../database/borrador/20261008000100_agenda.sql).

```mermaid
erDiagram
    PROFESIONALES ||--o{ DISPONIBILIDAD : profesional_id
    PROFESIONALES ||--o{ CITAS : profesional_id
    SERVICIOS ||--o{ CITAS : servicio_id
    PACIENTES ||--o{ CITAS : paciente_id
    CITAS ||--o{ MENSAJES_WHATSAPP : cita_id
    PROFESIONALES {
        uuid id PK
        uuid empresa_id FK
        text nombre
        text especialidad
        boolean activo
    }
    SERVICIOS {
        uuid id PK
        uuid empresa_id FK
        text nombre
        integer duracion_min
        numeric precio_referencial
    }
    DISPONIBILIDAD {
        uuid id PK
        uuid empresa_id FK
        uuid profesional_id FK
        smallint dia_semana
        time hora_inicio
        time hora_fin
    }
    PACIENTES {
        uuid id PK
        uuid empresa_id FK
        text nombre
        varchar telefono
        varchar documento
        boolean acepta_whatsapp
    }
    CITAS {
        uuid id PK
        uuid empresa_id FK
        uuid profesional_id FK
        uuid servicio_id FK
        uuid paciente_id FK
        timestamptz inicio
        timestamptz fin
        text estado
        text origen
    }
    MENSAJES_WHATSAPP {
        uuid id PK
        uuid empresa_id FK
        uuid cita_id FK
        text plantilla
        varchar telefono
        text estado
        text meta_message_id
        timestamptz enviado_en
    }
```

## Pendiente al construir

- Políticas RLS por rol (el borrador solo filtra por empresa).
- Índices para las consultas de reportes.
- Restricciones `unique` de negocio (p. ej. numeración por empresa).
