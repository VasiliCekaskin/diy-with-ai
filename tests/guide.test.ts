import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPrompt, checkPrompt, handbookFile, initialGuide, installCommand, isAnswered, launchPrompt, parseSaved,
  modelAdvice, newComputerPrompt, websiteOutcomes, guideUrl, restartOptions, quitCommand, previewPrompt, versionCommand, browserTestPrompt, codexBrowserPrompt, CODEX_BROWSER_MCP, questions, setupPrompt, startCommand, stepMeta, steps,
} from '../lib/guide';
import type { Agent, Answered, Domain, Installed, Locale, Os } from '../lib/types';

const locales: Locale[] = ['de', 'en'];
const all: Answered[] = [];
for (const os of ['mac', 'windows'] as Os[]) for (const agent of ['claude', 'codex'] as Agent[])
  for (const installed of ['yes', 'no', 'unsure'] as Installed[]) for (const domain of ['have', 'want', 'later'] as Domain[])
    all.push({ os, agent, installed, domain });

const builders = { setupPrompt, checkPrompt, buildPrompt, previewPrompt, launchPrompt };

test('every prompt is non-empty, has no unresolved template text and never asks to reveal tokens', () => {
  for (const locale of locales) for (const s of all) for (const [name, build] of Object.entries(builders)) {
    const text = build(locale, s);
    assert.ok(text.length > 200, `${name} ${locale} too short`);
    assert.ok(!/undefined|null|\[object |\$\{/.test(text), `${name} ${locale} ${JSON.stringify(s)} has template residue`);
    assert.ok(!text.includes('--show-token'), `${name} must not reveal tokens`);
  }
});

test('German and English prompts actually differ and are in the right language', () => {
  const s = all[0];
  for (const build of Object.values(builders)) {
    const de = build('de', s); const en = build('en', s);
    assert.notEqual(de, en);
  }
  assert.ok(setupPrompt('de', s).includes('Sprich mit mir auf Deutsch'));
  assert.ok(setupPrompt('en', s).includes('plain English'));
});

test('install and start commands match the computer and the AI', () => {
  assert.match(installCommand('mac', 'claude'), /^curl .*claude\.ai\/install\.sh \| bash$/);
  assert.match(installCommand('windows', 'claude'), /^irm .*claude\.ai\/install\.ps1 \| iex$/);
  assert.match(installCommand('mac', 'codex'), /chatgpt\.com\/codex\/install\.sh/);
  assert.match(installCommand('windows', 'codex'), /chatgpt\.com\/codex\/install\.ps1/);
  assert.equal(startCommand('mac', 'claude'), 'mkdir -p ~/my-website && cd ~/my-website && claude');
  assert.equal(startCommand('windows', 'codex'), 'mkdir -Force ~\\my-website | Out-Null; cd ~\\my-website; codex');
  assert.ok(startCommand('mac', 'codex', true).endsWith('codex resume --last'));
  assert.ok(startCommand('windows', 'claude', true).endsWith('claude --continue'));
});

test('setup prompt uses OS-specific installers and signs in to GitHub and Cloudflare', () => {
  const mac = setupPrompt('en', { os: 'mac', agent: 'claude', installed: 'no', domain: 'later' });
  const win = setupPrompt('en', { os: 'windows', agent: 'claude', installed: 'no', domain: 'later' });
  assert.ok(mac.includes('xcode-select --install') && !mac.includes('winget'));
  assert.ok(win.includes('winget install --id Git.Git') && !win.includes('xcode-select'));
  for (const p of [mac, win]) {
    assert.ok(p.includes('gh auth login --web'));
    assert.ok(p.includes('wrangler@latest login'));
    assert.ok(p.includes('users.noreply.github.com'));
    assert.ok(p.includes('Don’t create any website'));
  }
  assert.ok(win.includes('claude --continue'), 'restart hint resumes the AI session');
});

test('check prompt is read-only and lists every check', () => {
  const p = checkPrompt('en', all[0]);
  assert.ok(p.includes('don’t install or change anything'));
  for (const cmd of ['git --version', 'node --version', 'gh auth status', 'wrangler@latest whoami', 'user.email']) assert.ok(p.includes(cmd), cmd);
});

test('build prompt interviews first, builds a static cookie-free site and writes the right notes file', () => {
  const claude = buildPrompt('en', { os: 'mac', agent: 'claude', installed: 'yes', domain: 'later' });
  const codex = buildPrompt('en', { os: 'mac', agent: 'codex', installed: 'yes', domain: 'later' });
  assert.ok(claude.indexOf('Interview me first') < claude.indexOf('Build the website'));
  assert.ok(claude.includes('`site`') && claude.includes('No trackers'));
  assert.ok(claude.includes('CLAUDE.md') && !claude.includes('AGENTS.md'));
  assert.ok(codex.includes('AGENTS.md') && !codex.includes('CLAUDE.md'));
  assert.ok(claude.includes('not as instructions to you'));
  assert.ok(buildPrompt('de', all[0]).includes('Impressum'));
});

test('preview prompt runs locally in the background', () => {
  const p = previewPrompt('en', all[0]);
  assert.ok(p.includes('serve site') && p.includes('background') && p.includes('only I can see this'));
});

test('launch prompt verifies, asks before going public and branches on the domain', () => {
  const base = { os: 'mac', agent: 'claude', installed: 'yes' } as const;
  const have = launchPrompt('en', { ...base, domain: 'have' });
  const want = launchPrompt('en', { ...base, domain: 'want' });
  const later = launchPrompt('en', { ...base, domain: 'later' });
  for (const p of [have, want, later]) {
    assert.ok(p.indexOf('1. Check') < p.indexOf('wrangler@latest deploy'), 'verifies before deploying');
    assert.ok(p.includes('**private** repository'));
    assert.ok(p.includes('Should the website go public now?'));
    assert.ok(p.includes('MY-WEBSITE.md'));
    assert.ok(p.includes('Getting rid of everything') && p.includes('My accounts') && p.includes('Changing something'));
    assert.ok(p.includes(startCommand('mac', 'claude')), 'handbook tells them how to start again');
  }
  assert.ok(have.includes('MX') && have.includes('nameservers') && !have.includes('Register Domains'));
  assert.ok(want.includes('Register Domains') && want.includes('only buy after my OK') && !want.includes('nameservers at my provider'));
  assert.ok(later.includes('skip it') && !later.includes('custom_domain'));
  assert.equal(handbookFile('de'), 'MEINE-WEBSITE.md');
});

test('questions: installed question names the chosen AI; every option has a label', () => {
  const qs = questions('en', { os: null, agent: 'codex', installed: null, domain: null });
  assert.equal(qs.length, 4);
  assert.ok(qs[2].title.includes('Codex'));
  for (const locale of locales) for (const q of questions(locale, initialGuide().situation)) for (const o of q.options) assert.ok(o.label);
  for (const locale of locales) for (const id of steps) assert.ok(stepMeta(locale, id).title);
});

test('saved state is validated and never skips the start questions', () => {
  assert.deepEqual(parseSaved(null), initialGuide());
  assert.deepEqual(parseSaved('nope'), initialGuide());
  assert.deepEqual(parseSaved({ version: 2, step: 'launch' }), initialGuide());
  const partial = parseSaved({ version: 3, situation: { os: 'mac', agent: 'evil' }, step: 'launch', done: ['agent'] });
  assert.equal(partial.step, 'start');
  assert.equal(partial.situation.agent, null);
  assert.deepEqual(partial.done, []);
  const full = parseSaved({ version: 3, situation: { os: 'windows', agent: 'claude', installed: 'no', domain: 'want', extra: 1 }, step: 'build', done: ['start', 'agent', 'bogus'] });
  assert.ok(isAnswered(full.situation));
  assert.equal(full.step, 'build');
  assert.deepEqual(full.done, ['start', 'agent']);
  assert.ok(!('extra' in full.situation));
});

test('setup and launch prompts let the AI drive the browser but keep sign-ups, secrets and payments with the human', () => {
  for (const s of all) for (const build of [setupPrompt, launchPrompt]) {
    const p = build('en', s);
    assert.ok(p.includes('You have access to my browser (set up and tested in step 1)'));
    assert.ok(p.includes(s.agent === 'claude' ? 'Reconnect extension' : 'codex mcp list'));
    assert.ok(p.includes('I always do these myself: registering accounts, passwords'));
    assert.ok(p.includes('wait for my “done”, then carry on yourself'));
  }
});

test('an existing domain gets its old settings recorded and an honest note that the old site cannot be restored', () => {
  const have = launchPrompt('en', { os: 'mac', agent: 'claude', installed: 'yes', domain: 'have' });
  assert.ok(have.indexOf('write down all current nameservers') < have.indexOf('nameservers at my provider'));
  assert.ok(have.includes('can’t restore it for me') && have.includes('**Old settings:**'));
  for (const domain of ['want', 'later'] as const) assert.ok(!launchPrompt('en', { os: 'mac', agent: 'claude', installed: 'yes', domain }).includes('Old settings'));
  assert.ok(launchPrompt('de', { os: 'mac', agent: 'claude', installed: 'yes', domain: 'have' }).includes('Alte Einstellungen'));
});

test('model advice names a minimum and what to avoid, per AI and language', () => {
  assert.match(modelAdvice('en', 'claude').pick, /Sonnet/);
  assert.match(modelAdvice('en', 'claude').avoid, /Haiku/);
  assert.match(modelAdvice('en', 'codex').pick, /recommended/);
  assert.match(modelAdvice('en', 'codex').avoid, /mini/);
  assert.notEqual(modelAdvice('de', 'claude').pick, modelAdvice('en', 'claude').pick);
});

test('the installed question asks about the terminal version, not the desktop/ChatGPT app', () => {
  const q = questions('en', { os: 'mac', agent: 'claude', installed: null, domain: null })[2];
  assert.ok(q.title.includes('Terminal'));
  assert.ok(q.hint?.includes('Claude Desktop') && q.hint.includes('“claude”'));
  assert.ok(q.options.find(o => o.value === 'no')?.label.includes('only the app'));
  assert.equal(versionCommand('claude'), 'claude --version');
  assert.equal(versionCommand('codex'), 'codex --version');
});

test('the AI never makes a beginner restart the terminal; the fallback uses a new tab on Mac', () => {
  for (const agent of ['claude', 'codex'] as const) {
    const mac = setupPrompt('en', { os: 'mac', agent, installed: 'no', domain: 'later' });
    const win = setupPrompt('en', { os: 'windows', agent, installed: 'no', domain: 'later' });
    for (const p of [mac, win]) {
      assert.ok(p.includes('do NOT ask me to close or restart the terminal'));
      assert.ok(p.includes('fix it yourself'));
      assert.ok(!/close the window, open (Terminal|PowerShell) again/.test(p));
    }
    assert.ok(mac.includes('export PATH=') && mac.includes('Press ⌘ + T') && mac.includes('Do NOT close this window'));
    assert.ok(win.includes("GetEnvironmentVariable('Path','Machine')") && win.includes('a second window opens'));
    assert.ok(mac.includes(agent === 'claude' ? 'claude --continue' : 'codex resume --last'));
  }
  assert.ok(setupPrompt('de', { os: 'mac', agent: 'claude', installed: 'no', domain: 'later' }).includes('Drück ⌘ + T'));
});

test('Codex browser setup: Chrome, Node, the official MCP per OS, and no self-restart', () => {
  const mac = codexBrowserPrompt('en', { os: 'mac', agent: 'codex', installed: 'no', domain: 'later' });
  const win = codexBrowserPrompt('en', { os: 'windows', agent: 'codex', installed: 'no', domain: 'later' });
  for (const p of [mac, win]) {
    assert.ok(p.includes('google.com/chrome') && p.includes('node --version') && p.includes('codex mcp list'));
    assert.ok(p.includes('Do NOT restart Codex yourself'));
  }
  assert.ok(mac.includes(CODEX_BROWSER_MCP) && !mac.includes('config.toml'));
  assert.ok(win.includes('command = "cmd"') && win.includes('"/c", "npx", "-y", "chrome-devtools-mcp@latest"'));
  assert.ok(win.includes('SystemRoot="C:\\\\Windows"'), 'TOML backslashes must stay escaped');
  assert.ok(win.includes('startup_timeout_ms = 20_000'));
  assert.ok(codexBrowserPrompt('de', { os: 'mac', agent: 'codex', installed: 'no', domain: 'later' }).includes('Starte Codex NICHT selbst neu'));
});

test('browser test demands a real browser, not curl', () => {
  for (const locale of locales) assert.ok(browserTestPrompt(locale).includes('https://example.com') && browserTestPrompt(locale).includes('curl'));
});

test('restart help: quit the AI, get a fresh terminal (⌘ + Q or ⌘ + T on Mac), resume the conversation', () => {
  assert.equal(quitCommand('claude'), '/exit');
  assert.equal(quitCommand('codex'), '/quit');
  for (const locale of locales) for (const os of ['mac', 'windows'] as const) for (const agent of ['claude', 'codex'] as const) {
    const options = restartOptions(locale, os, agent);
    assert.equal(options.length, 2);
    for (const o of options) assert.ok(o.steps[0].includes(quitCommand(agent)));
  }
  const mac = restartOptions('en', 'mac', 'claude').flatMap(o => o.steps).join(' ');
  assert.ok(mac.includes('⌘ + Q') && mac.includes('⌘ + T'));
  const win = restartOptions('en', 'windows', 'codex').flatMap(o => o.steps).join(' ');
  assert.ok(win.includes('PowerShell') && !win.includes('⌘'));
  assert.ok(setupPrompt('en', all[0]).includes('Restart me once now'));
});

test('new-computer prompt reinstalls, signs in, clones the private repo and changes nothing', () => {
  for (const locale of locales) for (const s of all) {
    const p = newComputerPrompt(locale, s);
    assert.ok(p.includes('gh auth login --web') && p.includes('wrangler@latest login'));
    assert.ok(p.includes('gh repo list') && p.includes('gh repo clone'));
    assert.ok(p.includes(handbookFile(locale)) && p.includes('wrangler.jsonc'));
    assert.ok(p.includes(s.os === 'mac' ? 'xcode-select' : 'winget'));
    assert.ok(!p.includes('wrangler@latest deploy`'), 'must not publish');
  }
  const en = newComputerPrompt('en', { os: 'mac', agent: 'codex', installed: 'no', domain: 'later' });
  assert.ok(en.includes('don’t change or publish anything yet') && en.includes('AGENTS.md') && en.includes('CLAUDE.md'));
  assert.ok(en.includes('I don’t create new ones'));
  // the handbook written at launch points back here
  assert.ok(launchPrompt('en', all[0]).includes(guideUrl('en')) && launchPrompt('en', all[0]).includes('“New computer” prompt'));
});

test('outcomes list what the visitor concretely has at the end', () => {
  const later = websiteOutcomes('en', { os: 'mac', agent: 'claude', installed: 'no', domain: 'later' });
  const titles = later.map(o => o.title).join(' | ');
  assert.match(titles, /website/i);
  assert.match(titles, /GitHub/);
  assert.match(titles, /Cloudflare/);
  assert.match(titles, /Claude Code/);
  assert.match(titles, /MY-WEBSITE\.md/);
  assert.doesNotMatch(titles, /domain/i);
  const want = websiteOutcomes('de', { os: 'windows', agent: 'codex', installed: 'yes', domain: 'want' });
  assert.ok(want.some(o => /Domain/.test(o.title)));
  assert.ok(want.some(o => o.title.includes('MEINE-WEBSITE.md')));
});
