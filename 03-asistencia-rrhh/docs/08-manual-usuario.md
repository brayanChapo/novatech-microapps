# 08 · Manual de usuario — Asistencia NovaTech

Este manual tiene tres partes. Ve directo a la tuya:

- [Parte 1 · Colaborador (app del celular)](#parte-1--colaborador)
- [Parte 2 · Supervisor (panel web)](#parte-2--supervisor)
- [Parte 3 · Administrador (panel web)](#parte-3--administrador)
- [Preguntas frecuentes](#preguntas-frecuentes)

---

## Parte 1 · Colaborador

### Instalar la app

1. Abre el enlace que te envió tu empresa (o busca **"Asistencia NovaTech"** en tu tienda de apps).
2. Instálala y ábrela.

### Iniciar sesión

1. Escribe el **correo** y la **contraseña temporal** que te dio tu administrador.
2. Toca **Ingresar**. La app recordará tu sesión.

### Dar permiso de ubicación

La primera vez, la app pedirá tu ubicación. Elige **"Permitir mientras se usa la app"**.

> 🔒 La app **no te sigue** cuando está cerrada. Solo usa tu ubicación mientras tienes abierta la pantalla de marcación, y solo la **envía** cuando tocas "Marcar".

### Marcar tu entrada

1. Abre la app al llegar a tu local.
2. Verás tu **local**, tu **horario** y un **círculo con la distancia**:
   - 🟢 **Verde – "Estás en tu local"**: el botón se activa.
   - 🔴 **Rojo – "X m del local"**: acércate; el botón se activará solo.
3. Toca **MARCAR ENTRADA**.
4. Verás un mensaje verde, por ejemplo: *"Entrada registrada a las 08:22 en Sede Miraflores a tiempo."*

### Marcar tu salida

Al terminar tu jornada, abre la app y toca **MARCAR SALIDA**. Al completar ambas verás **"Jornada completa ✓"**.

### Ver tu historial

Toca la pestaña **Historial**: verás tus marcaciones de los últimos 30 días con su estado.

### Qué significan los estados

| Estado | Significado |
|---|---|
| A tiempo | Llegaste dentro del horario (incluye la tolerancia) |
| Tardanza | Llegaste después de la tolerancia |
| Salida | Saliste a tu hora o después |
| Salida anticipada | Saliste antes de tu hora |
| Día no programado | Marcaste un día que no está en tu horario |
| Observada | Marcaste fuera del local (solo si tu empresa lo permite) |

### Si algo sale mal

| Mensaje | Qué hacer |
|---|---|
| "Señal GPS imprecisa" | Acércate a una ventana o sal un momento al exterior y espera unos segundos. |
| "Estás a X m de…" | Estás fuera del área permitida. Acércate a la entrada del local. |
| "Tu GPS está apagado" | Activa la ubicación en los ajustes rápidos del celular. |
| "Se detectó una ubicación simulada" | Desinstala o desactiva apps de "GPS falso". |
| "No tienes un local asignado" | Avisa a tu administrador. |
| "No hay conexión con el servidor" | Revisa tus datos o Wi-Fi e inténtalo de nuevo. |
| "Ya registraste tu entrada y tu salida de hoy" | No necesitas hacer nada más. |

---

## Parte 2 · Supervisor

Ingresa a **https://asistencia.novatechconsulting.com.pe** con tu correo y contraseña.

### Dashboard general

- **Indicadores** del día: % de asistencia, presentes, tardanzas, sin marcar y marcaciones fuera del local.
- **Tabla por local**: programados, presentes, tardanzas, sin marcar y %.
- **Mapa**: cada local con su área. Color: 🟢 ≥ 90 % · 🟠 ≥ 70 % · 🔴 < 70 %.
- **Últimas marcaciones**: quién marcó, dónde, a qué distancia y a qué hora.
- **"En vivo"** (punto verde): la pantalla se actualiza sola cuando alguien marca. Si dice "Actualización cada minuto", igual se refresca cada 60 segundos.
- **Fecha**: cambia la fecha para ver días anteriores.

> Solo verás los locales que tienes asignados.

### Detalle de un local

Haz clic en un local (en la tabla o en el mapa) para ver a cada persona: horario, hora de entrada y salida, estado y situación (**Sin marcar**, **En el local**, **Jornada cerrada**). Usa los filtros (**Sin marcar**, **Tardanzas**, **En el local**) o busca por nombre o DNI.

### Reportes

Menú **Reportes** → elige fechas (máx. 93 días) y local → **Descargar CSV**. Se abre en Excel.

---

## Parte 3 · Administrador

Además de todo lo del supervisor, ves **todos los locales** y gestionas la configuración.

### Locales

1. Menú **Locales** → **Nuevo local**.
2. Escribe nombre y dirección.
3. Fija el punto: **"Usar mi ubicación actual"** (si estás en el local) o **haz clic en el mapa**.
4. Define el **radio** en metros. Recomendado: 80–150 m en ciudad; 200–300 m en almacenes.
5. **Crear local**. Puedes cambiar el radio en la tabla o **desactivar** un local (ya no se podrá marcar ahí).

### Horarios

Menú **Colaboradores** → tarjeta **Horarios**: nombre, hora de entrada, salida, **tolerancia** (minutos de gracia) y días de la semana.

### Usuarios

1. Menú **Colaboradores** → **Nuevo usuario**.
2. Completa nombre, DNI (opcional), correo, **contraseña temporal**, rol, y para colaboradores su **local** y **horario**.
3. Comparte el correo y la contraseña con la persona por un canal privado.

**Roles:**

| Rol | Puede |
|---|---|
| Colaborador | Marcar desde el celular |
| Supervisor | Ver dashboard y reportes de sus locales |
| Administrador | Todo |

**Cambiar local u horario:** en la tabla, elige el nuevo valor. Aplica **desde hoy**; el historial anterior se conserva.

**Locales de un supervisor:** botón **"Locales que supervisa"** → marca los locales → **Guardar**.

**Desactivar:** botón **Desactivar** (por ejemplo, cese). La persona ya no podrá ingresar; sus marcaciones se conservan.

---

## Preguntas frecuentes

**¿Qué pasa si cambio la hora de mi celular?** Nada: la hora oficial es la del servidor.

**¿Puedo marcar desde mi casa?** No. El sistema verifica que estés dentro del área de tu local.

**¿La empresa ve dónde estoy todo el día?** No. Solo se registra tu ubicación en el momento exacto en que marcas.

**Olvidé mi contraseña.** Pide a tu administrador que te asigne una nueva (botón **Nueva contraseña** en Colaboradores).

**¿Funciona sin internet?** En esta versión necesitas conexión para marcar.

**Soporte NovaTech:** WhatsApp +51 924 678 727 · soporte en horario laboral.
