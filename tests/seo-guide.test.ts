import assert from 'node:assert/strict';
import test from 'node:test';
import { initialGuide, launchPrompt, seoGuideUrl } from '../lib/guide';
import {
  consoleCheckPrompt, consolePrompt, initialSeoGuide, isSeoAnswered, monthlyPrompt, parseSavedSeo, prefillFromWebsiteGuide,
  seoOutcomes, seoPrompt, seoQuestions, seoStartCommand, seoStepMeta, seoSteps,
} from '../lib/seo-guide';
import type { Agent, Locale, Os, Platform, SeoAnswered } from '../lib/types';

const locales: Locale[] = ['de', 'en'];
const platforms: Platform[] = ['wordpress', 'wix', 'squarespace', 'shopify', 'jimdo', 'webflow', 'code', 'unknown'];
const all: SeoAnswered[] = [];
for (const os of ['mac', 'windows'] as Os[]) for (const agent of ['claude', 'codex'] as Agent[]) {
  all.push({ os, agent, installed: 'yes', site: 'diy', platform: null });
  for (const platform of platforms) all.push({ os, agent, installed: 'unsure', site: 'other', platform });
}
const builders = { consolePrompt, consoleCheckPrompt, seoPrompt, monthlyPrompt };
const diy = all[0];
const other = (platform: Platform) => all.find(s => s.platform === platform)!;

test('every SEO prompt is non-empty, in the right language and has no template residue', () => {
  for (const locale of locales) for (const s of all) for (const [name, build] of Object.entries(builders)) {
    const text = build(locale, s);
    assert.ok(text.length > 300, `${name} ${locale} too short`);
    assert.ok(!/undefined|null|\[object |\$\{/.test(text), `${name} ${locale} ${JSON.stringify(s)} has template residue`);
  }
  for (const build of Object.values(builders)) assert.notEqual(build('de', diy), build('en', diy));
  for (const id of seoSteps) for (const locale of locales) assert.ok(seoStepMeta(locale, id).title.length > 2);
});

test('Search Console prompt: check indexability, verify, submit sitemap, request indexing – user signs in', () => {
  for (const s of all) {
    const p = consolePrompt('en', s);
    for (const must of ['search.google.com/search-console', 'robots.txt', 'noindex', 'Domain property', 'URL prefix property', 'Sitemaps', 'Request indexing', 'I sign in to my Google account myself', 'NEVER delete the TXT record']) {
      assert.ok(p.includes(must), `missing “${must}” for ${JSON.stringify(s)}`);
    }
  }
});

test('DIY website: uses site/, Cloudflare DNS, the publish routine and the handbook', () => {
  const p = consolePrompt('en', diy);
  assert.ok(p.includes('site/sitemap.xml') && p.includes('wrangler.jsonc') && p.includes('Cloudflare dashboard under my domain’s DNS'));
  assert.ok(p.includes('MY-WEBSITE.md') && p.includes('“Publish my changes” means'));
  assert.ok(seoPrompt('en', diy).includes('`npx --yes serve site`'));
  assert.equal(seoStartCommand(diy), 'mkdir -p ~/my-website && cd ~/my-website && claude');
});

test('other websites: platform-specific advice, notes file and own folder', () => {
  assert.ok(consolePrompt('en', other('wordpress')).includes('Discourage search engines from indexing this site'));
  assert.ok(consolePrompt('en', other('wordpress')).includes('Site Kit by Google'));
  assert.ok(consolePrompt('en', other('shopify')).includes('theme.liquid'));
  assert.ok(consolePrompt('en', other('webflow')).includes('site verification code'));
  assert.ok(consolePrompt('en', other('unknown')).includes('generator'));
  const code = consolePrompt('en', other('code'));
  assert.ok(code.includes('ask me which framework') && code.includes('Next.js') && code.includes('Astro'), 'asks which framework and knows the usual ones');
  assert.ok(code.includes('git --version'), 'own code may need the dev tools');
  assert.ok(seoPrompt('en', other('code')).includes('separate Git branch') && seoPrompt('en', other('code')).includes('finished HTML'));
  assert.ok(seoPrompt('en', other('wordpress')).includes('backup'));
  for (const p of platforms) {
    const s = other(p);
    assert.ok(consolePrompt('en', s).includes('MY-SEO-NOTES.md'));
    assert.ok(!consolePrompt('en', s).includes('site/sitemap.xml'), 'no DIY-only paths for other websites');
    assert.ok(seoStartCommand(s).includes('~/my-seo') || seoStartCommand(s).includes('~\\my-seo'));
  }
});

test('SEO prompt: interview, read-only audit, OK before changes, honest rules, Google Business Profile', () => {
  for (const s of all) {
    const p = seoPrompt('en', s);
    for (const must of ['interview', 'change nothing', 'Wait for my OK', 'pagespeed.web.dev', 'LocalBusiness', 'business.google.com', 'no keyword stuffing', 'made-up reviews', 'Don’t promise me any Google rankings', 'No paid tools']) {
      assert.ok(p.includes(must), `missing “${must}” for ${JSON.stringify(s)}`);
    }
  }
  assert.ok(monthlyPrompt('en', diy).includes('don’t change anything without my OK'));
});

test('start questions: platform only matters for other websites', () => {
  const empty = initialSeoGuide().situation;
  const q = seoQuestions('en', empty);
  assert.equal(q.platform.options.length, 8);
  assert.ok(!isSeoAnswered({ os: 'mac', agent: 'claude', installed: 'yes', site: 'other', platform: null }));
  assert.ok(isSeoAnswered({ os: 'mac', agent: 'claude', installed: 'yes', site: 'diy', platform: null }));
  assert.ok(isSeoAnswered({ os: 'mac', agent: 'claude', installed: 'yes', site: 'other', platform: 'wix' }));
});

test('saved SEO progress is validated and can be prefilled from the website guide', () => {
  assert.deepEqual(parseSavedSeo('garbage'), initialSeoGuide());
  assert.deepEqual(parseSavedSeo({ version: 1, situation: { os: 'mac' }, step: 'seo', done: ['seo'] }).step, 'start');
  const ok = parseSavedSeo({ version: 1, situation: { os: 'mac', agent: 'codex', installed: 'yes', site: 'diy', platform: 'wix' }, step: 'seo', done: ['start', 'nope'] });
  assert.equal(ok.step, 'seo');
  assert.equal(ok.situation.platform, null, 'DIY website has no platform');
  assert.deepEqual(ok.done, ['start']);
  const website = { ...initialGuide(), situation: { os: 'windows' as const, agent: 'claude' as const, installed: 'no' as const, domain: 'have' as const }, done: ['start', 'agent', 'launch'] as const };
  assert.deepEqual(prefillFromWebsiteGuide({ ...website, done: [...website.done] }), { os: 'windows', agent: 'claude', installed: 'yes', site: 'diy', platform: null });
});

test('outcomes and cross-links', () => {
  const titles = seoOutcomes('en', initialSeoGuide().situation).map(o => o.title).join(' | ');
  assert.match(titles, /Search Console/);
  assert.ok(seoOutcomes('en', { ...diy }).some(o => o.title.includes('MY-WEBSITE.md')));
  assert.ok(seoOutcomes('de', { ...other('wix') }).some(o => o.text.includes('Wix')));
  assert.ok(launchPrompt('en', { os: 'mac', agent: 'claude', installed: 'yes', domain: 'later' }).includes(seoGuideUrl('en')));
});
