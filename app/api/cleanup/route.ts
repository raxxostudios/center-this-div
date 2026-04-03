import { getDb } from '@/lib/db';
import { headers } from 'next/headers';

// Auto-cleanup: nuke statistically impossible entries
// Runs via Vercel cron every 10 minutes
// Human floor: ~0.03px on high-DPI. Anything below 0.01px is sus.
// Also catches clusters: 3+ entries from same region within 60s = bot

const HUMAN_FLOOR = 0.01; // px - below this is physically impossible via pointer events

export async function GET(req: Request) {
  const headerMap = await headers();
  const authHeader = headerMap.get('authorization');

  // Vercel cron sends this header, or we check for the secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();

    // 1. Nuke entries below human floor
    const nukedFloor = await sql`
      DELETE FROM center_attempts
      WHERE deviation_px < ${HUMAN_FLOOR}
      RETURNING id, deviation_px
    `;

    // 2. Nuke rapid-fire clusters (3+ from same region within 60 seconds)
    const nukedClusters = await sql`
      DELETE FROM center_attempts
      WHERE id IN (
        SELECT a.id FROM center_attempts a
        JOIN center_attempts b ON a.region = b.region
          AND a.id != b.id
          AND ABS(EXTRACT(EPOCH FROM (a.submitted_at - b.submitted_at))) < 60
        GROUP BY a.id
        HAVING COUNT(*) >= 3
      )
      RETURNING id, deviation_px
    `;

    // 3. Recalculate stats
    const best = await sql`SELECT MIN(deviation_px) as best FROM center_attempts`;
    const count = await sql`SELECT COUNT(*) as cnt FROM center_attempts`;
    const newBest = best[0].best || 999;
    await sql`
      UPDATE center_stats
      SET best_deviation = ${newBest}, total_attempts = ${Number(count[0].cnt)}
      WHERE id = 'global'
    `;

    return Response.json({
      cleaned: {
        belowFloor: nukedFloor.length,
        rapidFire: nukedClusters.length,
        total: nukedFloor.length + nukedClusters.length,
      },
      stats: {
        bestDeviation: newBest,
        totalAttempts: Number(count[0].cnt),
      },
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
