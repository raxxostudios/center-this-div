import React from 'react';
import { tokens } from '../lib/tokens';

interface CursorProps {
  x: number;
  y: number;
  visible?: boolean;
  clicking?: boolean;
}

export const Cursor: React.FC<CursorProps> = ({ x, y, visible = true, clicking = false }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-2px, -2px)',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Cursor SVG */}
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 3l14 8-6 2-3 6z"
          fill={tokens.text}
          stroke={tokens.bg}
          strokeWidth="1.5"
        />
      </svg>
      {/* Click ring */}
      {clicking && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: `2px solid ${tokens.accent}`,
            transform: 'translate(-50%, -50%)',
            boxShadow: tokens.glowSm,
          }}
        />
      )}
    </div>
  );
};
