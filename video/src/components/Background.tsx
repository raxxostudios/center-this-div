import React from 'react';
import { useCurrentFrame } from 'remotion';
import { tokens, WIDTH, HEIGHT } from '../lib/tokens';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const scanY = (frame * 2) % HEIGHT;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: tokens.bg,
        overflow: 'hidden',
      }}
    >
      {/* Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(227, 252, 2, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(227, 252, 2, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Radial glow center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(227, 252, 2, 0.04) 0%, transparent 70%)`,
        }}
      />
      {/* Scan line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: scanY,
          height: 2,
          background: `linear-gradient(90deg, transparent, rgba(227, 252, 2, 0.06), transparent)`,
        }}
      />
      {/* Crosshair lines */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent 20%, ${tokens.border} 50%, transparent 80%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: 1,
          background: `linear-gradient(180deg, transparent 20%, ${tokens.border} 50%, transparent 80%)`,
        }}
      />
    </div>
  );
};
