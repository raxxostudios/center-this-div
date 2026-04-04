import { getDb } from '@/lib/db';
import { headers } from 'next/headers';
import { verifyChallenge } from '@/lib/anticheat';

// Simple in-memory rate limit (per-IP, 1 per 2 seconds)
const lastSubmit = new Map<string, number>();

// Anti-cheat: IP strike counter + ban list
// 3 strikes = banned for 1 hour
const strikes = new Map<string, { count: number; lastStrike: number }>();
const banned = new Map<string, number>(); // IP -> ban expiry timestamp
const BAN_DURATION = 3600000; // 1 hour
const MAX_STRIKES = 3;

function addStrike(ip: string, now: number) {
  const s = strikes.get(ip) || { count: 0, lastStrike: 0 };
  s.count++;
  s.lastStrike = now;
  strikes.set(ip, s);
  if (s.count >= MAX_STRIKES) {
    banned.set(ip, now + BAN_DURATION);
  }
}

export async function POST(req: Request) {
  try {
    const headerMap = await headers();
    const ip =
      headerMap.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerMap.get('x-real-ip') ||
      'unknown';
    const ua = headerMap.get('user-agent') || 'unknown';
    const region = headerMap.get('x-vercel-id')?.split('::')[0] || 'unknown';

    const now = Date.now();

    // Check IP ban first
    const banExpiry = banned.get(ip);
    if (banExpiry && now < banExpiry) {
      const minsLeft = Math.ceil((banExpiry - now) / 60000);
      return Response.json(
        { error: `You've been banned for cheating. ${minsLeft}m remaining. Play fair next time.`, teapot: true, nuked: true },
        { status: 418 }
      );
    }
    if (banExpiry && now >= banExpiry) {
      banned.delete(ip);
      strikes.delete(ip);
    }

    // Rate limit: 1 submission per 2 seconds per IP
    const last = lastSubmit.get(ip) || 0;
    if (now - last < 2000) {
      return Response.json(
        { error: 'Too fast. Wait 2 seconds between attempts.' },
        { status: 429 }
      );
    }
    lastSubmit.set(ip, now);

    // Clean up old entries periodically (keep map from growing)
    if (lastSubmit.size > 10000) {
      const cutoff = now - 10000;
      for (const [key, val] of lastSubmit) {
        if (val < cutoff) lastSubmit.delete(key);
      }
    }

    const body = await req.json();
    const { deviationX, deviationY, token, moveCount } = body;

    if (typeof deviationX !== 'number' || typeof deviationY !== 'number') {
      return Response.json({ error: 'Invalid deviation values' }, { status: 400 });
    }

    // Anti-cheat: verify gameplay proof (HMAC-signed challenge token + pointer moves)
    // Without a valid token from /api/challenge + real drag movements, no submission.
    if (!token || typeof moveCount !== 'number') {
      addStrike(ip, now);
      const s = strikes.get(ip);
      return Response.json(
        { error: "418: I'm a teapot. Where's your gameplay proof?", teapot: true, strike: s?.count || 1, maxStrikes: MAX_STRIKES },
        { status: 418 }
      );
    }

    const check = await verifyChallenge(token, moveCount);
    if (!check.valid) {
      addStrike(ip, now);
      const s = strikes.get(ip);
      return Response.json(
        { error: `418: I'm a teapot. (${check.reason})`, teapot: true, strike: s?.count || 1, maxStrikes: MAX_STRIKES },
        { status: 418 }
      );
    }

    // Euclidean distance
    const deviation = Math.sqrt(deviationX * deviationX + deviationY * deviationY);

    // Anti-cheat: reject exact zero (impossible via real pointer events)
    if (deviation === 0 || (deviationX === 0 && deviationY === 0)) {
      addStrike(ip, now);
      const s = strikes.get(ip);
      return Response.json(
        { error: "418: I'm a teapot. Exact zero? Really?", teapot: true, strike: s?.count || 1, maxStrikes: MAX_STRIKES },
        { status: 418 }
      );
    }

    // Anti-cheat: reject below human floor (0.02px is below what pointer events can produce)
    if (deviation < 0.02) {
      addStrike(ip, now);
      const s = strikes.get(ip);
      return Response.json(
        { error: "418: I'm a teapot. Sub-pixel perfection isn't human.", teapot: true, strike: s?.count || 1, maxStrikes: MAX_STRIKES },
        { status: 418 }
      );
    }

    // Anti-cheat: reject suspiciously round deviations
    // Real browser getBoundingClientRect produces messy floating point (e.g. 3.7265625)
    // Fabricated values are typically round numbers (0.01, 0.1, 1.0, etc.)
    const devStr = deviation.toFixed(10);
    const xStr = Math.abs(deviationX).toFixed(10);
    const yStr = Math.abs(deviationY).toFixed(10);

    // Count trailing zeros after decimal point - real browser values have noisy mantissas
    const trailingZeros = (s: string) => {
      const decimal = s.split('.')[1] || '';
      let count = 0;
      for (let i = decimal.length - 1; i >= 0; i--) {
        if (decimal[i] === '0') count++;
        else break;
      }
      return count;
    };

    // If Euclidean distance has 5+ trailing zeros AND both axes are suspiciously clean, it's fabricated
    // Real values from getBoundingClientRect: 3.7265625, 0.048828125, 12.34375 (binary fractions)
    // Fabricated: 0.01000000, 0.10000000, 1.00000000
    if (trailingZeros(devStr) >= 5 && trailingZeros(xStr) >= 5 && trailingZeros(yStr) >= 5 && deviation < 1.0) {
      addStrike(ip, now);
      const s = strikes.get(ip);
      return Response.json(
        { error: "418: I'm a teapot. Those numbers look a little too clean.", teapot: true, strike: s?.count || 1, maxStrikes: MAX_STRIKES },
        { status: 418 }
      );
    }

    // Anti-cheat: check for duplicate deviation pattern from same IP
    // If this IP submitted the exact same deviation (to 4 decimal places) in their last 5 attempts, reject
    const sql = getDb();

    const recentFromIp = await sql`
      SELECT deviation_px FROM center_attempts
      WHERE user_agent = ${ua}
      ORDER BY submitted_at DESC
      LIMIT 5
    `;
    const roundedDev = Math.round(deviation * 10000);
    const dupeCount = recentFromIp.filter(
      (r) => Math.round(Number(r.deviation_px) * 10000) === roundedDev
    ).length;
    if (dupeCount >= 2) {
      addStrike(ip, now);
      const s = strikes.get(ip);
      return Response.json(
        { error: "418: I'm a teapot. Déjà vu? Same score 3 times is suspicious.", teapot: true, strike: s?.count || 1, maxStrikes: MAX_STRIKES },
        { status: 418 }
      );
    }

    // Insert the attempt
    await sql`
      INSERT INTO center_attempts (deviation_px, deviation_x, deviation_y, region, user_agent)
      VALUES (${deviation}, ${deviationX}, ${deviationY}, ${region}, ${ua})
    `;

    // Update global stats (successes never increments, stays 0 forever)
    await sql`
      UPDATE center_stats
      SET
        total_attempts = total_attempts + 1,
        best_deviation = LEAST(best_deviation, ${deviation})
      WHERE id = 'global'
    `;

    // Get rank (how many attempts were closer)
    const rankResult = await sql`
      SELECT COUNT(*) as better_count FROM center_attempts
      WHERE deviation_px < ${deviation}
    `;
    const rank = Number(rankResult[0].better_count) + 1;

    // Get current stats
    const stats = await sql`SELECT * FROM center_stats WHERE id = 'global'`;
    const totalAttempts = Number(stats[0].total_attempts);
    const bestEver = Number(stats[0].best_deviation);

    return Response.json({
      rank,
      totalAttempts,
      bestEver,
      yourDeviation: deviation,
      yourDeviationX: deviationX,
      yourDeviationY: deviationY,
      success: false,
      percentile: totalAttempts > 1 ? Math.round(((totalAttempts - rank) / (totalAttempts - 1)) * 100) : 50,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return Response.json({ error: 'Submit failed' }, { status: 500 });
  }
}
