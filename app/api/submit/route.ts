import { getDb } from '@/lib/db';
import { headers } from 'next/headers';
import { verifyChallenge } from '@/lib/anticheat';

// Simple in-memory rate limit (per-IP, 1 per 2 seconds)
const lastSubmit = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const headerMap = await headers();
    const ip =
      headerMap.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerMap.get('x-real-ip') ||
      'unknown';
    const ua = headerMap.get('user-agent') || 'unknown';
    const region = headerMap.get('x-vercel-id')?.split('::')[0] || 'unknown';

    // Rate limit: 1 submission per 2 seconds per IP
    const now = Date.now();
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
      return Response.json(
        { error: "418: I'm a teapot. Where's your gameplay proof?", teapot: true },
        { status: 418 }
      );
    }

    const check = await verifyChallenge(token, moveCount);
    if (!check.valid) {
      return Response.json(
        { error: `418: I'm a teapot. (${check.reason})`, teapot: true },
        { status: 418 }
      );
    }

    // Euclidean distance
    const deviation = Math.sqrt(deviationX * deviationX + deviationY * deviationY);

    const sql = getDb();

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
