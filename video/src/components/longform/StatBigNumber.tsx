import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_SIZES } from '../../lib/longform-tokens';

interface StatBigNumberProps {
  // The final value displayed. Can be a number ("7") or a formatted string ("7 WEEKS").
  value: string | number;
  // Optional unit shown below the value (e.g., "WEEKS", "%").
  unit?: string;
  // Optional context above the number.
  label?: string;
  durationFrames: number;
  // For numeric values, optionally count up from this base. Default 0.
  countUpFrom?: number;
  // Color of the value. Defaults to lime.
  accent?: string;
}

// Massive stat — number scales in from small + counts up if numeric.
// The "this is THE number to remember" moment in a scene. Pairs well with
// short voice lines: "Seven weeks." / "Twenty-five words."

export const StatBigNumber: React.FC<StatBigNumberProps> = ({
  value,
  unit,
  label,
  durationFrames,
  countUpFrom = 0,
  accent = tokens.accent,
}) => {
  const frame = useCurrentFrame();
  const isNumeric = typeof value === 'number' || (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value));
  const finalNum = isNumeric ? Number(value) : null;

  // Scale in: starts at 0.4x, overshoots to 1.05x, settles at 1.0x.
  const scaleIn = interpolate(frame, [0, 18, 26], [0.4, 1.05, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Count-up animation for numeric values
  const countProgress = interpolate(frame, [4, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const displayedValue = isNumeric
    ? Math.round(countUpFrom + (finalNum! - countUpFrom) * countProgress).toString()
    : String(value);

  const labelOpacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const unitOpacity = interpolate(frame, [22, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const exitOpacity = interpolate(frame, [durationFrames - 14, durationFrames], [1, 0], {
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
        gap: 32,
        opacity: finalOpacity,
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: tokens.mono,
            fontSize: LF_SIZES.small,
            fontWeight: 600,
            color: tokens.text2,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            opacity: labelOpacity,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontFamily: tokens.sans,
          fontSize: 320,
          fontWeight: 800,
          color: accent,
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          transform: `scale(${scaleIn})`,
          textShadow: `0 0 64px ${accent}55, 0 0 16px ${accent}88`,
        }}
      >
        {displayedValue}
      </div>
      {unit && (
        <div
          style={{
            fontFamily: tokens.mono,
            fontSize: LF_SIZES.title,
            fontWeight: 700,
            color: tokens.text,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            opacity: unitOpacity,
          }}
        >
          {unit}
        </div>
      )}
    </div>
  );
};
