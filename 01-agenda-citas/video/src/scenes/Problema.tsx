import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../lib/colors";

/**
 * Escena 2: El problema — 5s a 15s (150–450 frames)
 * Muestra el problema que resuelve la app con animaciones de texto
 */

const problemItems = [
  { icon: "📅", text: "Pacientes que no recuerdan su cita", color: "#ef4444" },
  { icon: "📵", text: "Sin aviso, el slot queda desperdiciado", color: "#f97316" },
  { icon: "💸", text: "Ingresos perdidos irrecuperables", color: "#eab308" },
  { icon: "📋", text: "Agendas manuales en papel o Excel", color: "#ef4444" },
];

export const Problema: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Título principal
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 160, mass: 0.9 },
    durationInFrames: 40,
  });

  const titleY = interpolate(titleProgress, [0, 1], [60, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Icono de alerta pulsante
  const pulseScale = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.92, 1.08]
  );

  // Estadística animada
  const statProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 18, stiffness: 140 },
    durationInFrames: 35,
  });
  const statValue = interpolate(statProgress, [0, 1], [0, 30]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(160deg, ${COLORS.slate800} 0%, ${COLORS.navy} 60%, #0f1e2e 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 100px",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Línea vertical decorativa izquierda */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(to bottom, transparent, #ef4444, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Header */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 50,
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#ef4444",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          El problema
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Las clínicas pierden hasta un{" "}
          <span
            style={{
              color: "#ef4444",
              display: "inline-block",
              transform: `scale(${pulseScale})`,
            }}
          >
            {Math.round(statValue)}%
          </span>{" "}
          de sus citas por inasistencias
        </div>
      </div>

      {/* Lista de problemas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          width: "100%",
          maxWidth: 1400,
        }}
      >
        {problemItems.map((item, i) => (
          <AnimatedText
            key={i}
            delay={20 + i * 15}
            direction="left"
            distance={50}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "24px 32px",
                borderRadius: 16,
                background: "rgba(239,68,68,0.08)",
                border: `1.5px solid rgba(239,68,68,0.22)`,
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  fontSize: 38,
                  flexShrink: 0,
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                }}
              >
                {item.icon}
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: COLORS.whiteAlpha90,
                  fontWeight: 500,
                  lineHeight: 1.35,
                }}
              >
                {item.text}
              </div>
            </div>
          </AnimatedText>
        ))}
      </div>

      {/* Tagline final */}
      <AnimatedText delay={80} direction="up" distance={30}>
        <div
          style={{
            marginTop: 44,
            fontSize: 22,
            color: COLORS.green300,
            fontWeight: 500,
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          Cada cita perdida es dinero que no vuelve
        </div>
      </AnimatedText>
    </div>
  );
};
