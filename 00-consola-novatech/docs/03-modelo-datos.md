# 03 · Modelo de datos (borrador) — Consola NovaTech

SQL: [`database/borrador/20261008000001_consola.sql`](../database/borrador/20261008000001_consola.sql) — **validado en PostgreSQL 16** con datos de prueba (indicadores, recolector de uso y bloqueo de acceso a usuarios de clientes).

```mermaid
erDiagram
    CLIENTES ||--o{ CONTRATOS : firma
    CLIENTES ||--o{ COMPROBANTES : recibe
    CONTRATOS ||--o{ COMPROBANTES : origina
    COMPROBANTES ||--o{ PAGOS : "se paga con"
    CLIENTES ||--o{ NOTAS : tiene
    PRODUCTOS ||--o{ PRECIOS : "lista de"
    PRODUCTOS ||--o{ CONTRATOS : "se contrata"
    PRODUCTOS ||--o{ USO_DIARIO : reporta
    EMPRESAS ||--o| CLIENTES : "se aprovisiona"
    EMPRESAS ||--o{ USO_DIARIO : genera
    STAFF ||--o{ NOTAS : escribe

    CLIENTES {
        uuid id PK
        uuid empresa_id FK "null si es prospecto"
        text razon_social
        varchar ruc
        text estado "prospecto | activo | baja"
        date fecha_alta
    }
    CONTRATOS {
        uuid id PK
        uuid cliente_id FK
        text producto FK
        text plan "basico | estandar | pro"
        numeric precio_mensual "congelado"
        numeric descuento_mensual
        numeric implementacion
        int wa_incluidos
        date fecha_firma
        date inicio_plan
        date fecha_baja
        text estado
    }
    COMPROBANTES {
        uuid id PK
        text serie_numero "único"
        date fecha_emision
        text concepto
        text periodo
        numeric monto
        numeric igv
        numeric total "generado"
        date vence
        text estado
    }
    PAGOS {
        uuid id PK
        uuid comprobante_id FK
        date fecha
        numeric monto
        text medio
    }
    USO_DIARIO {
        date fecha PK
        uuid empresa_id PK
        text producto PK
        text metrica PK
        bigint valor
    }
    PRODUCTOS {
        text codigo PK
        text esquema
    }
    PRECIOS {
        text producto PK
        text plan PK
        date vigente_desde PK
        numeric precio_mensual
        numeric implementacion
        int wa_incluidos
    }
    EMPRESAS {
        uuid id PK
    }
    STAFF {
        uuid usuario_id PK
        text rol
    }
    NOTAS {
        uuid id PK
        text tipo
        text texto
    }
```

## Funciones

| Función | Devuelve |
|---|---|
| `consola.mrr(fecha)` | Ingreso mensual recurrente a esa fecha |
| `consola.kpis(fecha)` | Clientes activos, prospectos, contratos hoy/mes, bajas, recurrente, facturado hoy/mes, cobrado, por cobrar, vencido |
| `consola.recolectar_uso(fecha)` | Número de filas de uso guardadas |
| `asistencia.uso_diario(fecha)` | Ejemplo de contrato de uso (marcaciones, usuarios activos, locales activos) |
