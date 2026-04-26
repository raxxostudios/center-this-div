import React from 'react';
import { useCurrentFrame } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_WIDTH, LF_HEIGHT } from '../../lib/longform-tokens';

// Subtle dark backdrop with a faint grid + animated scanline for HUD vibe.
// Stays consistent across the whole video so cuts feel grounded.

export const BackgroundFX: React.FC = () => {
  const frame = useCurrentFrame();
  const scanlineY = ((frame * 4) % (LF_HEIGHT + 200)) - 100;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 30%, ${tokens.bgWarm} 0%, ${tokens.bg} 70%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${tokens.text4} 1px, transparent 1px),
            linear-gradient(90deg, ${tokens.text4} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.06,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: scanlineY,
          height: 2,
          background: tokens.accent,
          boxShadow: tokens.glowMd,
          opacity: 0.18,
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
