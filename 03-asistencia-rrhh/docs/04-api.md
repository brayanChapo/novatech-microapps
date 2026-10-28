# 04 · API — Asistencia

**Base URL:** local `http://localhost:4000` · producción `https://api-asistencia.novatechconsulting.com.pe`
**Autenticación:** `Authorization: Bearer <access_token de Supabase Auth>` en todas las rutas excepto `/salud`.
**Formato:** JSON UTF-8. Fechas `YYYY-MM-DD` (zona de la empresa). Timestamps ISO 8601 en UTC.

## Resumen de endpoints

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/salud` | público | Monitoreo |
| GET | `/yo` | todos | Perfil + estado del día (local, horario, marcaciones, siguiente, reglas) |
| POST | `/marcaciones` | todos | Registrar entrada/salida |
| GET | `/marcaciones/mias?desde&hasta` | todos | Historial propio (por defecto 30 días) |
| GET | `/dashboard/resumen?fecha` | admin, supervisor | Totales + fila por local |
| GET | `/dashboard/locales/:localId?fecha` | admin, supervisor | Detalle de personas del local |
| GET | `/dashboard/marcaciones?fecha&local_id&limite` | admin, supervisor | Últimas marcaciones (feed) |
| GET | `/locales` | admin, supervisor | Locales (supervisor: solo los suyos) |
| POST | `/locales` | admin | Crear local |
| PATCH | `/locales/:id` | admin | Editar local / activar / desactivar |
| GET | `/horarios` | admin, supervisor | Horarios |
| POST | `/horarios` | admin | Crear horario |
| GET | `/colaboradores` | admin | Usuarios + asignación + locales supervisados |
| POST | `/colaboradores` | admin | Crear usuario (Auth + perfil + asignación) |
| PATCH | `/colaboradores/:id` | admin | Nombre, documento, rol, activo |
| PUT | `/colaboradores/:id/asignacion` | admin | Cambiar local/horario desde hoy |
| PUT | `/colaboradores/:id/contrasena` | admin | Asignar nueva contraseña temporal |
| PUT | `/colaboradores/:id/locales-supervisados` | admin | Locales que ve un supervisor |
| GET | `/reportes/marcaciones.csv?desde&hasta&local_id` | admin, supervisor | Exportación CSV (máx. 93 días) |

## POST /marcaciones

**Solicitud**

```json
{
  "tipo": "entrada",
  "lat": -12.12115,
  "lng": -77.02968,
  "precision_m": 12,
  "ubicacion_simulada": false,
  "dispositivo": { "plataforma": "android", "modelo": "Galaxy A54", "version_app": "1.0.0" }
}
```

| Campo | Tipo | Reglas |
|---|---|---|
| `tipo` | `"entrada" \| "salida"` | Opcional. Si se envía, debe coincidir con la secuencia del día. |
| `lat`, `lng` | number | Rango geográfico válido. |
| `precision_m` | number | 0–10000. Debe ser ≤ `precision_max_m` de la empresa. |
| `ubicacion_simulada` | boolean | `location.mocked` de expo-location. |
| `dispositivo` | object | Opcional, solo para auditoría. |

**Respuesta 201**

```json
{
  "marcacion": {
    "id": "6f1c…", "tipo": "entrada", "estado": "a_tiempo",
    "marcado_en": "2026-10-08T13:22:05.120Z", "fecha_local": "2026-10-08",
    "distancia_m": 14.2, "dentro_geocerca": true, "local_id": "…"
  },
  "mensaje": "Entrada registrada a las 08:22 en Sede Miraflores a tiempo."
}
```

## GET /yo

```json
{
  "usuario": { "id": "…", "empresa_id": "…", "nombre": "Ana Torres", "rol": "colaborador" },
  "fecha": "2026-10-08",
  "hora_servidor": "08:21",
  "reglas": { "precision_max_m": 50, "politica_fuera_geocerca": "rechazar" },
  "asignacion": {
    "local": { "id": "…", "nombre": "Sede Miraflores", "lat": -12.1211, "lng": -77.0297, "radio_m": 120 },
    "horario": { "id": "…", "nombre": "Oficina L-V", "hora_entrada": "08:30:00", "hora_salida": "17:30:00", "tolerancia_min": 10, "dias_semana": [1,2,3,4,5] }
  },
  "marcaciones": [],
  "siguiente": "entrada"
}
```

## GET /dashboard/resumen?fecha=2026-10-08

```json
{
  "fecha": "2026-10-08",
  "totales": { "locales": 3, "programados": 24, "presentes": 19, "tardanzas": 3, "sin_marcar": 5, "salidas": 2, "observadas": 1, "porcentaje_asistencia": 79 },
  "locales": [
    { "local_id": "…", "local_nombre": "Sede Miraflores", "lat": -12.1211, "lng": -77.0297, "radio_m": 120,
      "programados": 8, "presentes": 6, "tardanzas": 2, "sin_marcar": 2, "salidas": 0, "observadas": 1, "porcentaje_asistencia": 75 }
  ]
}
```

## GET /dashboard/locales/:localId?fecha=2026-10-08

```json
{
  "fecha": "2026-10-08",
  "local": { "id": "…", "nombre": "Sede Miraflores", "direccion": "…", "lat": -12.1211, "lng": -77.0297, "radio_m": 120, "activo": true },
  "personas": [
    { "colaborador_id": "…", "nombre": "Luis Ramos", "documento": "70125896",
      "hora_entrada_prog": "08:30:00", "hora_salida_prog": "17:30:00",
      "entrada_en": "2026-10-08T13:47:00Z", "estado_entrada": "tardanza", "distancia_entrada": 34,
      "salida_en": null, "estado_salida": null, "situacion": "en_local" }
  ]
}
```

## Errores

Formato único:

```json
{ "error": { "codigo": "FUERA_DE_GEOCERCA", "mensaje": "Estás a 430 m de Sede Miraflores. Debes estar dentro de 120 m para marcar.", "detalle": { "distancia_m": 430.2, "radio_m": 120, "local": "Sede Miraflores" } } }
```

| Código | HTTP | Cuándo |
|---|---|---|
| `NO_AUTENTICADO` | 401 | Sin token o token vencido |
| `PERFIL_INACTIVO` | 403 | Usuario sin perfil o desactivado |
| `SIN_PERMISO` | 403 | Rol insuficiente o local no supervisado |
| `DATOS_INVALIDOS` | 400 | Falla de validación (incluye `detalle.campos`) |
| `SIN_ASIGNACION` | 422 | Colaborador sin local/horario vigente |
| `UBICACION_SIMULADA` | 422 | Fake GPS detectado |
| `PRECISION_INSUFICIENTE` | 422 | `precision_m` > máximo de la empresa |
| `FUERA_DE_GEOCERCA` | 422 | Distancia > radio con política "rechazar" |
| `JORNADA_COMPLETA` | 409 | Ya hay entrada y salida |
| `SECUENCIA_INVALIDA` | 409 | `tipo` enviado no corresponde |
| `MARCACION_DUPLICADA` | 409 | Carrera de doble envío (índice único) |
| `NO_ENCONTRADO` | 404 | Recurso inexistente o de otra empresa |
| `CONFLICTO` | 409 | Correo o nombre duplicado |
| `ERROR_INTERNO` | 500 | Error no controlado (se registra en logs) |

## Estados de marcación

| Estado | Significado |
|---|---|
| `a_tiempo` | Entrada ≤ hora_entrada + tolerancia |
| `tardanza` | Entrada > hora_entrada + tolerancia |
| `salida` | Salida ≥ hora_salida |
| `salida_anticipada` | Salida < hora_salida |
| `extra` | Día no incluido en el horario |
| `observada` | Fuera de geocerca con política "observar" |

## Ejemplo con curl

```bash
TOKEN=$(curl -s "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"email":"ana@demo.pe","password":"Demo2026!"}' | jq -r .access_token)

curl -s -X POST http://localhost:4000/marcaciones \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"lat":-12.12112,"lng":-77.02971,"precision_m":10,"ubicacion_simulada":false}' | jq
```
