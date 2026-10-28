import { useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import * as Location from 'expo-location';

export interface Ubicacion {
  lat: number;
  lng: number;
  precision_m: number;
  simulada: boolean;
  actualizada: number;
}

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'sin_permiso'; puedePreguntar: boolean }
  | { tipo: 'gps_apagado' }
  | { tipo: 'ok'; ubicacion: Ubicacion }
  | { tipo: 'error'; mensaje: string };

/**
 * Sigue la posición del celular en tiempo real MIENTRAS la pantalla de marcación está abierta.
 * - Solo primer plano: al salir de la app se detiene (privacidad y batería).
 * - La posición NO se envía al servidor hasta que el usuario pulsa "Marcar".
 */
export function useUbicacionEnVivo(activo: boolean) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const sub = useRef<Location.LocationSubscription | null>(null);

  async function iniciar() {
    sub.current?.remove();
    sub.current = null;

    let permiso = await Location.getForegroundPermissionsAsync();
    if (permiso.status !== 'granted' && permiso.canAskAgain) permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status !== 'granted') return setEstado({ tipo: 'sin_permiso', puedePreguntar: permiso.canAskAgain });

    if (!(await Location.hasServicesEnabledAsync())) return setEstado({ tipo: 'gps_apagado' });

    try {
      sub.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, timeInterval: 2000, distanceInterval: 1 },
        (p) =>
          setEstado({
            tipo: 'ok',
            ubicacion: {
              lat: p.coords.latitude,
              lng: p.coords.longitude,
              precision_m: p.coords.accuracy ?? 999,
              simulada: p.mocked === true,
              actualizada: p.timestamp,
            },
          }),
        (motivo) => setEstado({ tipo: 'error', mensaje: `No se pudo leer el GPS: ${motivo}` }),
      );
    } catch (e) {
      setEstado({ tipo: 'error', mensaje: (e as Error).message });
    }
  }

  useEffect(() => {
    if (!activo) return;
    void iniciar();
    const app = AppState.addEventListener('change', (s) => {
      if (s === 'active') void iniciar();
      else { sub.current?.remove(); sub.current = null; }
    });
    return () => { app.remove(); sub.current?.remove(); sub.current = null; };
  }, [activo]);

  return { estado, reintentar: iniciar, abrirAjustes: () => Linking.openSettings() };
}
