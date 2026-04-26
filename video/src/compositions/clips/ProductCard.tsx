import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';
import { BackgroundFX } from '../../components/longform/BackgroundFX';
import { Watermark } from '../../components/longform/Watermark';
import { LF_FPS, LF_SIZES } from '../../lib/longform-tokens';

interface Props {
  productName: string;       // e.g. "Claude Blueprint"
  tagline: string;           // e.g. "Six commands. Six skills. Three hooks."
  price?: string;            // e.g. "33 EUR" — optional
  url?: string;              // e.g. "raxxo.shop/pages/claude-blueprint"
  accent?: string;           // override accent color (default lime)
  durationSeconds?: number;
}

// Animated product card. Use as outro plug or mid-roll reveal.
// Layout: animated headline left, tagline below, lime price chip, URL.

export const ProductCard: React.FC<Props> = ({
  productName,
  tagline,
  price,
  url,
  accent = tokens.accent,
  durationSeconds = 6,
}) => {
  const frame = useCurrentFrame();
  const total = durationSeconds * LF_FPS;

  const nameOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const nameSlide = interpolate(frame, [0, 18], [-50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const taglineOpacity = interpolate(frame, [10, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const priceScale = interpolate(frame, [18, 32], [0.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2)) });
  const priceOpacity = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const urlOpacity = interpolate(frame, [28, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exit = interpolate(frame, [total - 14, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: tokens.bg, color: tokens.text, fontFamily: tokens.sans }}>
      <BackgroundFX />

      <div style={{ position: 'absolute', left: '8%', right: '8%', top: '50%', transform: 'translateY(-50%)', opacity: exit }}>
        {/* Lime tag chip top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ width: 12, height: 12, borderRadius: 9999, background: accent, boxShadow: `0 0 16px ${accent}` }} />
          <div style={{ fontFamily: tokens.mono, fontSize: LF_SIZES.small, fontWeight: 700, color: accent, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: nameOpacity }}>
            RAXXO Studios
          </div>
        </div>

        {/* Product name massive */}
        <div
          style={{
            fontFamily: tokens.sans,
            fontSize: 200,
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            color: tokens.text,
            opacity: nameOpacity,
            transform: `translateX(${nameSlide}px)`,
            textShadow: `0 4px 32px rgba(0,0,0,0.6)`,
            marginBottom: 32,
          }}
        >
          {productName}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: tokens.sans,
            fontSize: LF_SIZES.subtitle,
            fontWeight: 400,
            color: tokens.text2,
            lineHeight: 1.35,
            maxWidth: 1200,
            opacity: taglineOpacity,
            marginBottom: 48,
          }}
        >
          {tagline}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          {price && (
            <div
              style={{
                padding: '20px 32px',
                background: accent,
                color: tokens.bg,
                fontFamily: tokens.mono,
                fontSize: LF_SIZES.title,
                fontWeight: 800,
                borderRadius: 12,
                boxShadow: `0 0 32px ${accent}55`,
                opacity: priceOpacity,
                transform: `scale(${priceScale})`,
                letterSpacing: '0.04em',
              }}
            >
              {price}
            </div>
          )}
          {url && (
            <div
              style={{
                fontFamily: tokens.mono,
                fontSize: LF_SIZES.subtitle,
                fontWeight: 700,
                color: accent,
                letterSpacing: '-0.01em',
                opacity: urlOpacity,
                textShadow: `0 0 16px ${accent}40`,
              }}
            >
              {url}
            </div>
          )}
        </div>
      </div>

      <Watermark />
    </AbsoluteFill>
  );
};
