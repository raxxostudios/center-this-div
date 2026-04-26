import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_SIZES } from '../../lib/longform-tokens';

export interface TerminalLine {
  // If set, this is rendered as a prompt + command (typed in).
  prompt?: string;
  text: string;
  // Skip the typing animation, render as instant output (e.g., model response).
  isOutput?: boolean;
  // Color override (e.g., red for error, lime for success).
  color?: string;
}

interface TerminalCardProps {
  lines: TerminalLine[];
  durationFrames: number;
  // How many seconds-equivalent each line takes to type. Defaults to ~1s for input, ~0.4s for output.
  typeSpeed?: number;
  // Title shown in the macOS-style title bar.
  title?: string;
}

// Fake macOS terminal. Lines type in sequentially. Used for tech moments
// (claude code session, git commands, error messages). JetBrains Mono font.

const FPS = 30;

export const TerminalCard: React.FC<TerminalCardProps> = ({
  lines,
  durationFrames,
  typeSpeed = 1,
  title = 'claude-code',
}) => {
  const frame = useCurrentFrame();

  // Compute when each line starts typing
  const lineStarts: number[] = [];
  let cursor = 12; // small intro
  for (const line of lines) {
    lineStarts.push(cursor);
    const len = (line.prompt || '').length + line.text.length;
    const lineDur = line.isOutput
      ? Math.max(8, Math.floor(len * 0.6))
      : Math.max(12, Math.floor(len * 1.5 * typeSpeed));
    cursor += lineDur + 6; // gap between lines
  }

  // Card entry slide-in
  const cardOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const cardLift = interpolate(frame, [0, 18], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const exitOpacity = interpolate(frame, [durationFrames - 18, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, calc(-50% + ${cardLift}px))`,
        width: '70%',
        maxWidth: 1280,
        background: '#0d0d0f',
        border: `1px solid ${tokens.borderStrong}`,
        borderRadius: 16,
        boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${tokens.text4}, 0 0 80px ${tokens.accent}10`,
        overflow: 'hidden',
        opacity: cardOpacity * exitOpacity,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.04)',
          borderBottom: `1px solid ${tokens.text4}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: 9999, background: '#ff5f57' }} />
          <div style={{ width: 14, height: 14, borderRadius: 9999, background: '#febc2e' }} />
          <div style={{ width: 14, height: 14, borderRadius: 9999, background: '#28c840' }} />
        </div>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: tokens.mono,
            fontSize: LF_SIZES.small,
            color: tokens.text3,
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '32px 32px 48px',
          fontFamily: tokens.mono,
          fontSize: LF_SIZES.body,
          fontWeight: 500,
          lineHeight: 1.55,
          color: tokens.text,
          minHeight: 480,
        }}
      >
        {lines.map((line, i) => {
          const start = lineStarts[i];
          if (frame < start) return null;
          const len = (line.prompt || '').length + line.text.length;
          const speed = line.isOutput ? 0.6 : 1.5 * typeSpeed;
          const elapsed = (frame - start) / speed;
          const charsTyped = Math.min(len, Math.floor(elapsed));

          let visibleText = '';
          let visiblePrompt = '';
          if (line.prompt) {
            visiblePrompt = line.prompt.slice(0, charsTyped);
            visibleText = line.text.slice(0, Math.max(0, charsTyped - line.prompt.length));
          } else {
            visibleText = line.text.slice(0, charsTyped);
          }

          const isLastTyping = i === lines.length - 1 || frame < lineStarts[i + 1];
          const showCursor = isLastTyping && charsTyped < len && cursorVisible;

          return (
            <div key={i} style={{ marginBottom: line.isOutput ? 16 : 8 }}>
              {visiblePrompt && (
                <span style={{ color: tokens.accent, marginRight: 8 }}>{visiblePrompt}</span>
              )}
              <span style={{ color: line.color || (line.isOutput ? tokens.text2 : tokens.text) }}>
                {visibleText}
                {showCursor && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '0.55em',
                      height: '1.1em',
                      background: tokens.accent,
                      verticalAlign: 'middle',
                      marginLeft: 2,
                    }}
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
