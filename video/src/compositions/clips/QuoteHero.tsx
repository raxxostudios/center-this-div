import React from 'react';
import { AbsoluteFill } from 'remotion';
import { tokens } from '../../lib/tokens';
import { BackgroundFX } from '../../components/longform/BackgroundFX';
import { PullQuote } from '../../components/longform/PullQuote';
import { Watermark } from '../../components/longform/Watermark';
import { LF_FPS } from '../../lib/longform-tokens';

interface Props {
  quote: string;
  attribution?: string;
  durationSeconds?: number;
}

export const QuoteHero: React.FC<Props> = ({ quote, attribution, durationSeconds = 8 }) => {
  return (
    <AbsoluteFill style={{ background: tokens.bg, color: tokens.text, fontFamily: tokens.sans }}>
      <BackgroundFX />
      <PullQuote quote={quote} attribution={attribution} durationFrames={durationSeconds * LF_FPS} />
      <Watermark />
    </AbsoluteFill>
  );
};
