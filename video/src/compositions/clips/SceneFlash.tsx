import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_FPS, LF_WIDTH, LF_HEIGHT } from '../../lib/longform-tokens';

interface Props {
  durationSeconds?: number;
  // Optional label text shown briefly during the flash. e.g. "BUG 1 — MARCH 4"
  label?: string;
}

// Quick punchy transition clip (~1.5s). Drops in between Lexxa lipsync
// segments to chunk the video into chapters.

export const SceneFlash: React.FC<Props> = ({ durationSeconds = 1.5, label }) => {
  const frame = useCurrentFrame();
  const total = durationSeconds * LF_FPS;

  // Three phases: black wipe in, lime flash, label flick out
  const wipeIn = interpolate(frame, [0, total * 0.25], [0, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const flashOpacity = interpolate(frame, [total * 0.2, total * 0.4, total * 0.7], [0, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const labelOpacity = interpolate(frame, [total * 0.3, total * 0.5, total * 0.85, total], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const labelSlide = interpolate(frame, [total * 0.3, total * 0.55], [40, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: tokens.bgDark, color: tokens.text, fontFamily: tokens.sans }}>
      {/* Black wipe in from center */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: tokens.bg,
          clipPath: `inset(${50 - wipeIn / 2}% 0 ${50 - wipeIn / 2}% 0)`,
        }}
      />
      {/* Lime flash */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          height: 12,
          background: tokens.accent,
          boxShadow: `0 0 64px ${tokens.accent}, 0 0 16px ${tokens.accent}`,
          opacity: flashOpacity,
        }}
      />
      {/* Optional label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: labelOpacity,
            transform: `translateY(${labelSlide}px)`,
          }}
        >
          <div
            style={{
              fontFamily: tokens.mono,
              fontSize: 96,
              fontWeight: 800,
              color: tokens.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textShadow: `0 0 32px ${tokens.accent}55`,
            }}
          >
            {label}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
