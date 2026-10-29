import React from "react";
import { Composition, registerRoot } from "remotion";
import { App01Video } from "./App01Video";
import { TOTAL_FRAMES, FPS } from "./lib/timing";

/**
 * Root de Remotion — registro de composiciones
 * Entrypoint: src/Root.tsx
 */
const RemotionRoot: React.FC = () => {
  return (
    <>
      {/**
       * Composición principal: video completo de 90 segundos
       * 1920 x 1080 @ 30fps = 2700 frames
       */}
      <Composition
        id="App01Video"
        component={App01Video}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/**
       * Composición de escena Intro — para preview rápida durante desarrollo
       */}
      <Composition
        id="Intro"
        component={App01Video}
        durationInFrames={150}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};

registerRoot(RemotionRoot);
