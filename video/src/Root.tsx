import React from 'react';
import { Composition } from 'remotion';
import { WIDTH, HEIGHT, FPS } from './lib/tokens';
import { TikTok } from './compositions/TikTok';
import { Shorts } from './compositions/Shorts';
import { Reel } from './compositions/Reel';

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
    </>
  );
};
