import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_SIZES } from '../../lib/longform-tokens';

interface PullQuoteProps {
  quote: string;
  attribution?: string;
  durationFrames: number;
}

// Big pulled quote with massive lime quote marks. Used for verdict moments
// and key statements from the article.

export const PullQuote: React.FC<PullQuoteProps> = ({ quote, attribution, durationFrames }) => {
  const frame = useCurrentFrame();

  const quoteScale = interpolate(frame, [0, 14], [0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const attributionOpacity = interpolate(frame, [18, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [durationFrames - 14, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '0 64px',
        textAlign: 'center',
        opacity: opacity * exit,
      }}
    >
      <div
        style={{
          fontFamily: tokens.sans,
          fontSize: 240,
          fontWeight: 800,
          color: tokens.accent,
          lineHeight: 0.7,
          marginBottom: -32,
          textShadow: `0 0 32px ${tokens.accent}55`,
        }}
      >
        “
      </div>
      <div
        style={{
          fontFamily: tokens.sans,
          fontSize: 96,
          fontWeight: 600,
          color: tokens.text,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          transform: `scale(${quoteScale})`,
          textShadow: '0 4px 32px rgba(0,0,0,0.7)',
        }}
      >
        {quote}
      </div>
      {attribution && (
        <div
          style={{
            marginTop: 48,
            fontFamily: tokens.mono,
            fontSize: LF_SIZES.subtitle,
            fontWeight: 600,
            color: tokens.text2,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            opacity: attributionOpacity,
          }}
        >
          — {attribution}
        </div>
      )}
    </div>
  );
};
