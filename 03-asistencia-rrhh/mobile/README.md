# Mobile · App de marcación (Expo)

App del **colaborador** (Android/iOS) construida con **Expo SDK 57**.

```bash
cp .env.example .env    # usa la IP de tu PC, no "localhost"
npm install
npx expo start          # escanear el QR con Expo Go
npm run typecheck && npm test
```

## Cómo funciona

1. Inicia sesión con Supabase Auth (sesión guardada en AsyncStorage).
2. `GET /yo` → local asignado, horario, siguiente marcación y reglas de la empresa.
3. `useUbicacionEnVivo` (expo-location `watchPositionAsync`, precisión máxima, cada ~2 s/1 m) **solo en primer plano**.
4. Muestra la distancia al local y habilita el botón si está dentro, con buena precisión y sin ubicación simulada.
5. `POST /marcaciones` → el **servidor** valida de nuevo y responde con el mensaje final.

| Archivo | Rol |
|---|---|
| `App.tsx` | Sesión + pestañas (Marcar / Historial / Salir) |
| `src/screens/MarcarScreen.tsx` | Pantalla principal de marcación |
| `src/hooks/useUbicacionEnVivo.ts` | Permisos y GPS en vivo |
| `src/lib/geo.ts` | Distancia (solo informativa) |
| `app.json` | Permisos: solo ubicación "mientras se usa"; fondo bloqueado |
| `eas.json` | Perfiles de build (preview = APK, production = tiendas) |

Builds y publicación: ver [documento de implementación](../docs/07-documento-implementacion.md#a4-app-móvil--expo-eas).
