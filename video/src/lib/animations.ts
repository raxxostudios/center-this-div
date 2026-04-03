import { interpolate, Easing } from 'remotion';

export function fadeIn(frame: number, start: number, duration = 10): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
}

export function fadeOut(frame: number, start: number, duration = 10): number {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
}

export function slideUp(frame: number, start: number, duration = 15): number {
  return interpolate(frame, [start, start + duration], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
}

export function typewriter(text: string, frame: number, start: number, charsPerFrame = 1.5): string {
  const elapsed = Math.max(0, frame - start);
  const chars = Math.floor(elapsed * charsPerFrame);
  return text.slice(0, chars);
}

export function cursorPath(
  frame: number,
  startFrame: number,
  endFrame: number,
  from: { x: number; y: number },
  to: { x: number; y: number },
): { x: number; y: number } {
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}

export function countUp(
  frame: number,
  startFrame: number,
  endFrame: number,
  from: number,
  to: number,
): number {
  return interpolate(frame, [startFrame, endFrame], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
}

export function pulse(frame: number, speed = 0.05): number {
  return 0.85 + 0.15 * Math.sin(frame * speed * Math.PI * 2);
}
