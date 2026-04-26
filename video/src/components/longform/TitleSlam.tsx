import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_SIZES } from '../../lib/longform-tokens';

interface TitleSlamProps {
  headline: string;
  subtitle?: string;
  // The accent color used on the underline + glow. Defaults to lime.
  accent?: string;
  // Total duration of this primitive in frames. Used to compute exit fade.
  durationFrames: number;
  // Optional vertical position. Default center.
  align?: 'top' | 'center' | 'bottom';
}

// Headline that "slams" in: brief RGB-split glitch (4 frames), snap to
// position, lime underline draws across, headline holds, soft exit fade.
// Lime mono UPPERCASE. Heavy, cinematic.

export const TitleSlam: React.FC<TitleSlamProps> = ({
  headline,
  subtitle,
  accent = tokens.accent,
  durationFrames,
  align = 'center',
}) => {
  const frame = useCurrentFrame();

  // Glitch-in: 0–4 frames RGB split offsets, then snap.
  const glitchPhase = frame < 5;
  const slamProgress = interpolate(frame, [4, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.poly(4)),
  });
  const slamScale = interpolate(slamProgress, [0, 1], [1.18, 1]);
  const slamOpacity = interpolate(slamProgress, [0, 1], [0, 1]);

  // Underline draws after slam settles.
  const underlineDraw = interpolate(frame, [14, 28], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const underlineGlow = 0.5 + 0.5 * Math.sin(frame * 0.05);

  // Subtitle fades in after underline.
  const subOpacity = interpolate(frame, [28, 42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Exit fade in last 12 frames.
  const exitOpacity = interpolate(frame, [durationFrames - 12, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const masterOpacity = Math.min(slamOpacity, exitOpacity);

  const verticalAlign = {
    top: { top: '20%' },
    center: { top: '50%', transform: 'translateY(-50%)' },
    bottom: { bottom: '20%' },
  }[align];

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        ...verticalAlign,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
        padding: '0 64px',
        opacity: masterOpacity,
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* RGB-split glitch layers - only render during glitch phase */}
        {glitchPhase && (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                fontFamily: tokens.mono,
                fontSize: LF_SIZES.hero,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ff0080',
                transform: `translate(${(2 - frame) * 4}px, 0)`,
                mixBlendMode: 'screen',
                opacity: 0.7,
                whiteSpace: 'nowrap',
              }}
            >
              {headline}
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                fontFamily: tokens.mono,
                fontSize: LF_SIZES.hero,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: tokens.cyan,
                transform: `translate(${(frame - 2) * 4}px, 0)`,
                mixBlendMode: 'screen',
                opacity: 0.7,
                whiteSpace: 'nowrap',
              }}
            >
              {headline}
            </div>
          </>
        )}
        {/* Main headline */}
        <div
          style={{
            fontFamily: tokens.mono,
            fontSize: LF_SIZES.hero,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: tokens.text,
            textTransform: 'uppercase',
            transform: `scale(${slamScale})`,
            transformOrigin: 'center center',
            textShadow: `0 0 64px ${accent}55`,
            whiteSpace: 'nowrap',
          }}
        >
          {headline}
        </div>
      </div>

      {/* Lime underline that draws in */}
      <div
        style={{
          width: `${underlineDraw}%`,
          maxWidth: 800,
          height: 6,
          background: accent,
          boxShadow: `0 0 ${24 + 16 * underlineGlow}px ${accent}`,
          borderRadius: 2,
        }}
      />

      {/* Optional subtitle */}
      {subtitle && (
        <div
          style={{
            fontFamily: tokens.sans,
            fontSize: LF_SIZES.subtitle,
            fontWeight: 500,
            color: tokens.text2,
            letterSpacing: '0.02em',
            opacity: subOpacity,
            textAlign: 'center',
            maxWidth: 1400,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
