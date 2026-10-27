'use client';

import { useEffect, useRef, type PointerEvent, type ReactNode } from 'react';
import Image from 'next/image';
import styles from './sections.module.css';

const icon = (children: ReactNode) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const PAIN = [
  'You post, people like it, and nobody buys.',
  'Messages pile up while you are busy running your business.',
  'Agencies and creators cost a lot, and you still cannot tell what works.',
];

const FEATURES: {
  title: string;
  text: string;
  tag: string;
  icon: ReactNode;
}[] = [
  {
    title: 'Turn interest into sales',
    text: 'Follow up with people who show interest, bring past buyers back, and give every lead a reason to buy.',
    tag: 'Sales',
    icon: icon(
      <>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </>
    ),
  },
  {
    title: 'Campaigns that work while you rest',
    text: 'Let Jujo create and publish your campaigns, reply to ad enquiries, and keep customers moving toward a sale.',
    tag: 'Campaigns',
    icon: icon(
      <>
        <path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z" />
        <path d="M15.5 8.5a5 5 0 010 7" />
        <path d="M18.5 5.5a9 9 0 010 13" />
      </>
    ),
  },
  {
    title: 'AI ads made for your business',
    text: 'Create ad campaigns for the right customers without spending heavily on agencies or creators.',
    tag: 'AI ads',
    icon: icon(
      <>
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
      </>
    ),
  },
  {
    title: 'Create and edit media with Jujo Studio',
    text: 'Generate images and media for your brand, then edit them with Jujo Studio until they are ready to post.',
    tag: 'Jujo Studio',
    icon: icon(
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="M21 15l-5-5L5 20" />
      </>
    ),
  },
  {
    title: 'Manage every social page in one place',
    text: 'Plan, schedule and publish to Instagram, Facebook, X and TikTok without jumping between apps.',
    tag: 'Socials',
    icon: icon(
      <>
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
      </>
    ),
  },
  {
    title: 'Keep products and stock organised',
    text: 'Manage products, prices and inventory in one catalogue, then create posts directly from your listings.',
    tag: 'Catalogue',
    icon: icon(
      <>
        <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
        <path d="M3 8l9 5 9-5M12 13v8" />
      </>
    ),
  },
  {
    title: 'Build trust with CAC registration',
    text: 'Register your business with CAC and show customers that they are buying from a real business.',
    tag: 'Trust',
    icon: icon(
      <>
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        <path d="M8.5 12l2.5 2.5 4.5-5" />
      </>
    ),
  },
];

export default function Sections() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items =
      rootRef.current?.querySelectorAll<HTMLElement>('[data-reveal]');

    if (!items) return;

    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      items.forEach((element) => element.setAttribute('data-visible', ''));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', '');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
    );

    items.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const glow = (event: PointerEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const box = element.getBoundingClientRect();

    element.style.setProperty('--x', `${event.clientX - box.left}px`);
    element.style.setProperty('--y', `${event.clientY - box.top}px`);
  };

  return (
    <div className={styles.wrap} ref={rootRef}>
      <section className={styles.block}>
        <span className={styles.kicker} data-reveal>
          Built for sellers
        </span>

        <h2
          className={styles.h2}
          data-reveal
          style={{ ['--i' as string]: 1 }}
        >
          Are you looking to improve sales?
        </h2>

        <p
          className={styles.lead}
          data-reveal
          style={{ ['--i' as string]: 2 }}
        >
          You do not need to spend heavily on advertising or test many
          creators before finding what works. Jujo helps small and medium
          businesses create campaigns, manage customers and turn more
          interest into sales.
        </p>
      </section>

      <section className={styles.block}>
        <h2 className={styles.h2} data-reveal>
          Sound familiar?
        </h2>

        <ul className={styles.pain}>
          {PAIN.map((point, index) => (
            <li
              key={point}
              data-reveal
              style={{ ['--i' as string]: index }}
            >
              <span className={styles.dot} aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <span className={styles.kicker} data-reveal>
          What Jujo gives you
        </span>

        <h2
          className={styles.h2}
          data-reveal
          style={{ ['--i' as string]: 1 }}
        >
          Jujo has everything your business needs
        </h2>

        <div className={styles.grid}>
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className={styles.card}
              data-reveal
              style={{ ['--i' as string]: index % 4 }}
              onPointerMove={glow}
            >
              <div className={styles.cardTop}>
                <span className={styles.iconTile}>{feature.icon}</span>
                <span className={styles.tag}>{feature.tag}</span>
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.block} ${styles.cta}`}>
        <div className={styles.ctaCard} data-reveal>
          <Image
            src="/jujo-mark.png"
            alt="Jujo"
            width={56}
            height={48}
            style={{ width: 56, height: 'auto' }}
          />

          <h2 className={styles.h2} style={{ color: '#fff' }}>
            Don&apos;t miss out
          </h2>

          <p
            className={styles.lead}
            style={{ color: 'rgba(255,255,255,0.78)' }}
          >
            Jujo launches early November. Join the waitlist and be among the
            first businesses to use it.
          </p>

          <a href="#top" className={styles.btn}>
            Join the waitlist
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footBrand}>
          <Image
            src="/jujo-mark.png"
            alt=""
            width={26}
            height={22}
            style={{ width: 26, height: 'auto' }}
          />
          © 2026 Jujo
        </span>

        <a href="mailto:support@getjujo.com">support@getjujo.com</a>
      </footer>
    </div>
  );
}
