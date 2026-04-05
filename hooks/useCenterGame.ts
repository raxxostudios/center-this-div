'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface GlobalStats {
  totalAttempts: number;
  bestDeviation: number;
  successes: number;
  recentAttempts: {
    deviation: number;
    deviationX: number;
    deviationY: number;
    time: string;
    region: string;
  }[];
}

export interface LeaderboardEntry {
  rank: number;
  deviation: number;
  deviationX: number;
  deviationY: number;
  time: string;
  region: string;
}

export interface PercentileCluster {
  label: string;
  pct: number;
  threshold: number;
  count: number;
  samples: { deviation: number; region: string; time: string }[];
}

export interface SubmitResult {
  rank: number;
  totalAttempts: number;
  bestEver: number;
  yourDeviation: number;
  yourDeviationX: number;
  yourDeviationY: number;
  success: boolean;
  percentile: number;
  teapot?: boolean;
  nuked?: boolean;
  strike?: number;
  maxStrikes?: number;
}

export interface CenterGameState {
  // Div position (center of div relative to target area)
  divX: number;
  divY: number;
  // Deviation from true center
  deviationX: number;
  deviationY: number;
  totalDeviation: number;
  // Drag state
  isDragging: boolean;
  hasPlaced: boolean;
  // Target area dimensions
  targetRef: React.RefObject<HTMLDivElement | null>;
  divRef: React.RefObject<HTMLDivElement | null>;
  // Game state
  isSubmitting: boolean;
  submitted: boolean;
  submitResult: SubmitResult | null;
  bestThisSession: number;
  attemptCount: number;
  // Timer
  elapsedSeconds: number;
  // Global stats
  globalStats: GlobalStats;
  leaderboard: LeaderboardEntry[];
  percentiles: PercentileCluster[];
  totalAttempts: number;
  // Actions
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: () => void;
  submitAttempt: () => void;
  resetAttempt: () => void;
  generateShareText: () => string;
}

export function useCenterGame(): CenterGameState {
  const [divX, setDivX] = useState(0);
  const [divY, setDivY] = useState(0);
  const [deviationX, setDeviationX] = useState(0);
  const [deviationY, setDeviationY] = useState(0);
  const [totalDeviation, setTotalDeviation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasPlaced, setHasPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [bestThisSession, setBestThisSession] = useState(999);
  const [attemptCount, setAttemptCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalAttempts: 0,
    bestDeviation: 999,
    successes: 0,
    recentAttempts: [],
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [percentiles, setPercentiles] = useState<PercentileCluster[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const targetRef = useRef<HTMLDivElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(Date.now());
  const challengeToken = useRef<string>('');
  const pointerMoveCount = useRef<number>(0);

  // Calculate deviation from true center
  const updateDeviation = useCallback((x: number, y: number) => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const devX = x - centerX;
    const devY = y - centerY;
    const total = Math.sqrt(devX * devX + devY * devY);
    setDeviationX(devX);
    setDeviationY(devY);
    setTotalDeviation(total);
  }, []);

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (submitted) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    if (!hasPlaced) setHasPlaced(true);

    if (targetRef.current && divRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const divRect = divRef.current.getBoundingClientRect();
      const divCenterX = divRect.left + divRect.width / 2 - targetRect.left;
      const divCenterY = divRect.top + divRect.height / 2 - targetRect.top;
      const pointerX = e.clientX - targetRect.left;
      const pointerY = e.clientY - targetRect.top;
      dragOffset.current = {
        x: pointerX - divCenterX,
        y: pointerY - divCenterY,
      };
    }
  }, [submitted, hasPlaced]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !targetRef.current) return;
    e.preventDefault();
    pointerMoveCount.current++;
    const rect = targetRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.current.x;
    const y = e.clientY - rect.top - dragOffset.current.y;

    // Clamp to target area
    const halfDiv = 40; // div is 80px
    const clampedX = Math.max(halfDiv, Math.min(rect.width - halfDiv, x));
    const clampedY = Math.max(halfDiv, Math.min(rect.height - halfDiv, y));

    setDivX(clampedX);
    setDivY(clampedY);
    updateDeviation(clampedX, clampedY);
  }, [isDragging, updateDeviation]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Submit attempt
  const submitAttempt = useCallback(async () => {
    if (isSubmitting || submitted) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviationX,
          deviationY,
          token: challengeToken.current,
          moveCount: pointerMoveCount.current,
        }),
      });

      if (res.status === 429) {
        setIsSubmitting(false);
        return;
      }

      // Anti-cheat teapot: show result with the teapot flag instead of crashing
      if (res.status === 418) {
        const errData = await res.json().catch(() => ({}));
        setSubmitResult({
          rank: 0,
          totalAttempts: 0,
          bestEver: 0,
          yourDeviation: Math.sqrt(deviationX * deviationX + deviationY * deviationY),
          yourDeviationX: deviationX,
          yourDeviationY: deviationY,
          success: false,
          percentile: 0,
          teapot: true,
          nuked: errData.nuked || false,
          strike: errData.strike,
          maxStrikes: errData.maxStrikes,
        });
        setSubmitted(true);
        setAttemptCount((c) => c + 1);
        return;
      }

      const data: SubmitResult = await res.json();
      setSubmitResult(data);
      setSubmitted(true);
      setAttemptCount((c) => c + 1);
      if (data.yourDeviation < bestThisSession) {
        setBestThisSession(data.yourDeviation);
      }
    } catch {
      // Silently fail, user can retry
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, submitted, deviationX, deviationY, bestThisSession]);

  // Reset for another attempt
  const resetAttempt = useCallback(() => {
    setSubmitted(false);
    setSubmitResult(null);
    setHasPlaced(false);
    pointerMoveCount.current = 0;
    // Fresh challenge token for next attempt
    fetch('/api/challenge')
      .then((r) => r.json())
      .then((d) => { challengeToken.current = d.token; })
      .catch(() => {});
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      // Place div at random offset, at least 60px from center
      let offsetX: number, offsetY: number, dist: number;
      do {
        offsetX = (Math.random() - 0.5) * rect.width * 0.6;
        offsetY = (Math.random() - 0.5) * rect.height * 0.6;
        dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      } while (dist < 60);
      const newX = rect.width / 2 + offsetX;
      const newY = rect.height / 2 + offsetY;
      setDivX(newX);
      setDivY(newY);
      updateDeviation(newX, newY);
    }
  }, [updateDeviation]);

  // Generate share text
  const generateShareText = useCallback(() => {
    const dev = totalDeviation.toFixed(6);
    const emoji = totalDeviation < 1 ? '🎯' : totalDeviation < 5 ? '👀' : '😅';
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://center-this-div.vercel.app';
    return `${emoji} I got ${dev}px from center in "Can You Center This Div?"\n\nAttempt #${attemptCount} | Best: ${bestThisSession.toFixed(6)}px\nGlobal successes: 0. Ever.\n\n${url}`;
  }, [totalDeviation, attemptCount, bestThisSession]);

  // Poll global stats every 15 seconds (saves Neon transfer bandwidth)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, lbRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/leaderboard'),
        ]);
        const statsData = await statsRes.json();
        const lbData = await lbRes.json();
        setGlobalStats(statsData);
        setLeaderboard(lbData.leaderboard || []);
        setPercentiles(lbData.percentiles || []);
        if (lbData.total) setTotalAttempts(lbData.total);
      } catch {
        // Silently fail
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  // Timer
  useEffect(() => {
    startTime.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Initialize div position
  useEffect(() => {
    const initPosition = () => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          let offsetX: number, offsetY: number, dist: number;
          do {
            offsetX = (Math.random() - 0.5) * rect.width * 0.4;
            offsetY = (Math.random() - 0.5) * rect.height * 0.4;
            dist = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
          } while (dist < 60);
          const x = rect.width / 2 + offsetX;
          const y = rect.height / 2 + offsetY;
          setDivX(x);
          setDivY(y);
          updateDeviation(x, y);
        }
      }
    };
    // Defer to ensure layout is ready
    const raf = requestAnimationFrame(() => {
      setTimeout(initPosition, 50);
    });
    return () => cancelAnimationFrame(raf);
  }, [updateDeviation]);

  // Init DB tables + fetch anti-cheat challenge token on mount
  useEffect(() => {
    fetch('/api/init', { method: 'POST' }).catch(() => {});
    fetch('/api/challenge')
      .then((r) => r.json())
      .then((d) => { challengeToken.current = d.token; })
      .catch(() => {});

    // Block browser zoom on the game area (Ctrl+scroll, Ctrl+plus/minus)
    // Teapot 3D scene has its own zoom which stays enabled
    const blockZoom = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const inTeapot = target.closest('.teapot-modal');
      if ((e.ctrlKey || e.metaKey) && !inTeapot) e.preventDefault();
    };
    const blockKeyZoom = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
        e.preventDefault();
      }
    };
    // Block right-click inspect on game area (makes DevTools spoofing slightly harder)
    const blockContext = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.target-area') || target.closest('.draggable-div')) {
        e.preventDefault();
      }
    };
    document.addEventListener('wheel', blockZoom, { passive: false });
    document.addEventListener('keydown', blockKeyZoom);
    document.addEventListener('contextmenu', blockContext);
    return () => {
      document.removeEventListener('wheel', blockZoom);
      document.removeEventListener('keydown', blockKeyZoom);
      document.removeEventListener('contextmenu', blockContext);
    };
  }, []);

  return {
    divX,
    divY,
    deviationX,
    deviationY,
    totalDeviation,
    isDragging,
    hasPlaced,
    targetRef,
    divRef,
    isSubmitting,
    submitted,
    submitResult,
    bestThisSession,
    attemptCount,
    elapsedSeconds,
    globalStats,
    leaderboard,
    percentiles,
    totalAttempts,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    submitAttempt,
    resetAttempt,
    generateShareText,
  };
}
