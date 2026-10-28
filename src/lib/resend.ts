/* Bulk email through Resend's batch API (https://resend.com/docs/api-reference/emails/send-batch-emails).
   Each person gets their own email, so recipients never see each other. */

const BATCH_URL = 'https://api.resend.com/emails/batch';
const BATCH_SIZE = 100; // Resend's limit per batch call
const PAUSE_MS = 600; // stays under Resend's default 2 requests per second

export type Broadcast = {
  subject: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export type BroadcastResult = {
  sent: number;
  failed: number;
  errors: string[];
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Plain text from the composer becomes simple, branded HTML: blank lines split paragraphs */
export function renderEmail({ subject, message, ctaLabel, ctaUrl }: Broadcast) {
  const paragraphs = message
    .trim()
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#2b3d33">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
  const button =
    ctaLabel && ctaUrl
      ? `<p style="margin:26px 0 8px"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:#2fc142;color:#063b29;font-weight:700;font-size:15px;text-decoration:none">${escapeHtml(ctaLabel)}</a></p>`
      : '';
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f2faf5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2faf5;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;border:1px solid #d8ede0">
<tr><td style="padding:28px 32px 6px;font-family:Inter,Arial,sans-serif">
<p style="margin:0 0 22px;font-size:19px;font-weight:800;color:#063b29">Jujo</p>
<h1 style="margin:0 0 18px;font-size:22px;line-height:1.25;color:#063b29">${escapeHtml(subject)}</h1>
${paragraphs}${button}
</td></tr>
<tr><td style="padding:18px 32px 26px;font-family:Inter,Arial,sans-serif;font-size:12px;line-height:1.5;color:#7a8f83">
You’re getting this because you joined the Jujo waitlist.
</td></tr></table></td></tr></table></body></html>`;
  const text = `${message.trim()}${ctaLabel && ctaUrl ? `\n\n${ctaLabel}: ${ctaUrl}` : ''}\n\n—\nYou’re getting this because you joined the Jujo waitlist.`;
  return { html, text };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendBroadcast(recipients: string[], broadcast: Broadcast): Promise<BroadcastResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    throw new Error('Add RESEND_API_KEY and RESEND_FROM in Vercel Environment Variables.');
  }

  const { html, text } = renderEmail(broadcast);
  const replyTo = process.env.RESEND_REPLY_TO;
  const result: BroadcastResult = { sent: 0, failed: 0, errors: [] };

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const response = await fetch(BATCH_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(
        chunk.map((to) => ({ from, to: [to], subject: broadcast.subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }))
      ),
    });

    if (response.ok) {
      result.sent += chunk.length;
    } else {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      result.failed += chunk.length;
      result.errors.push(body?.message ?? `Resend returned ${response.status}`);
      /* a bad key or unverified sender fails every batch, so stop early */
      if (response.status === 401 || response.status === 403) break;
    }

    if (i + BATCH_SIZE < recipients.length) await sleep(PAUSE_MS);
  }

  return result;
}
