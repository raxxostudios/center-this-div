import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { tokens, WIDTH, HEIGHT } from '../lib/tokens';
import { cursorPath, fadeIn } from '../lib/animations';
import { Background } from '../components/Background';
import { DraggableDiv } from '../components/DraggableDiv';
import { Cursor } from '../components/Cursor';
import { HUD } from '../components/HUD';
import { TextOverlay } from '../components/TextOverlay';
import { ResultModal } from '../components/ResultModal';
import { SuccessCounter } from '../components/SuccessCounter';

// 20s @ 30fps = 600 frames
// HOOK:    0-90   (0-3s)    "Centering a div is easy. So I made it impossible."
// SETUP:   90-150 (3-5s)    Threshold reveal
// DEMO:    150-360 (5-12s)  Drag div, HUD, submit
// RESULT:  360-450 (12-15s) NOT CENTERED + Earth Scale
// PAYOFF:  450-540 (15-18s) Successes: 0
// CTA:     540-600 (18-20s) Link

const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

const START_POS = { x: 300, y: 700 };
const NEAR_POS = { x: CENTER_X + 2.4, y: CENTER_Y - 1.6 }; // ~2.88px off

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();

  const dragStart = 170;
  const dragEnd = 340;
  const pos = cursorPath(frame, dragStart, dragEnd, START_POS, NEAR_POS);

  const divX = frame < dragStart ? START_POS.x : pos.x;
  const divY = frame < dragStart ? START_POS.y : pos.y;
  const devX = Math.abs(divX - CENTER_X);
  const devY = Math.abs(divY - CENTER_Y);
  const devTotal = Math.sqrt(devX * devX + devY * devY);

  const isDragging = frame >= dragStart && frame < dragEnd;
  const showGameplay = frame >= 150 && frame < 360;
  const showResult = frame >= 360 && frame < 450;
  const showSuccess = frame >= 450 && frame < 540;

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

      {/* SETUP: 3-5s */}
      <TextOverlay
        text="0.0001px threshold"
        showAt={90}
        hideAt={145}
        position="center"
        size="lg"
        accent
        mono
      />
      <TextOverlay
        text="Nobody has ever won."
        showAt={110}
        hideAt={145}
        position="bottom"
        size="md"
      />

      {/* DEMO: 5-12s */}
      {showGameplay && (
        <>
          <DraggableDiv x={divX} y={divY} isDragging={isDragging} />
          <Cursor
            x={divX + 50}
            y={divY + 20}
            visible={frame >= 160}
            clicking={isDragging}
          />
          <HUD
            deviationX={devX}
            deviationY={devY}
            totalDeviation={devTotal}
            showAt={160}
          />
        </>
      )}

      {/* Deviation callout */}
      <TextOverlay
        text={`${devTotal < 5 ? devTotal.toFixed(1) : '2.9'} pixels away. Sounds close, right?`}
        showAt={300}
        hideAt={355}
        position="bottom"
        size="sm"
      />

      {/* Submit flash */}
      {frame >= 345 && frame < 360 && (
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

      {/* RESULT: 12-15s */}
      {showResult && (
        <ResultModal
          showAt={360}
          deviation={2.883194}
          earthDistance="58,412km"
          earthQuote="That's past the orbit of geostationary satellites."
        />
      )}

      {/* PAYOFF: 15-18s */}
      {showSuccess && <SuccessCounter showAt={450} />}

      {/* CTA: 18-20s */}
      {frame >= 540 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            opacity: fadeIn(frame, 540, 10),
            zIndex: 80,
          }}
        >
          <div
            style={{
              fontFamily: tokens.sans,
              fontSize: 80,
              fontWeight: 700,
              color: tokens.text,
            }}
          >
            Try to beat my score.
          </div>
          <div
            style={{
              fontFamily: tokens.sans,
              fontSize: 64,
              color: tokens.text3,
            }}
          >
            You won't.
          </div>
          <div
            style={{
              fontFamily: tokens.mono,
              fontSize: 52,
              color: tokens.accent,
              marginTop: 16,
              letterSpacing: '0.04em',
            }}
          >
            center-this-div.vercel.app
          </div>
        </div>
      )}
    </div>
  );
};
