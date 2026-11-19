'use client';

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { tr } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

interface Entry { title: string; body: React.ReactNode }
type ActiveEntry = Entry & { id: string };

interface Ctx {
  openHint: (id: string, entry: Entry) => void;
  register: (id: string, entry: Entry) => void;
  unregister: (id: string) => void;
}

const InfoHintContext = createContext<Ctx | null>(null);

/** Wrap one guide page so every `InfoHint` on it shares one explainer panel. */
export function InfoHintProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const [activeEntry, setActiveEntry] = useState<ActiveEntry | null>(null);
  const registry = useRef<Map<string, Entry>>(new Map());
  const lastTrigger = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [, bump] = useState(0);

  // Stable identities: the context value must not change reference on every render, or every
  // InfoHint's registration effect (which depends on it) would tear down and re-run forever.
  const register = useCallback((id: string, entry: Entry) => {
    const existed = registry.current.has(id);
    registry.current.set(id, entry);
    if (!existed) bump(n => n + 1);
  }, []);
  const unregister = useCallback((id: string) => {
    if (!registry.current.delete(id)) return;
    bump(n => n + 1);
    setActiveEntry(prev => (prev?.id === id ? null : prev));
  }, []);
  const openHint = useCallback((id: string, entry: Entry) => {
    lastTrigger.current = document.activeElement as HTMLElement;
    setActiveEntry({ id, ...entry });
  }, []);
  const value = useMemo(() => ({ openHint, register, unregister }), [openHint, register, unregister]);
  function close() {
    setActiveEntry(null);
    lastTrigger.current?.focus();
  }

  useEffect(() => {
    if (!activeEntry) return;
    closeBtn.current?.focus();
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry]);

  const others = [...registry.current.entries()].filter(([id]) => id !== activeEntry?.id);

  return (
    <InfoHintContext.Provider value={value}>
      {children}
      {activeEntry ? (
        <>
          <button type="button" className="info-sidebar-backdrop" aria-label={tr(locale, 'Schließen', 'Close')} onClick={close} />
          <div className="info-sidebar" role="dialog" aria-modal="true" aria-label={tr(locale, 'Erklärung', 'Explanation')}>
            <div className="info-sidebar-head">
              <span>{tr(locale, 'Kurz erklärt', 'Quick explainer')}</span>
              <button type="button" ref={closeBtn} className="info-sidebar-close" onClick={close} aria-label={tr(locale, 'Schließen', 'Close')}>✕</button>
            </div>
            <div className="info-sidebar-body">
              <div className="info-sidebar-entry active"><strong>{activeEntry.title}</strong><div>{activeEntry.body}</div></div>
              {others.length ? (
                <div className="info-sidebar-others">
                  <span className="info-sidebar-others-label">{tr(locale, 'Auch auf dieser Seite erklärt', 'Also explained on this page')}</span>
                  {others.map(([id, entry]) => (
                    <button type="button" key={id} className="info-sidebar-entry" onClick={() => setActiveEntry({ id, ...entry })}>
                      <strong>{entry.title}</strong><div>{entry.body}</div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </InfoHintContext.Provider>
  );
}

/**
 * Small (i) button: hover/focus shows a one-line teaser, click opens the full explanation in the
 * page's sidebar. Pass `id` when the same explanation appears next to several repeated controls
 * (e.g. every "command" CopyBlock) so they share one sidebar entry instead of repeating it.
 */
export function InfoHint({ locale, id: fixedId, title, teaser, children }: { locale: Locale; id?: string; title: string; teaser: string; children: React.ReactNode }) {
  const ctx = useContext(InfoHintContext);
  const generatedId = useId();
  const id = fixedId ?? generatedId;

  // Register once per mount, not on every render: `ctx` is a fresh object each time the
  // provider's state changes, so a re-running effect without this guard would unregister
  // and immediately re-register on every open/close, looping forever.
  useEffect(() => { ctx?.register(id, { title, body: children }); return () => ctx?.unregister(id); }, [ctx, id]);

  if (!ctx) return null;
  return (
    <span className="info-hint">
      <button
        type="button"
        className="info-hint-btn"
        aria-label={tr(locale, `Mehr erklärt: ${title}`, `More explained: ${title}`)}
        aria-haspopup="dialog"
        onClick={() => ctx.openHint(id, { title, body: children })}
      >
        i
      </button>
      <span className="info-hint-tip" aria-hidden="true">{teaser}</span>
    </span>
  );
}
