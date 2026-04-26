import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';
import { LF_SIZES } from '../../lib/longform-tokens';

interface DateTimelineItem {
  date: string;
  label?: string;
  // Color of the dot. Defaults to red for "bad" events; pass tokens.accent for good.
  color?: string;
}

interface DateTimelineProps {
  items: DateTimelineItem[];
  durationFrames: number;
  // Headline above the timeline.
  headline?: string;
}

// Horizontal timeline with dots that pulse in sequentially. Connecting line
// draws across as time advances. Dates appear above each dot, labels below.
// Used for hook scenes that establish a chronology of events.

export const DateTimeline: React.FC<DateTimelineProps> = ({ items, durationFrames, headline }) => {
  const frame = useCurrentFrame();
  const n = items.length;
  if (n === 0) return null;

  // Each item gets a slot: line draws in, then dot appears + pulse, then date + label.
  const animateWindow = Math.floor(durationFrames * 0.7);
  const perItem = Math.floor(animateWindow / n);

  // Master exit
  const exitOpacity = interpolate(frame, [durationFrames - 14, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const enterOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Headline fade-in
  const headlineOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '0 64px',
        opacity: enterOpacity * exitOpacity,
      }}
    >
      {headline && (
        <div
          style={{
            fontFamily: tokens.mono,
            fontSize: LF_SIZES.title,
            fontWeight: 800,
            color: tokens.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            textAlign: 'center',
            marginBottom: 64,
            opacity: headlineOpacity,
            textShadow: `0 0 32px ${tokens.accent}55`,
          }}
        >
          {headline}
        </div>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 32,
          padding: '0 64px',
        }}
      >
        {/* Connecting line drawing across */}
        <div
          style={{
            position: 'absolute',
            left: 64,
            right: 64,
            top: '50%',
            height: 2,
            background: tokens.text4,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 64,
            top: '50%',
            height: 3,
            background: tokens.accent,
            boxShadow: `0 0 16px ${tokens.accent}80`,
            width: `calc(${interpolate(frame, [0, animateWindow], [0, 100], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.inOut(Easing.cubic),
            })}% - 128px)`,
          }}
        />

        {items.map((item, i) => {
          const myStart = i * perItem;
          const dotScale = interpolate(frame, [myStart, myStart + 8], [0, 1.3], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.back(2)),
          });
          const dotSettle = interpolate(frame, [myStart + 8, myStart + 14], [1.3, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
          const finalScale = frame < myStart + 8 ? dotScale : dotSettle;

          const dateOpacity = interpolate(frame, [myStart + 4, myStart + 16], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });
          const labelOpacity = interpolate(frame, [myStart + 8, myStart + 22], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });

          const color = item.color || tokens.red;
          const pulse = 0.7 + 0.3 * Math.sin((frame - myStart) * 0.12);

          return (
            <div
              key={i}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  fontFamily: tokens.mono,
                  fontSize: LF_SIZES.subtitle,
                  fontWeight: 700,
                  color: tokens.text,
                  marginBottom: 24,
                  opacity: dateOpacity,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {item.date}
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  background: color,
                  transform: `scale(${finalScale})`,
                  boxShadow: `0 0 ${12 + 24 * pulse}px ${color}, 0 0 4px ${color}`,
                }}
              />
              {item.label && (
                <div
                  style={{
                    fontFamily: tokens.sans,
                    fontSize: LF_SIZES.body,
                    fontWeight: 500,
                    color: tokens.text2,
                    marginTop: 24,
                    maxWidth: 320,
                    textAlign: 'center',
                    lineHeight: 1.3,
                    opacity: labelOpacity,
                  }}
                >
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
