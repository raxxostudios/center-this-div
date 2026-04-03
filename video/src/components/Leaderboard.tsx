import React from 'react';
import { useCurrentFrame } from 'remotion';
import { tokens } from '../lib/tokens';
import { fadeIn, slideUp } from '../lib/animations';

interface LeaderboardEntry {
  rank: number;
  deviation: string;
  region: string;
  time: string;
}

interface LeaderboardProps {
  showAt: number;
  entries?: LeaderboardEntry[];
}

const defaultEntries: LeaderboardEntry[] = [
  { rank: 1, deviation: '0.891432', region: 'EU', time: '2m ago' },
  { rank: 2, deviation: '1.203847', region: 'US', time: '5m ago' },
  { rank: 3, deviation: '1.567291', region: 'JP', time: '12m ago' },
  { rank: 4, deviation: '2.034519', region: 'BR', time: '18m ago' },
  { rank: 5, deviation: '2.891076', region: 'KR', time: '31m ago' },
  { rank: 6, deviation: '3.427861', region: 'DE', time: '45m ago' },
  { rank: 7, deviation: '4.102394', region: 'IN', time: '1h ago' },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ showAt, entries = defaultEntries }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, showAt, 12);

  if (opacity === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity,
        zIndex: 70,
        width: 960,
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: tokens.mono,
          fontSize: 40,
          color: tokens.text3,
          letterSpacing: '0.12em',
          marginBottom: 24,
          textAlign: 'center',
        }}
      >
        GLOBAL LEADERBOARD
      </div>

      {/* Table */}
      <div
        style={{
          background: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        {entries.map((entry, i) => {
          const rowDelay = showAt + i * 3;
          const rowOpacity = fadeIn(frame, rowDelay, 8);
          const rowY = slideUp(frame, rowDelay, 10);

          return (
            <div
              key={entry.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '24px 32px',
                borderBottom: i < entries.length - 1 ? `1px solid ${tokens.border}` : 'none',
                opacity: rowOpacity,
                transform: `translateY(${rowY}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: tokens.mono,
                  fontSize: 44,
                  color: i === 0 ? tokens.accent : tokens.text3,
                  width: 80,
                  fontWeight: 700,
                }}
              >
                #{entry.rank}
              </span>
              <span
                style={{
                  fontFamily: tokens.mono,
                  fontSize: 52,
                  color: i === 0 ? tokens.accent : tokens.text,
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                {entry.deviation}px
              </span>
              <span
                style={{
                  fontFamily: tokens.mono,
                  fontSize: 40,
                  color: tokens.text3,
                  width: 80,
                }}
              >
                {entry.region}
              </span>
              <span
                style={{
                  fontFamily: tokens.mono,
                  fontSize: 36,
                  color: tokens.text4,
                  width: 120,
                  textAlign: 'right',
                }}
              >
                {entry.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
