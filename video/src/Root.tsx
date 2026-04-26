import React from 'react';
import { Composition } from 'remotion';
import { WIDTH, HEIGHT, FPS } from './lib/tokens';
import { LF_WIDTH, LF_HEIGHT, LF_FPS } from './lib/longform-tokens';
import { TikTok } from './compositions/TikTok';
import { Shorts } from './compositions/Shorts';
import { Reel } from './compositions/Reel';

// Animation clip compositions (drop-in MP4s for video edits)
import { IntroTitle } from './compositions/clips/IntroTitle';
import { StatHero } from './compositions/clips/StatHero';
import { DateTimelineClip } from './compositions/clips/DateTimelineClip';
import { ComparisonClip } from './compositions/clips/ComparisonClip';
import { QuoteHero } from './compositions/clips/QuoteHero';
import { URLCard } from './compositions/clips/URLCard';
import { SceneFlash } from './compositions/clips/SceneFlash';
import { ProductCard } from './compositions/clips/ProductCard';

// Each clip composition uses calculateMetadata to pick its own duration
// from the durationSeconds prop. Default props let `remotion studio`
// preview each clip without props injected via --props.

const clipMeta = (defaultSeconds: number) => ({
  defaultProps: { durationSeconds: defaultSeconds } as any,
  calculateMetadata: ({ props }: any) => ({
    durationInFrames: Math.max(LF_FPS, Math.ceil((props.durationSeconds ?? defaultSeconds) * LF_FPS)),
  }),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Existing shorts pipeline */}
      <Composition
        id="TikTok"
        component={TikTok}
        durationInFrames={FPS * 15}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Shorts"
        component={Shorts}
        durationInFrames={FPS * 30}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* Animation clips for long-form video assembly. 16:9, 4K-ready. */}
      <Composition
        id="IntroTitle"
        component={IntroTitle}
        fps={LF_FPS}
        width={LF_WIDTH}
        height={LF_HEIGHT}
        durationInFrames={LF_FPS * 6}
        defaultProps={{ title: 'PREVIEW TITLE', subtitle: 'Subtitle preview', durationSeconds: 6 } as any}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(LF_FPS, Math.ceil((props.durationSeconds ?? 6) * LF_FPS)),
        })}
      />
      <Composition
        id="StatHero"
        component={StatHero}
        fps={LF_FPS}
        width={LF_WIDTH}
        height={LF_HEIGHT}
        durationInFrames={LF_FPS * 4}
        defaultProps={{ value: 7, unit: 'WEEKS', label: 'BROKEN FOR', durationSeconds: 4 } as any}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(LF_FPS, Math.ceil((props.durationSeconds ?? 4) * LF_FPS)),
        })}
      />
      <Composition
        id="DateTimelineClip"
        component={DateTimelineClip}
        fps={LF_FPS}
        width={LF_WIDTH}
        height={LF_HEIGHT}
        durationInFrames={LF_FPS * 10}
        defaultProps={{
          headline: 'THE THREE BUGS',
          items: [
            { date: 'Mar 4', label: 'Reasoning effort dropped', color: '#ff4060' },
            { date: 'Mar 26', label: 'Reasoning history discarded', color: '#ff4060' },
            { date: 'Apr 16', label: '25-word response cap', color: '#ff4060' },
          ],
          durationSeconds: 10,
        } as any}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(LF_FPS, Math.ceil((props.durationSeconds ?? 10) * LF_FPS)),
        })}
      />
      <Composition
        id="ComparisonClip"
        component={ComparisonClip}
        fps={LF_FPS}
        width={LF_WIDTH}
        height={LF_HEIGHT}
        durationInFrames={LF_FPS * 6}
        defaultProps={{
          headline: 'DEFAULT REASONING EFFORT',
          left: { label: 'Before', value: 'HIGH' },
          right: { label: 'After', value: 'MEDIUM', color: '#ff4060' },
          durationSeconds: 6,
        } as any}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(LF_FPS, Math.ceil((props.durationSeconds ?? 6) * LF_FPS)),
        })}
      />
      <Composition
        id="QuoteHero"
        component={QuoteHero}
        fps={LF_FPS}
        width={LF_WIDTH}
        height={LF_HEIGHT}
        durationInFrames={LF_FPS * 8}
        defaultProps={{
          quote: 'Trust is built one post-mortem at a time.',
          attribution: 'Lexxa',
          durationSeconds: 8,
        } as any}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(LF_FPS, Math.ceil((props.durationSeconds ?? 8) * LF_FPS)),
        })}
      />
      <Composition
        id="URLCard"
        component={URLCard}
        fps={LF_FPS}
        width={LF_WIDTH}
        height={LF_HEIGHT}
        durationInFrames={LF_FPS * 8}
        defaultProps={{
          url: 'raxxo.shop/blogs/lab',
          tagline: 'Two posts every weekday. Subscribe and the algorithm wins.',
          durationSeconds: 8,
        } as any}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(LF_FPS, Math.ceil((props.durationSeconds ?? 8) * LF_FPS)),
        })}
      />
      <Composition
        id="SceneFlash"
        component={SceneFlash}
        fps={LF_FPS}
        width={LF_WIDTH}
        height={LF_HEIGHT}
        durationInFrames={Math.ceil(LF_FPS * 1.5)}
        defaultProps={{ label: 'BUG 1 · MARCH 4', durationSeconds: 1.5 } as any}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(LF_FPS, Math.ceil((props.durationSeconds ?? 1.5) * LF_FPS)),
        })}
      />
      <Composition
        id="ProductCard"
        component={ProductCard}
        fps={LF_FPS}
        width={LF_WIDTH}
        height={LF_HEIGHT}
        durationInFrames={LF_FPS * 6}
        defaultProps={{
          productName: 'Claude Blueprint',
          tagline: 'Six commands, six skills, three hooks. The Claude Code setup that actually works.',
          price: '33 EUR',
          url: 'raxxo.shop/pages/claude-blueprint',
          durationSeconds: 6,
        } as any}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(LF_FPS, Math.ceil((props.durationSeconds ?? 6) * LF_FPS)),
        })}
      />
    </>
  );
};
