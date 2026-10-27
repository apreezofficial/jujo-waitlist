'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './waitlist.module.css';
import Sections from './Sections';

type Status = 'idle' | 'sending' | 'done';

const STORAGE_KEY = 'jujo.waitlist';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/jujo.ng' },
  { label: 'X', href: 'https://x.com/jujo_ng' },
  { label: 'Facebook', href: 'https://facebook.com/jujo.ng' },
];

/* The ice crystal that floats behind the headline */
function Crystal() {
  return (
    <svg className={styles.crystal} viewBox="0 0 200 520" aria-hidden="true">
      <defs>
        <linearGradient id="wl-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#8fd0ff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#2f7bff" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="wl-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#4aa3ff" stopOpacity="0.5" />
        </linearGradient>
        <filter id="wl-blur" x="-20%" y="-10%" width="140%" height="120%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <g filter="url(#wl-blur)">
        <polygon points="100,0 128,230 100,300 72,230" fill="url(#wl-a)" />
        <polygon points="100,0 128,230 100,300" fill="url(#wl-b)" opacity="0.6" />
        <polygon points="100,520 116,300 100,262 84,300" fill="url(#wl-a)" opacity="0.7" />
        <polygon points="0,262 82,246 100,262 82,278" fill="url(#wl-b)" opacity="0.55" />
        <polygon points="200,262 118,246 100,262 118,278" fill="url(#wl-b)" opacity="0.55" />
      </g>
    </svg>
  );
}

export default function WaitlistPage() {
  const pageRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(''); /* honeypot: real people never see or fill this */
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  /* Remember a finished sign-up so a returning visitor sees their confirmation */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEmail(saved);
        setStatus('done');
      }
    } catch {
      /* storage blocked: the form simply shows again */
    }
  }, []);

  /* The crystal and glow drift gently toward the pointer (skipped for touch and reduced motion) */
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        page.style.setProperty('--mx', String((e.clientX / window.innerWidth - 0.5) * 2));
        page.style.setProperty('--my', String((e.clientY / window.innerHeight - 0.5) * 2));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setStatus('sending');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, company, source: 'waitlist-page' }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.message ?? 'Something went wrong. Please try again.');
        setStatus('idle');
        return;
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch {
        /* storage blocked: the confirmation still shows */
      }
      setEmail(value);
      setStatus('done');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setStatus('idle');
    }
  };

  const share = async () => {
    const url = window.location.origin + '/waitlist';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Jujo', text: 'Join me on the Jujo waitlist', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* cancelled or blocked: nothing to do */
    }
  };

  const editEmail = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setStatus('idle');
  };

  return (
    <>
    <main id="top" ref={pageRef} className={styles.page}>
      {/* ----- animated backdrop ----- */}
      <div className={styles.backdrop} aria-hidden="true">
        <div className={`${styles.flutes} ${styles.flutesTop}`} />
        <div className={`${styles.flutes} ${styles.flutesBottom}`} />
        <div className={`${styles.orb} ${styles.orbA}`} />
        <div className={`${styles.orb} ${styles.orbB}`} />
        <div className={styles.glass} />
        <div className={styles.grain} />
      </div>
      <Crystal />

      <header className={styles.top}>
        <Link href="/" className={styles.brand} aria-label="Jujo home">
          <Image src="/jujo-mark.png" alt="" width={40} height={34} style={{ width: 40, height: 'auto' }} priority />
          <span>Jujo</span>
        </Link>
      </header>

      <section className={styles.center}>
        <span className={`${styles.pill} ${styles.rise}`} style={{ ['--d' as string]: '0s' }}>
          <strong>Jujo</strong>
          <span className={styles.plus} aria-hidden="true">✦</span>
          <span>soon 2026</span>
        </span>

        <h1 className={`${styles.title} ${styles.rise}`} style={{ ['--d' as string]: '0.08s' }}>
          Growth is coming. <span>Built for Nigerian businesses.</span>
        </h1>

        <p className={`${styles.sub} ${styles.rise}`} style={{ ['--d' as string]: '0.18s' }}>
          Stay close to the launch and be among the first to try Jujo, the AI partner that helps you reach the right
          customers.
        </p>

        {status === 'done' ? (
          <div className={`${styles.done} ${styles.pop}`} role="status" aria-live="polite">
            <span className={styles.tick} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <h2>You&apos;re on the list</h2>
            <p>
              We&apos;ll email <strong>{email}</strong> the moment Jujo opens.
            </p>
            <div className={styles.doneActions}>
              <button type="button" className={styles.ghost} onClick={share}>
                {copied ? 'Link copied' : 'Share with a friend'}
              </button>
              <button type="button" className={styles.link} onClick={editEmail}>
                Use a different email
              </button>
            </div>
          </div>
        ) : (
          <form
            className={`${styles.form} ${styles.rise}`}
            style={{ ['--d' as string]: '0.28s' }}
            onSubmit={submit}
            noValidate
          >
            <div className={`${styles.field} ${error ? styles.fieldError : ''}`}>
              <label htmlFor="wl-email" className={styles.srOnly}>Your email address</label>
              <input
                id="wl-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Your Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                aria-invalid={!!error}
                aria-describedby={error ? 'wl-error' : undefined}
              />
              {/* honeypot */}
              <input
                className={styles.trap}
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <button type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? <span className={styles.spinner} aria-label="Sending" /> : 'Get Notified'}
              </button>
            </div>
            {error && (
              <p id="wl-error" className={styles.error} role="alert">
                {error}
              </p>
            )}
            <p className={styles.fine}>Free to join. No spam, and you can opt out any time.</p>
          </form>
        )}

        <nav className={`${styles.socials} ${styles.rise}`} style={{ ['--d' as string]: '0.38s' }} aria-label="Follow Jujo">
          {SOCIALS.map((s, i) => (
            <span key={s.label}>
              {i > 0 && <i aria-hidden="true">·</i>}
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </span>
          ))}
        </nav>
      </section>
    </main>
    <Sections />
    </>
  );
}
