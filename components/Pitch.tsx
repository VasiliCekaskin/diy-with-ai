import { tr } from '@/lib/i18n';
import type { Outcome } from '@/lib/guide';
import type { Locale } from '@/lib/types';

/** The "almost zero costs" pitch. Keep it truthful: the domain and the AI plan are the only costs. */
export function CostPitch({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const free = [
    tr(locale, 'Hosting bei Cloudflare', 'Hosting on Cloudflare'),
    tr(locale, 'Code-Sicherung bei GitHub', 'Code backup on GitHub'),
    tr(locale, 'Diese Anleitung', 'This guide'),
    tr(locale, 'Keine Agentur, keine monatliche Baukasten-Gebühr', 'No agency, no monthly website-builder fee'),
  ];
  return (
    <aside className={`cost-pitch ${compact ? 'compact' : ''}`} aria-label={tr(locale, 'Kosten', 'Costs')}>
      <p className="cost-big">{tr(locale, 'Fast 0 € Kosten.', 'Almost $0 in costs.')}</p>
      <p className="cost-sub">{tr(locale, 'Du zahlst nur deine Domain – alles andere ist kostenlos.', 'All you pay for is your domain – everything else is free.')}</p>
      {compact ? null : <ul className="cost-free">{free.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}<em>{tr(locale, 'kostenlos', 'free')}</em></li>)}</ul>}
      <p className="cost-fine">{tr(locale,
        'Einzige Ausnahme: Deine KI braucht ein Abo (Claude Pro oder ein ChatGPT-Abo). Hast du schon eins, kostet dich nur die Domain etwas – meist ein kleiner Betrag pro Jahr. Ohne eigene Domain bekommst du eine kostenlose Adresse.',
        'One exception: your AI needs a subscription (Claude Pro or a ChatGPT plan). If you already have one, only the domain costs anything – usually a small amount per year. Without your own domain you get a free address.')}</p>
    </aside>
  );
}

/** Who this guide is (and isn't) for. */
export function FitNote({ locale }: { locale: Locale }) {
  return (
    <aside className="fit-note" aria-label={tr(locale, 'Für wen ist diese Anleitung?', 'Who is this guide for?')}>
      <strong>{tr(locale, 'Für wen ist das?', 'Who is this for?')}</strong>
      <p>
        <span className="fit-yes">{tr(locale, '✓ Ideal, wenn du noch keine Website hast oder nur eine kleine, veraltete.', '✓ Best if you don’t have a website yet, or only a small, outdated one.')}</span>
        <span className="fit-no">{tr(locale,
          '✗ Große Websites, CMS-Systeme (z. B. WordPress mit vielen Seiten oder Plugins) und Online-Shops können damit nicht garantiert vollständig umgezogen werden.',
          '✗ Big websites, CMS systems (e.g. WordPress with lots of pages or plugins) and online shops are not guaranteed to transfer completely.')}</span>
      </p>
    </aside>
  );
}

/** "What you'll have afterwards": the concrete result of a guide, shown before step 1. Reusable by every guide. */
export function YouWillHave({ locale, items }: { locale: Locale; items: Outcome[] }) {
  return (
    <section className="outcomes" aria-labelledby="outcomes-title">
      <h2 id="outcomes-title">{tr(locale, 'Das hast du am Ende', 'What you’ll have at the end')}</h2>
      <p>{tr(locale, 'Alles gehört dir und läuft über deine eigenen Konten.', 'Everything belongs to you and runs on your own accounts.')}</p>
      <ol>
        {items.map((item, i) => (
          <li key={item.title}>
            <span className="outcome-icon" aria-hidden="true">{item.icon}</span>
            <span><strong>{i + 1}. {item.title}</strong><span className="outcome-text">{item.text}</span></span>
          </li>
        ))}
      </ol>
    </section>
  );
}
