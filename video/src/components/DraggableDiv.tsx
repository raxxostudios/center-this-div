import React from 'react';
import { useCurrentFrame } from 'remotion';
import { tokens } from '../lib/tokens';
import { pulse } from '../lib/animations';

interface DraggableDivProps {
  x: number;
  y: number;
  isDragging?: boolean;
}

export const DraggableDiv: React.FC<DraggableDivProps> = ({ x, y, isDragging = false }) => {
  const frame = useCurrentFrame();
  const p = pulse(frame, 0.03);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 60,
        top: y - 60,
        width: 120,
        height: 120,
        borderRadius: 10,
        background: isDragging
          ? `linear-gradient(135deg, rgba(227, 252, 2, 0.15), rgba(227, 252, 2, 0.05))`
          : `linear-gradient(135deg, rgba(0, 252, 237, 0.12), rgba(0, 252, 237, 0.04))`,
        border: `1.5px solid ${isDragging ? tokens.accent : tokens.cyan}`,
        boxShadow: isDragging ? tokens.glowMd : tokens.glowCyan,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${p})`,
        zIndex: 50,
      }}
    >
      <span
        style={{
          fontFamily: tokens.mono,
          fontSize: 32,
          color: isDragging ? tokens.accent : tokens.cyan,
          letterSpacing: '0.05em',
          opacity: 0.8,
        }}
      >
        {'<div>'}
      </span>
    </div>
  );
};
