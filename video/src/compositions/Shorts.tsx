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
import { Leaderboard } from '../components/Leaderboard';
import { SuccessCounter } from '../components/SuccessCounter';

// 30s @ 30fps = 900 frames
// HOOK:        0-90   (0-3s)    Text: "SUCCESS THRESHOLD: 0.0001px" + "Can you center a div? No. Literally no."
// WALKTHROUGH: 90-600 (3-20s)   Full gameplay with HUD
//   - Show game:     90-150
//   - Start drag:    150-400    Cursor drags div close
//   - Close zoom:    400-480    "I'm at 1.2 pixels. That sounds close."
//   - Submit:        480-510
//   - Result modal:  510-600    "NOT CENTERED" + Earth Scale
// LEADERBOARD:  600-750 (20-25s)
// CLOSE:        750-900 (25-30s) Success counter + CTA

const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;

const START_POS = { x: 320, y: 680 };
const MID_POS = { x: CENTER_X + 8, y: CENTER_Y - 5 };
const NEAR_POS = { x: CENTER_X + 0.9, y: CENTER_Y - 0.8 }; // ~1.2px off

export const Shorts: React.FC = () => {
  const frame = useCurrentFrame();

  // Two-phase drag: far -> medium -> close
  const drag1Start = 160;
  const drag1End = 300;
  const drag2Start = 320;
  const drag2End = 460;

  let divX: number;
  let divY: number;

  if (frame < drag1Start) {
    divX = START_POS.x;
    divY = START_POS.y;
  } else if (frame < drag1End) {
    const p = cursorPath(frame, drag1Start, drag1End, START_POS, MID_POS);
    divX = p.x;
    divY = p.y;
  } else if (frame < drag2Start) {
    divX = MID_POS.x;
    divY = MID_POS.y;
  } else if (frame < drag2End) {
    const p = cursorPath(frame, drag2Start, drag2End, MID_POS, NEAR_POS);
    divX = p.x;
    divY = p.y;
  } else {
    divX = NEAR_POS.x;
    divY = NEAR_POS.y;
  }

  const devX = Math.abs(divX - CENTER_X);
  const devY = Math.abs(divY - CENTER_Y);
  const devTotal = Math.sqrt(devX * devX + devY * devY);

  const isDragging = (frame >= drag1Start && frame < drag1End) || (frame >= drag2Start && frame < drag2End);
  const showGameplay = frame >= 90 && frame < 600;
  const showResult = frame >= 510 && frame < 600;
  const showLeaderboard = frame >= 600 && frame < 750;
  const showSuccess = frame >= 750;

  return (
    <div style={{ width: WIDTH, height: HEIGHT, position: 'relative', overflow: 'hidden' }}>
      <Background />

      {/* HOOK: 0-3s */}
      <TextOverlay
        text="SUCCESS THRESHOLD: 0.0001px"
        showAt={0}
        hideAt={85}
        position="top"
        size="sm"
        mono
        accent
      />
      <TextOverlay
        text="Can you center a div?"
        showAt={10}
        hideAt={50}
        position="center"
        size="lg"
      />
      <TextOverlay
        text="No. Literally no."
        showAt={45}
        hideAt={85}
        position="center"
        size="lg"
        accent
      />

      {/* WALKTHROUGH: 3-20s */}
      {showGameplay && !showResult && (
        <>
          <DraggableDiv x={divX} y={divY} isDragging={isDragging} />
          <Cursor
            x={divX + 50}
            y={divY + 20}
            visible={frame >= 130}
            clicking={isDragging}
          />
          <HUD
            deviationX={devX}
            deviationY={devY}
            totalDeviation={devTotal}
            showAt={120}
          />
        </>
      )}

      {/* Narration overlays */}
      <TextOverlay
        text="The interface tracks your deviation to six decimal places."
        showAt={200}
        hideAt={280}
        position="bottom"
        size="sm"
      />
      <TextOverlay
        text={`I'm at ${devTotal < 5 ? devTotal.toFixed(1) : '1.2'} pixels. That sounds close.`}
        showAt={380}
        hideAt={470}
        position="bottom"
        size="md"
      />

      {/* Submit button */}
      {frame >= 470 && frame < 510 && (
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

      {/* Result: NOT CENTERED + Earth Scale */}
      {showResult && (
        <ResultModal
          showAt={510}
          deviation={1.204712}
          earthDistance="24,193km"
          earthQuote="You'd miss the Pacific Ocean. The whole thing."
          rank={247}
          percentile={82.4}
        />
      )}

      {/* LEADERBOARD: 20-25s */}
      {showLeaderboard && (
        <>
          <Leaderboard showAt={600} />
          <TextOverlay
            text="The closest is 0.89px. Still 17,000x over the threshold."
            showAt={660}
            hideAt={745}
            position="bottom"
            size="sm"
          />
        </>
      )}

      {/* CLOSE: 25-30s */}
      {showSuccess && (
        <>
          <SuccessCounter showAt={750} />
          <TextOverlay
            text="It just never increments."
            showAt={830}
            hideAt={895}
            position="bottom"
            size="md"
          />
        </>
      )}

      {/* CTA watermark */}
      {frame >= 860 && (
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
            opacity: fadeIn(frame, 860, 10),
          }}
        >
          center-this-div.vercel.app
        </div>
      )}
    </div>
  );
};
