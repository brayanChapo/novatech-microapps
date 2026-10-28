# 07 · Documento de implementación — Consola NovaTech

1. Revisar el borrador, mover a `database/migrations/` (marca `20261008000001`), agregar pruebas pgTAP C-01 a C-07.
2. **No** exponer el esquema `consola` en Settings → API (no lo necesita: el backend lo consulta con `service_role` vía funciones RPC en `public` o conexión directa). Si se expone para RPC, mantener RLS sin políticas.
3. Activar la extensión `pg_cron` en Supabase y programar `consola.recolectar_uso` (comando en el borrador).
4. Cargar `consola.productos` y `consola.precios` desde el catálogo del portafolio.
5. Crear usuarios del equipo en Auth e insertarlos en `consola.staff`; activar verificación en dos pasos.
6. Importar el Excel `NovaTech-Control-Clientes.xlsx` con un script de carga única y comparar indicadores.
7. Desplegar en Vercel: `consola-api` (Root `00-consola-novatech/backend`) y `consola-web` (Root `00-consola-novatech/frontend`), dominio `consola.novatechconsulting.com.pe`. Recomendado: proteger además con *Vercel Password Protection* o lista de IPs.
