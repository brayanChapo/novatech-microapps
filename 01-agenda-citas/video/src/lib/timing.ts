/**
 * Constantes de timing por escena
 * Video: 90 segundos @ 30fps = 2700 frames
 */

export const FPS = 30;
export const TOTAL_DURATION_S = 90;
export const TOTAL_FRAMES = TOTAL_DURATION_S * FPS; // 2700

/** Inicio y duración de cada escena en segundos */
export const SCENES = {
  intro: { startS: 0, durationS: 5 },
  problema: { startS: 5, durationS: 10 },
  solucion: { startS: 15, durationS: 15 },
  arquitectura: { startS: 30, durationS: 15 },
  features: { startS: 45, durationS: 20 },
  stack: { startS: 65, durationS: 10 },
  cta: { startS: 75, durationS: 15 },
} as const;

/** Convertir segundos a frames */
export function sToF(seconds: number): number {
  return Math.round(seconds * FPS);
}

/** Inicio y duración de cada escena en frames */
export const SCENE_FRAMES = Object.fromEntries(
  Object.entries(SCENES).map(([key, { startS, durationS }]) => [
    key,
    { start: sToF(startS), duration: sToF(durationS) },
  ])
) as Record<
  keyof typeof SCENES,
  { start: number; duration: number }
>;

/** Configuración de spring compartida para entradas suaves */
export const SPRING_CONFIG = {
  fast: { damping: 20, stiffness: 200, mass: 0.8 },
  normal: { damping: 25, stiffness: 150, mass: 1 },
  slow: { damping: 30, stiffness: 100, mass: 1.2 },
} as const;
