# Jujo waitlist

The Jujo waitlist page: an animated ice-blue landing page with an email sign-up, built with Next.js (App Router).

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Import this repo in Vercel. No build settings are needed.
2. Add the environment variables from `.env.example`:
   - `NEXT_PUBLIC_SITE_URL`: the public address of the page.
   - `WAITLIST_WEBHOOK_URL`: where sign-ups go. Each one is POSTed as JSON `{ email, source, createdAt }` (Google Apps Script, Zapier, Make, Slack, or your own endpoint).
3. Without `WAITLIST_WEBHOOK_URL`, sign-ups are only printed to the function logs, because serverless functions cannot keep files.

The sign-up endpoint (`POST /api/waitlist`) validates the email, limits each IP to 5 tries a minute and has a hidden bot-trap field.