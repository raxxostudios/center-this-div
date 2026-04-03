// Anti-cheat: HMAC-signed gameplay proof
// The client must fetch a challenge token before playing, then submit it
// alongside pointer movement proof. Direct API calls can't fake this
// without running the actual game page.

const SECRET = process.env.ANTICHEAT_SECRET || 'center-this-div-you-shall-not-pass-2026';

async function hmac(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createChallenge(): Promise<{ token: string; ts: number }> {
  const ts = Date.now();
  const nonce = crypto.randomUUID();
  const payload = `${ts}:${nonce}`;
  const sig = await hmac(payload);
  const token = btoa(`${payload}:${sig}`);
  return { token, ts };
}

export async function verifyChallenge(
  token: string,
  moveCount: number,
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    if (parts.length !== 3) return { valid: false, reason: 'bad_token' };

    const [tsStr, nonce, sig] = parts;
    const ts = Number(tsStr);

    // Verify signature
    const expected = await hmac(`${ts}:${nonce}`);
    if (sig !== expected) return { valid: false, reason: 'bad_sig' };

    // Token must be at least 2 seconds old (you need time to drag)
    const age = Date.now() - ts;
    if (age < 2000) return { valid: false, reason: 'too_fast' };

    // Token expires after 1 hour (prevents replay with ancient tokens)
    if (age > 3600000) return { valid: false, reason: 'expired' };

    // Must have actually moved the pointer (real drag = many move events)
    if (moveCount < 5) return { valid: false, reason: 'no_moves' };

    return { valid: true };
  } catch {
    return { valid: false, reason: 'parse_error' };
  }
}
