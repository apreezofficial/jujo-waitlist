import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { isAdmin } from '../../lib/admin-auth';
import { getWaitlistSubmissions } from '../../lib/voieform';
import AdminBoard from './AdminBoard';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: 'Waitlist admin | Jujo',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect('/admin/login');
  }

  let total = 0;
  let submissions: Awaited<
    ReturnType<typeof getWaitlistSubmissions>
  >['submissions'] = [];
  let loadError = '';

  try {
    const data = await getWaitlistSubmissions();
    total = data.total;
    submissions = data.submissions;
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : 'Could not load waitlist entries.';
  }

  return (
    <main className={styles.adminPage}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>
          <Image
            src="/jujo-mark.png"
            alt=""
            width={34}
            height={29}
            priority
          />
          <span>Jujo</span>
        </a>

        <form action="/api/admin/logout" method="post">
          <button className={styles.logoutButton} type="submit">
            Log out
          </button>
        </form>
      </header>

      <section className={styles.content}>
        <p className={styles.eyebrow}>Waitlist</p>

        <h1>People waiting for Jujo</h1>

        <p className={styles.subtitle}>
          Every verified signup from your Voieform waitlist appears here.
        </p>

        <div className={styles.statCard}>
          <span>Total signups</span>
          <strong>{total}</strong>
        </div>

        {loadError ? (
          <div className={styles.errorCard}>
            <h2>We could not load the waitlist.</h2>
            <p>{loadError}</p>
            <p>
              Check that <code>VOIEFORM_SECRET_KEY</code> and{' '}
              <code>VOIEFORM_FORM_ID</code> are set in Vercel.
            </p>
          </div>
        ) : submissions.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No signups yet</h2>
            <p>When someone joins the waitlist, their email will appear here.</p>
          </div>
        ) : (
          <AdminBoard
            entries={submissions.map((submission) => ({
              id: submission.id,
              email: submission.fields.email ?? 'No email provided',
              createdAt: submission.created_at,
              source: submission.fields.source ?? 'waitlist-page',
            }))}
          />
        )}
      </section>
    </main>
  );
}
