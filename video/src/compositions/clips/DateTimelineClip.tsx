import React from 'react';
import { AbsoluteFill } from 'remotion';
import { tokens } from '../../lib/tokens';
import { BackgroundFX } from '../../components/longform/BackgroundFX';
import { DateTimeline } from '../../components/longform/DateTimeline';
import { Watermark } from '../../components/longform/Watermark';
import { LF_FPS } from '../../lib/longform-tokens';

interface Item { date: string; label?: string; color?: string; }

interface Props {
  items: Item[];
  headline?: string;
  durationSeconds?: number;
}

export const DateTimelineClip: React.FC<Props> = ({ items, headline, durationSeconds = 10 }) => {
  return (
    <AbsoluteFill style={{ background: tokens.bg, color: tokens.text, fontFamily: tokens.sans }}>
      <BackgroundFX />
      <DateTimeline items={items} headline={headline} durationFrames={durationSeconds * LF_FPS} />
      <Watermark />
    </AbsoluteFill>
  );
};
