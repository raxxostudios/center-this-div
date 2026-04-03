import { getDb } from '@/lib/db';
import { headers } from 'next/headers';

// Auto-cleanup: nuke statistically impossible entries
// Runs via Vercel cron every 10 minutes (Pro plan)
// Human floor: ~0.03px on high-DPI. 0.01px is generous but impossible via pointer events.

const HUMAN_FLOOR = 0.01;

export async function GET() {
  const headerMap = await headers();
  const authHeader = headerMap.get('authorization');

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();

    // Nuke entries below human floor
    const nuked = await sql`
      DELETE FROM center_attempts
      WHERE deviation_px < ${HUMAN_FLOOR}
      RETURNING id
    `;

    // Only fix best_deviation if we cleaned something. Never touch total_attempts
    // (total should only go up, never drop when cheater entries are removed)
    if (nuked.length > 0) {
      const best = await sql`SELECT MIN(deviation_px) as best FROM center_attempts`;
      await sql`
        UPDATE center_stats
        SET best_deviation = ${best[0].best || 999}
        WHERE id = 'global'
      `;
    }

    return Response.json({
      cleaned: nuked.length,
      threshold: HUMAN_FLOOR,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
