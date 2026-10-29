import React from "react";
import { COLORS } from "../lib/colors";

interface NovaTechLogoProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

/**
 * Logo SVG de NovaTech en React
 * Icono: hexágono con letra N estilizada
 */
export const NovaTechLogo: React.FC<NovaTechLogoProps> = ({
  size = 80,
  color = COLORS.white,
  accentColor = COLORS.green400,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexágono fondo */}
      <polygon
        points="40,4 74,22 74,58 40,76 6,58 6,22"
        fill={COLORS.green600}
        stroke={accentColor}
        strokeWidth="2"
      />
      {/* Letra N estilizada */}
      <path
        d="M22 56V24H29L40 43V24H51V56H44L33 37V56H22Z"
        fill={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Punto de acento */}
      <circle cx="56" cy="28" r="4" fill={accentColor} />
    </svg>
  );
};
