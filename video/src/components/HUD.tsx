import React from 'react';
import { useCurrentFrame } from 'remotion';
import { tokens } from '../lib/tokens';
import { fadeIn, pulse } from '../lib/animations';

interface HUDProps {
  deviationX: number;
  deviationY: number;
  totalDeviation: number;
  showAt: number;
  earthDistance?: string;
  earthQuote?: string;
  precision?: string;
  attempts?: number;
}

function deviationColor(total: number): string {
  if (total < 2) return tokens.green;
  if (total < 10) return tokens.accent;
  return tokens.red;
}

function deviationLabel(total: number): string {
  if (total < 0.5) return 'INSANE';
  if (total < 2) return 'CLOSE';
  if (total < 10) return 'WARM';
  if (total < 30) return 'MEH';
  return 'LOST';
}

export const HUD: React.FC<HUDProps> = ({
  deviationX,
  deviationY,
  totalDeviation,
  showAt,
  earthDistance,
  earthQuote,
  precision,
  attempts,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, showAt, 12);
  const color = deviationColor(totalDeviation);
  const label = deviationLabel(totalDeviation);
  const p = pulse(frame, 0.04);

  if (opacity === 0) return null;

  return (
    <div style={{ opacity, position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
      {/* Top bar */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 48,
          right: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Left: deviation readouts */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={labelStyle}>DEVIATION</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <ReadoutBox label="X" value={deviationX.toFixed(6)} color={color} />
            <ReadoutBox label="Y" value={deviationY.toFixed(6)} color={color} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            <span
              style={{
                fontFamily: tokens.mono,
                fontSize: 110,
                fontWeight: 700,
                color,
                textShadow: `0 0 40px ${color}40`,
              }}
            >
              {totalDeviation.toFixed(4)}
            </span>
            <span style={{ fontFamily: tokens.mono, fontSize: 48, color: tokens.text2 }}>px</span>
          </div>
        </div>

        {/* Right: precision meter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={labelStyle}>PRECISION</div>
          <div
            style={{
              fontFamily: tokens.mono,
              fontSize: 64,
              fontWeight: 700,
              color,
              transform: `scale(${p})`,
              textShadow: `0 0 24px ${color}40`,
            }}
          >
            {label}
          </div>
          {attempts !== undefined && (
            <div style={{ fontFamily: tokens.mono, fontSize: 40, color: tokens.text3, marginTop: 8 }}>
              ATTEMPTS: {attempts.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Earth Scale */}
      {earthDistance && (
        <div
          style={{
            position: 'absolute',
            bottom: 200,
            left: 48,
            right: 48,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={labelStyle}>EARTH SCALE</div>
          <div
            style={{
              fontFamily: tokens.mono,
              fontSize: 80,
              fontWeight: 700,
              color: tokens.cyan,
              textShadow: tokens.glowCyan,
            }}
          >
            {earthDistance}
          </div>
          {earthQuote && (
            <div
              style={{
                fontFamily: tokens.sans,
                fontSize: 48,
                color: tokens.text2,
                maxWidth: 900,
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              {earthQuote}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  fontFamily: tokens.mono,
  fontSize: 36,
  fontWeight: 500,
  color: tokens.text3,
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  textAlign: 'center',
};

const ReadoutBox: React.FC<{ label: string; value: string; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div
    style={{
      background: tokens.surface,
      border: `1px solid ${tokens.border}`,
      borderRadius: 20,
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
    }}
  >
    <span style={{ fontFamily: tokens.mono, fontSize: 32, color: tokens.text3, textAlign: 'center' }}>{label}</span>
    <span style={{ fontFamily: tokens.mono, fontSize: 48, color, fontWeight: 600, textAlign: 'center' }}>{value}</span>
  </div>
);
