import React from 'react';
import { useCurrentFrame } from 'remotion';
import { tokens } from '../lib/tokens';
import { fadeIn, pulse } from '../lib/animations';

interface SuccessCounterProps {
  showAt: number;
}

export const SuccessCounter: React.FC<SuccessCounterProps> = ({ showAt }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, showAt, 12);
  const p = pulse(frame, 0.02);

  if (opacity === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${p})`,
        opacity,
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
      }}
    >
      <div
        style={{
          fontFamily: tokens.mono,
          fontSize: 48,
          color: tokens.text3,
          letterSpacing: '0.12em',
        }}
      >
        GLOBAL SUCCESSES
      </div>
      <div
        style={{
          fontFamily: tokens.mono,
          fontSize: 400,
          fontWeight: 800,
          color: tokens.red,
          lineHeight: 1,
          textShadow: `0 0 40px ${tokens.red}30, 0 0 80px ${tokens.red}10`,
        }}
      >
        0
      </div>
      <div
        style={{
          fontFamily: tokens.sans,
          fontSize: 56,
          color: tokens.text2,
          textAlign: 'center',
        }}
      >
        The counter is real. It queries the database.
      </div>
      <div
        style={{
          fontFamily: tokens.sans,
          fontSize: 56,
          color: tokens.text3,
        }}
      >
        It just never changes.
      </div>
    </div>
  );
};
