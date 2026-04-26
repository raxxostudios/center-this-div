import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { tokens } from '../../lib/tokens';

interface KineticDialogueProps {
  text: string;
  durationFrames: number;
  // Tier of typography. mega = 180px, xl = 130px, lg = 96px, md = 64px
  size?: 'mega' | 'xl' | 'lg' | 'md';
  // Words that should be highlighted in the accent color (case-insensitive).
  // Numbers and dates are auto-detected.
  emphasizeWords?: string[];
  // Vertical anchor. Default center.
  align?: 'top' | 'center' | 'bottom';
  // Color of the highlighted phrases. Defaults to lime.
  accent?: string;
}

const SIZE_PX: Record<string, number> = { mega: 180, xl: 130, lg: 96, md: 64 };

// Strip ElevenLabs v3 inline tags (e.g., [pause 0.4s], [excited]) before display.
function stripTags(s: string): string {
  return s.replace(/\[[^\]]+\]\s*/g, '').trim();
}

function isEmphasized(word: string, emphasize: Set<string>): boolean {
  const clean = word.toLowerCase().replace(/[^\w-]/g, '');
  if (!clean) return false;
  if (emphasize.has(clean)) return true;
  // Auto-emphasize: numbers, ordinal dates (twenty-fourth, seventh, etc.)
  if (/\d/.test(clean)) return true;
  if (/^(january|february|march|april|may|june|july|august|september|october|november|december)$/i.test(clean)) return true;
  if (/(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|teenth|fourteenth|sixteenth|twentieth|fourth|sixth|seventh)$/i.test(clean)) return true;
  if (/^(seven|five|three|four|six|eight|nine|ten|twenty|thirty|forty|fifty|hundred|thousand|million|billion)$/i.test(clean)) return true;
  return false;
}

// Stagger words in over time. Each word fades + slides up. Key phrases pulse
// in lime. Full-frame, large type — content carries the screen.

export const KineticDialogue: React.FC<KineticDialogueProps> = ({
  text,
  durationFrames,
  size = 'xl',
  emphasizeWords = [],
  align = 'center',
  accent = tokens.accent,
}) => {
  const frame = useCurrentFrame();
  const fontSize = SIZE_PX[size] ?? SIZE_PX.xl;
  const cleanText = stripTags(text);
  const words = cleanText.split(/(\s+)/); // keeps whitespace tokens
  const wordTokens = words.filter(w => /\S/.test(w));
  const totalWordTokens = Math.max(1, wordTokens.length);

  // Stagger: distribute words across first 65% of duration, fade out final 12%
  const animateUntil = Math.floor(durationFrames * 0.65);
  const exitStart = durationFrames - 14;
  const perWordFrames = Math.max(2, Math.floor(animateUntil / totalWordTokens));

  const emphasize = new Set(emphasizeWords.map(w => w.toLowerCase()));

  // Build per-word timing
  let wordIdx = 0;
  const rendered = words.map((token, i) => {
    if (!/\S/.test(token)) {
      return <span key={i}>{token}</span>;
    }
    const myStart = wordIdx * perWordFrames;
    wordIdx++;
    const opacity = interpolate(frame, [myStart, myStart + 7], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
    const slide = interpolate(frame, [myStart, myStart + 9], [18, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
    const isHi = isEmphasized(token, emphasize);
    return (
      <span
        key={i}
        style={{
          display: 'inline-block',
          opacity,
          transform: `translateY(${slide}px)`,
          color: isHi ? accent : tokens.text,
          textShadow: isHi
            ? `0 0 32px ${accent}66, 0 0 8px ${accent}aa`
            : '0 4px 24px rgba(0,0,0,0.8)',
        }}
      >
        {token}
      </span>
    );
  });

  // Master exit fade
  const exitOpacity = interpolate(frame, [exitStart, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const verticalAlign = {
    top: { top: '15%' },
    center: { top: '50%', transform: 'translateY(-50%)' },
    bottom: { bottom: '15%' },
  }[align];

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        ...verticalAlign,
        padding: '0 64px',
        textAlign: 'center',
        fontFamily: tokens.sans,
        fontSize,
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        opacity: exitOpacity,
      }}
    >
      {rendered}
    </div>
  );
};
