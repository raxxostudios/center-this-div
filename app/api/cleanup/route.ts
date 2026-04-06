import { getDb } from '@/lib/db';
import { headers } from 'next/headers';

// Auto-cleanup: nuke cheaters, brute-forcers, and impossible entries
// Runs via Vercel cron every 10 minutes (Pro plan)

const HUMAN_FLOOR = 0.02;
const MAX_TOP_ENTRIES_PER_UA = 3;   // No single UA can hold more than 3 spots in top 50
const MAX_ELITE_PER_UA = 10;        // No single UA can have more than 10 sub-0.1px entries

export async function GET() {
  const headerMap = await headers();
  const authHeader = headerMap.get('authorization');

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    let totalNuked = 0;

    // 1. Nuke entries below human floor
    const floorNuked = await sql`
      DELETE FROM center_attempts
      WHERE deviation_px <= ${HUMAN_FLOOR}
      RETURNING id
    `;
    totalNuked += floorNuked.length;

    // 2. Nuke leaderboard hogs: if one UA has more than 3 entries in top 50, keep best 3, nuke rest
    const top50 = await sql`
      SELECT id, user_agent, deviation_px,
        ROW_NUMBER() OVER (PARTITION BY user_agent ORDER BY deviation_px ASC) as ua_rank
      FROM (
        SELECT * FROM center_attempts ORDER BY deviation_px ASC LIMIT 50
      ) top
    `;
    const hogIds = top50
      .filter((r: Record<string, unknown>) => Number(r.ua_rank) > MAX_TOP_ENTRIES_PER_UA)
      .map((r: Record<string, unknown>) => Number(r.id));

    if (hogIds.length > 0) {
      const hogNuked = await sql`
        DELETE FROM center_attempts
        WHERE id = ANY(${hogIds})
        RETURNING id
      `;
      totalNuked += hogNuked.length;
    }

    // 3. Nuke elite grinders: if one UA has more than 10 sub-0.1px entries, keep best 10, nuke rest
    const eliteExcess = await sql`
      DELETE FROM center_attempts
      WHERE id IN (
        SELECT id FROM (
          SELECT id, user_agent,
            ROW_NUMBER() OVER (PARTITION BY user_agent ORDER BY deviation_px ASC) as ua_rank
          FROM center_attempts
          WHERE deviation_px < 0.1
        ) ranked
        WHERE ua_rank > ${MAX_ELITE_PER_UA}
      )
      RETURNING id
    `;
    totalNuked += eliteExcess.length;

    // 4. Nuke exact-zero Y or X axis hits below 0.05px (fabricated single-axis submissions)
    const axisNuked = await sql`
      DELETE FROM center_attempts
      WHERE deviation_px < 0.05
        AND (deviation_x = 0 OR deviation_y = 0)
      RETURNING id
    `;
    totalNuked += axisNuked.length;

    // 5. Nuke suspiciously round decimal values that aren't binary fractions
    // Real getBoundingClientRect() returns binary fractions (k/2^n) like 3.7265625, 0.046875
    // These are messy in decimal. Fabricated values are clean decimals: 0.02, 0.05, 0.030, etc.
    // Check: if deviation is exact to 3 decimal places BUT not a binary fraction (not exact at 2^16), it's fake
    const roundNuked = await sql`
      DELETE FROM center_attempts
      WHERE deviation_px < 0.5
        AND deviation_px > 0
        AND ABS(deviation_px * 1000 - ROUND(deviation_px * 1000)) < 0.0001
        AND ABS(deviation_px * 65536 - ROUND(deviation_px * 65536)) > 0.01
      RETURNING id
    `;
    totalNuked += roundNuked.length;

    // 6. Nuke entries where ALL of deviation, x, and y are exact to 4 decimal places (but deviation is not a binary fraction)
    // Catches slightly less obvious fakes like 0.0214, 0.0300, etc.
    const allRoundNuked = await sql`
      DELETE FROM center_attempts
      WHERE deviation_px < 1.0
        AND deviation_px > 0
        AND ABS(deviation_px * 10000 - ROUND(deviation_px * 10000)) < 0.0001
        AND ABS(deviation_x * 10000 - ROUND(deviation_x * 10000)) < 0.0001
        AND ABS(deviation_y * 10000 - ROUND(deviation_y * 10000)) < 0.0001
        AND ABS(deviation_px * 65536 - ROUND(deviation_px * 65536)) > 0.01
      RETURNING id
    `;
    totalNuked += allRoundNuked.length;

    // Update best_deviation if we cleaned anything
    if (totalNuked > 0) {
      const best = await sql`SELECT MIN(deviation_px) as best FROM center_attempts`;
      await sql`
        UPDATE center_stats
        SET best_deviation = ${best[0].best || 999}
        WHERE id = 'global'
      `;
    }

    return Response.json({
      cleaned: totalNuked,
      floor: floorNuked.length,
      hogs: hogIds.length,
      eliteExcess: eliteExcess.length,
      axisZero: axisNuked.length,
      roundDecimals: roundNuked.length,
      allRoundAxes: allRoundNuked.length,
      threshold: HUMAN_FLOOR,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
