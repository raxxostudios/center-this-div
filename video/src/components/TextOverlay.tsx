import React from 'react';
import { useCurrentFrame } from 'remotion';
import { tokens } from '../lib/tokens';
import { fadeIn, fadeOut, slideUp } from '../lib/animations';

interface TextOverlayProps {
  text: string;
  showAt: number;
  hideAt: number;
  position?: 'top' | 'center' | 'bottom';
  size?: 'lg' | 'md' | 'sm';
  color?: string;
  accent?: boolean;
  mono?: boolean;
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  showAt,
  hideAt,
  position = 'center',
  size = 'md',
  color,
  accent = false,
  mono = false,
}) => {
  const frame = useCurrentFrame();
  const inOpacity = fadeIn(frame, showAt, 8);
  const outOpacity = fadeOut(frame, hideAt - 8, 8);
  const opacity = Math.min(inOpacity, outOpacity);
  const y = slideUp(frame, showAt, 12);

  if (frame < showAt || frame > hideAt) return null;

  const positionMap = {
    top: { top: 160, bottom: 'auto' as const },
    center: { top: '50%', transform: `translateY(calc(-50% + ${y}px))` },
    bottom: { bottom: 280, top: 'auto' as const },
  };

  const sizeMap = {
    lg: 120,
    md: 80,
    sm: 56,
  };

  const textColor = color || (accent ? tokens.accent : tokens.text);

  return (
    <div
      style={{
        position: 'absolute',
        left: 48,
        right: 48,
        zIndex: 80,
        opacity,
        display: 'flex',
        justifyContent: 'center',
        ...positionMap[position],
      }}
    >
      <div
        style={{
          fontFamily: mono ? tokens.mono : tokens.sans,
          fontSize: sizeMap[size],
          fontWeight: 700,
          color: textColor,
          textAlign: 'center',
          lineHeight: 1.3,
          textShadow: accent ? tokens.glowMd : `0 2px 20px rgba(0,0,0,0.8)`,
          maxWidth: 900,
        }}
      >
        {text}
      </div>
    </div>
  );
};
