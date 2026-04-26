import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_SIZES } from '../../lib/longform-tokens';

interface Side {
  label: string;
  value: string;
  // Color of the value. Default: red on left ("BEFORE"/"BAD"), lime on right.
  color?: string;
}

interface ComparisonCardProps {
  left: Side;
  right: Side;
  durationFrames: number;
  // Headline above the comparison.
  headline?: string;
}

// Two-column comparison. Used for "HIGH vs MEDIUM", "BEFORE vs AFTER",
// "MARCH 4 vs APRIL 20" style data presentations.

export const ComparisonCard: React.FC<ComparisonCardProps> = ({ left, right, durationFrames, headline }) => {
  const frame = useCurrentFrame();

  const leftOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const leftSlide = interpolate(frame, [0, 18], [-60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const rightOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const rightSlide = interpolate(frame, [8, 26], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const dividerOpacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headlineOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [durationFrames - 14, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const leftColor = left.color || tokens.red;
  const rightColor = right.color || tokens.accent;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 64px',
        opacity: exit,
      }}
    >
      {headline && (
        <div
          style={{
            fontFamily: tokens.mono,
            fontSize: LF_SIZES.subtitle,
            fontWeight: 700,
            color: tokens.text,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 64,
            opacity: headlineOpacity,
          }}
        >
          {headline}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 64, width: '100%', justifyContent: 'center' }}>
        {/* Left side */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            transform: `translateX(${leftSlide}px)`,
            opacity: leftOpacity,
            maxWidth: 700,
          }}
        >
          <div
            style={{
              fontFamily: tokens.mono,
              fontSize: LF_SIZES.small,
              fontWeight: 600,
              color: tokens.text2,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            {left.label}
          </div>
          <div
            style={{
              fontFamily: tokens.sans,
              fontSize: 200,
              fontWeight: 800,
              color: leftColor,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              textShadow: `0 0 48px ${leftColor}40`,
              textAlign: 'center',
            }}
          >
            {left.value}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 4,
            height: 280,
            background: `linear-gradient(180deg, transparent 0%, ${tokens.text4} 30%, ${tokens.text4} 70%, transparent 100%)`,
            opacity: dividerOpacity,
          }}
        />

        {/* Right side */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            transform: `translateX(${rightSlide}px)`,
            opacity: rightOpacity,
            maxWidth: 700,
          }}
        >
          <div
            style={{
              fontFamily: tokens.mono,
              fontSize: LF_SIZES.small,
              fontWeight: 600,
              color: tokens.text2,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            {right.label}
          </div>
          <div
            style={{
              fontFamily: tokens.sans,
              fontSize: 200,
              fontWeight: 800,
              color: rightColor,
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              textShadow: `0 0 48px ${rightColor}40`,
              textAlign: 'center',
            }}
          >
            {right.value}
          </div>
        </div>
      </div>
    </div>
  );
};
