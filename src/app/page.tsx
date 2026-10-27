'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './waitlist.module.css';
import Sections from './Sections';

type Status = 'idle' | 'sending' | 'done';

const STORAGE_KEY = 'jujo.waitlist';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function animationDelay(delay: string): CSSProperties {
  return { '--d': delay } as CSSProperties;
}

export default function WaitlistPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

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
      // The form still works if local storage is blocked.
    }

    return () => {
      if (copiedTimerRef.current !== null) {
        clearTimeout(copiedTimerRef.current);
      }
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        // Show confirmation even when local storage is unavailable.
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

      if (copiedTimerRef.current !== null) {
        clearTimeout(copiedTimerRef.current);
      }

      copiedTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setShareError(
        'Could not copy the link. Please share this page from your browser.'
      );
    }
  };

  const editEmail = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Allow another signup even when local storage is unavailable.
    }

    if (copiedTimerRef.current !== null) {
      clearTimeout(copiedTimerRef.current);
    }

    setError('');
    setShareError('');
    setCopied(false);
    setCompany('');
    setStatus('idle');

    requestAnimationFrame(() => {
      emailRef.current?.focus();
    });
  };

  return (
    <>
      <main id="top" className={styles.page}>
        <div className={styles.backdrop} aria-hidden="true">
          <div className={`${styles.flutes} ${styles.flutesTop}`} />
          <div className={`${styles.flutes} ${styles.flutesBottom}`} />
          <div className={`${styles.orb} ${styles.orbA}`} />
          <div className={`${styles.orb} ${styles.orbB}`} />
          <div className={styles.glass} />
          <div className={styles.grain} />
        </div>

        <header className={styles.top}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="Jujo home"
          >
            <Image
              src="/jujo-mark.png"
              alt=""
              width={30}
              height={26}
              style={{ width: 30, height: 'auto' }}
              priority
            />
            <span>Jujo</span>
          </Link>
        </header>

        <section
          className={styles.center}
          aria-labelledby="waitlist-title"
        >
          <span
  className={`${styles.pill} ${styles.rise}`}
  style={animationDelay('0s')}
>
  <strong>Jujo</strong>
  <span>Launching early November</span>
</span>

          <h1
            id="waitlist-title"
            className={`${styles.title} ${styles.rise}`}
            style={animationDelay('0.08s')}
          >
            You don&apos;t need to waste money{' '}
            <span>on advertising.</span>
          </h1>

          <p
            className={`${styles.sub} ${styles.rise}`}
            style={animationDelay('0.18s')}
          >
            Don&apos;t miss out. Stay close to the launch of Jujo, the
            AI partner that helps you reach the right customers.
          </p>

          {status === 'done' ? (
            <div
              className={`${styles.done} ${styles.pop}`}
              role="status"
              aria-live="polite"
            >
              <span className={styles.tick} aria-hidden="true">
                <svg
                  width="20"
                  height="20"
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
                We&apos;ll email <strong>{email}</strong> the moment
                Jujo opens.
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
                <p
                  role="alert"
                  style={{ color: '#b42318', marginTop: 12 }}
                >
                  {shareError}
                </p>
              )}
            </div>
          ) : (
            <form
              className={`${styles.form} ${styles.rise}`}
              style={animationDelay('0.28s')}
              onSubmit={submit}
              aria-busy={status === 'sending'}
              noValidate
            >
              <div
                className={`${styles.field} ${
                  error ? styles.fieldError : ''
                }`}
              >
                <label
                  htmlFor="wl-email"
                  className={styles.srOnly}
                >
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

                    if (error) {
                      setError('');
                    }
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'wl-error' : undefined}
                />

                {/* Honeypot field for spam prevention. */}
                <input
                  className={styles.trap}
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={company}
                  onChange={(event) => {
                    setCompany(event.target.value);
                  }}
                />

                <button
                  type="submit"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <>
                      <span
                        className={styles.spinner}
                        aria-hidden="true"
                      />
                      <span className={styles.srOnly}>
                        Joining the waitlist
                      </span>
                    </>
                  ) : (
                    'Get Notified'
                  )}
                </button>
              </div>

              {error && (
                <p
                  id="wl-error"
                  className={styles.error}
                  role="alert"
                >
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
