# DIY with AI — bounded implementation plan

Task: diy_with_ai_first_release
Level: L3 (new application exceeds 800 lines; no production backend or sensitive integration)
Date: 2026-11-19
Target: /Users/busraaslan/Desktop/vasili/code/diy-with-ai (new independent project; directory does not yet exist)

## Objective

Deliver a functioning German-first/English standalone Next.js tutorial platform, prepared for Vercel and the domain diywithai.cekask.in. A beginner follows three phases, receives context-specific mini tutorials and downloadable local-agent instructions, then reviews publishing, DNS, legal, consent and maintenance steps. The customer's own assistant and accounts do the website work; this platform never claims to have executed or verified it.

## Classification evidence

`rdms/node scripts/classify-change.mjs --paths app/layout.tsx,...,lib/engine.ts,lib/content.ts,lib/package.ts,package.json --level L3`

Underlying path reasons: L2 layout/server-client boundary; shared library code; dependency change. The implementation is intentionally raised to L3 for application size, consistent with `rdms/scripts/routing-rules.mjs` SIZE_RULES. No lowering. Planner → bounded feature implementation → independent security-reviewer → human approval before merge. User has authorized local implementation; no merge, deployment or external mutation is in this task.

## Verified product rules and sources

- This is standalone, linked from portfolio; Vercel hosts the platform, Cloudflare hosts customer sites. Source: user conversation, 2026-11-19, overrides attachment §2 and §22 integration requirements.
- Brand DIY with AI; broad practical-business positioning. Source: explicit user subdomain/name choice and approved tagline discussion.
- Exactly three major phases: preparation, build, review/launch/maintenance. Source: attachment §§4,7,9.
- Browser progress may be local; no tokens, passwords, agent infrastructure or arbitrary server command execution. Source: attachment §16.
- Self-marked completion differs from machine verification; UI cannot check local environment. Source: attachment §§3,5,9,10.
- New domain purchase, production publishing, private repo creation and DNS change require approval from customer. Source: attachment §§6,7,9.
- Preserve email/DNS, backup and rollback before cutover; MX presence is not delivery verification. Source: attachment §6.
- Official references and review dates; do not invent interfaces, prices, integrations or legal guarantees. Source: attachment §§8,15,19.
- German and English user-facing copy. Source: attachment §17.
- TrackDemos contracts and six-locale/cross-client constraints do not apply: this app is unrelated and touches neither repo. Verified: `rdms/docs/architecture/system-map.md` describes music-sharing infrastructure; parent AGENTS identifies independent repos.

## Implementation ownership and new files

All paths below are new paths under diy-with-ai, not asserted to be existing code. No writes in rdms, portfolio or trackdemos-app.

**Builder A — shared engine/content/package/tests (ownership: lib/**, tests/engine.test.ts)**
- lib/types.ts: Locale, choices, business input, progress state, task definition, source/provider metadata.
- lib/content.ts: bilingual reusable preparation and launch task definitions, provider-specific instructions and official sources. Each task contains objective, reason, actions, expected output, verification and troubleshooting. Include registrar fallbacks.
- lib/engine.ts: conditional task selection, dependencies, unknown-state handling, contextual five prompt types, persisted state validation/migration and readiness rules.
- lib/package.ts: fflate ZIP generation from versioned coherent workflow; AGENTS.md or CLAUDE.md plus business brief, source references, checks, approval gates, legal/consent/DNS procedures, deployment and maintenance/rollback guidance. Treat user fields as quoted untrusted business data; never command instructions.
- tests/engine.test.ts: scenario A–G, dependencies, locale coverage, generated package contents, approval requirements, unknown states, reset/invalid persistence and user-input boundaries.

**Builder B — app/UI/project shell (ownership: all remaining files below)**
- package.json and lockfile: Next.js/React, fflate, TypeScript, tsx and development checks. Use official/current supported versions verified by orchestrator; no API keys.
- tsconfig.json, next-env.d.ts, eslint.config.mjs (if lint used), .gitignore.
- app/layout.tsx, app/page.tsx, app/[lang]/layout.tsx, app/[lang]/page.tsx, app/[lang]/guides/page.tsx, app/[lang]/guides/business-website/[phase]/page.tsx: metadata, valid de/en routes and phase validation. Root defaults to German; route changes retain language and progress.
- app/globals.css: owned brand tokens: white/ink/cobalt and purposeful green. Large typography, precise spacing, 16px+ body, legible inputs, visible focus, reduced motion, responsive task rail/reading column. No fake provider screenshots.
- components/SiteShell.tsx: logo, navigation, locale selector, footer/portfolio link.
- components/Workflow.tsx: preparation personalization, task mini tutorial, progress rail, contextual copy prompts, confirmation/needs-attention states, incremental business form, ZIP download, launch checklist and maintenance prompt. Fresh state plus returning-user recovery, reset confirmation, storage failures visible.
- lib/i18n.ts: UI dictionaries (coordinate with Builder A types); no untranslated essential strings.
- README.md: architecture, run/build/deploy to Vercel, owner obligations for platform legal pages, provider content review and limitations, acceptance evidence.
- scripts/verify-change.sh: typecheck + meaningful engine/package tests + production build; no checks against unrelated TrackDemos tables.
- docs/implementation-plan.md: retained copy of this plan and final evidence.
- public/icon.svg: simple original mark if useful.

If more files are necessary, orchestrator must extend these named boundaries first. No next.config needed for default Vercel behavior. No .env, OAuth, backend, GitHub workflow or hosting infrastructure.

## Architecture contract to agree before parallel work

Builder A publishes the exact exports and TypeScript interface signatures to Builder B before coding components. Suggested exports: `initialState`, `parseSavedState`, `getPreparationTasks`, `getLaunchTasks`, `buildSidePrompt`, `getReadiness`, `buildWorkflowFiles`, `buildWorkflowZip`. `Locale = 'de' | 'en'`; choices must include Windows/macOS/unknown, Claude/Codex/undecided, domain new/existing/unknown and registrar other/unknown. Progress values: not_started, self_confirmed, needs_attention; any evidence recorded from agent remains user-reported, never automatically_verified. Don't offer a fake verify action. Only accept evidence URL fields through http/https validation; never render arbitrary HTML.

## Ordered steps and acceptance

1. Orchestrator researches official assistant/platform/registrar/legal/consent docs; pass exact sources and verified capabilities to content builder. Unverified prices use link-to-current-plan language.
2. Establish signatures, scaffold standalone project, install only declared dependencies. Both builders read sibling ownership; never revert each other's changes.
3. Engine/content and UI implemented within ownership. German home and library explain actual available guide; future workflows visibly unavailable, no broken cards.
4. ZIP contains runnable human-readable instructions and assistant-specific entry file; download/copy operates locally. Explicitly explain unzip/open-folder/start-assistant process for Windows/macOS. Unsupported states are guided, not guessed.
5. Preparation task selection matches scenarios A–D; E prevents ready state; F restores browser progress and offers rechecking; G always requires backup/approval and email send/receive test.
6. Legal/consent guide chooses only documented provider mechanisms with manual fallback. No mandatory banner for every site, no automatic compliance claim. Runtime consent implementation is assigned to local agent with reject/withdrawal, blocked optional resources and actual tests.
7. Validate typecheck, engine/package tests and production build. Browser QA (if available) covers desktop/mobile, keyboard, locale switching, resume, package download and checklist behavior. Report any unavailable browser check plainly.
8. Independent security-reviewer examines local implementation and generated prompts for unsafe URL rendering, storage/input validation, fake evidence, credential leakage or implicit live mutation. Fix material findings through bounded builders, rerun affected gate.

## Constraints / out of scope

No production changes; no purchases; no account connection; no direct DNS edits; no automatic hosted verification; no user authentication; no database or Supabase reuse; no generic generated legal documents; no fabricated screenshots or hardcoded unverified subscription claims. Platform's own legal business identity is not supplied: avoid invented identity, document owner completion before public release. A browser-local draft does not survive another browser/device or cleared storage; clearly state this.

## Escalation

Stop dependent work if actual hosted-agent/backend/OAuth requirements arise, a provider capability cannot be verified for a claimed working integration, or an implementation would need production credentials. Use honest manual fallback for external provider steps rather than blocking independent product work. Never weaken checks to obtain green status.

## Required evidence

- scripts/verify-change.sh successful output (typecheck + semantic tests + production build).
- Scenario A–G/package evidence.
- Browser QA results or named limit.
- Independent security review and findings resolution.
- No commit, push, merge or publish; final user handoff names local project and remaining owner setup only.

## Implemented adjustments and verification

- Root route uses `app/(entry)/layout.tsx` + `app/(entry)/page.tsx`; localized routes use their own `app/[lang]/layout.tsx` root layout. This replaces the proposed top-level layout/page so HTML `lang` and metadata are correct for German and English at server render time. Approved by orchestrator before implementation.
- New `AGENTS.md` (Next-generated rules plus project-specific guidance) and `docs/provider-research.md` added within expanded documentation scope.
- `npm run verify`: passed TypeScript/Next route generation, 15 behavioral engine/package tests, production build (13 static pages). Validated Node 26.5.0, Next 16.4.5, React 19.3.0. Dependency audit reported 0 vulnerabilities at install time.
- UI review fixes: changing business fields clears launch confirmations; task risk acknowledgements reset on effective task changes; confirmations remain on the selected task until an explicit next-step action; storage failures replace saved assurances; package files can be inspected before ZIP download; task-critical controls are at least 14px and instruction text 16px; official task links are visible beside the task instructions.
- Browser QA completed in the in-app browser: German homepage at 1280px and English homepage/launch flow at 390px; no horizontal overflow at 390px; no captured console errors. Walked the Windows/Claude/new-domain/minimal-consent personalization; checked failed Git status blocks the ZIP, all eight self-confirmations, fresh risk acknowledgements, and download-start feedback. Copy-to-clipboard content was checked. German-to-English switching preserved business input and setup, English HTML language/title were correct, reload restored the draft, unsafe preview URLs rendered no link, and the keyboard-activated reset confirmation cleared the synthetic test draft. Test data was reset before handoff.
- The browser download-event inspection stalled in the automation tool; a direct button test subsequently showed download-start feedback. ZIP byte/content validity is covered independently by the roundtrip tests; the browser's final saved-file path was not verified.
- Independent security-reviewer verdict: APPROVE for local implementation; no unresolved blocking or fix-required findings. Its independent full gate passed type generation, TypeScript, 15 tests (including 270 conditional/locale combinations), and the production build with 13 static pages. Documentation review and local checks do not imply the customer/provider workflows were executed end-to-end.
- No commits, pushes, merges, DNS edits, purchases, account connections or deployments were performed.

## Follow-up: basic SEO and Search Console (2026-11-19)

L2 plan: `docs/search-console-plan.yaml`. Content version 1.1.0 adds three reusable, bilingual launch tasks after the actual production-domain check: Search Console ownership, sitemap submission and URL inspection/follow-up. They flow into maintenance, preserve prior website/email confirmations on a Google-setup failure, and reopen stale maintenance confirmations when older saved drafts lack these new prerequisites. Google processing/indexing may remain pending with an explicit follow-up; no readiness flag claims indexing or ranking.

Both assistant packages now prepare basic metadata, canonical URLs, robots checks and sitemap before preview, then include the complete manual Google setup. Sources and homepage guide scope were updated. No OAuth, new dependencies, credentials, analytics, live account/DNS actions, or advanced SEO features were introduced.

Verification: `npm run verify` passed type generation/TypeScript, 18 tests (including 270 conditional/locale combinations, new Google dependency/failure/restoration tests, and both assistant ZIPs in both languages), and the production build with 13 static pages. This content-driven addition uses the existing task UI; no new browser interaction or Google-account test was claimed.

## 2026-11-19 — Simplified website guide (supersedes the three-phase workflow above)

User direction: the guide must be "stupid easy". It replaces the setup/run/launch phases, the business form, the ZIP package and the per-task mini tutorials with one page at `/{lang}/guides/business-website`:

0. Where you stand: OS, AI (Claude Code / Codex), already installed, domain (have / want / later).
1. AI setup: install command + start command (`~/my-website`), or only the start command if already installed.
2. Accounts: prompt that installs Git, Node.js and gh, signs in to GitHub (`gh auth login --web`) and Cloudflare (`wrangler login`); plus a read-only check prompt.
3. Build: interview → static HTML/CSS in `site/`, no trackers/cookies, legal pages for DACH, notes file, local git commit.
4. Preview: local server in the background, opens the browser.
5. Go live: verify → private GitHub repo → `wrangler deploy` (after an explicit yes) → domain branch → handbook file covering accounts, changes and removal.

Removed: `lib/content.ts`, `lib/engine.ts`, `lib/package.ts`, `components/Workflow.tsx`, the `[phase]` route, `fflate`, and `docs/search-console-plan.yaml`. Search Console is now offered by the AI after launch. Hosting moved from Cloudflare Pages Git integration to a Worker with static assets, so deployment can run entirely from the CLI. Verified with `npm run verify` (10 tests, build green).
