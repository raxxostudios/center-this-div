import React from 'react';
import { useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';
import { tokens, WIDTH, HEIGHT } from '../lib/tokens';
import { cursorPath, countUp } from '../lib/animations';
import { Background } from '../components/Background';
import { DraggableDiv } from '../components/DraggableDiv';
import { Cursor } from '../components/Cursor';
import { HUD } from '../components/HUD';
import { TextOverlay } from '../components/TextOverlay';
import { ResultModal } from '../components/ResultModal';
import { SuccessCounter } from '../components/SuccessCounter';

// 15s @ 30fps = 450 frames
// HOOK:    0-90   (0-3s)   "Centering a div is easy. So I made it impossible."
// SETUP:   90-180 (3-6s)   Show game, threshold text
// DEMO:    180-330 (6-11s) Drag div, HUD updates, submit
// RESULT:  330-390 (11-13s) NOT CENTERED + Earth Scale
// PAYOFF:  390-450 (13-15s) Successes: 0. CTA.

const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

// Cursor animation: starts far, drags close
const START_POS = { x: 280, y: 720 };
const NEAR_POS = { x: CENTER_X + 1.8, y: CENTER_Y - 1.2 }; // ~2.16px off

export const TikTok: React.FC = () => {
  const frame = useCurrentFrame();

  // Div position follows cursor during drag
  const dragStart = 200;
  const dragEnd = 310;
  const pos = cursorPath(frame, dragStart, dragEnd, START_POS, NEAR_POS);

  // Deviation calculation
  const divX = frame < dragStart ? START_POS.x : pos.x;
  const divY = frame < dragStart ? START_POS.y : pos.y;
  const devX = Math.abs(divX - CENTER_X);
  const devY = Math.abs(divY - CENTER_Y);
  const devTotal = Math.sqrt(devX * devX + devY * devY);

  const isDragging = frame >= dragStart && frame < dragEnd;
  const showHUD = frame >= 120;
  const showResult = frame >= 330;

  return (
    <div style={{ width: WIDTH, height: HEIGHT, position: 'relative', overflow: 'hidden' }}>
      <Background />

      {/* HOOK: 0-3s */}
      <TextOverlay
        text="Centering a div is easy."
        showAt={0}
        hideAt={50}
        position="center"
        size="lg"
      />
      <TextOverlay
        text="So I made it impossible."
        showAt={45}
        hideAt={90}
        position="center"
        size="lg"
        accent
      />

      {/* SETUP: 3-6s - threshold reveal */}
      <TextOverlay
        text="SUCCESS THRESHOLD"
        showAt={90}
        hideAt={175}
        position="top"
        size="sm"
        mono
      />
      <TextOverlay
        text="0.0001px"
        showAt={100}
        hideAt={175}
        position="center"
        size="lg"
        accent
        mono
      />
      <TextOverlay
        text="Nobody has ever won."
        showAt={130}
        hideAt={175}
        position="bottom"
        size="md"
      />

      {/* DEMO: 6-11s - gameplay */}
      {frame >= 180 && !showResult && (
        <>
          <DraggableDiv x={divX} y={divY} isDragging={isDragging} />
          <Cursor
            x={frame < dragStart ? 360 : pos.x + 50}
            y={frame < dragStart ? 780 : pos.y + 20}
            visible={frame >= 185}
            clicking={isDragging}
          />
        </>
      )}

      {/* HUD during gameplay */}
      {showHUD && !showResult && (
        <HUD
          deviationX={devX}
          deviationY={devY}
          totalDeviation={devTotal}
          showAt={120}
        />
      )}

      {/* Submit flash */}
      {frame >= 315 && frame < 330 && (
        <div
          style={{
            position: 'absolute',
            bottom: 140,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 70,
          }}
        >
          <div
            style={{
              fontFamily: tokens.mono,
              fontSize: 48,
              fontWeight: 700,
              color: tokens.bg,
              background: tokens.accent,
              padding: '24px 64px',
              borderRadius: 9999,
              boxShadow: tokens.glowLg,
            }}
          >
            SUBMIT
          </div>
        </div>
      )}

      {/* RESULT: 11-13s */}
      {showResult && frame < 390 && (
        <ResultModal
          showAt={330}
          deviation={2.163847}
          earthDistance="49,291km"
          earthQuote="That's farther than the circumference of the Moon."
        />
      )}

      {/* PAYOFF: 13-15s */}
      <SuccessCounter showAt={390} />

      {/* CTA watermark */}
      {frame >= 400 && (
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: tokens.mono,
            fontSize: 48,
            color: tokens.accent,
            letterSpacing: '0.06em',
            opacity: interpolate(frame, [400, 410], [0, 0.9], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          center-this-div.vercel.app
        </div>
      )}
    </div>
  );
};
