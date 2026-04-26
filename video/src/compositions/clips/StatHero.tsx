import React from 'react';
import { AbsoluteFill } from 'remotion';
import { tokens } from '../../lib/tokens';
import { BackgroundFX } from '../../components/longform/BackgroundFX';
import { StatBigNumber } from '../../components/longform/StatBigNumber';
import { Watermark } from '../../components/longform/Watermark';
import { LF_FPS } from '../../lib/longform-tokens';

interface Props {
  value: string | number;
  unit?: string;
  label?: string;
  durationSeconds?: number;
  countUpFrom?: number;
  accent?: string;
}

// Massive stat callout. Use to land a single number ("SEVEN WEEKS",
// "25 WORDS BETWEEN TOOL CALLS") between explainer beats.

export const StatHero: React.FC<Props> = ({ value, unit, label, durationSeconds = 4, countUpFrom, accent }) => {
  return (
    <AbsoluteFill style={{ background: tokens.bg, color: tokens.text, fontFamily: tokens.sans }}>
      <BackgroundFX />
      <StatBigNumber
        value={value}
        unit={unit}
        label={label}
        durationFrames={durationSeconds * LF_FPS}
        countUpFrom={countUpFrom}
        accent={accent}
      />
      <Watermark />
    </AbsoluteFill>
  );
};
