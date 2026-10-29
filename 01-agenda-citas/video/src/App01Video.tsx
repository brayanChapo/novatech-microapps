import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Intro } from "./scenes/Intro";
import { Problema } from "./scenes/Problema";
import { Solucion } from "./scenes/Solucion";
import { Arquitectura } from "./scenes/Arquitectura";
import { Features } from "./scenes/Features";
import { Stack } from "./scenes/Stack";
import { CTA } from "./scenes/CTA";
import { SCENE_FRAMES } from "./lib/timing";

/**
 * Composición principal del video App 01 — Agenda de Citas + Recordatorios WhatsApp
 *
 * Duración total: 90 segundos @ 30fps = 2700 frames
 * Resolución: 1920 × 1080 (16:9)
 *
 * Escenas:
 *  Intro        —  0s -  5s (  0 -  150 frames)
 *  Problema     —  5s - 15s (150 -  450 frames)
 *  Solucion     — 15s - 30s (450 -  900 frames)
 *  Arquitectura — 30s - 45s (900 - 1350 frames)
 *  Features     — 45s - 65s (1350 - 1950 frames)
 *  Stack        — 65s - 75s (1950 - 2250 frames)
 *  CTA          — 75s - 90s (2250 - 2700 frames)
 */
export const App01Video: React.FC = () => {
  // Aceder a la config para validaciones si se necesita
  const { width, height, fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Escena 1: Intro */}
      <Sequence
        from={SCENE_FRAMES.intro.start}
        durationInFrames={SCENE_FRAMES.intro.duration}
        name="Intro"
      >
        <AbsoluteFill>
          <Intro />
        </AbsoluteFill>
      </Sequence>

      {/* Escena 2: El problema */}
      <Sequence
        from={SCENE_FRAMES.problema.start}
        durationInFrames={SCENE_FRAMES.problema.duration}
        name="Problema"
      >
        <AbsoluteFill>
          <Problema />
        </AbsoluteFill>
      </Sequence>

      {/* Escena 3: La solución */}
      <Sequence
        from={SCENE_FRAMES.solucion.start}
        durationInFrames={SCENE_FRAMES.solucion.duration}
        name="Solucion"
      >
        <AbsoluteFill>
          <Solucion />
        </AbsoluteFill>
      </Sequence>

      {/* Escena 4: Arquitectura */}
      <Sequence
        from={SCENE_FRAMES.arquitectura.start}
        durationInFrames={SCENE_FRAMES.arquitectura.duration}
        name="Arquitectura"
      >
        <AbsoluteFill>
          <Arquitectura />
        </AbsoluteFill>
      </Sequence>

      {/* Escena 5: Características clave */}
      <Sequence
        from={SCENE_FRAMES.features.start}
        durationInFrames={SCENE_FRAMES.features.duration}
        name="Features"
      >
        <AbsoluteFill>
          <Features />
        </AbsoluteFill>
      </Sequence>

      {/* Escena 6: Stack tecnológico */}
      <Sequence
        from={SCENE_FRAMES.stack.start}
        durationInFrames={SCENE_FRAMES.stack.duration}
        name="Stack"
      >
        <AbsoluteFill>
          <Stack />
        </AbsoluteFill>
      </Sequence>

      {/* Escena 7: CTA */}
      <Sequence
        from={SCENE_FRAMES.cta.start}
        durationInFrames={SCENE_FRAMES.cta.duration}
        name="CTA"
      >
        <AbsoluteFill>
          <CTA />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
