import { initCenterDb } from '@/lib/db';

export async function POST() {
  try {
    await initCenterDb();
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Init error:', error);
    return Response.json({ error: 'Init failed' }, { status: 500 });
  }
}
