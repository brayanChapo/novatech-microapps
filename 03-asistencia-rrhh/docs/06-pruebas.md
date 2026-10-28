# 06 · Plan y casos de prueba — Asistencia

## 1. Estrategia

| Nivel | Qué cubre | Herramienta | Dónde | Cuándo corre |
|---|---|---|---|---|
| Unitarias de dominio | Haversine, geocerca, zona horaria, reglas de estado | Vitest | `backend/tests/*.test.ts` | Cada push (CI) |
| Unitarias de servicio | Caso de uso de marcación con repositorio en memoria (sin BD) | Vitest | `backend/tests/marcacion.service.test.ts` | Cada push |
| API | Autenticación, CORS, formato de errores | Vitest + `app.request` | `backend/tests/api.test.ts` | Cada push |
| Base de datos | RLS y aislamiento entre empresas/roles | pgTAP | `database/tests/rls_asistencia.test.sql` | Cada push (CI con Postgres) |
| Frontend | Formato de fechas/horas en Lima | Vitest | `frontend/tests/` | Cada push |
| Móvil | Cálculo de distancia (igual al backend) | `node --test` | `mobile/tests/` | Cada push |
| Integración manual | Flujo completo con Supabase local | Checklist | Sección 4 | Antes de cada versión |
| Aceptación (UAT) | Con el cliente en su local real | Checklist | Sección 5 | Antes de salir a producción |

## 2. Cómo ejecutar

```bash
cd 03-asistencia-rrhh/backend  && npm test               # 49 pruebas
cd 03-asistencia-rrhh/backend  && npm run test:cobertura # reporte en coverage/
cd 03-asistencia-rrhh/frontend && npm test               # 4 pruebas
cd 03-asistencia-rrhh/mobile   && npm test               # 3 pruebas
cd microapps && node scripts/db-sync.mjs && supabase test db   # 8 pruebas RLS
```

**Meta de cobertura:** ≥ 80 % de líneas en `src/domain/` y `src/services/`. Un PR que la baje no se aprueba.

## 3. Inventario de pruebas automatizadas

### Dominio — geocerca (`geocerca.test.ts`)

| # | Caso | Esperado |
|---|---|---|
| U-01 | Mismo punto | 0 m |
| U-02 | 0.001° de latitud | ≈ 111 m |
| U-03 | Miraflores → San Isidro | 3–4 km |
| U-04 | Simetría A→B = B→A | Igual |
| U-05 | Posición a ~20 m con radio 100 | Dentro |
| U-06 | Posición a ~220 m con radio 100 | Fuera |
| U-07 | Borde exacto del radio | Dentro |
| U-08 | Precisión 51 m con máximo 50 | Insuficiente |

### Dominio — tiempo (`tiempo.test.ts`)

| # | Caso | Esperado |
|---|---|---|
| U-09 | 13:25 UTC | 08:25 Lima, jueves |
| U-10 | 03:30 UTC del día 9 | 22:30 del día 8 en Lima |
| U-11 | Medianoche Lima | 00:00 (no 24:00), domingo = 7 |
| U-12 | `minutosDeHora` HH:MM y HH:MM:SS | 510 / 1050 |
| U-13 | Hora inválida | Lanza error |
| U-14 | Restar días cruzando mes/año | 28-feb / 31-dic |
| U-15 | Días entre fechas | 30 / -1 |

### Dominio — reglas (`reglas.test.ts`)

| # | Caso | Esperado |
|---|---|---|
| U-16 | Sin marcaciones | Siguiente = entrada |
| U-17 | Con entrada | Siguiente = salida |
| U-18 | Con entrada y salida | null |
| U-19 | Entrada 08:15 (horario 08:30, tol. 10) | a_tiempo |
| U-20 | Entrada 08:40 (límite) | a_tiempo |
| U-21 | Entrada 08:41 | tardanza |
| U-22 | Salida 17:00 (horario 17:30) | salida_anticipada |
| U-23 | Salida 17:30 | salida |
| U-24 | Sábado no programado | extra |
| U-25 | Fuera de geocerca | observada |

### Servicio — registrar marcación (`marcacion.service.test.ts`)

| # | Caso | Esperado |
|---|---|---|
| S-01 | Entrada a las 08:20 dentro del local | 201, a_tiempo, mensaje con hora y local |
| S-02 | Hora guardada | Hora del servidor en UTC |
| S-03 | Entrada 08:45 | tardanza |
| S-04 | Entrada y luego salida 17:35 | salida |
| S-05 | Tercera marcación | `JORNADA_COMPLETA` |
| S-06 | Enviar `tipo: salida` sin entrada | `SECUENCIA_INVALIDA` |
| S-07 | A ~430 m, política rechazar | `FUERA_DE_GEOCERCA` con distancia, nada guardado |
| S-08 | A ~430 m, política observar | Guardada como observada |
| S-09 | Precisión 120 m | `PRECISION_INSUFICIENTE` |
| S-10 | Ubicación simulada | `UBICACION_SIMULADA` |
| S-11 | Simulada con permiso de la empresa | Guardada con indicador |
| S-12 | Sin asignación | `SIN_ASIGNACION` |
| S-13 | Doble toque simultáneo | Solo 1 registro |
| S-14 | Sábado | extra |
| S-15 | Estado del día antes y después de marcar | entrada → salida |
| S-16 | Estado del día sin asignación | siguiente = null |

### API (`api.test.ts`)

| # | Caso | Esperado |
|---|---|---|
| A-01 | GET /salud sin token | 200 |
| A-02 | POST /marcaciones sin token | 401 `NO_AUTENTICADO` en español |
| A-03 | GET /dashboard/resumen sin token | 401 |
| A-04 | CORS origen permitido / no permitido | Cabecera presente / ausente |

### Base de datos (`rls_asistencia.test.sql`)

| # | Caso | Esperado |
|---|---|---|
| D-01 | Colaborador A lista marcaciones | Solo la suya |
| D-02 | Colaborador A lista locales | Solo los de su empresa |
| D-03 | Usuario autenticado inserta marcación | Error 42501 |
| D-04 | Admin A lista marcaciones | Todas las de A |
| D-05 | Admin A filtra por empresa B | 0 |
| D-06 | Supervisor A (solo Local 2) | Solo marcaciones del Local 2 |
| D-07 | Colaborador B lista empresas | Solo la suya |
| D-08 | Colaborador B lista marcaciones | Solo la suya |

## 4. Pruebas de integración manual (antes de cada versión)

| # | Paso | Resultado esperado | ✔ |
|---|---|---|---|
| P-01 | Login web con admin | Ve Dashboard, Locales, Colaboradores, Reportes | ☐ |
| P-02 | Login web con supervisor | Solo Dashboard y Reportes, solo sus locales | ☐ |
| P-03 | Login web con colaborador | Se rechaza y explica que use la app | ☐ |
| P-04 | Crear local con "Usar mi ubicación actual" | Círculo aparece en el mapa | ☐ |
| P-05 | Crear horario L-V 08:30–17:30, tolerancia 10 | Aparece en la lista | ☐ |
| P-06 | Crear colaborador con local y horario | Mensaje de éxito; aparece en la tabla | ☐ |
| P-07 | App: login del nuevo colaborador | Muestra local, horario y hora del servidor | ☐ |
| P-08 | App: negar permiso de ubicación | Mensaje y enlace a ajustes | ☐ |
| P-09 | App: GPS apagado | "Tu GPS está apagado" | ☐ |
| P-10 | App: fuera del radio | Círculo rojo, botón deshabilitado | ☐ |
| P-11 | App: dentro del radio | Círculo verde, botón "MARCAR ENTRADA" | ☐ |
| P-12 | Marcar entrada | Mensaje verde con hora y estado | ☐ |
| P-13 | Cambiar la hora del celular y marcar | Se registra con la hora del servidor | ☐ |
| P-14 | Android con app de fake GPS | "Se detectó una ubicación simulada" | ☐ |
| P-15 | Dashboard abierto al marcar | Se actualiza en < 3 s; indicador "En vivo" | ☐ |
| P-16 | Detalle del local | La persona aparece "En el local" | ☐ |
| P-17 | Marcar salida antes de hora | "Salida anticipada" | ☐ |
| P-18 | Tercer intento | "Ya registraste tu entrada y tu salida de hoy" | ☐ |
| P-19 | Reasignar a otro local | Desde hoy marca en el nuevo local | ☐ |
| P-20 | Desactivar colaborador | La app muestra "Tu usuario no está habilitado" | ☐ |
| P-21 | Exportar CSV del mes | Abre en Excel con tildes y columnas correctas | ☐ |
| P-22 | Dashboard en celular (360 px) | Sin desplazamiento horizontal de la página | ☐ |
| P-23 | Modo avión al marcar | "No hay conexión con el servidor" | ☐ |

## 5. Aceptación con el cliente (UAT)

Realizar **en el local real**, con 2–3 colaboradores del cliente y su administrador:

1. Verificar coordenadas y radio en sitio (caminar hasta el borde de la geocerca).
2. Marcar desde **Android y iPhone** en interiores (zona más alejada de ventanas).
3. Confirmar que el administrador ve las marcaciones en vivo.
4. Revisar el CSV con quien hace la planilla.
5. Firmar el acta de conformidad.

**Criterio de salida:** P-01 a P-23 aprobados, 0 defectos críticos, ≤ 2 menores con fecha de corrección.

## 6. Prueba de carga (antes del primer cliente con más de 200 colaboradores)

Simular 300 marcaciones en 5 minutos (pico de entrada) con k6 o artillery contra el entorno demo. Objetivo: p95 < 1.5 s y 0 errores 5xx.
