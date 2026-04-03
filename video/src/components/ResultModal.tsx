import React from 'react';
import { useCurrentFrame } from 'remotion';
import { tokens } from '../lib/tokens';
import { fadeIn, slideUp } from '../lib/animations';

interface ResultModalProps {
  showAt: number;
  deviation: number;
  earthDistance: string;
  earthQuote: string;
  rank?: number;
  percentile?: number;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  showAt,
  deviation,
  earthDistance,
  earthQuote,
  rank = 847,
  percentile = 73.2,
}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, showAt, 10);
  const y = slideUp(frame, showAt, 15);

  if (opacity === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, calc(-50% + ${y}px))`,
        opacity,
        zIndex: 90,
        width: 960,
      }}
    >
      {/* Backdrop blur sim */}
      <div
        style={{
          background: 'rgba(31, 31, 33, 0.92)',
          border: `1px solid ${tokens.borderStrong}`,
          borderRadius: 20,
          padding: '64px 48px 56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
        }}
      >
        {/* NOT CENTERED */}
        <div
          style={{
            fontFamily: tokens.mono,
            fontSize: 96,
            fontWeight: 800,
            color: tokens.red,
            letterSpacing: '0.04em',
            textShadow: `0 0 24px ${tokens.red}40`,
          }}
        >
          NOT CENTERED
        </div>

        {/* Deviation */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              fontFamily: tokens.mono,
              fontSize: 110,
              fontWeight: 700,
              color: tokens.accent,
              textShadow: tokens.glowMd,
            }}
          >
            {deviation.toFixed(6)}
          </span>
          <span style={{ fontFamily: tokens.mono, fontSize: 48, color: tokens.text2 }}>px off</span>
        </div>

        {/* Earth Scale */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}
        >
          <div style={{ fontFamily: tokens.mono, fontSize: 36, color: tokens.text3, letterSpacing: '0.1em' }}>
            ON EARTH, THAT MISS WOULD BE
          </div>
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
          <div
            style={{
              fontFamily: tokens.sans,
              fontSize: 44,
              color: tokens.text2,
              textAlign: 'center',
              maxWidth: 860,
              lineHeight: 1.4,
              marginTop: 4,
            }}
          >
            "{earthQuote}"
          </div>
        </div>

        {/* Rank */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            marginTop: 12,
            paddingTop: 20,
            borderTop: `1px solid ${tokens.border}`,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <StatBox label="RANK" value={`#${rank}`} />
          <StatBox label="PERCENTILE" value={`${percentile}%`} />
          <StatBox label="SUCCESSES" value="0" color={tokens.red} />
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string; color?: string }> = ({
  label,
  value,
  color = tokens.text,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <span style={{ fontFamily: tokens.mono, fontSize: 32, color: tokens.text3, letterSpacing: '0.1em' }}>
      {label}
    </span>
    <span style={{ fontFamily: tokens.mono, fontSize: 64, fontWeight: 700, color }}>{value}</span>
  </div>
);
