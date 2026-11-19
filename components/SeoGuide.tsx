'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { STORAGE_KEY as WEBSITE_STORAGE_KEY, agentName, officialLinks, parseSaved, terminalName } from '@/lib/guide';
import { tr } from '@/lib/i18n';
import {
  SEO_STORAGE_KEY, consoleCheckPrompt, consolePrompt, initialSeoGuide, isSeoAnswered, monthlyPrompt, parseSavedSeo, platformName,
  prefillFromWebsiteGuide, seoFolder, seoNotesFile, seoOutcomes, seoPrompt, seoQuestions, seoStartCommand, seoStepMeta, seoSteps,
} from '@/lib/seo-guide';
import type { Locale, SavedSeoGuide, SeoAnswered, SeoSituation, SeoStepId } from '@/lib/types';
import { AgentStep, CopyBlock, PromptIntro, RestartSession, Tip, WhatHappens } from './guide-ui';
import { YouWillHave } from './Pitch';

/* ---------- step 0: where do you stand ---------- */

function StartStep({ locale, situation, onChange }: { locale: Locale; situation: SeoSituation; onChange: (s: SeoSituation) => void }) {
  const q = seoQuestions(locale, situation);
  const list = [
    q.site,
    situation.site === 'other' ? q.platform : null,
    q.os,
    q.agent,
    situation.agent ? q.installed : null,
  ].filter(item => item !== null);
  return (
    <div className="questions">
      {list.map(question => (
        <fieldset key={question.key} className="question">
          <legend>{question.title}</legend>
          {question.hint ? <p className="question-hint">{question.hint}</p> : null}
          <div className={`options count-${question.options.length > 4 ? 'many' : question.options.length}`}>
            {question.options.map(o => {
              const checked = situation[question.key] === o.value;
              return (
                <label key={o.value} className={`option ${checked ? 'checked' : ''}`}>
                  <input type="radio" name={question.key} value={o.value} checked={checked}
                    onChange={() => onChange({ ...situation, [question.key]: o.value, ...(question.key === 'site' && o.value === 'diy' ? { platform: null } : {}) })} />
                  <strong>{o.label}</strong>
                  {o.hint ? <small>{o.hint}</small> : null}
                </label>
              );
            })}
          </div>
          {question.key === 'site' && situation.site === 'diy'
            ? <p className="question-note">{tr(locale, 'Deine Website muss schon online sein. Noch nicht? ', 'Your website needs to be online already. Not yet? ')}<Link href={`/${locale}/guides/business-website`}>{tr(locale, 'Erst die Website-Anleitung abschließen', 'Finish the website guide first')}</Link></p>
            : null}
          {question.key === 'agent' ? <p className="question-note">{tr(locale, 'Nimm dieselbe KI wie bei deiner Website – oder die, für die du schon ein Abo hast. ', 'Use the same AI as for your website – or the one you already pay for. ')}<a href={officialLinks.claudePricing} target="_blank" rel="noreferrer">{tr(locale, 'Claude-Preise', 'Claude pricing')}</a> · <a href={officialLinks.chatgptPricing} target="_blank" rel="noreferrer">{tr(locale, 'ChatGPT-Preise', 'ChatGPT pricing')}</a></p> : null}
        </fieldset>
      ))}
    </div>
  );
}

/* ---------- step 2: Search Console ---------- */

function ConsoleStep({ locale, s }: { locale: Locale; s: SeoAnswered }) {
  const name = agentName(s.agent);
  const diy = s.site === 'diy';
  return (
    <>
      <PromptIntro>{tr(locale,
        `Die Google Search Console ist Googles kostenloser Bereich für Website-Besitzer. Dort sagst du Google „Das ist meine Website“ und siehst später, wie oft du gefunden wirst. ${name} richtet alles mit dir ein.`,
        `Google Search Console is Google’s free area for website owners. There you tell Google “this is my website”, and later you see how often you’re found. ${name} sets it all up with you.`)}</PromptIntro>
      <WhatHappens locale={locale} items={[
        ['ai', diy
          ? tr(locale, 'Die KI prüft zuerst, ob Google deine Website lesen darf und ob deine Sitemap (das Inhaltsverzeichnis für Google) stimmt – und repariert es nach deinem OK.', 'The AI first checks that Google may read your website and that your sitemap (the table of contents for Google) is right – and fixes it after your OK.')
          : tr(locale, `Die KI prüft zuerst, ob Google deine Website lesen darf, und sucht deine Sitemap (das Inhaltsverzeichnis für Google). Sie kennt die Eigenheiten von ${platformName(locale, s.platform ?? 'unknown')}${s.platform === 'code' ? ' und fragt dich, welches Framework du nutzt' : ''}.`, `The AI first checks that Google may read your website and finds your sitemap (the table of contents for Google). It knows the quirks of ${platformName(locale, s.platform ?? 'unknown')}${s.platform === 'code' ? ' and asks which framework you use' : ''}.`)],
        ['you', tr(locale, 'Bei deinem Google-Konto meldest du dich selbst an. Hast du keins, legst du es selbst an – die KI zeigt dir wo.', 'You sign in to your Google account yourself. If you don’t have one, you create it yourself – the AI shows you where.')],
        ['ai', tr(locale, 'Dann klickt sich die KI per Browser-Automatisierung durch die Search Console: Website hinzufügen, bestätigen, Sitemap einreichen, Startseite anmelden.', 'Then the AI uses browser automation to click through Search Console: add the website, verify it, submit the sitemap, request your home page.')],
        ['back', tr(locale, 'Muss etwas an deiner Domain oder Website geändert werden, zeigt die KI dir vorher genau was – und macht erst nach deinem OK weiter.', 'If something on your domain or website needs to change, the AI shows you exactly what first – and only continues after your OK.')],
        ['calm', tr(locale, 'Alles ist kostenlos und angeleitet. Du kannst nichts kaputt machen.', 'Everything is free and guided. You can’t break anything.')],
      ]} />
      <h3 className="sub">{tr(locale, 'A · Einrichten', 'A · Set up')}</h3>
      <p>{tr(locale, `Kopiere den Prompt, füge ihn bei ${name} im ${terminalName(locale, s.os)}-Fenster ein und drücke Enter.`, `Copy the prompt, paste it into ${name} in the ${terminalName(locale, s.os)} window and press Enter.`)}</p>
      <CopyBlock locale={locale} label={tr(locale, 'Prompt: Google Search Console', 'Prompt: Google Search Console')} text={consolePrompt(locale, s)} />
      {s.platform === 'code' ? <RestartSession locale={locale} s={s} folder={seoFolder(s)} /> : null}
      <Tip>{tr(locale, 'Die Bestätigung über die Domain (DNS) braucht manchmal ein paar Stunden. Dann einfach später wiederkommen und dasselbe sagen: „Bitte jetzt bestätigen.“', 'Verifying through your domain (DNS) sometimes takes a few hours. Then just come back later and say: “Please verify now.”')}</Tip>
      <h3 className="sub">{tr(locale, 'B · Prüfen', 'B · Check')}</h3>
      <p>{tr(locale, 'Wenn A fertig ist: Dieser Prompt prüft, ob alles richtig eingerichtet ist. Er ändert nichts.', 'When A is done: this prompt checks that everything is set up correctly. It doesn’t change anything.')}</p>
      <CopyBlock locale={locale} label={tr(locale, 'Prompt: Alles bei Google bereit?', 'Prompt: all set on Google?')} text={consoleCheckPrompt(locale, s)} />
      <p className="ready-line">{tr(locale, 'Fertig, wenn überall ✅ oder ⏳ steht. ⏳ heißt nur: Google braucht noch ein paar Tage.', 'You’re done when everything shows ✅ or ⏳. ⏳ only means Google needs a few more days.')}</p>
    </>
  );
}

/* ---------- step 3: SEO ---------- */

function SeoStep({ locale, s }: { locale: Locale; s: SeoAnswered }) {
  const diy = s.site === 'diy';
  return (
    <>
      <PromptIntro>{tr(locale,
        'SEO heißt: deine Website so machen, dass Google sie versteht und Leute dich finden, wenn sie nach dem suchen, was du anbietest. Deine KI fragt dich kurz aus, prüft alles und verbessert dann das Wichtigste.',
        'SEO means making your website so that Google understands it and people find you when they search for what you offer. Your AI briefly interviews you, checks everything and then improves what matters most.')}</PromptIntro>
      <Tip>{tr(locale, 'Überleg dir vorher: Was sind deine 3–5 wichtigsten Angebote, wo sind deine Kunden, und welche Wörter würden sie bei Google eintippen? Grob reicht völlig.', 'Think about it beforehand: what are your 3–5 most important offers, where are your customers, and which words would they type into Google? A rough idea is plenty.')}</Tip>
      <WhatHappens locale={locale} items={[
        ['ai', tr(locale, 'Die KI stellt dir ein paar Fragen zu deinem Angebot und deinen Kunden und schlägt Suchbegriffe vor.', 'The AI asks you a few questions about your offer and your customers and suggests search terms.')],
        ['check', tr(locale, 'Dann prüft sie jede Seite und zeigt dir eine ✅/⚠️/❌-Liste – das Wichtigste zuerst, in normalen Worten.', 'Then it checks every page and shows you a ✅/⚠️/❌ list – most important first, in everyday words.')],
        ['you', tr(locale, 'Du sagst OK zu den 5 Verbesserungen, die am meisten bringen.', 'You say OK to the 5 improvements that help most.')],
        ['ai', diy
          ? tr(locale, 'Die KI ändert deine Website, zeigt sie dir auf deinem Computer und veröffentlicht sie erst nach deinem OK. Danach sagt sie Google Bescheid.', 'The AI changes your website, shows it to you on your computer and only publishes it after your OK. Then it tells Google.')
          : s.platform === 'code'
            ? tr(locale, 'Die KI ändert deinen Code mit den üblichen Werkzeugen deines Frameworks, zeigt dir die Änderungen und veröffentlicht erst nach deinem OK.', 'The AI changes your code using your framework’s usual tools, shows you the changes and only publishes after your OK.')
            : tr(locale, 'Die KI erledigt, was sie über deinen Browser in der Verwaltung deiner Website machen kann. Was nur du tun kannst, bekommst du als einfache Schritt-für-Schritt-Liste.', 'The AI does what it can through your browser in your website’s admin area. Anything only you can do, you get as a simple step-by-step list.')],
        ['calm', tr(locale, 'Keine Tricks, keine Kosten, nichts wird ohne dein OK geändert.', 'No tricks, no costs, nothing changes without your OK.')],
      ]} />
      <CopyBlock locale={locale} label={tr(locale, 'Prompt: SEO verbessern', 'Prompt: improve SEO')} text={seoPrompt(locale, s)} />
      <Tip>{tr(locale, 'Hast du ein Geschäft vor Ort? Dann ist dein kostenloses Google-Unternehmensprofil (der Eintrag bei Google Maps) oft genauso wichtig wie die Website. Die KI bietet dir an, es mit dir einzurichten.', 'Do you have a local business? Then your free Google Business Profile (the listing on Google Maps) is often as important as the website. The AI offers to set it up with you.')}</Tip>
      <p className="ready-line">{tr(locale, 'Fertig, wenn die KI dir sagt, was jetzt besser ist, und alles notiert hat.', 'You’re done when the AI tells you what’s better now and has written everything down.')}</p>
    </>
  );
}

/* ---------- step 4: keep it up ---------- */

function KeepStep({ locale, s }: { locale: Locale; s: SeoAnswered }) {
  const name = agentName(s.agent);
  return (
    <>
      <PromptIntro>{tr(locale, 'SEO ist kein Einmal-Ding, aber auch keine Arbeit: 10 Minuten im Monat reichen. Speichere dir diesen Prompt.', 'SEO isn’t a one-off, but it isn’t work either: 10 minutes a month is enough. Keep this prompt.')}</PromptIntro>
      <div className="handbook">
        <strong>{tr(locale, 'Was dich erwartet:', 'What to expect:')}</strong>
        <ul>
          <li>{tr(locale, 'Nach 2–3 Tagen: erste Zahlen in der Search Console.', 'After 2–3 days: first numbers in Search Console.')}</li>
          <li>{tr(locale, 'Nach Tagen bis Wochen: deine Seiten erscheinen bei Google.', 'After days to weeks: your pages appear on Google.')}</li>
          <li>{tr(locale, 'Nach 1–3 Monaten: du siehst, wonach Leute suchen, wenn sie dich finden – damit wird es jeden Monat besser.', 'After 1–3 months: you see what people search for when they find you – and it gets better every month.')}</li>
        </ul>
      </div>
      <p>{tr(locale, `Einmal im Monat: ${terminalName(locale, s.os)} öffnen, den Start-Befehl einfügen und diesen Prompt bei ${name} einfügen.`, `Once a month: open ${terminalName(locale, s.os)}, paste the start command, then paste this prompt into ${name}.`)}</p>
      <CopyBlock locale={locale} kind="command" label={tr(locale, 'Start-Befehl', 'Start command')} text={seoStartCommand(s)} />
      <CopyBlock locale={locale} label={tr(locale, 'Prompt: Monats-Check', 'Prompt: monthly check')} text={monthlyPrompt(locale, s)} />
      <Tip>{tr(locale, 'Du hast etwas an deiner Website geändert? Sag deiner KI danach einfach „Sag Google Bescheid“ – sie reicht die Sitemap neu ein und meldet die geänderten Seiten an.', 'Changed something on your website? Afterwards just tell your AI “tell Google” – it resubmits the sitemap and requests the changed pages.')}</Tip>
      <p className="ready-line">{tr(locale, 'Fertig, wenn du dir den Monats-Check gespeichert hast (oder einfach diese Seite als Lesezeichen).', 'You’re done when you’ve saved the monthly check (or simply bookmarked this page).')}</p>
    </>
  );
}

/* ---------- the page ---------- */

function loadSaved(): SavedSeoGuide {
  try {
    const raw = window.localStorage.getItem(SEO_STORAGE_KEY);
    if (raw) return parseSavedSeo(JSON.parse(raw));
    const website = window.localStorage.getItem(WEBSITE_STORAGE_KEY);
    if (website) return { ...initialSeoGuide(), situation: prefillFromWebsiteGuide(parseSaved(JSON.parse(website))) };
  } catch { /* fall through */ }
  return initialSeoGuide();
}

export function SeoGuide({ locale }: { locale: Locale }) {
  const [state, setState] = useState<SavedSeoGuide>(initialSeoGuide);
  const [loaded, setLoaded] = useState(false);
  const [finished, setFinished] = useState(false);
  const section = useRef<HTMLElement>(null);

  function scrollToSection() {
    const el = section.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: reduce ? 'auto' : 'smooth' });
  }

  useEffect(() => { setState(loadSaved()); setLoaded(true); }, []);
  useEffect(() => { if (loaded) { try { window.localStorage.setItem(SEO_STORAGE_KEY, JSON.stringify(state)); } catch { /* private mode */ } } }, [state, loaded]);

  const s = state.situation;
  const ready = isSeoAnswered(s);
  const index = seoSteps.indexOf(state.step);
  const next = seoSteps[index + 1];
  const meta = seoStepMeta(locale, state.step);

  function go(step: SeoStepId, markDone = false) {
    setState(prev => ({ ...prev, step, done: markDone && !prev.done.includes(prev.step) ? [...prev.done, prev.step] : prev.done }));
    setFinished(false);
    scrollToSection();
  }
  function finish() {
    setState(prev => ({ ...prev, done: prev.done.includes('keep') ? prev.done : [...prev.done, 'keep'] }));
    setFinished(true);
    scrollToSection();
  }
  function reset() {
    if (!window.confirm(tr(locale, 'Alle Auswahlen auf dieser Seite zurücksetzen? (Auf deinem Computer und bei Google wird nichts gelöscht.)', 'Reset all choices on this page? (Nothing on your computer or at Google is deleted.)'))) return;
    setState(initialSeoGuide());
    setFinished(false);
  }

  return (
    <main id="main" className="guide page-width">
      <div className="guide-top">
        <p className="eyebrow">{tr(locale, 'Bei Google gefunden werden · 5 Schritte', 'Get found on Google · 5 steps')}</p>
        <h1>{tr(locale, 'Bei Google.', 'On Google.')} <span>{tr(locale, 'Gefunden.', 'Found.')}</span></h1>
        <p className="guide-intro">{tr(locale,
          'Melde deine Website bei Google an und mach sie fit für die Suche – für die Website aus unserer Anleitung oder jede andere, egal ob WordPress, Wix, Shopify oder eigener Code. Du kopierst Prompts, deine KI erledigt die Arbeit.',
          'Register your website with Google and get it ready for search – the website from our guide or any other, whether WordPress, Wix, Shopify or your own code. You copy prompts, your AI does the work.')}</p>
        <YouWillHave locale={locale} items={seoOutcomes(locale, s)} />
        <div className="pitch-row">
          <aside className="cost-pitch compact" aria-label={tr(locale, 'Kosten', 'Costs')}>
            <p className="cost-big">{tr(locale, '0 € Kosten.', '$0 in costs.')}</p>
            <p className="cost-sub">{tr(locale, 'Google Search Console und alles in dieser Anleitung sind kostenlos.', 'Google Search Console and everything in this guide are free.')}</p>
            <p className="cost-fine">{tr(locale, 'Du brauchst nur deine KI (Abo) und ein kostenloses Google-Konto.', 'All you need is your AI (subscription) and a free Google account.')}</p>
          </aside>
          <aside className="fit-note" aria-label={tr(locale, 'Ehrlich gesagt', 'To be honest')}>
            <strong>{tr(locale, 'Ehrlich gesagt', 'To be honest')}</strong>
            <p>
              <span className="fit-yes">{tr(locale, '✓ Google findet dich schneller, versteht dein Angebot besser und zeigt dich eher den richtigen Leuten.', '✓ Google finds you faster, understands your offer better and is more likely to show you to the right people.')}</span>
              <span className="fit-no">{tr(locale, '✗ Niemand kann dir Platz 1 versprechen. Google braucht Tage bis Wochen, und wer dir „garantierte Rankings“ verkauft, sagt nicht die Wahrheit.', '✗ Nobody can promise you the top spot. Google takes days to weeks, and anyone selling you “guaranteed rankings” isn’t telling the truth.')}</span>
            </p>
          </aside>
        </div>
      </div>

      <nav ref={section} className="stepper" aria-label={tr(locale, 'Schritte', 'Steps')}>
        <ol>
          {seoSteps.map((id, i) => {
            const enabled = id === 'start' || ready;
            const current = id === state.step && !finished;
            const done = state.done.includes(id);
            return (
              <li key={id}>
                <button type="button" disabled={!enabled} aria-current={current ? 'step' : undefined} className={`${current ? 'current' : ''} ${done ? 'done' : ''}`} onClick={() => go(id)}>
                  <span className="step-dot" aria-hidden="true">{done ? '✓' : i}</span>
                  <span className="step-label">{seoStepMeta(locale, id).short}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {finished && ready ? (
        <section className="step-card finished" aria-live="polite">
          <p className="step-count">🎉</p>
          <h2>{tr(locale, 'Google weiß jetzt von dir.', 'Google knows about you now.')}</h2>
          <p className="lead">{s.site === 'diy'
            ? tr(locale, 'Alles Wichtige steht im SEO-Kapitel deines Handbuchs in „my-website“.', 'Everything important is in the SEO chapter of your handbook in “my-website”.')
            : tr(locale, `Alles Wichtige steht in ${seoNotesFile(locale)} in deinem Ordner „${seoFolder(s)}“.`, `Everything important is in ${seoNotesFile(locale)} in your “${seoFolder(s)}” folder.`)}</p>
          <p>{tr(locale, 'Einmal im Monat: Start-Befehl einfügen und den Monats-Check machen.', 'Once a month: paste the start command and run the monthly check.')}</p>
          <CopyBlock locale={locale} kind="command" label={tr(locale, 'Start-Befehl', 'Start command')} text={seoStartCommand(s)} />
          <div className="step-actions"><button type="button" className="button secondary" onClick={() => go('keep')}>{tr(locale, '← Zum Monats-Check', '← To the monthly check')}</button></div>
        </section>
      ) : (
        <section className="step-card" aria-labelledby="step-title">
          <p className="step-count">{state.step === 'start' ? tr(locale, 'Bevor es losgeht', 'Before we start') : tr(locale, `Schritt ${index} von 4`, `Step ${index} of 4`)}</p>
          <h2 id="step-title">{meta.title}</h2>
          {!loaded ? null : state.step === 'start' ? (
            <>
              <p className="lead">{tr(locale, 'Ein paar kurze Fragen, damit die Prompts genau zu deiner Website passen.', 'A few quick questions so the prompts fit your website exactly.')}</p>
              <StartStep locale={locale} situation={s} onChange={situation => setState(prev => ({ ...prev, situation }))} />
            </>
          ) : !ready ? null : state.step === 'agent' ? (
            <>
              {s.installed === 'yes' ? <Tip>{tr(locale, 'Deine KI läuft schon? Dann reichen hier: Terminal öffnen, Start-Befehl einfügen und der Browser-Test.', 'Your AI already works? Then all you need here: open the terminal, paste the start command and do the browser test.')}</Tip> : null}
              <AgentStep locale={locale} s={s} folder={seoFolder(s)} />
            </>
          ) : state.step === 'console' ? <ConsoleStep locale={locale} s={s} />
            : state.step === 'seo' ? <SeoStep locale={locale} s={s} />
              : <KeepStep locale={locale} s={s} />}

          <div className="step-actions">
            {index > 0 ? <button type="button" className="button secondary" onClick={() => go(seoSteps[index - 1])}>{tr(locale, '← Zurück', '← Back')}</button> : <span />}
            {next
              ? <button type="button" className="button primary" disabled={!ready} onClick={() => go(next, true)}>{state.step === 'start' ? tr(locale, 'Los geht’s →', 'Let’s go →') : tr(locale, 'Erledigt, weiter →', 'Done, next →')}</button>
              : <button type="button" className="button primary" onClick={finish}>{tr(locale, 'Fertig 🎉', 'Done 🎉')}</button>}
          </div>
        </section>
      )}

      <p className="guide-foot">
        {tr(locale, 'Deine Auswahl bleibt nur in diesem Browser. Diese Seite sieht nichts von deinem Computer, deiner Website oder deinem Google-Konto. ', 'Your choices stay in this browser only. This page can’t see your computer, your website or your Google account. ')}
        <button type="button" className="text-button" onClick={reset}>{tr(locale, 'Neu anfangen', 'Start over')}</button>
      </p>
    </main>
  );
}
