import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../lib/colors";

/**
 * Escena 5: Características clave — 45s a 65s (1350–1950 frames)
 * Lista animada de features principales
 */

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  delay: number;
  accentColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  tag,
  tagColor,
  delay,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 150, mass: 0.9 },
    durationInFrames: 40,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateX = interpolate(progress, [0, 1], [-60, 0]);
  const scale = interpolate(progress, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        padding: "28px 32px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.07)",
        border: `1.5px solid rgba(255,255,255,0.12)`,
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "flex-start",
        gap: 22,
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.2)`,
      }}
    >
      {/* Icono */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: `${accentColor}22`,
          border: `1.5px solid ${accentColor}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Texto */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: COLORS.white,
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: "'IBM Plex Mono', monospace",
              color: tagColor,
              background: `${tagColor}20`,
              border: `1px solid ${tagColor}44`,
              padding: "2px 10px",
              borderRadius: 20,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {tag}
          </span>
        </div>
        <div
          style={{
            fontSize: 16,
            color: COLORS.whiteAlpha70,
            lineHeight: 1.55,
            fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};

export const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 160 },
    durationInFrames: 38,
  });

  const features: Omit<FeatureCardProps, "delay">[] = [
    {
      icon: "🏢",
      title: "Multi-tenant",
      description:
        "Aislamiento total entre empresas con RLS en PostgreSQL y filtro empresa_id en cada consulta del backend.",
      tag: "Seguridad",
      tagColor: "#a78bfa",
      accentColor: "#a78bfa",
    },
    {
      icon: "🚦",
      title: "Rate Limiting",
      description:
        "Protección anti-spam en la reserva pública: 5 intentos por IP en 10 min y 3 reservas por teléfono por día.",
      tag: "Anti-spam",
      tagColor: "#f97316",
      accentColor: "#f97316",
    },
    {
      icon: "💬",
      title: "Recordatorios automáticos",
      description:
        "WhatsApp 24h antes (o 2h si la cita es de corto plazo). El paciente puede confirmar, cancelar o reprogramar respondiendo al chat.",
      tag: "WhatsApp",
      tagColor: "#25D366",
      accentColor: "#25D366",
    },
    {
      icon: "📱",
      title: "PWA responsive",
      description:
        "La página pública de reserva funciona como app en cualquier celular sin instalación. Carga en menos de 2s en 4G.",
      tag: "PWA",
      tagColor: COLORS.green400,
      accentColor: COLORS.green400,
    },
    {
      icon: "📊",
      title: "Reporte CSV mensual",
      description:
        "Asistencias, inasistencias y tasa de presentación por profesional. Exportable a Excel en un clic.",
      tag: "Reportes",
      tagColor: "#60a5fa",
      accentColor: "#60a5fa",
    },
    {
      icon: "⚡",
      title: "API < 1s en p95",
      description:
        "Hono en Vercel Edge. Respuestas en el percentil 95 menores a 1 segundo. SELECT FOR UPDATE para reservas concurrentes.",
      tag: "Performance",
      tagColor: "#fbbf24",
      accentColor: "#fbbf24",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(160deg, #0d1f1a 0%, ${COLORS.navy} 50%, #0a1628 100%)`,
        display: "flex",
        flexDirection: "column",
        padding: "50px 90px",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: interpolate(titleProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleProgress, [0, 1], [-30, 0])}px)`,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontFamily: "'IBM Plex Mono', monospace",
            color: COLORS.green400,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Caracteristicas clave
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Todo lo que tu clinica necesita
        </div>
      </div>

      {/* Grid de features 2 columnas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          flex: 1,
        }}
      >
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} delay={15 + i * 20} />
        ))}
      </div>
    </div>
  );
};
