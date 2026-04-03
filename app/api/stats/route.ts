import { getDb } from '@/lib/db';

export const revalidate = 0;

export async function GET() {
  try {
    const sql = getDb();

    const stats = await sql`SELECT * FROM center_stats WHERE id = 'global'`;

    if (stats.length === 0) {
      return Response.json({
        totalAttempts: 0,
        bestDeviation: 999,
        successes: 0,
        recentAttempts: [],
      });
    }

    const recent = await sql`
      SELECT deviation_px, deviation_x, deviation_y, submitted_at, region
      FROM center_attempts
      ORDER BY submitted_at DESC
      LIMIT 100
    `;

    return Response.json({
      totalAttempts: Number(stats[0].total_attempts),
      bestDeviation: Number(stats[0].best_deviation),
      successes: Number(stats[0].successes),
      recentAttempts: recent.map((r) => ({
        deviation: Number(r.deviation_px),
        deviationX: Number(r.deviation_x),
        deviationY: Number(r.deviation_y),
        time: r.submitted_at,
        region: r.region,
      })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return Response.json({
      totalAttempts: 0,
      bestDeviation: 999,
      successes: 0,
      recentAttempts: [],
    });
  }
}
