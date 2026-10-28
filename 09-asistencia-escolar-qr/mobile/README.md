# Mobile · Asistencia por QR con aviso a padres

**Decisión:** App nativa con Expo

Se recomienda **Expo** (reutiliza la app 03) para un escáner QR rápido con `expo-camera` y cola sin conexión. Alternativa PWA si el colegio usa una sola tablet con buena señal.

Partir de una copia de [`03-asistencia-rrhh/mobile`](../../03-asistencia-rrhh/mobile/) (login, sesión, cliente API, tema) y agregar lo específico. Usar `EXPO_OFFLINE=1 npx expo install <paquete>` si la red bloquea la API de Expo.
