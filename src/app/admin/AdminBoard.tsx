'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './admin.module.css';

export type Entry = { id: string; email: string; createdAt: string; source: string };

const SIZES = [25, 50, 100];

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Lagos' }).format(d);
}

/* 1 … 4 5 [6] 7 8 … 20 */
function pageList(current: number, last: number): Array<number | '…'> {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages = new Set([1, last, current - 1, current, current + 1].filter((p) => p >= 1 && p <= last));
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= last - 2) [last - 3, last - 2, last - 1].forEach((p) => pages.add(p));
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const out: Array<number | '…'> = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1]! > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function AdminBoard({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* page, search and size live in the URL so a view can be shared or refreshed */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setQuery(q.get('q') ?? '');
    setPage(Math.max(1, Number(q.get('page')) || 1));
    const s = Number(q.get('size'));
    if (SIZES.includes(s)) setSize(s);
  }, []);

  useEffect(() => {
    const q = new URLSearchParams();
    if (query) q.set('q', query);
    if (page > 1) q.set('page', String(page));
    if (size !== 25) q.set('size', String(size));
    const next = `${window.location.pathname}${q.toString() ? `?${q}` : ''}`;
    window.history.replaceState(null, '', next);
  }, [query, page, size]);

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    return t ? entries.filter((e) => e.email.toLowerCase().includes(t) || e.source.toLowerCase().includes(t)) : entries;
  }, [entries, query]);

  const last = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, last);
  const start = (current - 1) * size;
  const rows = filtered.slice(start, start + size);
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.email));

  const toggle = (email: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });

  const togglePage = () =>
    setSelected((s) => {
      const next = new Set(s);
      rows.forEach((r) => (allOnPage ? next.delete(r.email) : next.add(r.email)));
      return next;
    });

  const go = (p: number) => {
    setPage(Math.min(Math.max(1, p), last));
    document.getElementById('waitlist-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const exportCsv = () => {
    const csv = ['email,joined,source', ...filtered.map((e) => [e.email, e.createdAt, e.source].map((v) => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jujo-waitlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Composer total={entries.length} selected={Array.from(selected)} onClear={() => setSelected(new Set())} />

      <section className={styles.tableCard} id="waitlist-table">
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            type="search"
            placeholder="Search by email or source"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <div className={styles.toolbarRight}>
            {selected.size > 0 && (
              <button type="button" className={styles.linkButton} onClick={() => setSelected(new Set())}>
                Clear {selected.size} selected
              </button>
            )}
            <button type="button" className={styles.ghostButton} onClick={exportCsv} disabled={!filtered.length}>
              Export CSV
            </button>
          </div>
        </div>

        <div className={styles.tableHeading}>
          <label className={styles.checkCell}>
            <input type="checkbox" checked={allOnPage} onChange={togglePage} aria-label="Select everyone on this page" />
          </label>
          <span>Email address</span>
          <span>Joined</span>
          <span>Source</span>
        </div>

        <div className={styles.rows}>
          {rows.map((entry) => (
            <label className={`${styles.row} ${selected.has(entry.email) ? styles.rowOn : ''}`} key={entry.id}>
              <span className={styles.checkCell}>
                <input type="checkbox" checked={selected.has(entry.email)} onChange={() => toggle(entry.email)} aria-label={`Select ${entry.email}`} />
              </span>
              <strong>{entry.email}</strong>
              <span>{formatDate(entry.createdAt)}</span>
              <span className={styles.source}>{entry.source}</span>
            </label>
          ))}
          {!rows.length && <p className={styles.noMatch}>No one matches “{query}”.</p>}
        </div>

        <footer className={styles.pager}>
          <span className={styles.pagerInfo}>
            {filtered.length ? `Showing ${start + 1}–${start + rows.length} of ${filtered.length}` : 'No results'}
          </span>
          <div className={styles.pages}>
            <button type="button" onClick={() => go(current - 1)} disabled={current === 1} aria-label="Previous page">
              ‹
            </button>
            {pageList(current, last).map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} className={styles.gap}>
                  …
                </span>
              ) : (
                <button type="button" key={p} className={p === current ? styles.pageOn : ''} onClick={() => go(p)} aria-current={p === current ? 'page' : undefined}>
                  {p}
                </button>
              )
            )}
            <button type="button" onClick={() => go(current + 1)} disabled={current === last} aria-label="Next page">
              ›
            </button>
          </div>
          <label className={styles.sizePick}>
            Per page
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </footer>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ bulk email */

function Composer({ total, selected, onClear }: { total: number; selected: string[]; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<'all' | 'selected' | 'test'>('test');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (selected.length && audience !== 'test') setAudience('selected');
    if (!selected.length && audience === 'selected') setAudience('all');
  }, [selected.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = audience === 'all' ? total : audience === 'selected' ? selected.length : 1;

  const send = async () => {
    setStatus(null);
    if (!subject.trim() || !message.trim()) return setStatus({ tone: 'error', text: 'Add a subject and a message.' });
    if (audience !== 'test' && !window.confirm(`Send “${subject.trim()}” to ${count} ${count === 1 ? 'person' : 'people'}? This can’t be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, emails: selected, testEmail, subject, message, ctaLabel, ctaUrl }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; sent?: number; failed?: number; errors?: string[] };
      if (!res.ok && !data.sent) {
        setStatus({ tone: 'error', text: data.message ?? data.errors?.[0] ?? 'Sending failed.' });
      } else {
        const failed = data.failed ? ` ${data.failed} failed: ${data.errors?.[0] ?? 'see Resend logs'}.` : '';
        setStatus({ tone: data.failed ? 'error' : 'ok', text: `Sent to ${data.sent} ${data.sent === 1 ? 'person' : 'people'}.${failed}` });
        if (audience === 'selected' && !data.failed) onClear();
      }
    } catch {
      setStatus({ tone: 'error', text: 'Could not reach the server. Check your connection.' });
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button type="button" className={styles.composeOpen} onClick={() => setOpen(true)}>
        <span>✉</span> Email the waitlist
        {selected.length > 0 && <em>{selected.length} selected</em>}
      </button>
    );
  }

  return (
    <section className={styles.composer}>
      <div className={styles.composerHead}>
        <h2>Email the waitlist</h2>
        <button type="button" className={styles.linkButton} onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <div className={styles.audience} role="radiogroup" aria-label="Who gets this">
        {(
          [
            ['test', 'Send me a test'],
            ['selected', `Selected (${selected.length})`],
            ['all', `Everyone (${total})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={audience === value}
            className={audience === value ? styles.audienceOn : ''}
            disabled={value === 'selected' && !selected.length}
            onClick={() => setAudience(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {audience === 'selected' && !selected.length && <p className={styles.hint}>Tick people in the table below first.</p>}

      {audience === 'test' && (
        <label className={styles.field}>
          <span>Send the test to</span>
          <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@getjujo.com" />
        </label>
      )}
      <label className={styles.field}>
        <span>Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="Jujo is opening its doors" />
      </label>
      <label className={styles.field}>
        <span>Message</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} placeholder={'Hi there,\n\nLeave a blank line to start a new paragraph.'} />
      </label>
      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span>Button text (optional)</span>
          <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} maxLength={60} placeholder="Create your account" />
        </label>
        <label className={styles.field}>
          <span>Button link</span>
          <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://growth.getjujo.com/signup" />
        </label>
      </div>

      {status && <p className={status.tone === 'ok' ? styles.statusOk : styles.statusError}>{status.text}</p>}

      <div className={styles.composerFoot}>
        <span className={styles.hint}>Each person gets their own copy. Nobody sees other addresses.</span>
        <button type="button" className={styles.sendButton} onClick={() => void send()} disabled={busy || (audience === 'selected' && !selected.length)}>
          {busy ? 'Sending…' : audience === 'test' ? 'Send test' : `Send to ${count} ${count === 1 ? 'person' : 'people'}`}
        </button>
      </div>
    </section>
  );
}
