'use client';

import { useEffect, useRef, type PointerEvent } from 'react';
import Image from 'next/image';
import styles from './sections.module.css';

const FEATURES = [
  {
    title: 'Turn interest into sales',
    text: 'Follow up with people who show interest, bring past buyers back, and give every lead a reason to buy.',
    tag: 'Sales',
    image: '/08AFA280-D788-4AB7-B225-F89851AF6E3E.png',
  },
  {
    title: 'Campaigns that work while you rest',
    text: 'Let Jujo create and publish your campaigns, reply to ad enquiries, and keep customers moving toward a sale.',
    tag: 'Campaigns',
    image: '/110CEC95-0D55-4462-B0EE-2B5D391EC3F8.png',
  },
  {
    title: 'AI ads made for your business',
    text: 'Create ad campaigns for the right customers without spending heavily on agencies or creators.',
    tag: 'AI ads',
    image: '/367E9683-95E8-4C2B-9B72-613CB71781E2.png',
  },
  {
    title: 'Create and edit media with Jujo Studio',
    text: 'Generate images and media for your brand, then edit them with Jujo Studio until they are ready to post.',
    tag: 'Jujo Studio',
    image: '/55681FA4-1322-4B9C-B8D8-EAFCE90E100E.png',
  },
  {
    title: 'Manage every social page in one place',
    text: 'Plan, schedule and publish to Instagram, Facebook, X and TikTok without jumping between apps.',
    tag: 'Socials',
    image: '/5EC31E96-0758-4260-94A7-38DC638B8A01.png',
  },
  {
    title: 'Keep products and stock organised',
    text: 'Manage products, prices and inventory in one catalogue, then create posts directly from your listings.',
    tag: 'Catalogue',
    image: '/7C749527-732B-4A6B-954A-6DDEBDA2BA40.png',
  },
  {
    title: 'Build trust with CAC registration',
    text: 'Register your business with CAC and show customers that they are buying from a real business.',
    tag: 'Trust',
    image: '/B887A612-A607-411A-8DCD-6B7AC2761064.png',
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
      {
        threshold: 0.15,
        rootMargin: '0px 0px -6% 0px',
      }
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
                <Image
                  src={feature.image}
                  alt=""
                  width={160}
                  height={140}
                  className={styles.featureImage}
                />

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
          <div className={styles.ctaLogo}>
            <Image
              src="/jujo-mark.png"
              alt="Jujo"
              width={56}
              height={48}
              style={{ width: 56, height: 'auto' }}
            />
          </div>

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
