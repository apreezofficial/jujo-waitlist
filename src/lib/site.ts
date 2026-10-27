/* The deployed address. On Vercel, falls back to the project's production domain. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'https://growth.getjujo.com'
).replace(/\/$/, '');

export const SITE_TITLE = 'Jujo – Sell more without big ad budgets | Join the waitlist';
export const SITE_DESCRIPTION =
  'Jujo is the AI partner that helps Nigerian businesses post, advertise, reply to customers and turn leads into sales, without paying big money for advertising. Join the waitlist.';