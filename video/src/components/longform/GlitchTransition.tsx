import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';

interface GlitchTransitionProps {
  // Total duration — typically 8–14 frames for a punchy cut.
  durationFrames: number;
}

// Short transition overlay. RGB-shift noise bands + a quick lime flash,
// returns to transparent. Drop one between scenes for a cinematic cut.

export const GlitchTransition: React.FC<GlitchTransitionProps> = ({ durationFrames }) => {
  const frame = useCurrentFrame();
  if (frame >= durationFrames) return null;

  // Three-phase: glitch in (0-40%), peak flash (40-55%), fade (55-100%)
  const phase = frame / durationFrames;
  const noiseOpacity = phase < 0.55 ? 1 : interpolate(phase, [0.55, 1], [1, 0]);
  const flashOpacity = phase < 0.4 ? interpolate(phase, [0, 0.4], [0, 1]) :
                        phase < 0.55 ? 1 :
                        interpolate(phase, [0.55, 0.85], [1, 0]);

  // Random-feeling band positions tied to frame
  const bandOffset = (frame * 47) % 100;

  return (
    <>
      {/* Lime flash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: tokens.accent,
          opacity: flashOpacity * 0.65,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      {/* RGB shift bands */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${bandOffset}%`,
          height: '12%',
          background: '#ff0080',
          opacity: noiseOpacity * 0.3,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${(bandOffset + 30) % 100}%`,
          height: '8%',
          background: tokens.cyan,
          opacity: noiseOpacity * 0.4,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
