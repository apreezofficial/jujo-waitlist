import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../admin.module.css';

export const metadata: Metadata = {
  title: 'Admin login | Jujo',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/jujo-mark.png"
            alt=""
            width={38}
            height={32}
            priority
          />
          <span>Jujo</span>
        </Link>

        <p className={styles.eyebrow}>Private area</p>

        <h1>Waitlist admin</h1>

        <p className={styles.loginText}>
          Sign in to view people who joined the Jujo waitlist.
        </p>

        <form action="/api/admin/login" method="post" className={styles.loginForm}>
          <label htmlFor="password">Admin password</label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />

          {error === 'invalid-password' && (
            <p className={styles.error}>
              That password is not correct. Try again.
            </p>
          )}

          <button type="submit">Open admin</button>
        </form>
      </section>
    </main>
  );
}
