'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  STORAGE_KEY, agentName, buildPrompt, checkPrompt, handbookFile, initialGuide, isAnswered,
  launchPrompt, newComputerPrompt, officialLinks, parseSaved, previewPrompt, questions, seoGuidePath, setupPrompt, startCommand,
  stepMeta, steps, terminalName,
  websiteOutcomes,
} from '@/lib/guide';
import { tr } from '@/lib/i18n';
import { AgentStep, CopyBlock, Numbered, OldWebsiteWarning, PromptIntro, RestartSession, Tip, WhatHappens } from './guide-ui';
import { CostPitch, FitNote, YouWillHave } from './Pitch';
import type { Answered, Locale, SavedGuide, Situation, StepId } from '@/lib/types';

/* ---------- step 0: where do you stand ---------- */

function StartStep({ locale, situation, onChange }: { locale: Locale; situation: Situation; onChange: (s: Situation) => void }) {
  const qs = questions(locale, situation);
  return (
    <div className="questions">
      {qs.map(q => {
        if (q.key === 'installed' && !situation.agent) return null;
        return (
          <fieldset key={q.key} className="question">
            <legend>{q.title}</legend>
            {q.hint ? <p className="question-hint">{q.hint}</p> : null}
            <div className={`options count-${q.options.length}`}>
              {q.options.map(o => {
                const checked = situation[q.key] === o.value;
                return (
                  <label key={o.value} className={`option ${checked ? 'checked' : ''}`}>
                    <input type="radio" name={q.key} value={o.value} checked={checked} onChange={() => onChange({ ...situation, [q.key]: o.value })} />
                    <strong>{o.label}</strong>
                    {o.hint ? <small>{o.hint}</small> : null}
                  </label>
                );
              })}
            </div>
            {q.key === 'domain' && situation.domain === 'have' ? <OldWebsiteWarning locale={locale} /> : null}
            {q.key === 'agent' ? <p className="question-note">{tr(locale, 'Unsicher? Nimm die, für die du schon ein Abo hast. Beide funktionieren gleich gut. ', 'Not sure? Pick the one you already pay for. Both work equally well. ')}<a href={officialLinks.claudePricing} target="_blank" rel="noreferrer">{tr(locale, 'Claude-Preise', 'Claude pricing')}</a> · <a href={officialLinks.chatgptPricing} target="_blank" rel="noreferrer">{tr(locale, 'ChatGPT-Preise', 'ChatGPT pricing')}</a></p> : null}
          </fieldset>
        );
      })}
    </div>
  );
}


/* ---------- the prompt steps ---------- */


function AccountsStep({ locale, s }: { locale: Locale; s: Answered }) {
  const name = agentName(s.agent);
  return (
    <>
      <PromptIntro>{tr(locale, `Deine Website braucht zwei kostenlose Konten: GitHub (bewahrt den Code sicher auf) und Cloudflare (stellt die Website ins Internet). ${name} installiert alles Nötige und führt dich durch die Anmeldung.`, `Your website needs two free accounts: GitHub (keeps the code safe) and Cloudflare (puts the website on the internet). ${name} installs everything needed and walks you through signing in.`)}</PromptIntro>
      <WhatHappens locale={locale} items={[
        ['ai', tr(locale, `${name} erklärt dir jeden Schritt und übernimmt die schwere Arbeit: Es installiert die Werkzeuge und klickt sich – per Browser-Automatisierung – für dich durch GitHub und Cloudflare.`, `${name} explains every step and does the heavy lifting: it installs the tools and uses browser automation to click through GitHub and Cloudflare for you.`)],
        ['you', tr(locale, 'Manchmal kann die KI nicht ohne dich weitermachen – vor allem beim Registrieren der Konten, bei Passwörtern und Bestätigungscodes. Dann sagt sie dir genau, was du tun sollst.', 'Sometimes the AI can’t continue without you – especially when registering the accounts, for passwords and confirmation codes. It then tells you exactly what to do.')],
        ['back', tr(locale, 'Sobald du die Schritte erledigt hast und „fertig“ schreibst, übernimmt die KI wieder.', 'Once you’ve finished those steps and write “done”, the AI takes over again.')],
        ['calm', tr(locale, 'Keine Sorge: Alles ist angeleitet, du kannst nichts falsch machen. Und nichts kostet Geld oder geht online ohne dein OK.', 'Don’t worry: everything is guided, you can’t do anything wrong. And nothing costs money or goes online without your OK.')],
      ]} />
      <h3 className="sub">{tr(locale, 'A · Einrichten', 'A · Set up')}</h3>
      <p>{tr(locale, `Kopiere den Prompt, füge ihn bei ${name} im ${terminalName(locale, s.os)}-Fenster ein (nicht in der App) und drücke Enter. Dann einfach mitmachen.`, `Copy the prompt, paste it into ${name} in the ${terminalName(locale, s.os)} window (not the app) and press Enter. Then just follow along.`)}</p>
      <CopyBlock locale={locale} label={tr(locale, 'Prompt: Werkzeuge & Konten', 'Prompt: tools & accounts')} text={setupPrompt(locale, s)} />
      <h3 className="sub">{tr(locale, 'Dazwischen · KI neu starten', 'In between · restart your AI')}</h3>
      <p>{tr(locale, `Wenn A fertig ist, wurden neue Programme installiert. Starte ${name} deshalb einmal neu, bevor du prüfst:`, `When A is done, new programs have been installed. So restart ${name} once before you check:`)}</p>
      <RestartSession locale={locale} s={s} open />
      <h3 className="sub">{tr(locale, 'B · Prüfen', 'B · Check')}</h3>
      <p>{tr(locale, 'Wenn A fertig ist: Dieser Prompt prüft, ob wirklich alles bereit ist. Er ändert nichts.', 'When A is done: this prompt checks that everything is really ready. It doesn’t change anything.')}</p>
      <CopyBlock locale={locale} label={tr(locale, 'Prompt: Alles bereit?', 'Prompt: all set?')} text={checkPrompt(locale, s)} />
      <p className="ready-line">{tr(locale, 'Fertig, wenn überall ✅ steht.', 'You’re done when everything shows ✅.')}</p>
    </>
  );
}

function BuildStep({ locale, s }: { locale: Locale; s: Answered }) {
  return (
    <>
      <PromptIntro>{tr(locale, 'Jetzt kommt der schöne Teil. Deine KI stellt dir ein paar Fragen zu deinem Business und baut dann die Website.', 'Now for the fun part. Your AI asks you a few questions about your business and then builds the website.')}</PromptIntro>
      <Tip>{tr(locale, 'Leg dir bereit: Logo, ein paar Fotos, Kontaktdaten, Öffnungszeiten. Antworte so, wie du es einer Freundin erzählen würdest.', 'Have ready: logo, a few photos, contact details, opening hours. Answer the way you’d tell a friend.')}</Tip>
      <WhatHappens locale={locale} items={[
        ['ai', tr(locale, 'Die KI stellt dir Fragen – immer nur ein, zwei auf einmal, mit Beispielen.', 'The AI asks you questions – just one or two at a time, with examples.')],
        ['you', tr(locale, 'Du antwortest in ganz normalen Worten und legst Logo und Fotos in den Ordner, den sie dir öffnet.', 'You answer in everyday words and drop your logo and photos into the folder it opens for you.')],
        ['ai', tr(locale, 'Sie fasst alles zusammen, wartet auf dein OK und baut dann die ganze Website. Das dauert ein paar Minuten.', 'It sums everything up, waits for your OK and then builds the whole website. That takes a few minutes.')],
        ['check', tr(locale, 'Zum Schluss sagt sie dir, was fertig ist und welche Angaben noch fehlen.', 'At the end it tells you what’s done and which details are still missing.')],
      ]} />
      <CopyBlock locale={locale} label={tr(locale, 'Prompt: Website erstellen', 'Prompt: create website')} text={buildPrompt(locale, s)} />
      <p className="ready-line">{tr(locale, 'Fertig, wenn die KI dir sagt, was sie gebaut hat.', 'You’re done when the AI tells you what it built.')}</p>
    </>
  );
}

function PreviewStep({ locale, s }: { locale: Locale; s: Answered }) {
  return (
    <>
      <PromptIntro>{tr(locale, 'Das startet deine Website auf deinem Computer. Nur du siehst sie – zum Prüfen, ob alles stimmt.', 'This starts your website on your computer. Only you can see it – it’s for checking that everything is right.')}</PromptIntro>
      <WhatHappens locale={locale} items={[
        ['ai', tr(locale, 'Dein Browser öffnet sich mit deiner neuen Website.', 'Your browser opens with your new website.')],
        ['you', tr(locale, 'Du klickst dich durch und sagst der KI, was dir nicht gefällt.', 'You click around and tell the AI what you don’t like.')],
        ['back', tr(locale, 'Die KI ändert es, du lädst die Seite neu – so lange, bis alles passt.', 'The AI changes it, you reload the page – until everything is right.')],
      ]} />
      <CopyBlock locale={locale} label={tr(locale, 'Prompt: Website anschauen', 'Prompt: preview website')} text={previewPrompt(locale, s)} />
      <Tip>{tr(locale, 'Gefällt dir etwas nicht? Sag es der KI einfach, z. B. „Mach die Überschrift größer“ oder „Andere Farbe, eher grün“.', 'Something you don’t like? Just tell the AI, e.g. “Make the heading bigger” or “Different color, more green”.')}</Tip>
      <p className="ready-line">{tr(locale, 'Fertig, wenn dir die Website gefällt.', 'You’re done when you like your website.')}</p>
    </>
  );
}

/** Later, on a new computer: AI first (step 1), then one prompt that brings the website back from GitHub. */
function NewComputer({ locale, s, onGo }: { locale: Locale; s: Answered; onGo?: (id: StepId) => void }) {
  const name = agentName(s.agent);
  return (
    <section className="new-computer" id="new-computer" aria-labelledby="new-computer-title">
      <p className="step-count">{tr(locale, 'Für später', 'For later')}</p>
      <h3 id="new-computer-title">💻 {tr(locale, 'Neuer Computer? So arbeitest du weiter an deiner Website', 'New computer? How to keep working on your website')}</h3>
      <p>{tr(locale, 'Deine Website ist sicher auf GitHub gespeichert. Auf einem neuen Computer holst du sie in drei Schritten zurück:', 'Your website is safely stored on GitHub. On a new computer you get it back in three steps:')}</p>
      <Numbered items={[
        <>{tr(locale, `Richte ${name} neu ein: Mach `, `Set up ${name} again: do `)}<button type="button" className="text-button" onClick={() => onGo?.('agent')}>{tr(locale, 'Schritt 1 dieser Anleitung', 'step 1 of this guide')}</button>{tr(locale, ' auf dem neuen Computer (inklusive Browser-Test).', ' on the new computer (including the browser test).')}<span className="muted">{tr(locale, 'Ist der neue Computer ein anderer Typ (z. B. Windows statt Mac) oder nimmst du eine andere KI? Ändere zuerst die Antworten unter „Start“ – die Befehle passen sich an.', 'Is the new computer a different type (e.g. Windows instead of Mac), or are you using a different AI? Change your answers under “Start” first – the commands adapt.')}</span></>,
        <>{tr(locale, `Kopiere diesen Prompt und füge ihn bei ${name} ein. Die KI installiert die Werkzeuge, meldet dich bei GitHub und Cloudflare an und holt deine Website auf den Computer – ohne etwas zu ändern.`, `Copy this prompt and paste it into ${name}. The AI installs the tools, signs you in to GitHub and Cloudflare and brings your website onto the computer – without changing anything.`)}<CopyBlock locale={locale} label={tr(locale, 'Prompt: Neuer Computer', 'Prompt: new computer')} text={newComputerPrompt(locale, s)} /></>,
        <>{tr(locale, `Wenn die KI es sagt, starte ${name} einmal neu:`, `When the AI says so, restart ${name} once:`)}<RestartSession locale={locale} s={s} /></>,
      ]} />
      <p className="ready-line">{tr(locale, 'Danach wie gewohnt: Sag der KI, was du ändern möchtest, schau es dir an und sag „Veröffentliche meine Änderungen“.', 'Then as usual: tell the AI what you’d like to change, have a look and say “publish my changes”.')}</p>
    </section>
  );
}

function LaunchStep({ locale, s, onGo }: { locale: Locale; s: Answered; onGo?: (id: StepId) => void }) {
  const domain = s.domain === 'have'
    ? tr(locale, 'und verbindet deine Domain (deine E-Mails laufen dabei weiter)', 'and connects your domain (your email keeps working)')
    : s.domain === 'want' ? tr(locale, 'und hilft dir beim Kauf deiner Domain', 'and helps you buy your domain')
      : tr(locale, 'unter einer kostenlosen Adresse', 'at a free address');
  return (
    <>
      <PromptIntro>{tr(locale, `Der letzte Prompt prüft noch einmal alles, stellt deine Website online ${domain}.`, `The last prompt checks everything once more and puts your website online ${domain}.`)}</PromptIntro>
      {s.domain === 'have' ? <OldWebsiteWarning locale={locale} /> : null}
      <WhatHappens locale={locale} items={[
        ['ai', tr(locale, 'Die KI prüft zuerst alles und zeigt dir eine ✅/❌-Liste.', 'The AI checks everything first and shows you a ✅/❌ list.')],
        ['ai', tr(locale, 'Sie speichert eine Sicherung bei GitHub und bereitet das Hosting bei Cloudflare vor – per Browser-Automatisierung, wo es geht.', 'It saves a backup on GitHub and prepares the hosting on Cloudflare – using browser automation where it can.')],
        ['you', s.domain === 'have'
          ? tr(locale, 'Du sagst „Ja“, bevor die Website öffentlich wird. Bei deinem Domain-Anbieter meldest du dich selbst an – die KI zeigt dir genau, was du dort umstellst.', 'You say “yes” before the website goes public. You sign in to your domain provider yourself – the AI shows you exactly what to change there.')
          : s.domain === 'want'
            ? tr(locale, 'Du sagst „Ja“, bevor die Website öffentlich wird. Den Domain-Kauf bestätigst und bezahlst du selbst – die KI sagt dir vorher den Preis.', 'You say “yes” before the website goes public. You confirm and pay for the domain yourself – the AI tells you the price first.')
            : tr(locale, 'Du sagst „Ja“, bevor die Website öffentlich wird.', 'You say “yes” before the website goes public.')],
        ['check', tr(locale, 'Die KI testet die Live-Website und schreibt dir deine Übersichtsdatei.', 'The AI tests the live website and writes your overview file.')],
      ]} />
      <CopyBlock locale={locale} label={tr(locale, 'Prompt: Online stellen', 'Prompt: go live')} text={launchPrompt(locale, s)} />
      <div className="handbook">
        <strong>{tr(locale, `Am Ende bekommst du die Datei ${handbookFile(locale)} mit:`, `At the end you get the file ${handbookFile(locale)} with:`)}</strong>
        <ul>
          <li>{tr(locale, 'deiner Website-Adresse', 'your website address')}</li>
          <li>{tr(locale, 'allen Konten, die du jetzt hast – und was sie kosten', 'every account you now have – and what they cost')}</li>
          <li>{tr(locale, 'wie du später etwas änderst', 'how to change things later')}</li>
          <li>{tr(locale, 'wie du alles wieder loswirst', 'how to get rid of everything again')}</li>
        </ul>
      </div>
      <NewComputer locale={locale} s={s} onGo={onGo} />
    </>
  );
}

/* ---------- the page ---------- */

function loadSaved(): SavedGuide {
  try { const raw = window.localStorage.getItem(STORAGE_KEY); return raw ? parseSaved(JSON.parse(raw)) : initialGuide(); } catch { return initialGuide(); }
}

export function Guide({ locale }: { locale: Locale }) {
  const [state, setState] = useState<SavedGuide>(initialGuide);
  const [loaded, setLoaded] = useState(false);
  const [finished, setFinished] = useState(false);
  const section = useRef<HTMLElement>(null);

  /** After switching steps, bring the step bar + card into view (not the page top). */
  function scrollToSection() {
    const el = section.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: reduce ? 'auto' : 'smooth' });
  }

  useEffect(() => { setState(loadSaved()); setLoaded(true); }, []);
  useEffect(() => { if (loaded) { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* private mode: progress just isn't kept */ } } }, [state, loaded]);

  const s = state.situation;
  const ready = isAnswered(s);
  const index = steps.indexOf(state.step);

  function go(step: StepId, markDone = false) {
    setState(prev => ({ ...prev, step, done: markDone && !prev.done.includes(prev.step) ? [...prev.done, prev.step] : prev.done }));
    setFinished(false);
    scrollToSection();
  }
  function finish() {
    setState(prev => ({ ...prev, done: prev.done.includes('launch') ? prev.done : [...prev.done, 'launch'] }));
    setFinished(true);
    scrollToSection();
  }
  function reset() {
    if (!window.confirm(tr(locale, 'Alle Auswahlen auf dieser Seite zurücksetzen? (Auf deinem Computer wird nichts gelöscht.)', 'Reset all choices on this page? (Nothing on your computer is deleted.)'))) return;
    setState(initialGuide());
    setFinished(false);
  }

  const meta = stepMeta(locale, state.step);
  const next = steps[index + 1];

  return (
    <main id="main" className="guide page-width">
      <div className="guide-top">
        <p className="eyebrow">{tr(locale, 'Deine eigene Website · 6 Schritte', 'Your own website · 6 steps')}</p>
        <h1>{tr(locale, 'Kopieren. Einfügen.', 'Copy. Paste.')} <span>{tr(locale, 'Fertig.', 'Done.')}</span></h1>
        <p className="guide-intro">{tr(locale, 'Du musst nichts von Technik verstehen. Bei jedem Schritt kopierst du einen Text und gibst ihn deiner KI. Sie erledigt den Rest und erklärt dir unterwegs alles.', 'You don’t need to understand anything technical. At each step you copy a text and give it to your AI. It does the rest and explains everything along the way.')}</p>
        <YouWillHave locale={locale} items={websiteOutcomes(locale, s)} />
        <div className="pitch-row"><CostPitch locale={locale} /><FitNote locale={locale} /></div>
      </div>

      <nav ref={section} className="stepper" aria-label={tr(locale, 'Schritte', 'Steps')}>
        <ol>
          {steps.map((id, i) => {
            const enabled = id === 'start' || ready;
            const current = id === state.step && !finished;
            const done = state.done.includes(id);
            return (
              <li key={id}>
                <button type="button" disabled={!enabled} aria-current={current ? 'step' : undefined} className={`${current ? 'current' : ''} ${done ? 'done' : ''}`} onClick={() => go(id)}>
                  <span className="step-dot" aria-hidden="true">{done ? '✓' : i}</span>
                  <span className="step-label">{stepMeta(locale, id).short}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {finished ? (
        <section className="step-card finished" aria-live="polite">
          <p className="step-count">🎉</p>
          <h2>{tr(locale, 'Du hast es geschafft.', 'You did it.')}</h2>
          <p className="lead">{tr(locale, `Deine Website ist online. Alles Wichtige steht in ${handbookFile(locale)} in deinem Ordner „my-website“.`, `Your website is online. Everything important is in ${handbookFile(locale)} in your “my-website” folder.`)}</p>
          {ready ? <p>{tr(locale, 'Etwas ändern? Öffne dein Terminal, füge den Start-Befehl ein und sag der KI, was anders sein soll. Danach: „Veröffentliche meine Änderungen“.', 'Want to change something? Open your terminal, paste the start command and tell the AI what should change. Then: “publish my changes”.')}</p> : null}
          {ready ? <CopyBlock locale={locale} kind="command" label={tr(locale, 'Start-Befehl', 'Start command')} text={startCommand(s.os, s.agent)} /> : null}
          <div className="next-guide">
            <strong>{tr(locale, '🔎 Nächster Schritt: bei Google gefunden werden', '🔎 Next step: get found on Google')}</strong>
            <p>{tr(locale, 'Melde deine Website bei Google an und mach sie fit für die Suche – wieder mit fertigen Prompts, kostenlos.', 'Register your website with Google and get it ready for search – again with ready-made prompts, for free.')}</p>
            <Link className="button primary" href={seoGuidePath(locale)}>{tr(locale, 'Zur Anleitung „Google & SEO“', 'Open the “Google & SEO” guide')}</Link>
          </div>
          {ready ? <p>{tr(locale, 'Neuer Computer? ', 'New computer? ')}<button type="button" className="text-button" onClick={() => go('launch')}>{tr(locale, 'Hier ist der Prompt, mit dem du weiterarbeitest.', 'Here’s the prompt to keep working.')}</button></p> : null}
          <div className="step-actions"><button type="button" className="button secondary" onClick={() => go('launch')}>{tr(locale, '← Zurück zum letzten Schritt', '← Back to the last step')}</button></div>
        </section>
      ) : (
        <section className="step-card" aria-labelledby="step-title">
          <p className="step-count">{state.step === 'start' ? tr(locale, 'Bevor es losgeht', 'Before we start') : tr(locale, `Schritt ${index} von 5`, `Step ${index} of 5`)}</p>
          <h2 id="step-title">{meta.title}</h2>
          {!loaded ? null : state.step === 'start' ? (
            <>
              <p className="lead">{tr(locale, 'Vier kurze Fragen, damit alles genau zu dir passt.', 'Four quick questions so everything fits you exactly.')}</p>
              <StartStep locale={locale} situation={s} onChange={situation => setState(prev => ({ ...prev, situation }))} />
            </>
          ) : !ready ? null : state.step === 'agent' ? <AgentStep locale={locale} s={s} />
            : state.step === 'accounts' ? <AccountsStep locale={locale} s={s} />
              : state.step === 'build' ? <BuildStep locale={locale} s={s} />
                : state.step === 'preview' ? <PreviewStep locale={locale} s={s} />
                  : <LaunchStep locale={locale} s={s} onGo={id => go(id)} />}

          <div className="step-actions">
            {index > 0 ? <button type="button" className="button secondary" onClick={() => go(steps[index - 1])}>{tr(locale, '← Zurück', '← Back')}</button> : <span />}
            {next
              ? <button type="button" className="button primary" disabled={!ready} onClick={() => go(next, true)}>{state.step === 'start' ? tr(locale, 'Los geht’s →', 'Let’s go →') : tr(locale, 'Erledigt, weiter →', 'Done, next →')}</button>
              : <button type="button" className="button primary" onClick={finish}>{tr(locale, 'Meine Website ist online 🎉', 'My website is live 🎉')}</button>}
          </div>
        </section>
      )}

      <p className="guide-foot">
        {tr(locale, 'Deine Auswahl bleibt nur in diesem Browser. Diese Seite sieht nichts von deinem Computer und deinen Konten. ', 'Your choices stay in this browser only. This page can’t see your computer or your accounts. ')}
        <button type="button" className="text-button" onClick={reset}>{tr(locale, 'Neu anfangen', 'Start over')}</button>
      </p>
    </main>
  );
}
