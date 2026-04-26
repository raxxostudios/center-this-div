import React from 'react';
import { AbsoluteFill } from 'remotion';
import { tokens } from '../../lib/tokens';
import { BackgroundFX } from '../../components/longform/BackgroundFX';
import { ComparisonCard } from '../../components/longform/ComparisonCard';
import { Watermark } from '../../components/longform/Watermark';
import { LF_FPS } from '../../lib/longform-tokens';

interface Side { label: string; value: string; color?: string; }

interface Props {
  left: Side;
  right: Side;
  headline?: string;
  durationSeconds?: number;
}

export const ComparisonClip: React.FC<Props> = ({ left, right, headline, durationSeconds = 6 }) => {
  return (
    <AbsoluteFill style={{ background: tokens.bg, color: tokens.text, fontFamily: tokens.sans }}>
      <BackgroundFX />
      <ComparisonCard left={left} right={right} headline={headline} durationFrames={durationSeconds * LF_FPS} />
      <Watermark />
    </AbsoluteFill>
  );
};
