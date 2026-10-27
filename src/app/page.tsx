'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Sections from './Sections';
import styles from './waitlist.module.css';

type Status = 'idle' | 'sending' | 'done';

const STORAGE_KEY = 'jujo.waitlist';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SHARDS = [
  { left: '8%', top: '18%', size: '54px', delay: '0s' },
  { left: '86%', top: '14%', size: '38px', delay: '1.2s' },
  { left: '16%', top: '62%', size: '34px', delay: '0.6s' },
  { left: '80%', top: '58%', size: '62px', delay: '2s' },
  { left: '48%', top: '8%', size: '26px', delay: '1.6s' },
  { left: '92%', top: '38%', size: '22px', delay: '0.3s' },
];

function Crystal() {
  return (
    <svg
      className={styles.crystal}
      viewBox="0 0 200 520"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wl-green-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#edfff5" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#65d998" stopOpacity="0.8" />
          <stop offset="1" stopColor="#008c48" stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id="wl-green-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#00a854" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <polygon
        points="100,0 128,230 100,300 72,230"
        fill="url(#wl-green-a)"
      />
      <polygon
        points="100,0 128,230 100,300"
        fill="url(#wl-green-b)"
        opacity="0.6"
      />
      <polygon
        points="100,520 116,300 100,262 84,300"
        fill="url(#wl-green-a)"
        opacity="0.7"
      />
      <polygon
        points="0,262 82,246 100,262 82,278"
        fill="url(#wl-green-b)"
        opacity="0.55"
      />
      <polygon
        points="200,262 118,246 100,262 118,278"
        fill="url(#wl-green-b)"
        opacity="0.55"
      />
    </svg>
  );
}

export default function WaitlistPage() {
  const pageRef = useRef<HTMLElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved && EMAIL_RE.test(saved)) {
        setEmail(saved);
        setStatus('done');
      }
    } catch {
      // The form remains available when storage is blocked.
    }

    return () => {
      if (copiedTimer.current) {
        clearTimeout(copiedTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const page = pageRef.current;

    if (!page) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        page.style.setProperty(
          '--mx',
          String((event.clientX / window.innerWidth - 0.5) * 2)
        );
        page.style.setProperty(
          '--my',
          String((event.clientY / window.innerHeight - 0.5) * 2)
        );
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (sendingRef.current) return;

    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      setError('Enter a valid email address.');
      emailRef.current?.focus();
      return;
    }

    sendingRef.current = true;
    setError('');
    setStatus('sending');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          company,
          source: 'waitlist-page',
        }),
      });

      const data: unknown = await response.json().catch(() => null);

      const result =
        data !== null && typeof data === 'object'
          ? (data as Record<string, unknown>)
          : null;

      if (!response.ok || result?.ok !== true) {
        setError(
          typeof result?.message === 'string'
            ? result.message
            : 'Something went wrong. Please try again.'
        );
        setStatus('idle');
        return;
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // Confirmation still appears when storage is blocked.
      }

      setEmail(value);
      setStatus('done');
    } catch {
      setError(
        'Could not reach the server. Check your connection and try again.'
      );
      setStatus('idle');
    } finally {
      sendingRef.current = false;
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/waitlist`;

    setShareError('');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Jujo',
          text: "Don't miss out. Join me on the Jujo waitlist.",
          url,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      if (copiedTimer.current) {
        clearTimeout(copiedTimer.current);
      }

      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError(
        'Could not copy the link. You can share this page from your browser.'
      );
    }
  };

  const editEmail = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Allow another signup even if storage is unavailable.
    }

    if (copiedTimer.current) {
      clearTimeout(copiedTimer.current);
    }

    setError('');
    setShareError('');
    setCopied(false);
    setCompany('');
    setStatus('idle');

    requestAnimationFrame(() => emailRef.current?.focus());
  };

  return (
    <>
      <main id="top" ref={pageRef} className={styles.page}>
        <div className={styles.backdrop} aria-hidden="true">
          <div className={`${styles.orb} ${styles.orbA}`} />
          <div className={`${styles.orb} ${styles.orbB}`} />
          <div className={styles.grid} />
        </div>

        <Crystal />

        <div className={styles.floaters} aria-hidden="true">
          {SHARDS.map((shard, index) => (
            <span
              key={index}
              className={styles.shard}
              style={
                {
                  '--left': shard.left,
                  '--top': shard.top,
                  '--size': shard.size,
                  '--delay': shard.delay,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <header className={styles.top}>
          <Link href="/" className={styles.brand} aria-label="Jujo home">
            <Image
              src="/jujo-mark.png"
              alt=""
              width={40}
              height={34}
              style={{ width: 40, height: 'auto' }}
              priority
            />
            <span>Jujo</span>
          </Link>
        </header>

        <section className={styles.center} aria-labelledby="waitlist-title">
          <span className={`${styles.pill} ${styles.rise}`}>
            <strong>Jujo</strong>
            <span className={styles.plus} aria-hidden="true">
              ✦
            </span>
            <span>Coming soon · 2026</span>
          </span>

          <h1
            id="waitlist-title"
            className={`${styles.title} ${styles.rise}`}
          >
            Growth is coming.
            <span>Built for Nigerian businesses.</span>
          </h1>

          <p className={`${styles.sub} ${styles.rise}`}>
            Don&apos;t miss out. Stay close to the launch of Jujo, the AI
            partner that helps you reach the right customers.
          </p>

          {status === 'done' ? (
            <div
              className={`${styles.done} ${styles.rise}`}
              role="status"
              aria-live="polite"
            >
              <span className={styles.tick} aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>

              <h2>You&apos;re on the list</h2>

              <p>
                We&apos;ll email <strong>{email}</strong> the moment Jujo
                opens.
              </p>

              <div className={styles.doneActions}>
                <button
                  type="button"
                  className={styles.ghost}
                  onClick={share}
                >
                  {copied ? 'Link copied' : 'Share with a friend'}
                </button>

                <button
                  type="button"
                  className={styles.link}
                  onClick={editEmail}
                >
                  Use a different email
                </button>
              </div>

              {shareError && (
                <p className={styles.error} role="alert">
                  {shareError}
                </p>
              )}
            </div>
          ) : (
            <form
              className={`${styles.form} ${styles.rise}`}
              onSubmit={submit}
              aria-busy={status === 'sending'}
              noValidate
            >
              <div
                className={`${styles.field} ${
                  error ? styles.fieldError : ''
                }`}
              >
                <label htmlFor="wl-email" className={styles.srOnly}>
                  Your email address
                </label>

                <input
                  ref={emailRef}
                  id="wl-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Your email address"
                  value={email}
                  disabled={status === 'sending'}
                  required
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError('');
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'wl-error' : undefined}
                />

                <input
                  className={styles.trap}
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />

                <button type="submit" disabled={status === 'sending'}>
                  {status === 'sending' && (
                    <span className={styles.spinner} aria-hidden="true" />
                  )}
                  {status === 'sending' ? 'Joining…' : 'Get Notified'}
                </button>
              </div>

              {error && (
                <p id="wl-error" className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <p className={styles.fine}>
                Free to join. No spam, and you can opt out any time.
              </p>
            </form>
          )}
        </section>
      </main>

      <Sections />
    </>
  );
}
