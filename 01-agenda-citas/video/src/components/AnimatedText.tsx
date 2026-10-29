import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
  style?: React.CSSProperties;
  springConfig?: { damping: number; stiffness: number; mass: number };
}

/**
 * Helper para animar texto con spring al entrar en cuadro.
 * delay: frames a esperar antes de iniciar la animación
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  direction = "up",
  distance = 40,
  style,
  springConfig = { damping: 20, stiffness: 180, mass: 0.9 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: springConfig,
    durationInFrames: 40,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);

  let translateX = 0;
  let translateY = 0;

  if (direction === "up") {
    translateY = interpolate(progress, [0, 1], [distance, 0]);
  } else if (direction === "down") {
    translateY = interpolate(progress, [0, 1], [-distance, 0]);
  } else if (direction === "left") {
    translateX = interpolate(progress, [0, 1], [distance, 0]);
  } else if (direction === "right") {
    translateX = interpolate(progress, [0, 1], [-distance, 0]);
  }

  return (
    <div
      style={{
        opacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
