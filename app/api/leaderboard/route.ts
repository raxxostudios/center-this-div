import { getDb } from '@/lib/db';

export const revalidate = 0;

export async function GET() {
  try {
    const sql = getDb();

    // Get total count for percentile calculation
    const [{ count: totalStr }] = await sql`SELECT count(*) FROM center_attempts`;
    const total = Number(totalStr);

    if (total === 0) {
      return Response.json({ leaderboard: [], percentiles: [], total: 0 });
    }

    // Get percentile thresholds: top 1%, 5%, 10%, 25%, 50%, 90%
    const pcts = [0.01, 0.05, 0.10, 0.25, 0.50];
    const percentiles = [];

    for (const pct of pcts) {
      const offset = Math.max(0, Math.floor(total * pct) - 1);
      const rows = await sql`
        SELECT deviation_px FROM center_attempts
        ORDER BY deviation_px ASC
        LIMIT 1 OFFSET ${offset}
      `;
      if (rows.length > 0) {
        percentiles.push({
          label: `Top ${Math.round(pct * 100)}%`,
          pct: pct,
          threshold: Number(rows[0].deviation_px),
          count: Math.floor(total * pct),
        });
      }
    }

    // Get a sample entry from each cluster (the best in that percentile)
    const clusters = [];
    let prevOffset = 0;
    for (let i = 0; i < percentiles.length; i++) {
      const clusterOffset = i === 0 ? 0 : Math.floor(total * pcts[i - 1]);
      const clusterLimit = Math.floor(total * pcts[i]) - clusterOffset;
      if (clusterLimit > 0) {
        const sample = await sql`
          SELECT deviation_px, region, submitted_at
          FROM center_attempts
          ORDER BY deviation_px ASC
          LIMIT 3 OFFSET ${clusterOffset}
        `;
        clusters.push({
          label: percentiles[i].label,
          pct: percentiles[i].pct,
          threshold: percentiles[i].threshold,
          count: percentiles[i].count,
          samples: sample.map(r => ({
            deviation: Number(r.deviation_px),
            region: r.region,
            time: r.submitted_at,
          })),
        });
      }
    }

    return Response.json({ percentiles: clusters, total });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return Response.json({ percentiles: [], total: 0 });
  }
}
