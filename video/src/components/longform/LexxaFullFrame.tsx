import React from 'react';
import { useCurrentFrame, interpolate, Easing, staticFile } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_WIDTH, LF_HEIGHT } from '../../lib/longform-tokens';

interface LexxaFullFrameProps {
  durationFrames: number;
  // Side the portrait sits on. The 9:16 image gets cropped/positioned for 16:9.
  side?: 'left' | 'right' | 'center';
  // Slow Ken Burns: zoom from -> to over duration.
  zoomFrom?: number;
  zoomTo?: number;
  // Optional dialogue caption overlaid at the bottom.
  caption?: string;
  // Subtle pan in pixels left/right across duration.
  panX?: number;
}

// Canonical Lexxa as full-frame visual (NOT a teleprompter sidecar).
// 9:16 source image is cropped to 16:9 by anchoring to one side and
// letting the other side feather into the dark scene. Slow Ken Burns
// zoom + pan for life. Cyan glow halo from her right side, matching
// the canonical lighting direction.

export const LexxaFullFrame: React.FC<LexxaFullFrameProps> = ({
  durationFrames,
  side = 'right',
  zoomFrom = 1.0,
  zoomTo = 1.08,
  caption,
  panX = 24,
}) => {
  const frame = useCurrentFrame();

  // Slow ease for cinematic feel
  const t = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const zoom = interpolate(t, [0, 1], [zoomFrom, zoomTo]);
  const panOffset = interpolate(t, [0, 1], [-panX, panX]);

  // Entry fade
  const entryOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const exitOpacity = interpolate(frame, [durationFrames - 18, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const captionOpacity = interpolate(frame, [16, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  }) * exitOpacity;

  // Position image: anchor to one side, full height
  const imgWidth = LF_HEIGHT * (9 / 16);
  const imgLeft = side === 'right'
    ? LF_WIDTH - imgWidth
    : side === 'left'
    ? 0
    : (LF_WIDTH - imgWidth) / 2;

  return (
    <>
      {/* Cyan glow behind portrait, matches canonical lighting */}
      <div
        style={{
          position: 'absolute',
          left: side === 'left' ? imgLeft + imgWidth * 0.4 : imgLeft - imgWidth * 0.5,
          top: '15%',
          width: imgWidth,
          height: '70%',
          background: `radial-gradient(ellipse at ${side === 'left' ? '20%' : '80%'} 40%, ${tokens.cyanMid} 0%, transparent 65%)`,
          filter: 'blur(60px)',
          opacity: entryOpacity * exitOpacity * 0.85,
          pointerEvents: 'none',
        }}
      />
      {/* Lexxa portrait */}
      <div
        style={{
          position: 'absolute',
          left: imgLeft + panOffset,
          top: 0,
          width: imgWidth,
          height: LF_HEIGHT,
          transform: `scale(${zoom})`,
          transformOrigin: side === 'left' ? 'left center' : side === 'right' ? 'right center' : 'center center',
          opacity: entryOpacity * exitOpacity,
        }}
      >
        <img
          src={staticFile('lexxa/canonical.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            // Feathered edge fading into the dark scene on the side opposite the anchor.
            maskImage: side === 'right'
              ? 'linear-gradient(to left, black 70%, transparent 100%)'
              : side === 'left'
              ? 'linear-gradient(to right, black 70%, transparent 100%)'
              : 'linear-gradient(to bottom, black 80%, transparent 100%)',
            WebkitMaskImage: side === 'right'
              ? 'linear-gradient(to left, black 70%, transparent 100%)'
              : side === 'left'
              ? 'linear-gradient(to right, black 70%, transparent 100%)'
              : 'linear-gradient(to bottom, black 80%, transparent 100%)',
          }}
          alt="Lexxa"
        />
      </div>

      {/* Optional caption */}
      {caption && (
        <div
          style={{
            position: 'absolute',
            left: side === 'right' ? '8%' : '52%',
            right: side === 'right' ? '52%' : '8%',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: tokens.sans,
            fontSize: 84,
            fontWeight: 700,
            color: tokens.text,
            opacity: captionOpacity,
            textShadow: '0 4px 32px rgba(0,0,0,0.8)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
          }}
        >
          {caption}
        </div>
      )}
    </>
  );
};
