import { createChallenge } from '@/lib/anticheat';

export async function GET() {
  const challenge = await createChallenge();
  return Response.json(challenge);
}
