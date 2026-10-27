import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'jujo_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error('ADMIN_PASSWORD is not configured.');
  }

  return secret;
}

function signature(value: string) {
  return createHmac('sha256', getSessionSecret())
    .update(value)
    .digest('hex');
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const value = `jujo-admin.${expiresAt}`;

  return `${expiresAt}.${signature(value)}`;
}

export async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  const [expiresAtText, receivedSignature] = token.split('.');

  if (!expiresAtText || !receivedSignature) {
    return false;
  }

  const expiresAt = Number(expiresAtText);

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now() / 1000) {
    return false;
  }

  const expectedSignature = signature(`jujo-admin.${expiresAt}`);

  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

export const adminCookie = {
  name: COOKIE_NAME,
  maxAge: SESSION_DURATION_SECONDS,
};
