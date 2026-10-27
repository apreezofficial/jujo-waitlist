'use client';

import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import Image from 'next/image';
import styles from './sections.module.css';

const icon = (children: ReactNode) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const PAIN = [
  'You post, people like it, and nobody buys.',
  'Messages pile up at night while you are busy running the shop.',
  'Agencies and creators cost a lot, and you still cannot tell what works.',
];

const FEATURES: { title: string; text: string; tag: string; icon: ReactNode }[] = [
  {
    title: 'Publish and manage your socials',
    text: 'Plan, schedule and post to Instagram, Facebook, X and TikTok from one place.',
    tag: 'Socials',
    icon: icon(<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>),
  },
  {
    title: 'Content and media made for you',
    text: 'Captions, slogans and post images written in your voice, ready to approve.',
    tag: 'AI content',
    icon: icon(<><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>),
  },
  {
    title: 'Campaigns and ads, simply',
    text: 'Launch a campaign in minutes and see what is working, without paying an agency.',
    tag: 'Ads',
    icon: icon(<><path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z" /><path d="M15.5 8.5a5 5 0 010 7" /><path d="M18.5 5.5a9 9 0 010 13" /></>),
  },
  {
    title: 'Inbox and AI replies',
    text: 'Answer customer questions and enquiries on time, even when you are away.',
    tag: 'Inbox',
    icon: icon(<><path d="M21 11.5a8.4 8.4 0 01-8.5 8.5 8.6 8.6 0 01-3.8-.9L3 21l1.9-5.5A8.4 8.4 0 1121 11.5z" /><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" /></>),
  },
  {
    title: 'Turn leads into sales',
    text: 'Follow up with people who showed interest and bring past buyers back.',
    tag: 'Sales',
    icon: icon(<><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>),
  },
  {
    title: 'Product catalogue and inventory',
    text: 'Keep your products, prices and stock in one list, and post straight from it.',
    tag: 'Catalogue',
    icon: icon(<><path d="M21 8l-9-5-9 5v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>),
  },
  {
    title: 'CAC registration, built in',
    text: 'Register your business with CAC and show customers you are the real deal.',
    tag: 'Trust',
    icon: icon(<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>),
  },
  {
    title: 'Results in plain words',
    text: 'See "14 people replied" instead of marketing jargon, so you always know what to do next.',
    tag: 'Insights',
    icon: icon(<><path d="M5 20V10M12 20V4M19 20v-7" /></>),
  },
];

export default function Sections() {
  const rootRef = useRef<HTMLDivElement>(null);

  /* Fade items in as they scroll into view */
  useEffect(() => {
    const items = rootRef.current?.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!items) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((el) => el.setAttribute('data-visible', ''));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', '');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* A soft light follows the pointer across each card */
  const glow = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const box = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - box.left}px`);
    el.style.setProperty('--y', `${e.clientY - box.top}px`);
  };

  return (
    <div className={styles.wrap} ref={rootRef}>
      <section className={styles.block}>
        <span className={styles.kicker} data-reveal>Built for sellers</span>
        <h2 className={styles.h2} data-reveal style={{ ['--i' as string]: 1 }}>
          Are you looking to improve sales?
        </h2>
        <p className={styles.lead} data-reveal style={{ ['--i' as string]: 2 }}>
          You don&apos;t have to pay large money for brand advertisement. You don&apos;t have to test several creators
          before you find the sales pattern that works for your business. Jujo does the heavy lifting, built for
          small and medium businesses that want one thing: more sales.
        </p>
      </section>

      <section className={styles.block}>
        <h2 className={styles.h2} data-reveal>Sound familiar?</h2>
        <ul className={styles.pain}>
          {PAIN.map((p, i) => (
            <li key={p} data-reveal style={{ ['--i' as string]: i }}>
              <span className={styles.dot} aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <span className={styles.kicker} data-reveal>What you get</span>
        <h2 className={styles.h2} data-reveal style={{ ['--i' as string]: 1 }}>
          Everything you need to sell, in one place
        </h2>
        <div className={styles.grid}>
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className={styles.card}
              data-reveal
              style={{ ['--i' as string]: i % 4 }}
              onPointerMove={glow}
            >
              <div className={styles.cardTop}>
                <span className={styles.iconTile}>{f.icon}</span>
                <span className={styles.tag}>{f.tag}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.block} ${styles.cta}`}>
        <div className={styles.ctaCard} data-reveal>
          <Image src="/jujo-mark.png" alt="Jujo" width={56} height={48} style={{ width: 56, height: 'auto' }} />
          <h2 className={styles.h2} style={{ color: '#fff' }}>Be first in line</h2>
          <p className={styles.lead} style={{ color: 'rgba(255,255,255,0.78)' }}>
            Join the waitlist and we will email you the moment Jujo opens.
          </p>
          <a href="#top" className={styles.btn}>Join the waitlist</a>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footBrand}>
          <Image src="/jujo-mark.png" alt="" width={26} height={22} style={{ width: 26, height: 'auto' }} />
          © 2026 Jujo
        </span>
        <a href="mailto:support@getjujo.com">support@getjujo.com</a>
      </footer>
    </div>
  );
}