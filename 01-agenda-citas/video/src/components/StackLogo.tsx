import React from "react";
import {
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { COLORS } from "../lib/colors";

interface StackLogoProps {
  name: string;
  icon: React.ReactNode;
  delay?: number;
  color?: string;
  bgColor?: string;
}

/**
 * Componente de logo de tecnología con nombre y animación de entrada.
 */
export const StackLogo: React.FC<StackLogoProps> = ({
  name,
  icon,
  delay = 0,
  color = COLORS.white,
  bgColor = "rgba(255,255,255,0.12)",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.8 },
    durationInFrames: 35,
  });

  const scale = interpolate(progress, [0, 1], [0.4, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [30, 0]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: 22,
          background: bgColor,
          border: `1.5px solid rgba(255,255,255,0.22)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          color,
          fontSize: 18,
          fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
          fontWeight: 600,
          letterSpacing: "0.02em",
          textAlign: "center",
        }}
      >
        {name}
      </span>
    </div>
  );
};
