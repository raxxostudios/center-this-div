'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useCenterGame } from '@/hooks/useCenterGame';
import type { LeaderboardEntry, PercentileCluster } from '@/hooks/useCenterGame';
import { getRandomQuote } from '@/lib/earth-quotes';
import {
  Crosshair,
  Trophy,
  Lightning,
  Clock,
  Globe,
  ChartBar,
  ShareNetwork,
  ArrowClockwise,
  Coffee,
  GithubLogo,
  Target,
  ArrowsOutCardinal,
  Pulse,
  XCircle,
  CursorClick,
  Users,
  WifiHigh,
  Eye,
  CheckCircle,
  Sun,
  Moon,
  Fire,
  Bomb,
} from '@phosphor-icons/react';

/* ---- Helpers ---- */

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function formatDeviation(v: number): string {
  return v.toFixed(6);
}

function deviationColor(total: number): string {
  if (total < 2) return 'var(--green)';
  if (total < 10) return 'var(--accent)';
  return 'var(--red)';
}

function deviationLabel(total: number): string {
  if (total < 0.5) return 'INSANE';
  if (total < 2) return 'CLOSE';
  if (total < 10) return 'WARM';
  if (total < 30) return 'MEH';
  return 'LOST';
}

/* ---- Earth Scale: map pixel deviation to real-world distance ---- */

const EARTH_CIRCUMFERENCE_KM = 40_075;

function getEarthScale(deviationPx: number, targetWidthPx: number): { distanceKm: number; quote: string } {
  const kmPerPx = EARTH_CIRCUMFERENCE_KM / Math.max(targetWidthPx, 1);
  const distanceKm = deviationPx * kmPerPx;
  const result = getRandomQuote(distanceKm);
  return { distanceKm, quote: result.quote };
}

function formatDistance(km: number): string {
  const mm = km * 1_000_000;
  if (mm < 1000) return `${mm.toFixed(0)}mm`;
  const m = km * 1000;
  if (m < 1000) return `${m.toFixed(0)}m`;
  if (km < 100) return `${km.toFixed(1)}km`;
  return `${km.toLocaleString('en', { maximumFractionDigits: 0 })}km`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

/* ---- Share Card Generator ---- */

function generateShareCard(opts: {
  deviation: number;
  deviationX: number;
  deviationY: number;
  rank: number;
  totalAttempts: number;
  percentile: number;
  earthDistanceKm: number;
  earthQuote: string;
}): Promise<Blob> {
  return new Promise((resolve) => {
    const S = 2; // 2x for Retina sharpness
    const W = 1080;
    const H = 1080;
    const P = 48;
    const canvas = document.createElement('canvas');
    canvas.width = W * S;
    canvas.height = H * S;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(S, S);

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, '#242426');
    bgGrad.addColorStop(0.5, '#1f1f21');
    bgGrad.addColorStop(1, '#08081a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Grid (logical coords, S is handled by ctx.scale)
    ctx.strokeStyle = 'rgba(227,252,2,0.025)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < 1080; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1080); ctx.stroke(); }
    for (let y = 0; y < 1080; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }

    // Radial glow
    const glow = ctx.createRadialGradient(540, 380, 0, 540, 380, 420);
    glow.addColorStop(0, 'rgba(0,252,237,0.06)');
    glow.addColorStop(0.5, 'rgba(227,252,2,0.03)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1080);

    // ── Top bar ──
    ctx.fillStyle = 'rgba(227,252,2,0.05)';
    ctx.fillRect(0, 0, W, 52);
    ctx.fillStyle = '#e3fc02';
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.letterSpacing = '4px';
    ctx.textAlign = 'left';
    ctx.fillText('DIV//CENTER', P, 34);
    ctx.fillStyle = 'rgba(245,245,247,0.2)';
    ctx.font = '400 13px "JetBrains Mono", monospace';
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'right';
    ctx.fillText('v4.2.0', W - P, 34);

    // ── NOT CENTERED ──
    ctx.fillStyle = '#ff4060';
    ctx.font = '900 72px "JetBrains Mono", monospace';
    ctx.letterSpacing = '6px';
    ctx.textAlign = 'center';
    ctx.fillText('NOT CENTERED', W / 2, 140);

    // ── Hero deviation number ──
    const devStr = opts.deviation.toFixed(6);
    ctx.fillStyle = '#e3fc02';
    ctx.font = '800 108px "JetBrains Mono", monospace';
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'center';
    ctx.fillText(devStr, W / 2, 280);

    ctx.fillStyle = 'rgba(245,245,247,0.25)';
    ctx.font = '500 28px "JetBrains Mono", monospace';
    ctx.fillText('PIXELS OFF CENTER', W / 2, 320);

    // ── Tier badge ──
    const cardTier = getTier(opts.deviation);
    ctx.font = '700 16px "JetBrains Mono", monospace';
    ctx.letterSpacing = '3px';
    const tierText = cardTier.name.toUpperCase();
    const tierW = ctx.measureText(tierText).width + 32;
    ctx.strokeStyle = cardTier.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(W / 2 - tierW / 2, 332, tierW, 32, 9999); ctx.stroke();
    ctx.fillStyle = cardTier.color;
    ctx.textAlign = 'center';
    ctx.fillText(tierText, W / 2, 354);
    ctx.letterSpacing = '0px';
    ctx.lineWidth = 0.5;

    // ── Divider ──
    ctx.strokeStyle = 'rgba(227,252,2,0.08)';
    ctx.beginPath(); ctx.moveTo(P, 378); ctx.lineTo(W - P, 378); ctx.stroke();

    // ── Stats row (2x2 grid, centered content) ──
    const sY = 400;
    const sW = (W - P * 2 - 20) / 2;
    const sH = 100;
    const drawStat = (col: number, row: number, label: string, value: string, color?: string) => {
      const x = P + col * (sW + 20);
      const y = sY + row * (sH + 16);
      const cx = x + sW / 2;
      ctx.fillStyle = 'rgba(245,245,247,0.03)';
      ctx.beginPath(); ctx.roundRect(x, y, sW, sH, 12); ctx.fill();
      ctx.strokeStyle = 'rgba(245,245,247,0.06)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(245,245,247,0.35)';
      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.letterSpacing = '2px';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, y + 32);

      ctx.fillStyle = color || '#F5F5F7';
      ctx.font = '800 32px "JetBrains Mono", monospace';
      ctx.letterSpacing = '0px';
      ctx.textAlign = 'center';
      ctx.fillText(value, cx, y + 74);
    };

    drawStat(0, 0, 'X OFFSET', `${opts.deviationX > 0 ? '+' : ''}${opts.deviationX.toFixed(2)}px`);
    drawStat(1, 0, 'Y OFFSET', `${opts.deviationY > 0 ? '+' : ''}${opts.deviationY.toFixed(2)}px`);
    drawStat(0, 1, 'GLOBAL RANK', `#${opts.rank} of ${opts.totalAttempts.toLocaleString()}`);
    drawStat(1, 1, 'PERCENTILE', `Top ${100 - opts.percentile}%`, '#e3fc02');

    // ── Earth scale ──
    const eY = sY + sH * 2 + 16 * 2 + 20;
    ctx.fillStyle = 'rgba(0,252,237,0.04)';
    ctx.beginPath(); ctx.roundRect(P, eY, W - P * 2, 130, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(0,252,237,0.12)';
    ctx.stroke();

    ctx.fillStyle = '#00FCED';
    ctx.font = '700 14px "JetBrains Mono", monospace';
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.fillText(`EARTH SCALE: ${formatDistance(opts.earthDistanceKm)} OFF`, W / 2, eY + 32);

    ctx.fillStyle = '#F5F5F7';
    ctx.font = 'italic 600 28px "Outfit", sans-serif';
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'center';
    const words = opts.earthQuote.split(' ');
    let line = '';
    let lineY2 = eY + 68;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > W - P * 2 - 60) {
        ctx.fillText(line.trim(), W / 2, lineY2);
        line = word + ' ';
        lineY2 += 36;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), W / 2, lineY2);

    // ── Verdict bar ──
    const vY = eY + 156;
    ctx.fillStyle = 'rgba(255,64,96,0.06)';
    ctx.beginPath(); ctx.roundRect(P, vY, W - P * 2, 96, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,64,96,0.15)';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(245,245,247,0.3)';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.letterSpacing = '2px';
    ctx.fillText('CENTERED?', W / 2, vY + 24);

    ctx.fillStyle = '#ff4060';
    ctx.font = '900 36px "JetBrains Mono", monospace';
    ctx.letterSpacing = '6px';
    ctx.fillText('NO', W / 2, vY + 60);

    ctx.fillStyle = 'rgba(245,245,247,0.2)';
    ctx.font = '400 11px "JetBrains Mono", monospace';
    ctx.letterSpacing = '0px';
    ctx.fillText(`${(opts.deviation / 0.0001).toFixed(0)}x over threshold  |  Successes: 0. Ever.`, W / 2, vY + 80);

    // ── CTA ──
    const cY = vY + 116;
    ctx.fillStyle = 'rgba(227,252,2,0.08)';
    ctx.beginPath(); ctx.roundRect(W / 2 - 240, cY, 480, 56, 9999); ctx.fill();
    ctx.strokeStyle = 'rgba(227,252,2,0.2)';
    ctx.stroke();
    ctx.fillStyle = '#e3fc02';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.letterSpacing = '4px';
    ctx.textAlign = 'center';
    ctx.fillText('center-this-div.vercel.app', W / 2, cY + 34);

    // ── Footer ──
    const fY = H - 48;
    ctx.fillStyle = 'rgba(245,245,247,0.15)';
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.letterSpacing = '3px';
    ctx.textAlign = 'left';
    ctx.fillText('RAXXO STUDIOS', P, fY);
    ctx.fillStyle = 'rgba(245,245,247,0.1)';
    ctx.font = '400 11px "JetBrains Mono", monospace';
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'right';
    ctx.fillText('#418challenge', W - P, fY);

    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

/* ---- Precision Meter ---- */

function PrecisionMeter({ deviation }: { deviation: number }) {
  // Map deviation to a 0-100 scale (logarithmic)
  // 0px = 100%, 100px+ = 0%
  const pct = Math.max(0, Math.min(100, 100 - Math.log10(Math.max(deviation, 0.00001) + 1) * 50));
  const color = deviationColor(deviation);

  return (
    <div className="precision-meter">
      <div className="precision-label">
        <Target size={12} weight="fill" />
        <span>PRECISION</span>
        <span className="precision-pct" style={{ color }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="precision-track">
        <div
          className="precision-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="precision-tag" style={{ color }}>
        {deviationLabel(deviation)}
      </div>
    </div>
  );
}

/* ---- Leaderboard Row ---- */

function LeaderRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="leader-row">
      <span className="leader-rank">#{entry.rank}</span>
      <span className="leader-dev">{entry.deviation.toFixed(4)}px</span>
      <span className="leader-time">{timeAgo(entry.time)}</span>
    </div>
  );
}

/* ---- Percentile Cluster ---- */

function PercentileRow({ cluster }: { cluster: PercentileCluster }) {
  const color = cluster.pct <= 0.01 ? '#e3fc02' : cluster.pct <= 0.05 ? '#00FCED' : cluster.pct <= 0.10 ? '#22c55e' : cluster.pct <= 0.25 ? '#FF6B00' : cluster.pct <= 0.50 ? '#FF0079' : 'rgba(245,245,247,0.4)';
  return (
    <div className="leader-row" style={{ borderLeft: `2px solid ${color}`, paddingLeft: 8 }}>
      <span className="leader-rank" style={{ color, minWidth: 52 }}>{cluster.label}</span>
      <span className="leader-dev">~ {cluster.threshold < 1 ? cluster.threshold.toFixed(4) : cluster.threshold.toFixed(2)}px</span>
      <span className="leader-time" style={{ opacity: 0.5 }}>{cluster.count.toLocaleString()} entries</span>
    </div>
  );
}

/* ---- Recent Attempt Row ---- */

function RecentRow({ deviation, time }: { deviation: number; time: string }) {
  return (
    <div className="recent-row">
      <span className="recent-dot" style={{ background: deviationColor(deviation) }} />
      <span className="recent-dev">{deviation.toFixed(4)}px</span>
      <span className="recent-time">{timeAgo(time)}</span>
    </div>
  );
}

/* ---- Submit Result Modal ---- */

// Skill tier based on deviation
function getTier(dev: number): { name: string; color: string } {
  if (dev < 0.05) return { name: 'Pixel Surgeon', color: '#e3fc02' };
  if (dev < 0.1) return { name: 'Sub-Pixel Territory', color: '#00FCED' };
  if (dev < 0.5) return { name: 'Microscope Vision', color: '#00FCED' };
  if (dev < 1) return { name: 'Almost Human', color: '#95BF47' };
  if (dev < 5) return { name: 'Getting Warm', color: '#FF6B00' };
  if (dev < 20) return { name: 'In The Neighborhood', color: '#FF6B00' };
  if (dev < 50) return { name: 'Wrong Continent', color: '#FF0079' };
  return { name: 'Did You Even Try', color: '#FF0079' };
}

// Personal best via localStorage
function getPersonalBest(): number | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem('ctd-personal-best');
  return v ? parseFloat(v) : null;
}
function setPersonalBest(dev: number) {
  if (typeof window === 'undefined') return;
  const prev = getPersonalBest();
  if (!prev || dev < prev) localStorage.setItem('ctd-personal-best', String(dev));
}
function getAttemptStreak(): number {
  if (typeof window === 'undefined') return 0;
  const d = localStorage.getItem('ctd-streak-date');
  const c = parseInt(localStorage.getItem('ctd-streak-count') || '0');
  const today = new Date().toISOString().substring(0, 10);
  return d === today ? c : 0;
}
function bumpAttemptStreak() {
  if (typeof window === 'undefined') return;
  const today = new Date().toISOString().substring(0, 10);
  const d = localStorage.getItem('ctd-streak-date');
  const c = parseInt(localStorage.getItem('ctd-streak-count') || '0');
  localStorage.setItem('ctd-streak-date', today);
  localStorage.setItem('ctd-streak-count', String(d === today ? c + 1 : 1));
}

function ResultOverlay({
  result,
  onReset,
  attemptCount,
  elapsedSeconds,
  bestThisSession,
  targetWidth,
  onTeapot,
}: {
  result: NonNullable<ReturnType<typeof useCenterGame>['submitResult']>;
  onReset: () => void;
  attemptCount: number;
  elapsedSeconds: number;
  bestThisSession: number;
  targetWidth: number;
  onTeapot: () => void;
}) {
  const [justCopied, setJustCopied] = useState(false);
  const multiplier = (result.yourDeviation / 0.0001).toFixed(0);
  const url = typeof window !== 'undefined' ? window.location.origin : 'https://center-this-div.vercel.app';
  const tier = getTier(result.yourDeviation);
  const prevBest = getPersonalBest();
  const isNewPB = !prevBest || result.yourDeviation < prevBest;

  useEffect(() => {
    setPersonalBest(result.yourDeviation);
    bumpAttemptStreak();
  }, [result.yourDeviation]);
  // Memoize so the quote doesn't change on every re-render
  const earth = useMemo(() => getEarthScale(result.yourDeviation, targetWidth), [result.yourDeviation, targetWidth]);

  // 418 easter egg: trigger teapot if Earth distance is ~418km
  const triggered418 = useRef(false);
  useEffect(() => {
    if (!triggered418.current && earth.distanceKm >= 417 && earth.distanceKm <= 419) {
      triggered418.current = true;
      setTimeout(onTeapot, 1500);
    }
  }, [earth.distanceKm, onTeapot]);

  const shareText = `I got ${result.yourDeviation.toFixed(6)}px from center in "Can You Center This Div?"\n\nIf the target was Earth, I missed by ${formatDistance(earth.distanceKm)}.\n"${earth.quote}"\n\nRank #${result.rank} of ${result.totalAttempts}. Successes: 0. Ever.\n\n${url}`;

  const shortText = `${result.yourDeviation.toFixed(2)}px off center. ${formatDistance(earth.distanceKm)} on Earth scale. "${earth.quote}" Successes: 0. Ever.`;

  const shareX = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shortText)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareReddit = () => {
    window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shortText)}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };


  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shortText)}`, '_blank');
  };

  const copyResult = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000);
      });
    }
  };

  const cardOpts = {
    deviation: result.yourDeviation,
    deviationX: result.yourDeviationX,
    deviationY: result.yourDeviationY,
    rank: result.rank,
    totalAttempts: result.totalAttempts,
    percentile: result.percentile,
    earthDistanceKm: earth.distanceKm,
    earthQuote: earth.quote,
  };

  const downloadCard = async () => {
    const blob = await generateShareCard(cardOpts);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `center-this-div-${result.yourDeviation.toFixed(2)}px.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const nativeShare = async () => {
    const blob = await generateShareCard(cardOpts);
    const file = new File([blob], 'center-this-div.png', { type: 'image/png' });
    if (navigator.share) {
      await navigator.share({
        title: 'Can You Center This Div?',
        text: shortText,
        url,
        files: [file],
      }).catch(() => {});
    } else {
      downloadCard();
    }
  };

  // 418 Teapot: suspiciously close submission was rejected by anti-cheat
  if (result.teapot) {
    const isNuked = result.nuked;
    const strike = result.strike || 0;
    const maxStrikes = result.maxStrikes || 3;

    return (
      <div className={`result-overlay ${isNuked ? 'teapot-nuked' : ''}`}>
        <div className={`result-card ${isNuked ? 'teapot-nuke-card' : ''}`}>
          <div className="result-scanline" />

          {/* Exploding teapot icon shower */}
          <div className="teapot-explosion" aria-hidden="true">
            {Array.from({ length: isNuked ? 40 : 12 }).map((_, i) => {
              const size = isNuked ? 20 + Math.random() * 32 : 14 + Math.random() * 18;
              const Icon = isNuked ? (i % 3 === 0 ? Bomb : i % 3 === 1 ? Coffee : Fire) : Coffee;
              return (
                <span
                  key={i}
                  className="teapot-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.6}s`,
                    animationDuration: `${1 + Math.random() * 1.5}s`,
                  }}
                >
                  <Icon size={size} weight="fill" />
                </span>
              );
            })}
          </div>

          <div className="result-brand">
            <span className="result-brand-name">RAXXO</span>
            <span className="result-brand-sep">//</span>
            <span className="result-brand-product">ANTI-CHEAT</span>
          </div>

          <div className="result-header">
            <h2 className="result-title glitch" data-text={isNuked ? 'BANNED' : "418: I'M A TEAPOT"}>
              {isNuked ? 'BANNED' : <>418: I&apos;M A TEAPOT</>}
            </h2>
          </div>

          <div className="result-hero">
            <span className="result-hero-value" style={{ fontSize: isNuked ? '1.6rem' : '1.4rem', color: isNuked ? 'var(--red)' : undefined }}>
              {isNuked
                ? 'You have been IP banned for 1 hour.'
                : 'The server refuses to brew coffee. It is a teapot.'}
            </span>
          </div>

          {/* Strike counter */}
          {!isNuked && strike > 0 && (
            <div className="result-earth">
              <div className="result-earth-header" style={{ color: 'var(--red)' }}>
                <XCircle size={14} weight="fill" />
                <span>STRIKE {strike} OF {maxStrikes}</span>
              </div>
              <div className="result-earth-quote">
                {strike >= maxStrikes - 1
                  ? 'One more and you get nuked. Play the actual game.'
                  : 'Submissions require real gameplay. No curl, no Postman, no scripts.'}
              </div>
            </div>
          )}

          {isNuked && (
            <div className="result-earth">
              <div className="result-earth-quote" style={{ color: 'var(--text-2)' }}>
                You tried to cheat a game that is already impossible to win. Think about that.
              </div>
            </div>
          )}

          <div className="result-actions">
            {!isNuked && (
              <button className="result-btn-primary" onClick={onReset}>
                <ArrowClockwise size={16} weight="bold" />
                Play Fair This Time
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-overlay">
      <div className="result-card">
        <div className="result-scanline" />

        {/* RAXXO branding top */}
        <div className="result-brand">
          <span className="result-brand-name">RAXXO</span>
          <span className="result-brand-sep">//</span>
          <span className="result-brand-product">DIV CENTER</span>
        </div>

        <div className="result-header">
          <h2 className="result-title glitch" data-text="NOT CENTERED">NOT CENTERED</h2>
        </div>

        {/* Big deviation hero number - centered */}
        <div className="result-hero">
          <span className="result-hero-value">{result.yourDeviation.toFixed(6)}</span>
          <span className="result-hero-unit">px off</span>
        </div>

        {/* Tier badge + personal best */}
        <div className="result-tier-row">
          <span className="result-tier-badge" style={{ borderColor: tier.color, color: tier.color }}>{tier.name}</span>
          {isNewPB && <span className="result-pb-badge">NEW PB!</span>}
          <span className="result-percentile">Top {(100 - result.percentile).toFixed(0)}%</span>
        </div>

        {/* Compact inline stats */}
        <div className="result-inline-stats">
          <span>X: {result.yourDeviationX > 0 ? '+' : ''}{result.yourDeviationX.toFixed(2)}</span>
          <span className="result-inline-sep">/</span>
          <span>Y: {result.yourDeviationY > 0 ? '+' : ''}{result.yourDeviationY.toFixed(2)}</span>
          <span className="result-inline-sep">/</span>
          <span>Rank #{result.rank} of {result.totalAttempts}</span>
          {prevBest && <><span className="result-inline-sep">/</span><span>PB: {prevBest.toFixed(4)}px</span></>}
        </div>

        {/* Earth scale - the star of the show */}
        <div className="result-earth">
          <div className="result-earth-header">
            <Globe size={14} weight="fill" />
            <span>EARTH SCALE: {formatDistance(earth.distanceKm)}</span>
          </div>
          <div className="result-earth-quote">{earth.quote}</div>
        </div>

        {/* Verdict - centered with context */}
        <div className="result-verdict">
          <span className="result-verdict-label">SUCCESSFULLY CENTERED?</span>
          <span className="result-verdict-no">NO</span>
          <div className="result-verdict-stats">
            <span>{multiplier}x over the 0.0001px threshold</span>
            <span className="result-verdict-sep">|</span>
            <span>Record: {result.bestEver.toFixed(4)}px</span>
            <span className="result-verdict-sep">|</span>
            <span>Successes globally: 0</span>
          </div>
        </div>

        {/* CTA to play */}
        <div className="result-play-cta">
          center-this-div.vercel.app
        </div>

        {/* Share section */}
        <div className="result-share-section">
          <span className="result-share-label">SHARE YOUR FAILURE</span>

          {/* Primary: image share + save */}
          <div className="result-share-primary">
            <button className="share-btn-image" onClick={nativeShare}>
              <ShareNetwork size={16} weight="fill" />
              Share Image
            </button>
            <button className="share-btn-download" onClick={downloadCard}>
              Save PNG
            </button>
            <button className="share-btn-copy-text" onClick={copyResult}>
              {justCopied ? <><CheckCircle size={14} weight="fill" /> Copied</> : <>Copy Text</>}
            </button>
          </div>

          {/* Platform row */}
          <div className="result-share-platforms">
            <button className="share-plat" onClick={shareX}>X</button>
            <button className="share-plat" onClick={shareReddit}>Reddit</button>
            <button className="share-plat" onClick={shareLinkedIn}>LinkedIn</button>
            <button className="share-plat" onClick={shareWhatsApp}>WhatsApp</button>
            <button className="share-plat" onClick={shareTelegram}>Telegram</button>
          </div>
        </div>

        <div className="result-actions">
          <button className="btn-primary" onClick={onReset}>
            <ArrowClockwise size={16} weight="fill" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- 418 Teapot Particle Cloud ---- */

// Teapot defined as contour rings at different heights, creating a clear silhouette
const TEAPOT_POINTS: [number, number, number][] = (() => {
  const pts: [number, number, number][] = [];

  // Helper: ring of points
  const ring = (y: number, r: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([r * Math.cos(a), y, r * Math.sin(a)]);
    }
  };

  // Body profile: dense stacked rings
  const bodyProfile: [number, number][] = [
    [0.42, 0.15], [0.40, 0.22], [0.38, 0.30], [0.36, 0.35],
    [0.34, 0.38], [0.31, 0.42], [0.28, 0.44], [0.25, 0.46],
    [0.22, 0.48], [0.19, 0.49], [0.16, 0.50], [0.13, 0.51],
    [0.10, 0.51], [0.07, 0.51], [0.04, 0.50], [0.01, 0.50],
    [-0.02, 0.49], [-0.05, 0.48], [-0.08, 0.47], [-0.11, 0.45],
    [-0.14, 0.44], [-0.17, 0.42], [-0.20, 0.40], [-0.23, 0.38],
    [-0.26, 0.36], [-0.28, 0.35], [-0.30, 0.34], [-0.32, 0.33],
    [-0.34, 0.31], [-0.35, 0.30],
  ];
  for (const [y, r] of bodyProfile) ring(y, r, 48);

  // Lid
  const lidProfile: [number, number][] = [
    [-0.36, 0.31], [-0.37, 0.30], [-0.38, 0.28], [-0.39, 0.26],
    [-0.40, 0.24], [-0.41, 0.21], [-0.42, 0.18], [-0.43, 0.15],
    [-0.44, 0.12], [-0.45, 0.09],
  ];
  for (const [y, r] of lidProfile) ring(y, r, 32);
  // Knob
  ring(-0.46, 0.06, 14);
  ring(-0.47, 0.05, 12);
  ring(-0.48, 0.04, 10);
  ring(-0.49, 0.025, 8);
  ring(-0.50, 0.01, 4);

  // Spout: curved tube, starts flush with body surface
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const x = 0.42 + t * 0.34 + t * t * 0.16;
    const y = -0.04 - t * 0.10 - t * t * 0.30;
    const r = 0.08 - t * 0.035;
    for (let j = 0; j < 12; j++) {
      const a = (j / 12) * Math.PI * 2;
      pts.push([x, y + r * Math.sin(a), r * Math.cos(a)]);
    }
  }

  // Handle: D-shape, connects at body surface
  // Top attach: y=-0.24, body radius ~0.38 -> x=-0.38
  // Bottom attach: y=0.16, body radius ~0.50 -> x=-0.50
  // Arc bulges out to x ~ -0.76
  const handlePts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    // Cubic bezier: P0=top attach, P1=control top-out, P2=control bottom-out, P3=bottom attach
    // Top attach at shoulder: y=-0.23, body r=0.38
    // Bottom attach at lower belly: y=0.16, body r=0.50
    const p0x = -0.37, p0y = -0.23;
    const p1x = -0.76, p1y = -0.24;
    const p2x = -0.76, p2y = 0.20;
    const p3x = -0.50, p3y = 0.16;
    const mt = 1 - t;
    const hx = mt*mt*mt*p0x + 3*mt*mt*t*p1x + 3*mt*t*t*p2x + t*t*t*p3x;
    const hy = mt*mt*mt*p0y + 3*mt*mt*t*p1y + 3*mt*t*t*p2y + t*t*t*p3y;
    handlePts.push([hx, hy]);
  }
  for (let i = 0; i < handlePts.length; i++) {
    const [hx, hy] = handlePts[i];
    const r = 0.04;
    for (let j = 0; j < 10; j++) {
      const a = (j / 10) * Math.PI * 2;
      pts.push([hx + r * Math.cos(a) * 0.3, hy + r * Math.sin(a) * 0.4, r * Math.cos(a)]);
    }
  }

  return pts;
})();

// Steam particles (generated fresh each frame)
interface SteamParticle { x: number; y: number; life: number; speed: number; drift: number; size: number; }

function TeapotEasterEgg({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const startRef = useRef(Date.now());
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0, rotY: 0, rotX: 0, velY: 0, velX: 0, zoom: 1, pinchDist: 0 });
  const steamRef = useRef<SteamParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    const onDown = (e: PointerEvent) => {
      e.stopPropagation();
      dragRef.current.active = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      dragRef.current.velY = 0;
      dragRef.current.velX = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.rotY += dx * 0.006;
      dragRef.current.rotX += dy * 0.006;
      dragRef.current.velY = dx * 0.006;
      dragRef.current.velX = dy * 0.006;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
    };
    const onUp = () => { dragRef.current.active = false; };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      dragRef.current.zoom = Math.max(0.3, Math.min(3, dragRef.current.zoom - e.deltaY * 0.001));
    };

    // Pinch zoom for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        dragRef.current.pinchDist = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dragRef.current.pinchDist > 0) {
          const scale = dist / dragRef.current.pinchDist;
          dragRef.current.zoom = Math.max(0.3, Math.min(3, dragRef.current.zoom * scale));
        }
        dragRef.current.pinchDist = dist;
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });

    const animate = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const drag = dragRef.current;

      // Auto-rotate when not dragging, with inertia
      if (!drag.active) {
        drag.velY *= 0.96;
        drag.velX *= 0.96;
        if (Math.abs(drag.velY) < 0.0005) drag.velY = 0;
        if (Math.abs(drag.velX) < 0.0005) drag.velX = 0;
        drag.rotY += drag.velY || 0.25 * (1 / 60);
        drag.rotX += drag.velX;
      }

      const rotY = drag.rotY;
      const rotX = drag.rotX;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(6,6,14,0.97)';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(0,252,237,0.025)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const scale = Math.min(W, H) * 0.7 * drag.zoom;
      const centerY = H * 0.4;

      // Project teapot
      const projected: { x: number; y: number; z: number; idx: number }[] = [];
      for (let i = 0; i < TEAPOT_POINTS.length; i++) {
        const [px, py, pz] = TEAPOT_POINTS[i];
        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;
        const y1 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;
        const depth = 2.8 + z2;
        projected.push({ x: W / 2 + (x1 / depth) * scale, y: centerY + (y1 / depth) * scale, z: z2, idx: i });
      }

      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        const dn = (p.z + 1) / 2;
        const sz = 0.8 + dn * 1.2;
        const br = 0.3 + dn * 0.7;
        const fl = 0.9 + Math.sin(elapsed * 2 + p.idx * 0.4) * 0.1;
        const a = br * fl;

        if (p.idx % 6 === 0) {
          ctx.fillStyle = `rgba(227,252,2,${a * 0.9})`;
          ctx.shadowColor = 'rgba(227,252,2,0.3)';
        } else {
          ctx.fillStyle = `rgba(0,252,237,${a * 0.8})`;
          ctx.shadowColor = 'rgba(0,252,237,0.2)';
        }
        ctx.shadowBlur = sz * 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      // Steam particles
      const steam = steamRef.current;
      // Spawn multiple wisps per frame from spout tip
      const spawnCount = Math.random() < 0.8 ? (Math.random() < 0.4 ? 3 : 2) : 1;
      for (let s = 0; s < spawnCount; s++) {
        const tipX = 0.92, tipY = -0.44, tipZ = 0;
        const tx1 = tipX * cosY - tipZ * sinY;
        const tz1 = tipX * sinY + tipZ * cosY;
        const ty1 = tipY * cosX - tz1 * sinX;
        const tz2 = tipY * sinX + tz1 * cosX;
        const td = 2.8 + tz2;
        const sx = W / 2 + (tx1 / td) * scale;
        const sy = centerY + (ty1 / td) * scale;

        steam.push({
          x: sx + (Math.random() - 0.5) * 6,
          y: sy + (Math.random() - 0.5) * 4,
          life: 1,
          speed: 0.3 + Math.random() * 0.8,
          drift: (Math.random() - 0.5) * 0.4,
          size: 0.5 + Math.random() * 1,
        });
      }

      ctx.shadowBlur = 0;
      // Draw + update steam with curl
      for (let i = steam.length - 1; i >= 0; i--) {
        const st = steam[i];
        const age = 1 - st.life;
        st.y -= st.speed * (1 + age * 0.5);
        st.x += st.drift + Math.sin(elapsed * 2.5 + i * 1.3) * (0.3 + age * 0.8);
        st.drift += (Math.random() - 0.5) * 0.03;
        st.life -= 0.008;
        st.size += 0.03 + age * 0.02;

        if (st.life <= 0) { steam.splice(i, 1); continue; }

        const sa = st.life * st.life;
        const g = Math.round(252 - age * 40);
        ctx.fillStyle = `rgba(0,${g},237,${sa * 0.3})`;
        ctx.shadowColor = `rgba(0,252,237,${sa * 0.15})`;
        ctx.shadowBlur = st.size * 4;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cap steam count
      if (steam.length > 150) steam.splice(0, steam.length - 150);

      ctx.shadowBlur = 0;

      // Text
      const ta = 0.6 + Math.sin(elapsed * 1.5) * 0.2;
      ctx.fillStyle = `rgba(227,252,2,${ta})`;
      ctx.font = '800 56px "JetBrains Mono", monospace';
      ctx.letterSpacing = '10px';
      ctx.textAlign = 'center';
      ctx.fillText('418', W / 2, H - 110);

      ctx.fillStyle = `rgba(0,252,237,${ta * 0.6})`;
      ctx.font = '400 16px "JetBrains Mono", monospace';
      ctx.letterSpacing = '4px';
      ctx.fillText("I'M A TEAPOT", W / 2, H - 74);

      ctx.fillStyle = 'rgba(245,245,247,0.2)';
      ctx.font = '400 12px "JetBrains Mono", monospace';
      ctx.letterSpacing = '1px';
      ctx.fillText('I refuse to center your div.', W / 2, H - 48);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="teapot-overlay">
      <button className="teapot-close" onClick={onClose}>
        <XCircle size={24} weight="fill" />
      </button>
      <canvas
        ref={canvasRef}
        width={1200}
        height={1200}
        className="teapot-canvas"
      />
      <div className="teapot-hint">drag to rotate / scroll to zoom / ESC to close</div>
    </div>
  );
}

/* ---- Main Page ---- */

export default function CenterDivChallenge() {
  const game = useCenterGame();
  const color = deviationColor(game.totalDeviation);
  const [lightMode, setLightMode] = useState(false);
  const [teapot, setTeapot] = useState(false);
  const fallbackProducts = [
    { label: 'RAXXO Studio', tag: 'Free', href: 'https://raxxo.shop/pages/studio' },
    { label: 'Claude Blueprint', tag: '33 EUR', href: 'https://raxxo.shop/pages/claude-blueprint' },
    { label: 'Git Dojo', tag: '5 EUR', href: 'https://raxxo.shop/pages/git-dojo' },
    { label: 'OhNine', tag: '9 EUR', href: 'https://raxxo.shop/pages/ohnine' },
    { label: 'FULLMOON', tag: '49 EUR', href: 'https://raxxo.shop/pages/fullmoon' },
    { label: 'Blog', tag: 'Free', href: 'https://raxxo.shop/blogs/lab' },
  ];
  const [allProducts, setAllProducts] = useState(fallbackProducts);
  const raxxoProducts = useMemo(() => {
    const filtered = allProducts.filter(p => p.label !== 'Center This Div');
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [allProducts]);

  useEffect(() => {
    fetch('https://studio.raxxo.shop/api/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setAllProducts(data); })
      .catch(() => {});
  }, []);
  const teapotClicks = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('ctd-theme');
    if (saved === 'light') setLightMode(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setLightMode(prev => {
      const next = !prev;
      localStorage.setItem('ctd-theme', next ? 'light' : 'dark');
      return next;
    });
  }, []);

  const handleTeapotClick = useCallback(() => {
    teapotClicks.current++;
    if (teapotClicks.current >= 4) {
      setTeapot(true);
      teapotClicks.current = 0;
    }
  }, []);


  return (
    <div className={`dashboard ${lightMode ? 'light' : ''}`}>
      {/* Ambient background effects */}
      <div className="bg-grid" />
      <div className="bg-radial" />
      <div className="scan-line" />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-left">
          <Crosshair size={20} weight="fill" className="nav-icon" />
          <h1 className="nav-title">DIV//CENTER</h1>
          <span className="nav-version">v4.2.0</span>
          <span className="nav-status">
            <span className="status-dot status-dot-live" />
            LIVE
          </span>
        </div>
        <div className="nav-center-stats">
          <span className="nav-stat">
            <Users size={13} weight="fill" />
            {game.globalStats.totalAttempts.toLocaleString()} attempts
          </span>
          <span className="nav-stat nav-stat-fail teapot-trigger" onClick={handleTeapotClick}>
            Successes: <strong>0</strong>
          </span>
          <span className="nav-stat nav-stat-tracking">
            <Eye size={13} weight="fill" />
            TRACKING
          </span>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title={lightMode ? 'Dark mode' : 'Light mode'}>
            {lightMode ? <Moon size={14} weight="fill" /> : <Sun size={14} weight="fill" />}
          </button>
          <span className="nav-status nav-status-online">
            <WifiHigh size={12} weight="fill" />
            ONLINE
          </span>
          <span className="nav-timer">
            <Clock size={13} weight="fill" />
            {formatTime(game.elapsedSeconds)}
          </span>
          <a href="https://raxxo.shop/products/buy-me-a-coffee" target="_blank" rel="noopener noreferrer" className="nav-coffee" title="Buy me a coffee">
            <Coffee size={14} weight="fill" />
          </a>
        </div>
      </nav>

      {/* MAIN AREA */}
      <div className="main-area">
        {/* Left Panel: Deviation Readouts */}
        <div className="panel-left">
          <div className="panel-card panel-3d-left">
            <h3 className="panel-heading">
              <ChartBar size={14} weight="fill" />
              DEVIATION READOUT
            </h3>

            <div className="readout-group">
              <div className="readout">
                <span className="readout-label">X OFFSET</span>
                <span className="readout-value" style={{ color }}>
                  {game.deviationX > 0 ? '+' : ''}{formatDeviation(game.deviationX)}
                  <span className="readout-unit">px</span>
                </span>
              </div>
              <div className="readout">
                <span className="readout-label">Y OFFSET</span>
                <span className="readout-value" style={{ color }}>
                  {game.deviationY > 0 ? '+' : ''}{formatDeviation(game.deviationY)}
                  <span className="readout-unit">px</span>
                </span>
              </div>
              <div className="readout readout-total">
                <span className="readout-label">TOTAL DISTANCE</span>
                <span className="readout-value readout-big" style={{ color }}>
                  {formatDeviation(game.totalDeviation)}
                  <span className="readout-unit">px</span>
                </span>
              </div>
            </div>
          </div>

          <div className="panel-card panel-3d-left">
            <h3 className="panel-heading">
              <Target size={14} weight="fill" />
              ACCURACY
            </h3>
            <PrecisionMeter deviation={game.totalDeviation} />
          </div>

          <div className="panel-card panel-3d-left">
            <h3 className="panel-heading">
              <Lightning size={14} weight="fill" />
              SESSION
            </h3>
            <div className="session-stats">
              <div className="session-row">
                <span className="session-label">Attempts</span>
                <span className="session-value">{game.attemptCount}</span>
              </div>
              <div className="session-row">
                <span className="session-label">Best</span>
                <span className="session-value">
                  {game.bestThisSession < 900 ? `${game.bestThisSession.toFixed(4)}px` : '--'}
                </span>
              </div>
              <div className="session-row">
                <span className="session-label">Threshold</span>
                <span className="session-value session-threshold">0.0001px</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: The Target Area */}
        <div className="center-col">
          <div className="target-header">
            <CursorClick size={14} weight="fill" />
            <span>DRAG THE DIV TO CENTER</span>
            <ArrowsOutCardinal size={14} weight="fill" />
          </div>

          <div
            className="target-area"
            ref={game.targetRef}
            onPointerMove={game.handlePointerMove}
            onPointerUp={game.handlePointerUp}
          >
            {/* HUD corner brackets */}
            <div className="hud-corner hud-tl" />
            <div className="hud-corner hud-tr" />
            <div className="hud-corner hud-bl" />
            <div className="hud-corner hud-br" />

            {/* Radar sweep */}
            <div className="radar-sweep" />

            {/* Player blips from last 100 attempts - amplified so convergence is visible */}
            {game.targetRef.current && game.globalStats.recentAttempts.map((a, i) => {
              const rect = game.targetRef.current!.getBoundingClientRect();
              const cx = rect.width / 2;
              const cy = rect.height / 2;
              // Gentle amplification: close attempts cluster tight, far ones spread naturally
              // 0.04px -> ~3px on screen, 1px -> ~18px, 10px -> ~42px, 100px -> ~80px
              const amplify = (v: number) => Math.sign(v) * Math.log1p(Math.abs(v) * 3) * 18;
              const bx = Math.max(4, Math.min(rect.width - 4, cx + amplify(a.deviationX)));
              const by = Math.max(4, Math.min(rect.height - 4, cy + amplify(a.deviationY)));
              const age = (Date.now() - new Date(a.time).getTime()) / 60000;
              const opacity = Math.max(0.12, 1 - age / 10); // fade over 10 minutes
              const isRecent = age < 0.5; // last 30 seconds
              return (
                <div
                  key={i}
                  className={`radar-blip ${isRecent ? 'radar-blip-new' : ''}`}
                  style={{
                    left: `${bx}px`,
                    top: `${by}px`,
                    opacity,
                  }}
                />
              );
            })}

            {/* Grid dots */}
            <div className="target-grid" />

            {/* Crosshair */}
            <div className="crosshair-h" />
            <div className="crosshair-v" />

            {/* Center marker */}
            <div className="center-marker">
              <div className="center-ring center-ring-1" />
              <div className="center-ring center-ring-2" />
              <div className="center-ring center-ring-3" />
              <div className="center-dot" />
            </div>

            {/* Measurement lines (visible when dragging or placed) */}
            {game.hasPlaced && game.divX > 0 && game.targetRef.current && (
              <>
                {/* Horizontal measurement line */}
                <div
                  className="measure-line measure-h"
                  style={{
                    left: `${Math.min(game.divX, game.targetRef.current.getBoundingClientRect().width / 2)}px`,
                    top: `${game.divY}px`,
                    width: `${Math.abs(game.deviationX)}px`,
                  }}
                />
                {/* Vertical measurement line */}
                <div
                  className="measure-line measure-v"
                  style={{
                    left: `${game.targetRef.current.getBoundingClientRect().width / 2}px`,
                    top: `${Math.min(game.divY, game.targetRef.current.getBoundingClientRect().height / 2)}px`,
                    height: `${Math.abs(game.deviationY)}px`,
                  }}
                />
                {/* X label - bottom-right of div */}
                <div
                  className="measure-label measure-label-x"
                  style={{
                    left: `${game.divX + 48}px`,
                    top: `${game.divY + 12}px`,
                    color,
                  }}
                >
                  X: {game.deviationX > 0 ? '+' : ''}{game.deviationX.toFixed(2)}px
                </div>
                {/* Y label - below-right of div */}
                <div
                  className="measure-label measure-label-y"
                  style={{
                    left: `${game.divX + 12}px`,
                    top: `${game.divY + 48}px`,
                    color,
                  }}
                >
                  Y: {game.deviationY > 0 ? '+' : ''}{game.deviationY.toFixed(2)}px
                </div>
              </>
            )}

            {/* The draggable div */}
            <div
              ref={game.divRef}
              className={`draggable-div ${game.isDragging ? 'dragging' : ''}`}
              style={{
                left: `${game.divX - 40}px`,
                top: `${game.divY - 40}px`,
                borderColor: color,
                boxShadow: `0 0 16px ${color}40, 0 0 48px ${color}15`,
              }}
              onPointerDown={game.handlePointerDown}
            >
              <span className="div-label">&lt;div&gt;</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="target-actions">
            <button
              className="btn-submit"
              onClick={game.submitAttempt}
              disabled={!game.hasPlaced || game.isSubmitting || game.submitted}
            >
              {game.isSubmitting ? (
                <>
                  <Pulse size={16} weight="fill" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Crosshair size={16} weight="fill" />
                  Submit Attempt
                </>
              )}
            </button>
          </div>
          <p className="anticheat-notice">
            Submissions are pattern-analyzed. Fabricated values get the teapot. The cron learns.
          </p>
        </div>

        {/* Right Panel: Leaderboard + Feed */}
        <div className="panel-right">
          <div className="panel-card panel-3d-right">
            <h3 className="panel-heading">
              <Trophy size={14} weight="fill" />
              ALL TIME STANDINGS
            </h3>
            <div className="leader-list">
              {game.percentiles.length === 0 && (
                <p className="panel-empty">No attempts yet</p>
              )}
              {game.percentiles.map((cluster) => (
                <PercentileRow key={cluster.label} cluster={cluster} />
              ))}
            </div>
            {(() => {
              const pb = getPersonalBest();
              const total = game.totalAttempts;
              if (!pb || total === 0) return null;
              const yourPct = game.percentiles.find((c: PercentileCluster) => pb <= c.threshold);
              const rank = yourPct ? Math.max(1, Math.round(total * yourPct.pct)) : total;
              return (
                <div className="leader-context">
                  <div className="leader-ranges">
                    <span className="leader-range leader-range-you"><span className="leader-range-label">You</span> #{rank.toLocaleString()} of {total.toLocaleString()} ({yourPct ? yourPct.label : 'Bottom 50%'})</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="panel-card panel-3d-right">
            <h3 className="panel-heading">
              <Globe size={14} weight="fill" />
              LIVE FEED
            </h3>
            <div className="recent-list">
              {game.globalStats.recentAttempts.length === 0 && (
                <p className="panel-empty">Waiting for attempts...</p>
              )}
              {game.globalStats.recentAttempts.map((a, i) => (
                <RecentRow key={i} deviation={a.deviation} time={a.time} />
              ))}
            </div>
          </div>

          <div className="panel-card panel-3d-right panel-card-highlight">
            <h3 className="panel-heading">
              <Crosshair size={14} weight="fill" />
              LAST 24H GLOBAL RECORD
            </h3>
            <div className="global-record">
              <span className="global-record-value">
                {game.globalStats.best24h != null
                  ? `${game.globalStats.best24h.toFixed(6)}px`
                  : game.globalStats.bestDeviation < 900
                  ? `${game.globalStats.bestDeviation.toFixed(6)}px`
                  : '--'}
              </span>
              <span className="global-record-label">{game.globalStats.best24h != null ? 'closest in the last 24 hours' : 'closest attempt ever'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MORE FROM RAXXO */}
      {raxxoProducts.length > 0 && (
        <div className="more-from-raxxo">
          <span className="more-label">More from RAXXO</span>
          <div className="more-links">
            {raxxoProducts.map(p => (
              <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer" className="more-link">
                {p.label}
                <span className="more-tag">{p.tag}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer-line">
        <div className="footer-left">
          <a href="https://raxxo.shop" target="_blank" rel="noopener noreferrer" className="footer-link">
            RAXXO Studios
          </a>
          <span className="footer-sep">/</span>
          <a
            href="https://dev.to/devteam/join-our-april-fools-challenge-for-a-chance-at-tea-rrific-prizes-1ofa"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            DEV April Fools 2026
          </a>
          <span className="footer-sep">/</span>
          <a
            href="https://raxxo.shop/products/buy-me-a-coffee"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link footer-coffee"
          >
            <Coffee size={13} weight="fill" />
            Buy me a coffee
          </a>
          <span className="footer-sep">/</span>
          <a
            href="https://github.com/raxxostudios/center-this-div"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <GithubLogo size={13} weight="fill" />
            Source
          </a>
        </div>
        <div className="footer-right">
          <span className="footer-zero">Successfully centered: 0. Globally. Ever.</span>
        </div>
      </footer>

      {/* 418 Teapot easter egg - particle cloud */}
      {teapot && <TeapotEasterEgg onClose={() => setTeapot(false)} />}

      {/* Result overlay */}
      {game.submitted && game.submitResult && (
        <ResultOverlay
          result={game.submitResult}
          onReset={game.resetAttempt}
          attemptCount={game.attemptCount}
          elapsedSeconds={game.elapsedSeconds}
          bestThisSession={game.bestThisSession}
          targetWidth={game.targetRef.current?.getBoundingClientRect().width || 800}
          onTeapot={() => setTeapot(true)}
        />
      )}

    </div>
  );
}
