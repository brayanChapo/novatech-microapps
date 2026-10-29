import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NovaTechLogo } from "../components/NovaTechLogo";
import { COLORS } from "../lib/colors";

/**
 * Escena 1: Intro — 0 a 5s (0–150 frames)
 * Logo NovaTech + título App 01
 */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entra con spring
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.8 },
    durationInFrames: 45,
  });

  // Texto principal entra después
  const titleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 22, stiffness: 160, mass: 1 },
    durationInFrames: 40,
  });

  // Subtítulo tarda más
  const subtitleProgress = spring({
    frame: frame - 38,
    fps,
    config: { damping: 25, stiffness: 140, mass: 1 },
    durationInFrames: 38,
  });

  // Línea decorativa
  const lineWidth = interpolate(
    spring({
      frame: frame - 50,
      fps,
      config: { damping: 20, stiffness: 120 },
      durationInFrames: 40,
    }),
    [0, 1],
    [0, 320]
  );

  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  const subtitleY = interpolate(subtitleProgress, [0, 1], [30, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  // Partículas decorativas de fondo
  const particleOpacity = interpolate(frame, [0, 30], [0, 0.4], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.green700} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      }}
    >
      {/* Círculos decorativos de fondo */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `1px solid ${COLORS.whiteAlpha10}`,
          top: -100,
          right: -100,
          opacity: particleOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: `1px solid ${COLORS.whiteAlpha10}`,
          bottom: -80,
          left: -80,
          opacity: particleOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.green400}22 0%, transparent 70%)`,
          top: "20%",
          right: "15%",
          opacity: particleOpacity,
        }}
      />

      {/* Contenido principal */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        >
          <NovaTechLogo size={120} color={COLORS.white} accentColor={COLORS.green400} />
        </div>

        {/* Título "NovaTech" */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: COLORS.green400,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              marginBottom: 12,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            NovaTech Consulting
          </div>
          <div
            style={{
              fontSize: 58,
              fontWeight: 700,
              color: COLORS.white,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            App 01
          </div>
        </div>

        {/* Línea divisoria */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.green400}, transparent)`,
            borderRadius: 2,
          }}
        />

        {/* Subtítulo */}
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: COLORS.whiteAlpha90,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            Agenda de Citas
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: COLORS.green300,
              lineHeight: 1.3,
            }}
          >
            + Recordatorios WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
};
