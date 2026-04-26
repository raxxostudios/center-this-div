import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_SIZES } from '../../lib/longform-tokens';

interface URLSlamProps {
  url: string;
  tagline?: string;
  durationFrames: number;
}

// CTA closer. URL appears huge in lime mono with underline. RAXXO dot
// pulses. Used as the last visual at the end of the video.

export const URLSlam: React.FC<URLSlamProps> = ({ url, tagline, durationFrames }) => {
  const frame = useCurrentFrame();

  // Slam in scale
  const slam = interpolate(frame, [0, 10, 18], [1.2, 0.95, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Underline draws after slam
  const underline = interpolate(frame, [16, 30], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // RAXXO dot + name
  const raxxoOpacity = interpolate(frame, [24, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const dotPulse = 0.5 + 0.5 * Math.sin(frame * 0.08);

  // Tagline
  const taglineOpacity = interpolate(frame, [38, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const exitOpacity = interpolate(frame, [durationFrames - 12, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const finalOpacity = opacity * exitOpacity;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        opacity: finalOpacity,
      }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          style={{
            fontFamily: tokens.mono,
            fontSize: 200,
            fontWeight: 800,
            color: tokens.accent,
            textShadow: `0 0 64px ${tokens.accent}55, 0 0 16px ${tokens.accent}aa`,
            letterSpacing: '-0.02em',
            transform: `scale(${slam})`,
          }}
        >
          {url}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -16,
            height: 6,
            background: tokens.accent,
            borderRadius: 2,
            width: `${underline}%`,
            margin: '0 auto',
            boxShadow: `0 0 24px ${tokens.accent}80`,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: raxxoOpacity,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 9999,
            background: tokens.accent,
            boxShadow: `0 0 ${16 + 24 * dotPulse}px ${tokens.accent}, 0 0 8px ${tokens.accent}`,
          }}
        />
        <div
          style={{
            fontFamily: tokens.mono,
            fontSize: LF_SIZES.title,
            fontWeight: 800,
            color: tokens.text,
            letterSpacing: '0.18em',
          }}
        >
          RAXXO STUDIOS
        </div>
      </div>

      {tagline && (
        <div
          style={{
            fontFamily: tokens.sans,
            fontSize: LF_SIZES.subtitle,
            fontWeight: 400,
            color: tokens.text2,
            opacity: taglineOpacity,
            textAlign: 'center',
            maxWidth: 1200,
          }}
        >
          {tagline}
        </div>
      )}
    </div>
  );
};
