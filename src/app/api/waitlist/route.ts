import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
 * Waitlist sign-ups.
 * With WAITLIST_WEBHOOK_URL set, each sign-up is POSTed there as JSON.
 * Without it, the sign-up is printed to the function log (Vercel > project > Logs), because
 * serverless functions cannot keep files between requests.
 */

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

/* Per-IP limiter held in memory. It resets when an instance is recycled, so it only slows a script down. */
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

const reply = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

async function store(entry: { email: string; source: string; createdAt: string }): Promise<void> {
  console.log('[waitlist]', JSON.stringify(entry));

  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (!webhook) return;

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Waitlist webhook answered ${res.status}`);
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return reply(429, { ok: false, message: 'Too many attempts. Please wait a minute and try again.' });
  }

  let body: { email?: unknown; source?: unknown; company?: unknown };
  try {
    body = await req.json();
  } catch {
    return reply(400, { ok: false, message: 'Something went wrong. Please try again.' });
  }

  /* Hidden field that only bots fill in: pretend it worked */
  if (typeof body.company === 'string' && body.company.trim()) return reply(200, { ok: true });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return reply(400, { ok: false, message: 'Enter a valid email address.' });
  }

  const source = typeof body.source === 'string' ? body.source.slice(0, 60) : 'waitlist';

  try {
    await store({ email, source, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error('[waitlist] could not store sign-up', err);
    return reply(502, { ok: false, message: 'We could not save your spot just now. Please try again in a moment.' });
  }

  return reply(200, { ok: true });
}