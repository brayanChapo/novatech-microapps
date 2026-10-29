/**
 * Paleta de colores del design system NovaTech
 * App 01 — Agenda de Citas + Recordatorios WhatsApp
 */

export const COLORS = {
  // Verde principal
  green600: "#16a34a",
  green700: "#15803d",
  green500: "#22c55e",
  green400: "#4ade80",
  green300: "#86efac",
  green100: "#dcfce7",
  green50: "#f0fdf4",

  // Marino / Azul oscuro
  navy: "#1e3a5f",
  navyLight: "#2d5a8a",

  // Texto
  slate800: "#1e293b",
  slate600: "#475569",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",

  // Blancos
  white: "#ffffff",
  whiteAlpha90: "rgba(255,255,255,0.9)",
  whiteAlpha70: "rgba(255,255,255,0.7)",
  whiteAlpha20: "rgba(255,255,255,0.2)",
  whiteAlpha10: "rgba(255,255,255,0.1)",

  // Fondos
  bgMain: "#f0fdf4",
  bgCard: "rgba(255,255,255,0.85)",
  bgDark: "#0f2027",
  bgGradientStart: "#1e3a5f",
  bgGradientEnd: "#15803d",

  // Overlays glassmorphism
  glass: "rgba(255,255,255,0.15)",
  glassBorder: "rgba(255,255,255,0.25)",
} as const;

export type ColorKey = keyof typeof COLORS;
