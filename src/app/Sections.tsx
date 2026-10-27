import styles from './sections.module.css';

const PAIN = [
  'You post, people like it, and nobody buys.',
  'Messages pile up at night while you are busy running the shop.',
  'Agencies and creators cost a lot, and you still cannot tell what works.',
];

const FEATURES = [
  { title: 'Publish and manage your socials', text: 'Plan, schedule and post to Instagram, Facebook, X and TikTok from one place.' },
  { title: 'Content and media made for you', text: 'Captions, slogans and post images written in your voice, ready to approve.' },
  { title: 'Campaigns and ads, simply', text: 'Launch a campaign in minutes and see what is working, without paying an agency.' },
  { title: 'Inbox and AI replies', text: 'Answer customer questions and enquiries on time, even when you are away.' },
  { title: 'Turn leads into sales', text: 'Follow up with people who showed interest and bring past buyers back.' },
  { title: 'Product catalogue and inventory', text: 'Keep your products, prices and stock in one list, and post straight from it.' },
  { title: 'CAC registration, built in', text: 'Register your business with CAC and show customers you are the real deal.' },
  { title: 'Results in plain words', text: 'See "14 people replied" instead of marketing jargon, so you always know what to do next.' },
];

export default function Sections() {
  return (
    <div className={styles.wrap}>
      <section className={styles.block}>
        <h2 className={styles.h2}>Are you looking to improve sales?</h2>
        <p className={styles.lead}>
          You don&apos;t have to pay large money for brand advertisement. You don&apos;t have to test several creators
          before you find the sales pattern that works for your business. Jujo does the heavy lifting, built for
          small and medium businesses that want one thing: more sales.
        </p>
      </section>

      <section className={styles.block}>
        <h2 className={styles.h2}>Sound familiar?</h2>
        <ul className={styles.pain}>
          {PAIN.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <h2 className={styles.h2}>Everything you need to sell, in one place</h2>
        <div className={styles.grid}>
          {FEATURES.map((f) => (
            <article key={f.title} className={styles.card}>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.block} ${styles.cta}`}>
        <h2 className={styles.h2}>Be first in line</h2>
        <p className={styles.lead}>Join the waitlist and we will email you the moment Jujo opens.</p>
        <a href="#top" className={styles.btn}>Join the waitlist</a>
      </section>

      <footer className={styles.footer}>
        <span>© 2026 Jujo</span>
        <a href="mailto:Hello@jujo.ng">Hello@jujo.ng</a>
      </footer>
    </div>
  );
}