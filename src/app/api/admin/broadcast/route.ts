import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/admin-auth';
import { sendBroadcast } from '../../../../lib/resend';
import { getWaitlistSubmissions } from '../../../../lib/voieform';

export const runtime = 'nodejs';
/* large waitlists send in batches of 100, so allow time to finish */
export const maxDuration = 300;

type Body = {
  audience?: 'all' | 'selected' | 'test';
  emails?: unknown;
  testEmail?: unknown;
  subject?: unknown;
  message?: unknown;
  ctaLabel?: unknown;
  ctaUrl?: unknown;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'Please log in again.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const subject = clean(body.subject, 200);
  const message = clean(body.message, 20000);
  const ctaLabel = clean(body.ctaLabel, 60);
  const ctaUrl = clean(body.ctaUrl, 500);

  if (!subject || !message) {
    return NextResponse.json({ message: 'Add a subject and a message.' }, { status: 400 });
  }
  if (ctaUrl && !/^https:\/\//i.test(ctaUrl)) {
    return NextResponse.json({ message: 'The button link must start with https://' }, { status: 400 });
  }

  let recipients: string[];
  if (body.audience === 'test') {
    const to = clean(body.testEmail, 254).toLowerCase();
    if (!EMAIL.test(to)) {
      return NextResponse.json({ message: 'Enter a valid email for the test send.' }, { status: 400 });
    }
    recipients = [to];
  } else {
    /* only ever email people who are actually on the waitlist */
    const { submissions } = await getWaitlistSubmissions();
    const onList = new Set(submissions.map((s) => s.fields.email?.trim().toLowerCase()).filter((e): e is string => !!e && EMAIL.test(e)));
    if (body.audience === 'selected') {
      const picked = Array.isArray(body.emails) ? body.emails.filter((e): e is string => typeof e === 'string').map((e) => e.trim().toLowerCase()) : [];
      recipients = Array.from(new Set(picked.filter((e) => onList.has(e))));
    } else {
      recipients = Array.from(onList);
    }
  }

  if (!recipients.length) {
    return NextResponse.json({ message: 'No one to send to.' }, { status: 400 });
  }

  try {
    const result = await sendBroadcast(recipients, { subject, message, ctaLabel, ctaUrl });
    return NextResponse.json({ ...result, total: recipients.length }, { status: result.sent ? 200 : 502 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Sending failed.' }, { status: 500 });
  }
}
