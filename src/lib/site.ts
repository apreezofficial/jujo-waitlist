/* The deployed address. On Vercel, falls back to the project's production domain. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '') ||
  'https://growth.getjujo.com'
).replace(/\/$/, '');

export const SITE_TITLE =
  'Jujo AI | Grow your socials. Turn leads into sales.';

export const SITE_DESCRIPTION =
  'Jujo AI is your professional business assistant that helps businesses grow their socials and turn leads into sales without disrupting how they work. Join the waitlist.';
