# Backend · Consola NovaTech (por construir)

Misma estructura que [`03-asistencia-rrhh/backend`](../../03-asistencia-rrhh/backend/), con un middleware distinto: en lugar de cargar `core.perfiles`, verifica que el usuario esté en **`consola.staff`** y activo.

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/kpis?fecha` | todos | `consola.kpis(fecha)` + tabla por producto |
| GET | `/evolucion?desde&hasta` | todos | Serie mensual facturado / cobrado / recurrente |
| GET/POST/PATCH | `/clientes` | operaciones+ | Clientes y prospectos |
| GET | `/clientes/:id` | todos | Ficha completa |
| POST | `/clientes/:id/aprovisionar` | direccion | Crea empresa en `core` + primer admin |
| GET/POST/PATCH | `/contratos` | operaciones+ | Precio tomado de la lista vigente |
| GET/POST/PATCH | `/comprobantes` | direccion | Registro de comprobantes |
| POST | `/comprobantes/:id/pagos` | direccion | Registrar pago |
| GET | `/por-facturar?periodo` | todos | Planes y excedentes pendientes de facturar |
| GET | `/uso?empresa_id&desde&hasta` | todos | Conteos de uso |
| GET | `/riesgo` | todos | Clientes sin actividad o con caída de uso |
| POST | `/notas` | operaciones+ | Notas por cliente |
| GET | `/exportar/:tabla.csv` | todos | CSV |
