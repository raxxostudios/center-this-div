import { getDb } from '@/lib/db';

export const revalidate = 0;

export async function GET() {
  try {
    const sql = getDb();

    const leaders = await sql`
      SELECT deviation_px, deviation_x, deviation_y, submitted_at, region
      FROM center_attempts
      ORDER BY deviation_px ASC
      LIMIT 20
    `;

    return Response.json({
      leaderboard: leaders.map((r, i) => ({
        rank: i + 1,
        deviation: Number(r.deviation_px),
        deviationX: Number(r.deviation_x),
        deviationY: Number(r.deviation_y),
        time: r.submitted_at,
        region: r.region,
      })),
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return Response.json({ leaderboard: [] });
  }
}
