import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { StackLogo } from "../components/StackLogo";
import { COLORS } from "../lib/colors";

/**
 * Escena 6: Stack tecnológico — 65s a 75s (1950–2250 frames)
 * Logos animados de Hono, Next.js, Supabase, Vercel, Meta WhatsApp
 */

// SVGs minimalistas para cada tecnología
const HonoIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="12" fill="transparent" />
    <path d="M26 6L8 18V34L26 46L44 34V18L26 6Z" fill="#FF6B35" opacity="0.9" />
    <path d="M26 14L16 20V32L26 38L36 32V20L26 14Z" fill="#FF8C5A" />
    <circle cx="26" cy="26" r="6" fill="white" opacity="0.9" />
  </svg>
);

const NextJsIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="24" fill="#000000" />
    <path
      d="M16 34V18H20L29 30V18H33V34H29L20 22V34H16Z"
      fill="white"
    />
  </svg>
);

const SupabaseIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path
      d="M26 6L10 38H24V46L42 14H28V6H26Z"
      fill="url(#sb-grad)"
    />
    <defs>
      <linearGradient id="sb-grad" x1="26" y1="6" x2="26" y2="46" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3ECF8E" />
        <stop offset="1" stopColor="#1A7F4B" />
      </linearGradient>
    </defs>
  </svg>
);

const VercelIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <path d="M26 8L46 42H6L26 8Z" fill="white" />
  </svg>
);

const WhatsAppIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="24" fill="#25D366" />
    <path
      d="M26 12C18.28 12 12 18.28 12 26C12 28.72 12.76 31.28 14.1 33.46L12 40L18.72 37.92C20.84 39.16 23.34 39.88 26 39.88C33.72 39.88 40 33.6 40 25.88C40 18.28 33.72 12 26 12ZM33.1 31.28C32.78 32.2 31.34 33 30.28 33.2C29.46 33.38 28.4 33.44 27.24 33.06C26.54 32.82 25.66 32.5 24.52 31.98C19.94 29.84 17.1 25.18 16.9 24.92C16.7 24.66 15.2 22.7 15.2 20.66C15.2 18.62 16.2 17.62 16.56 17.24C16.88 16.88 17.28 16.76 17.54 16.76H18.2C18.52 16.76 18.94 16.64 19.34 17.62L20.62 20.76C20.74 21.06 20.82 21.4 20.56 21.7L20.02 22.34C19.76 22.64 19.5 22.96 19.76 23.46C20.76 25.26 21.96 26.72 23.46 27.92C24.94 29.12 26.26 29.62 26.84 29.88C27.28 30.06 27.66 30.02 27.96 29.7L28.8 28.74C29.08 28.42 29.42 28.3 29.74 28.42L32.8 29.94C33.14 30.08 33.38 30.22 33.42 30.42C33.54 30.72 33.42 30.34 33.1 31.28Z"
      fill="white"
    />
  </svg>
);

const TypeScriptIcon: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <rect x="4" y="4" width="44" height="44" rx="6" fill="#3178C6" />
    <path
      d="M22 22H12V26H16V40H20V26H24V22H22Z"
      fill="white"
    />
    <path
      d="M32 22C29.8 22 28 23.8 28 26C28 28.2 29.4 29.3 31.6 30.4L33.2 31.2C34.2 31.7 34.8 32.2 34.8 33C34.8 33.8 34.2 34.3 33.2 34.3C32 34.3 31.2 33.6 30.6 32.4L27.6 34.1C28.6 36.1 30.5 37.4 33.2 37.4C36 37.4 38 35.8 38 33.1C38 30.8 36.7 29.6 34.4 28.4L32.8 27.6C31.8 27.1 31.2 26.6 31.2 25.8C31.2 25.2 31.7 24.7 32.5 24.7C33.4 24.7 33.9 25.2 34.4 26L37.2 24.3C36.2 22.6 34.4 22 32 22Z"
      fill="white"
    />
  </svg>
);

export const Stack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 160 },
    durationInFrames: 38,
  });

  // Línea de separación animada
  const lineProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 25, stiffness: 120 },
    durationInFrames: 40,
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 700]);

  const stackItems = [
    {
      name: "Hono",
      icon: <HonoIcon />,
      delay: 20,
      bgColor: "rgba(255,107,53,0.18)",
    },
    {
      name: "Next.js 16",
      icon: <NextJsIcon />,
      delay: 35,
      bgColor: "rgba(255,255,255,0.1)",
    },
    {
      name: "Supabase",
      icon: <SupabaseIcon />,
      delay: 50,
      bgColor: "rgba(62,207,142,0.15)",
    },
    {
      name: "Vercel",
      icon: <VercelIcon />,
      delay: 65,
      bgColor: "rgba(255,255,255,0.08)",
    },
    {
      name: "WhatsApp API",
      icon: <WhatsAppIcon />,
      delay: 80,
      bgColor: "rgba(37,211,102,0.15)",
    },
    {
      name: "TypeScript",
      icon: <TypeScriptIcon />,
      delay: 95,
      bgColor: "rgba(49,120,198,0.18)",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(145deg, ${COLORS.navy} 0%, #0d1a10 60%, #061014 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 90px",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow de fondo */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.green700}30 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 56,
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [-30, 0])}px)`,
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
          Stack tecnologico
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
          Construido con lo{" "}
          <span style={{ color: COLORS.green400 }}>mejor</span> del ecosistema
        </div>

        <div
          style={{
            width: lineWidth,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.green400}, transparent)`,
            borderRadius: 2,
            margin: "20px auto 0",
          }}
        />
      </div>

      {/* Grid de logos */}
      <div
        style={{
          display: "flex",
          gap: 50,
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-end",
          zIndex: 10,
        }}
      >
        {stackItems.map((item, i) => (
          <StackLogo
            key={i}
            name={item.name}
            icon={item.icon}
            delay={item.delay}
            color={COLORS.white}
            bgColor={item.bgColor}
          />
        ))}
      </div>

      {/* Badge TypeScript strict */}
      <div
        style={{
          marginTop: 48,
          padding: "10px 24px",
          borderRadius: 24,
          background: "rgba(49,120,198,0.18)",
          border: "1.5px solid rgba(49,120,198,0.35)",
          color: "#93c5fd",
          fontSize: 15,
          fontFamily: "'IBM Plex Mono', monospace",
          opacity: interpolate(
            spring({
              frame: frame - 120,
              fps,
              config: { damping: 22, stiffness: 130 },
            }),
            [0, 1],
            [0, 1]
          ),
        }}
      >
        TypeScript strict: true · Vitest · Zod schemas
      </div>
    </div>
  );
};
