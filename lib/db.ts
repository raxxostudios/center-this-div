import { neon } from '@neondatabase/serverless';

export function getDb() {
  const sql = neon(process.env.POSTGRES_URL!);
  return sql;
}

// Initialize center_attempts + center_stats tables (idempotent)
export async function initCenterDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS center_attempts (
      id SERIAL PRIMARY KEY,
      deviation_px REAL NOT NULL,
      deviation_x REAL NOT NULL DEFAULT 0,
      deviation_y REAL NOT NULL DEFAULT 0,
      submitted_at TIMESTAMPTZ DEFAULT now(),
      region TEXT,
      user_agent TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS center_stats (
      id TEXT PRIMARY KEY DEFAULT 'global',
      total_attempts INTEGER DEFAULT 0,
      best_deviation REAL DEFAULT 999,
      successes INTEGER DEFAULT 0
    )
  `;
  // Ensure global row exists
  await sql`
    INSERT INTO center_stats (id, total_attempts, best_deviation, successes)
    VALUES ('global', 0, 999, 0)
    ON CONFLICT (id) DO NOTHING
  `;
}

