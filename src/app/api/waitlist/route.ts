import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VOIEFORM_ENDPOINT = 'https://voieform.com/f/pr8c400abd';

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

/* Per-IP limiter. It resets when a serverless function instance restarts. */
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();

  const recent = (hits.get(key) ?? []).filter(
    (time) => now - time < WINDOW_MS
  );

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [ip, times] of hits) {
      const hasRecentRequest = times.some(
        (time) => now - time < WINDOW_MS
      );

      if (!hasRecentRequest) {
        hits.delete(ip);
      }
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

function reply(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

async function submitToVoieform(entry: {
  email: string;
  source: string;
  createdAt: string;
}) {
  const response = await fetch(VOIEFORM_ENDPOINT, {
    method: 'POST',

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      email: entry.email,
      source: entry.source,
      submitted_at: entry.createdAt,
    }),

    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Voieform answered ${response.status}`);
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  if (rateLimited(ip)) {
    return reply(429, {
      ok: false,
      message: 'Too many attempts. Please wait a minute and try again.',
    });
  }

  let body: {
    email?: unknown;
    source?: unknown;
    company?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return reply(400, {
      ok: false,
      message: 'Something went wrong. Please try again.',
    });
  }

  /* Honeypot: silently accept automated spam submissions. */
  if (typeof body.company === 'string' && body.company.trim()) {
    return reply(200, { ok: true });
  }

  const email =
    typeof body.email === 'string'
      ? body.email.trim().toLowerCase()
      : '';

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return reply(400, {
      ok: false,
      message: 'Enter a valid email address.',
    });
  }

  const source =
    typeof body.source === 'string'
      ? body.source.slice(0, 60)
      : 'waitlist-page';

  try {
    await submitToVoieform({
      email,
      source,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[waitlist] Voieform submission failed', error);

    return reply(502, {
      ok: false,
      message: 'We could not save your spot just now. Please try again.',
    });
  }

  return reply(200, { ok: true });
}
