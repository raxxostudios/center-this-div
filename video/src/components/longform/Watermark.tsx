import React from 'react';
import { tokens } from '../../lib/tokens';
import { LF_SIZES } from '../../lib/longform-tokens';

// RAXXO Studios watermark, bottom-right. Always present.

export const Watermark: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 48,
        bottom: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: tokens.mono,
        fontSize: LF_SIZES.small,
        fontWeight: 700,
        letterSpacing: '0.18em',
        color: tokens.accent,
        textShadow: tokens.glowSm,
        opacity: 0.85,
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 9999,
          background: tokens.accent,
          boxShadow: tokens.glowSm,
        }}
      />
      RAXXO
    </div>
  );
};
