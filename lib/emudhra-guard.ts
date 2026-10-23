// eMudhra stopgap (2026-10-23). Vercel Functions still run Node 24.21.0, which
// trusts the eMudhra intermediates whose private keys turned out computable.
// Node 24.22.1 distrusts them. Until the runtime catches up, drop the two roots
// that chain to them from Node's default CA list. Proven on Vercel 24.21.0: the
// eMudhra test host goes from CONNECTED to UNABLE_TO_GET_ISSUER_CERT_LOCALLY while
// Shopify, Stripe, Anthropic and Vercel Blob still connect. Delete this file and
// its call in instrumentation.ts once ~/CLAUDE/scripts/vercel-runtime-probe
// reports the runtime patched.
import * as tls from 'node:tls';
import { X509Certificate } from 'node:crypto';

const DISTRUSTED = ['emSign ECC Root CA - G3', 'AAA Certificate Services'];

// @types/node in this repo predates these two (Node 24.5 / 22.19).
type CaApi = {
  getCACertificates?: (type: 'default') => string[];
  setDefaultCACertificates?: (certs: string[]) => void;
};

export function dropEmudhraRoots(): number {
  const api = tls as unknown as CaApi;
  if (!api.getCACertificates || !api.setDefaultCACertificates) return -1;
  const all = api.getCACertificates('default');
  const keep = all.filter((pem) => {
    try {
      const cn = new X509Certificate(pem).subject.split('\n').find((l) => l.startsWith('CN='));
      return !DISTRUSTED.some((name) => cn === `CN=${name}`);
    } catch {
      return true;
    }
  });
  if (keep.length !== all.length) api.setDefaultCACertificates(keep);
  return all.length - keep.length;
}
