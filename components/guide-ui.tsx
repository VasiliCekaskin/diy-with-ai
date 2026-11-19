'use client';

/* Building blocks shared by every guide: copy boxes, tips, "what happens", restarting the AI, and step 1 (set up the AI). */

import { useRef, useState } from 'react';
import {
  FOLDER, agentName, browserTestPrompt, codexBrowserPrompt, freshTerminalSteps, installCommand, modelAdvice, officialLinks,
  openTerminalSteps, restartOptions, startCommand, terminalName, versionCommand,
} from '@/lib/guide';
import { tr } from '@/lib/i18n';
import type { AgentSetup, Locale } from '@/lib/types';

/* ---------- small building blocks ---------- */

export function CopyBlock({ locale, text, label, kind = 'prompt' }: { locale: Locale; text: string; label: string; kind?: 'prompt' | 'command' }) {
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');
  const ref = useRef<HTMLPreElement>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied('ok');
    } catch {
      const range = document.createRange();
      if (ref.current) { range.selectNodeContents(ref.current); const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range); }
      setCopied('fail');
    }
    window.setTimeout(() => setCopied('idle'), 2500);
  }
  return (
    <div className={`copy-block ${kind}`}>
      <div className="copy-head">
        <span>{label}</span>
        <button type="button" className={`button ${kind === 'prompt' ? 'primary' : 'secondary'} copy-button`} onClick={copy} aria-live="polite">
          {copied === 'ok' ? tr(locale, '✓ Kopiert', '✓ Copied') : copied === 'fail' ? tr(locale, 'Markiert – jetzt ⌘/Strg + C', 'Selected – now press ⌘/Ctrl + C') : kind === 'prompt' ? tr(locale, 'Prompt kopieren', 'Copy prompt') : tr(locale, 'Kopieren', 'Copy')}
        </button>
      </div>
      <pre ref={ref} tabIndex={0}>{text}</pre>
    </div>
  );
}

export function Numbered({ items }: { items: React.ReactNode[] }) {
  return <ol className="do-list">{items.map((item, i) => <li key={i}><span className="do-num" aria-hidden="true">{i + 1}</span><div>{item}</div></li>)}</ol>;
}

/** Renders **bold** segments from plain copy strings. */
export function Bold({ text }: { text: string }) {
  return <span>{text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}</span>;
}

export function Tip({ children }: { children: React.ReactNode }) {
  return <p className="tip"><span aria-hidden="true">💡</span><span>{children}</span></p>;
}

export type Who = 'ai' | 'you' | 'back' | 'calm' | 'check';
const whoIcon: Record<Who, string> = { ai: '🤖', you: '🙋', back: '↩️', calm: '😌', check: '✅' };

/** "Ah okay, that's what will happen" — a short preview of what pasting the prompt sets in motion. */
export function WhatHappens({ locale, items }: { locale: Locale; items: [Who, string][] }) {
  return (
    <div className="what-happens">
      <strong>{tr(locale, 'Was passiert, wenn du den Prompt einfügst?', 'What happens when you paste the prompt?')}</strong>
      <ul>{items.map(([who, text], i) => <li key={i}><span aria-hidden="true">{whoIcon[who]}</span><span>{text}</span></li>)}</ul>
    </div>
  );
}

export function OldWebsiteWarning({ locale }: { locale: Locale }) {
  return (
    <div className="warning-box" role="note">
      <strong>{tr(locale, '⚠️ Du hast schon eine Website? Lies das zuerst.', '⚠️ Already have a website? Read this first.')}</strong>
      <p>{tr(locale,
        'Wenn deine neue Website auf deiner Domain online geht, ersetzt sie die alte. Deine KI weiß nicht, wie deine alte Website gebaut wurde oder wo sie liegt – deshalb gibt es danach keinen einfachen Weg für sie, zu deiner alten Website zurückzukehren.',
        'When your new website goes live on your domain, it replaces the old one. Your AI doesn’t know how your old website was built or where it lives – so afterwards there’s no easy way for it to get you back to your old website.')}</p>
      <p>{tr(locale,
        'Kläre deshalb vorher selbst, wie du zurückkommst: Frag z. B. die Person oder Firma, die deine alte Website gemacht hat, oder deinen jetzigen Anbieter, ob die alte Website gespeichert bleibt und wie man zurückwechselt. Deine KI notiert dir die alten Domain-Einstellungen – die alte Website selbst kann sie aber nicht zurückholen.',
        'So make sure yourself beforehand that you know how to get back: for example, ask the person or company who made your old website, or your current provider, whether the old website stays saved and how to switch back. Your AI will write down your old domain settings for you – but it can’t bring the old website itself back.')}</p>
    </div>
  );
}

/** "Restart your AI": needed after installing tools so the new programs are found. Resume keeps the conversation. */
export function RestartSession({ locale, s, open = false, folder = FOLDER }: { locale: Locale; s: AgentSetup; open?: boolean; folder?: string }) {
  const name = agentName(s.agent);
  const resume = <CopyBlock locale={locale} kind="command" label={tr(locale, `${name} fortsetzen`, `Resume ${name}`)} text={startCommand(s.os, s.agent, true, folder)} />;
  return (
    <details className="restart" open={open}>
      <summary>🔄 {tr(locale, 'KI neu starten – so geht’s', 'Restart your AI – here’s how')}</summary>
      <p>{tr(locale,
        `Wenn neue Programme auf deinem Computer installiert wurden, solltest du ${name} einmal neu starten. Erst dann findet es die neuen Programme zuverlässig. Wähle eine Variante:`,
        `When new programs were installed on your computer, you should restart ${name} once. Only then does it reliably find the new programs. Pick one option:`)}</p>
      <div className="restart-options">
        {restartOptions(locale, s.os, s.agent).map(option => (
          <div key={option.title} className="restart-option">
            <strong>{option.title}</strong>
            <ol>
              {option.steps.map((step, i) => <li key={i}>{step}{i === option.steps.length - 1 ? resume : null}</li>)}
            </ol>
          </div>
        ))}
      </div>
    </details>
  );
}

/* ---------- step 1: AI agent ---------- */

/** Step 1 of every guide: AI in the terminal, browser access, a strong model. `folder` is where the AI works. */
export function AgentStep({ locale, s, folder = FOLDER }: { locale: Locale; s: AgentSetup; folder?: string }) {
  const name = agentName(s.agent);
  const term = terminalName(locale, s.os);
  const start = <CopyBlock locale={locale} kind="command" label={tr(locale, `In ${term} einfügen und Enter drücken`, `Paste into ${term} and press Enter`)} text={startCommand(s.os, s.agent, false, folder)} />;
  const model = modelAdvice(locale, s.agent);
  const modelItem = (
    <>
      <strong>{tr(locale, 'Wähle ein starkes Modell, damit alles rund läuft:', 'Pick a strong model so everything runs smoothly:')}</strong>{' '}
      {tr(locale, 'Tippe ', 'Type ')}<code>/model</code>{tr(locale, ' ins Fenster und drücke Enter.', ' into the window and press Enter.')}
      <ul className="model-list">
        <li className="model-yes"><span aria-hidden="true">✓</span><Bold text={model.pick} /></li>
        <li className="model-no"><span aria-hidden="true">✗</span><Bold text={model.avoid} /></li>
      </ul>
      <span className="muted">{tr(locale, 'Das musst du nur einmal machen.', 'You only need to do this once.')}</span>
    </>
  );
  const check = (
    <CopyBlock locale={locale} kind="command" label={tr(locale, `Prüfen: in ${term} einfügen und Enter drücken`, `Check: paste into ${term} and press Enter`)} text={versionCommand(s.agent)} />
  );
  const notFound = s.os === 'mac' ? '„command not found“' : '„… wurde nicht als Name eines Cmdlet … erkannt“';
  const notFoundEn = s.os === 'mac' ? '“command not found”' : '“… is not recognized as the name of a cmdlet …”';
  const install = <CopyBlock locale={locale} kind="command" label={tr(locale, `${name} installieren`, `Install ${name}`)} text={installCommand(s.os, s.agent)} />;
  const paste = s.os === 'mac' ? '⌘ + V' : tr(locale, 'Strg + V oder Rechtsklick', 'Ctrl + V or right-click');
  const signIn = s.agent === 'claude'
    ? tr(locale, 'Beim ersten Start beantwortest du ein paar Fragen. Bei der Anmeldung wählst du dein Claude-Konto – dein Browser öffnet sich, dort bestätigst du.', 'The first time, answer a few questions on screen. When asked how to sign in, pick your Claude account – your browser opens and you confirm there.')
    : tr(locale, 'Beim ersten Start wählst du „Sign in with ChatGPT“ – dein Browser öffnet sich, dort meldest du dich an.', 'The first time, choose “Sign in with ChatGPT” – your browser opens and you sign in there.');
  const planNote = s.agent === 'claude'
    ? <>{tr(locale, 'Du brauchst ein bezahltes Claude-Abo (Pro oder höher). ', 'You need a paid Claude plan (Pro or higher). ')}<a href={officialLinks.claudePricing} target="_blank" rel="noreferrer">{tr(locale, 'Abo abschließen', 'Get a plan')}</a></>
    : <>{tr(locale, 'Du brauchst ein ChatGPT-Konto mit einem Abo, das Codex enthält. ', 'You need a ChatGPT account with a plan that includes Codex. ')}<a href={officialLinks.chatgptPricing} target="_blank" rel="noreferrer">{tr(locale, 'Abos ansehen', 'See plans')}</a></>;
  const openTerm = <>{tr(locale, `Öffne ${term}. `, `Open ${term}. `)}{openTerminalSteps(locale, s.os)}<span className="muted"> {tr(locale, 'Ein Fenster mit Text erscheint. Keine Sorge – du musst hier nur einfügen.', 'A window with text appears. Don’t worry – you only paste things here.')}</span></>;

  // "Yes" and "Not sure" both start with a check: an installed app (Claude Desktop, ChatGPT) does not put the CLI on the PATH.
  const browserTest = <CopyBlock locale={locale} label={tr(locale, 'Prompt: Browser-Test', 'Prompt: browser test')} text={browserTestPrompt(locale)} />;
  const testExpect = tr(locale, 'Ein Chrome-Fenster öffnet sich mit einer schlichten Seite, und die KI antwortet „Example Domain“. Dann ist alles bereit.', 'A Chrome window opens with a plain page, and the AI answers “Example Domain”. Then everything is ready.');
  const browserItem = (
    <>
      <strong>{tr(locale, 'Verbinde deinen Browser, damit die KI später die Klickarbeit für dich machen kann:', 'Connect your browser so the AI can do the clicking for you later:')}</strong>
      {s.agent === 'claude' ? (
        <ol className="sub-steps">
          <li>{tr(locale, 'Du brauchst Google Chrome (oder Microsoft Edge). Noch nicht da? ', 'You need Google Chrome (or Microsoft Edge). Don’t have it? ')}<a href={officialLinks.chrome} target="_blank" rel="noreferrer">{tr(locale, 'Chrome herunterladen', 'Download Chrome')}</a></li>
          <li>{tr(locale, 'Öffne in Chrome die Erweiterung ', 'In Chrome, open the extension ')}<a href={officialLinks.claudeChromeExtension} target="_blank" rel="noreferrer">Claude in Chrome ↗</a>{tr(locale, ', klick auf „Zu Chrome hinzufügen“ und melde dich darin mit deinem Claude-Konto an.', ', click “Add to Chrome” and sign in to it with your Claude account.')}</li>
          <li>{tr(locale, 'Zurück im Terminal: Tippe ', 'Back in the terminal: type ')}<code>/chrome</code>{tr(locale, ', drück Enter und wähle „Enabled by default“ (standardmäßig an).', ', press Enter and choose “Enabled by default”.')}</li>
          <li>{tr(locale, 'Teste es – kopiere diesen Prompt und füge ihn bei Claude Code ein:', 'Test it – copy this prompt and paste it into Claude Code:')}{browserTest}<span className="muted">{testExpect}</span></li>
        </ol>
      ) : (
        <ol className="sub-steps">
          <li>{tr(locale, 'Kopiere diesen Prompt und füge ihn bei Codex ein. Codex installiert, was der Browser braucht.', 'Copy this prompt and paste it into Codex. Codex installs what the browser needs.')}<CopyBlock locale={locale} label={tr(locale, 'Prompt: Browser einrichten', 'Prompt: set up browser')} text={codexBrowserPrompt(locale, s)} /></li>
          <li>{tr(locale, 'Wenn Codex „Fertig! … neu starten“ sagt, starte Codex einmal neu:', 'When Codex says “Done! … restart”, restart Codex once:')}<RestartSession locale={locale} s={s} open folder={folder} /></li>
          <li>{tr(locale, 'Teste es – kopiere diesen Prompt und füge ihn bei Codex ein:', 'Test it – copy this prompt and paste it into Codex:')}{browserTest}<span className="muted">{testExpect} {tr(locale, 'Das ist ein eigenes Chrome-Fenster, das Codex steuert – dort meldest du dich später an, wenn die KI dich darum bittet.', 'It’s a separate Chrome window that Codex controls – that’s where you sign in later when the AI asks you to.')}</span></li>
        </ol>
      )}
    </>
  );
  const items: React.ReactNode[] = s.installed !== 'no'
    ? [
      openTerm,
      <>{tr(locale, `Kurz prüfen, ob ${name} im Terminal wirklich da ist. Füge das ein (${paste}) und drücke Enter:`, `Quickly check that ${name} is really there in the terminal. Paste this (${paste}) and press Enter:`)}{check}
        <ul className="model-list">
          <li className="model-yes"><span aria-hidden="true">✓</span><span>{tr(locale, 'Eine Versionsnummer erscheint (eine Zahl mit Punkten)? Super, weiter mit dem nächsten Punkt.', 'A version number appears (a number with dots)? Great, go on to the next point.')}</span></li>
          <li className="model-no"><span aria-hidden="true">✗</span><span>{tr(locale, `Da steht ${notFound}? Dann hast du nur die App. Füge das hier ein, drücke Enter und warte, bis es fertig ist. Danach: ${freshTerminalSteps(locale, s.os)}`, `It says ${notFoundEn}? Then you only have the app. Paste this, press Enter and wait until it’s finished. Then: ${freshTerminalSteps(locale, s.os)}`)}</span></li>
        </ul>
        {install}
      </>,
      <>{tr(locale, `Dieser Befehl legt deinen Arbeitsordner „${folder}“ an und startet ${name} darin:`, `This command creates your working folder “${folder}” and starts ${name} in it:`)}{start}<span className="muted">{signIn}</span></>,
      browserItem,
      modelItem,
    ]
    : [
      planNote,
      openTerm,
      <>{tr(locale, `Kopiere diesen Befehl, füge ihn ins Fenster ein (${paste}) und drücke Enter. Warte, bis es fertig ist.`, `Copy this command, paste it into the window (${paste}) and press Enter. Wait until it’s finished.`)}{install}</>,
      <>{tr(locale, `${freshTerminalSteps(locale, s.os)} Prüfe dann, ob es geklappt hat – es sollte eine Versionsnummer erscheinen:`, `${freshTerminalSteps(locale, s.os)} Then check that it worked – a version number should appear:`)}{check}</>,
      <>{tr(locale, `Dieser Befehl legt deinen Arbeitsordner „${folder}“ an und startet ${name}:`, `This command creates your working folder “${folder}” and starts ${name}:`)}{start}<span className="muted">{signIn}</span></>,
      browserItem,
      modelItem,
    ];
  return (
    <>
      <p className="lead">{s.installed === 'no'
        ? tr(locale, `Wir installieren ${name}. Das dauert etwa 5 Minuten.`, `Let’s install ${name}. It takes about 5 minutes.`)
        : tr(locale, `Wir prüfen kurz, ob ${name} im Terminal bereit ist, und starten es dann in einem eigenen Ordner.`, `We quickly check that ${name} is ready in the terminal, then start it in its own folder.`)}</p>
      <Tip>{tr(locale, `Alle Prompts dieser Anleitung fügst du in ${name} im ${term}-Fenster ein – nicht in die Claude-App, die ChatGPT-App oder die Website. Nur dort kann deine KI Programme installieren und für dich arbeiten.`, `You paste every prompt in this guide into ${name} in the ${term} window – not into the Claude app, the ChatGPT app or the website. Only there can your AI install programs and work for you.`)}</Tip>
      <Numbered items={items} />
      <Tip>{tr(locale, `${name} fragt manchmal um Erlaubnis, bevor es etwas tut. Lies kurz, was dasteht, und erlaube es, wenn es zu deinem Auftrag passt.`, `${name} sometimes asks for permission before doing something. Read it briefly and allow it if it fits what you asked for.`)}</Tip>
      <Tip>{tr(locale, `Später wiederkommen? Einfach ${term} öffnen und denselben Start-Befehl einfügen.`, `Coming back later? Just open ${term} and paste the same start command.`)}</Tip>
      <RestartSession locale={locale} s={s} folder={folder} />
      <details className="help">
        <summary>{tr(locale, 'Klappt nicht?', 'Not working?')}</summary>
        {s.agent === 'claude' && s.os === 'mac'
          ? <><p>{tr(locale, 'Steht da „command not found: claude“? Füge das ein, drücke Enter und versuche den Start-Befehl erneut:', 'Does it say “command not found: claude”? Paste this, press Enter and try the start command again:')}</p><CopyBlock locale={locale} kind="command" label="Terminal" text={'echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc'} /></>
          : <p>{tr(locale, `${freshTerminalSteps(locale, s.os)} Versuche dort den Start-Befehl noch einmal. Viele Probleme sind damit gelöst.`, `${freshTerminalSteps(locale, s.os)} Try the start command there once more. That fixes most problems.`)}</p>}
        <p><strong>{tr(locale, 'Browser-Test klappt nicht?', 'Browser test not working?')}</strong>{' '}{s.agent === 'claude'
          ? tr(locale, 'Prüfe, ob Chrome offen ist und die Erweiterung unter chrome://extensions eingeschaltet ist. Tippe dann /chrome und wähle „Reconnect extension“. Hilft das nicht: Chrome und Claude Code einmal komplett schließen und neu starten.', 'Check that Chrome is open and the extension is switched on at chrome://extensions. Then type /chrome and choose “Reconnect extension”. If that doesn’t help: fully close Chrome and Claude Code once and start them again.')
          : tr(locale, 'Hast du Codex nach dem Einrichten neu gestartet (Punkt 2)? Sag Codex sonst: „Prüfe mit codex mcp list, ob chrome-devtools eingetragen ist, und repariere es.“ Danach noch einmal neu starten.', 'Did you restart Codex after the setup (point 2)? Otherwise tell Codex: “Check with codex mcp list whether chrome-devtools is registered and fix it.” Then restart once more.')}{' '}
          <a href={s.agent === 'claude' ? officialLinks.claudeChromeDocs : officialLinks.chromeDevtoolsMcp} target="_blank" rel="noreferrer">{tr(locale, 'Offizielle Hilfe', 'Official help')} ↗</a></p>
        <p>{tr(locale, 'Sonst hilft die offizielle Anleitung: ', 'Otherwise the official guide helps: ')}<a href={s.agent === 'claude' ? officialLinks.claudeSetup : officialLinks.codexSetup} target="_blank" rel="noreferrer">{tr(locale, `${name} einrichten`, `Set up ${name}`)} ↗</a></p>
      </details>
      <p className="ready-line">{tr(locale, `Fertig, wenn ${name} im ${term}-Fenster läuft und der Browser-Test „Example Domain“ gezeigt hat.`, `You’re done when ${name} is running in the ${term} window and the browser test showed “Example Domain”.`)}</p>
    </>
  );
}

export function PromptIntro({ children }: { children: React.ReactNode }) { return <p className="lead">{children}</p>; }
