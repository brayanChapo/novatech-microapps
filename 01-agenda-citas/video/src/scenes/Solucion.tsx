import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Card } from "../components/Card";
import { AnimatedText } from "../components/AnimatedText";
import { COLORS } from "../lib/colors";

/**
 * Escena 3: La solución — 15s a 30s (450–900 frames)
 * Flujo de reserva en 3 pasos animados + confirmación WhatsApp
 */

interface StepProps {
  step: number;
  title: string;
  description: string;
  icon: string;
  delay: number;
  isActive: boolean;
}

const Step: React.FC<StepProps> = ({
  step,
  title,
  description,
  icon,
  delay,
  isActive,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 150, mass: 0.9 },
    durationInFrames: 40,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const translateY = interpolate(progress, [0, 1], [50, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        flex: 1,
      }}
    >
      <div
        style={{
          padding: "32px 28px",
          borderRadius: 20,
          background: isActive
            ? `linear-gradient(135deg, ${COLORS.green700}, ${COLORS.green600})`
            : "rgba(255,255,255,0.1)",
          border: isActive
            ? `2px solid ${COLORS.green400}`
            : "1.5px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
          boxShadow: isActive
            ? `0 8px 32px rgba(22,163,74,0.35)`
            : "0 4px 16px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 16,
          height: "100%",
        }}
      >
        {/* Número de paso */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: isActive
              ? COLORS.whiteAlpha20
              : COLORS.green600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.white,
            fontFamily: "'IBM Plex Mono', monospace",
            flexShrink: 0,
          }}
        >
          {step}
        </div>

        {/* Icono */}
        <div style={{ fontSize: 42 }}>{icon}</div>

        {/* Título */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.white,
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        {/* Descripción */}
        <div
          style={{
            fontSize: 17,
            color: isActive ? COLORS.green100 : COLORS.whiteAlpha70,
            lineHeight: 1.5,
            fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export const Solucion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 160 },
    durationInFrames: 40,
  });

  // Paso activo: cambia dinámicamente según el frame
  const activeStep = frame < 120 ? 0 : frame < 240 ? 1 : 2;

  // Conector de flecha entre pasos
  const arrowProgress = spring({
    frame: frame - 70,
    fps,
    config: { damping: 25, stiffness: 120 },
    durationInFrames: 35,
  });

  // Burbuja de WhatsApp de confirmación
  const waProgress = spring({
    frame: frame - 310,
    fps,
    config: { damping: 20, stiffness: 140 },
    durationInFrames: 40,
  });

  const steps = [
    {
      icon: "🗓️",
      title: "Elige tu turno",
      description: "Sin app, sin cuenta. Solo un enlace. Selecciona profesional, servicio y horario disponible.",
    },
    {
      icon: "📝",
      title: "Tus datos",
      description: "Solo nombre y celular. Sin contraseñas. El formulario valida el teléfono en tiempo real.",
    },
    {
      icon: "✅",
      title: "Confirma",
      description: "La cita queda registrada al instante. Recibes confirmación inmediata por WhatsApp.",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(150deg, #0a1628 0%, ${COLORS.navy} 50%, #0d2818 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "55px 90px 50px",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [40, 0])}px)`,
          textAlign: "center",
          marginBottom: 48,
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontFamily: "'IBM Plex Mono', monospace",
            color: COLORS.green400,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          La solución
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Reserva en{" "}
          <span style={{ color: COLORS.green400 }}>3 pasos</span>{" "}
          desde el celular
        </div>
      </div>

      {/* Pasos */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "100%",
          maxWidth: 1500,
          alignItems: "stretch",
        }}
      >
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <Step
              step={i + 1}
              title={s.title}
              description={s.description}
              icon={s.icon}
              delay={20 + i * 35}
              isActive={activeStep === i}
            />
            {i < 2 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  opacity: interpolate(arrowProgress, [0, 1], [0, 1]),
                  flexShrink: 0,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M6 16H26M26 16L18 8M26 16L18 24"
                    stroke={COLORS.green400}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Burbuja WhatsApp de confirmación */}
      <AnimatedText delay={310} direction="up" distance={40}>
        <div
          style={{
            marginTop: 36,
            padding: "18px 28px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #25D366, #128C7E)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 6px 24px rgba(37,211,102,0.3)",
          }}
        >
          <div style={{ fontSize: 28 }}>📱</div>
          <div style={{ color: COLORS.white }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 3 }}>
              WhatsApp — Confirmacion instantanea
            </div>
            <div
              style={{
                fontSize: 15,
                opacity: 0.9,
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              "Hola Maria! Tu cita con Dr. Gomez esta confirmada para el lunes 9 de nov. a las 10:00 a.m."
            </div>
          </div>
        </div>
      </AnimatedText>
    </div>
  );
};
