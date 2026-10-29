import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../lib/colors";

/**
 * Escena 4: Arquitectura — 30s a 45s (900–1350 frames)
 * Diagrama animado: Next.js -> Hono API -> Supabase -> WhatsApp Meta API
 */

interface NodeProps {
  label: string;
  sublabel?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  delay: number;
  x: number;
  y: number;
  width?: number;
}

const ArchNode: React.FC<NodeProps> = ({
  label,
  sublabel,
  color,
  bgColor,
  borderColor,
  icon,
  delay,
  x,
  y,
  width = 220,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.8 },
    durationInFrames: 40,
  });

  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          padding: "20px 18px",
          borderRadius: 16,
          background: bgColor,
          border: `2px solid ${borderColor}`,
          backdropFilter: "blur(10px)",
          boxShadow: `0 6px 24px ${borderColor}44`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 36 }}>{icon}</div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color,
            textAlign: "center",
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div
            style={{
              fontSize: 13,
              color: `${color}bb`,
              textAlign: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              lineHeight: 1.3,
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};

interface ArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  label?: string;
  color?: string;
  dashed?: boolean;
}

const AnimatedArrow: React.FC<ArrowProps> = ({
  x1,
  y1,
  x2,
  y2,
  delay,
  label,
  color = COLORS.green400,
  dashed = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 130 },
    durationInFrames: 40,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  // Interpolamos el punto final desde el punto medio
  const currentX2 = interpolate(progress, [0, 1], [x1, x2]);
  const currentY2 = interpolate(progress, [0, 1], [y1, y2]);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
    >
      <defs>
        <marker
          id={`arrowhead-${delay}`}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={currentX2}
        y2={currentY2}
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={dashed ? "8 5" : "none"}
        markerEnd={`url(#arrowhead-${delay})`}
        opacity={0.85}
      />
      {label && progress > 0.7 && (
        <text
          x={midX}
          y={midY - 10}
          fill={color}
          fontSize="13"
          textAnchor="middle"
          fontFamily="'IBM Plex Mono', monospace"
          opacity={interpolate(progress, [0.7, 1], [0, 1])}
        >
          {label}
        </text>
      )}
    </svg>
  );
};

export const Arquitectura: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 160 },
    durationInFrames: 38,
  });

  // Layout: diagrama centrado horizontalmente
  // Posiciones de nodos (1920x1080, padding 90px)
  // Fila 1: Paciente, Next.js PWA
  // Fila 2: Hono API (centro)
  // Fila 3: Supabase, WhatsApp, Resend
  // Fila 4: Vercel Cron

  const W = 1920;
  const H = 1080;
  const nodeW = 210;
  const rowY = [160, 340, 560, 760];

  const nodes = {
    paciente: { x: 120, y: rowY[0] },
    nextjs: { x: 420, y: rowY[0] },
    hono: { x: W / 2 - nodeW / 2, y: rowY[1] },
    supabase: { x: 290, y: rowY[2] },
    whatsapp: { x: W / 2 - nodeW / 2, y: rowY[2] },
    resend: { x: W - 290 - nodeW, y: rowY[2] },
    cron: { x: W - 290 - nodeW, y: rowY[1] },
  };

  // Centro de cada nodo para las flechas
  const nc = (key: keyof typeof nodes) => ({
    cx: nodes[key].x + nodeW / 2,
    cy: nodes[key].y + 90,
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `radial-gradient(ellipse at center, #0e2030 0%, #080f1a 100%)`,
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fondo grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(22,163,74,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(22,163,74,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.6,
        }}
      />

      {/* Título */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
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
            marginBottom: 8,
          }}
        >
          Arquitectura
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: "-0.01em",
          }}
        >
          Stack cloud-native en Vercel + Supabase
        </div>
      </div>

      {/* Flechas — dibujadas antes de nodos para quedar debajo */}
      <AnimatedArrow
        x1={nc("nextjs").cx}
        y1={nc("nextjs").cy}
        x2={nc("hono").cx}
        y2={nc("hono").cy - 90}
        delay={60}
        label="HTTPS + JWT"
        color={COLORS.green400}
      />
      <AnimatedArrow
        x1={nc("hono").cx}
        y1={nc("hono").cy}
        x2={nc("supabase").cx}
        y2={nc("supabase").cy - 90}
        delay={90}
        label="service_role"
        color="#a78bfa"
      />
      <AnimatedArrow
        x1={nc("hono").cx}
        y1={nc("hono").cy}
        x2={nc("whatsapp").cx}
        y2={nc("whatsapp").cy - 90}
        delay={110}
        label="plantillas"
        color="#25D366"
      />
      <AnimatedArrow
        x1={nc("hono").cx}
        y1={nc("hono").cy}
        x2={nc("resend").cx}
        y2={nc("resend").cy - 90}
        delay={130}
        label="correo"
        color="#f59e0b"
      />
      <AnimatedArrow
        x1={nc("cron").cx}
        y1={nc("cron").cy}
        x2={nc("hono").cx + 110}
        y2={nc("hono").cy - 40}
        delay={150}
        label="cada hora"
        color="#60a5fa"
        dashed
      />
      <AnimatedArrow
        x1={nc("whatsapp").cx}
        y1={nc("whatsapp").cy}
        x2={nc("hono").cx}
        y2={nc("hono").cy + 20}
        delay={170}
        label="webhook"
        color="#25D366"
        dashed
      />

      {/* Nodos */}
      <ArchNode
        label="Paciente"
        sublabel="sin cuenta"
        icon="🧑‍💻"
        color={COLORS.white}
        bgColor="rgba(255,255,255,0.08)"
        borderColor="rgba(255,255,255,0.2)"
        delay={10}
        x={nodes.paciente.x}
        y={nodes.paciente.y}
      />
      <ArchNode
        label="Next.js PWA"
        sublabel="agenda.novatech.pe"
        icon="⚛️"
        color={COLORS.white}
        bgColor="rgba(22,163,74,0.15)"
        borderColor={COLORS.green600}
        delay={20}
        x={nodes.nextjs.x}
        y={nodes.nextjs.y}
      />
      <ArchNode
        label="Hono API"
        sublabel="Vercel · TypeScript"
        icon="⚡"
        color={COLORS.white}
        bgColor="rgba(22,163,74,0.25)"
        borderColor={COLORS.green400}
        delay={40}
        x={nodes.hono.x}
        y={nodes.hono.y}
        width={nodeW}
      />
      <ArchNode
        label="Supabase"
        sublabel="PostgreSQL + RLS"
        icon="🗄️"
        color="#a78bfa"
        bgColor="rgba(167,139,250,0.12)"
        borderColor="#a78bfa"
        delay={90}
        x={nodes.supabase.x}
        y={nodes.supabase.y}
      />
      <ArchNode
        label="WhatsApp"
        sublabel="Meta Business API"
        icon="💬"
        color="#25D366"
        bgColor="rgba(37,211,102,0.12)"
        borderColor="#25D366"
        delay={110}
        x={nodes.whatsapp.x}
        y={nodes.whatsapp.y}
        width={nodeW}
      />
      <ArchNode
        label="Resend"
        sublabel="correo transaccional"
        icon="✉️"
        color="#f59e0b"
        bgColor="rgba(245,158,11,0.12)"
        borderColor="#f59e0b"
        delay={130}
        x={nodes.resend.x}
        y={nodes.resend.y}
      />
      <ArchNode
        label="Vercel Cron"
        sublabel="recordatorios / hora"
        icon="⏰"
        color="#60a5fa"
        bgColor="rgba(96,165,250,0.12)"
        borderColor="#60a5fa"
        delay={150}
        x={nodes.cron.x}
        y={nodes.cron.y}
      />

      {/* Flecha Paciente -> Next.js */}
      <AnimatedArrow
        x1={nc("paciente").cx + nodeW / 2 - 15}
        y1={nc("paciente").cy - 40}
        x2={nodes.nextjs.x}
        y2={nc("nextjs").cy - 40}
        delay={30}
        label="reserva"
        color={COLORS.slate400}
      />

      {/* Leyenda multi-tenant */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {[
          { icon: "🔒", text: "RLS por empresa_id" },
          { icon: "🏢", text: "Multi-tenant" },
          { icon: "🌎", text: "Vercel Edge Network" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: COLORS.whiteAlpha70,
              fontSize: 14,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
