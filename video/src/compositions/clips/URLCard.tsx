import React from 'react';
import { AbsoluteFill } from 'remotion';
import { tokens } from '../../lib/tokens';
import { BackgroundFX } from '../../components/longform/BackgroundFX';
import { URLSlam } from '../../components/longform/URLSlam';
import { Watermark } from '../../components/longform/Watermark';
import { LF_FPS } from '../../lib/longform-tokens';

interface Props {
  url: string;
  tagline?: string;
  durationSeconds?: number;
}

export const URLCard: React.FC<Props> = ({ url, tagline, durationSeconds = 8 }) => {
  return (
    <AbsoluteFill style={{ background: tokens.bg, color: tokens.text, fontFamily: tokens.sans }}>
      <BackgroundFX />
      <URLSlam url={url} tagline={tagline} durationFrames={durationSeconds * LF_FPS} />
      <Watermark />
    </AbsoluteFill>
  );
};
