import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { adminCookie, createAdminSession } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';

function passwordsMatch(password: string, expectedPassword: string) {
  const passwordBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expectedPassword);

  if (passwordBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(passwordBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const password =
    typeof formData.get('password') === 'string'
      ? String(formData.get('password'))
      : '';

  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { message: 'ADMIN_PASSWORD is not configured.' },
      { status: 500 }
    );
  }

  if (!passwordsMatch(password, expectedPassword)) {
    return NextResponse.redirect(
      new URL('/admin/login?error=invalid-password', request.url),
      303
    );
  }

  const response = NextResponse.redirect(
    new URL('/admin', request.url),
    303
  );

  response.cookies.set({
    name: adminCookie.name,
    value: createAdminSession(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: adminCookie.maxAge,
  });

  return response;
}
