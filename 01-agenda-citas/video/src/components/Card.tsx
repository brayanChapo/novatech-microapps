import React from "react";
import { COLORS } from "../lib/colors";

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  variant?: "glass" | "solid" | "dark";
  padding?: number;
  borderRadius?: number;
}

/**
 * Tarjeta con glassmorphism para el design system NovaTech
 */
export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "glass",
  padding = 40,
  borderRadius = 20,
}) => {
  const variants: Record<string, React.CSSProperties> = {
    glass: {
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(16px)",
      border: `1.5px solid rgba(255,255,255,0.28)`,
      boxShadow:
        "0 8px 32px rgba(22,163,74,0.18), 0 2px 8px rgba(0,0,0,0.12)",
    },
    solid: {
      background: COLORS.white,
      border: `1.5px solid ${COLORS.green100}`,
      boxShadow: "0 4px 24px rgba(22,163,74,0.12)",
    },
    dark: {
      background: "rgba(15,32,39,0.82)",
      backdropFilter: "blur(20px)",
      border: `1.5px solid rgba(255,255,255,0.12)`,
      boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
    },
  };

  return (
    <div
      style={{
        padding,
        borderRadius,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
};
