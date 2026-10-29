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
 * Escena 7: CTA — 75s a 90s (2250–2700 frames)
 * NovaTech · Soluciones SaaS para PYMEs peruanas + contacto
 */

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fondo animado con partículas
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Logo y tagline
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 180, mass: 0.8 },
    durationInFrames: 45,
  });

  // Headline
  const headlineProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20, stiffness: 160, mass: 0.9 },
    durationInFrames: 42,
  });

  // Subtítulo
  const subProgress = spring({
    frame: frame - 45,
    fps,
    config: { damping: 22, stiffness: 140 },
    durationInFrames: 40,
  });

  // Tarjetas de contacto
  const contactProgress = spring({
    frame: frame - 70,
    fps,
    config: { damping: 25, stiffness: 130 },
    durationInFrames: 40,
  });

  // Tagline inferior pulsante
  const pulseOpacity = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.5),
    [-1, 1],
    [0.7, 1]
  );

  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  // Badge "App 01 de 15" que aparece rotando
  const badgeProgress = spring({
    frame: frame - 90,
    fps,
    config: { damping: 20, stiffness: 150 },
    durationInFrames: 38,
  });

  const contactItems = [
    { icon: "🌐", label: "Web", value: "novatechconsulting.com.pe" },
    { icon: "📧", label: "Email", value: "hola@novatechconsulting.com.pe" },
    { icon: "📍", label: "Ubicacion", value: "Lima, Peru" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, #0a1a0f 50%, ${COLORS.green700} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 100px",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
        opacity: bgOpacity,
      }}
    >
      {/* Círculos decorativos */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          border: `1px solid rgba(22,163,74,0.15)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: `1px solid rgba(22,163,74,0.12)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.green600}18 0%, transparent 70%)`,
          top: "20%",
          right: "10%",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          marginBottom: 28,
        }}
      >
        <NovaTechLogo size={100} color={COLORS.white} accentColor={COLORS.green400} />
      </div>

      {/* Headline principal */}
      <div
        style={{
          opacity: interpolate(headlineProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headlineProgress, [0, 1], [50, 0])}px)`,
          textAlign: "center",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
          }}
        >
          NovaTech Consulting
        </div>
      </div>

      {/* Subtítulo */}
      <div
        style={{
          opacity: interpolate(subProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(subProgress, [0, 1], [30, 0])}px)`,
          textAlign: "center",
          marginBottom: 44,
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: COLORS.green300,
            lineHeight: 1.4,
            letterSpacing: "0.01em",
          }}
        >
          Soluciones SaaS para PYMEs peruanas
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 18,
            color: COLORS.whiteAlpha70,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          Digitaliza tu clinica. Reduce inasistencias. Haz crecer tu negocio.
        </div>
      </div>

      {/* Tarjetas de contacto */}
      <div
        style={{
          opacity: interpolate(contactProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(contactProgress, [0, 1], [30, 0])}px)`,
          display: "flex",
          gap: 28,
          marginBottom: 44,
        }}
      >
        {contactItems.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "16px 26px",
              borderRadius: 14,
              background: COLORS.glass,
              border: `1.5px solid ${COLORS.glassBorder}`,
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: COLORS.green400,
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: COLORS.white,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: 500,
                }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Badge App 01 de 15 */}
      <div
        style={{
          opacity: interpolate(badgeProgress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(badgeProgress, [0, 1], [0.7, 1])})`,
          padding: "10px 28px",
          borderRadius: 30,
          background: `linear-gradient(90deg, ${COLORS.green700}, ${COLORS.green600})`,
          border: `2px solid ${COLORS.green400}`,
          color: COLORS.white,
          fontSize: 16,
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.08em",
          boxShadow: "0 4px 20px rgba(22,163,74,0.4)",
          marginBottom: 28,
        }}
      >
        App 01 de 15 · Suite NovaTech MicroApps
      </div>

      {/* Tagline inferior pulsante */}
      <div
        style={{
          opacity: pulseOpacity,
          fontSize: 16,
          color: COLORS.whiteAlpha70,
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        novatechconsulting.com.pe
      </div>
    </div>
  );
};
