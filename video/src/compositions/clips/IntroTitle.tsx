import React from 'react';
import { AbsoluteFill } from 'remotion';
import { tokens } from '../../lib/tokens';
import { BackgroundFX } from '../../components/longform/BackgroundFX';
import { TitleSlam } from '../../components/longform/TitleSlam';
import { Watermark } from '../../components/longform/Watermark';
import { LF_FPS } from '../../lib/longform-tokens';

interface Props {
  title: string;
  subtitle?: string;
  durationSeconds?: number;
}

// Short title-card clip. Title slams in with RGB glitch + lime underline,
// optional subtitle. Use as intro before Lexxa starts talking.

export const IntroTitle: React.FC<Props> = ({ title, subtitle, durationSeconds = 6 }) => {
  return (
    <AbsoluteFill style={{ background: tokens.bg, color: tokens.text, fontFamily: tokens.sans }}>
      <BackgroundFX />
      <TitleSlam
        headline={(title || '').toUpperCase()}
        subtitle={subtitle}
        durationFrames={durationSeconds * LF_FPS}
      />
      <Watermark />
    </AbsoluteFill>
  );
};
