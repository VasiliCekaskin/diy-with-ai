# DIY with AI

A standalone, German-first/English toolkit for nontechnical business owners. The first guide takes a complete beginner from "which computer do you have?" to a live website in six steps, using copy-paste prompts for Claude Code or Codex.

Platform URL: **https://diywithai.cekask.in**. This application is prepared for Vercel. Visitor websites use the visitor’s own GitHub, Cloudflare and (optional) domain accounts. There is no relationship with the TrackDemos backend.

## Local development

Node.js 22 or later recommended; validated with Node 26.5.0. Dependencies are pinned in `package-lock.json`.

```sh
npm ci
npm run dev
```

Open the URL printed by Next.js. `/` redirects to `/de`; `/en` is the English version.

```sh
npm run verify
```

The gate runs Next route-type generation, TypeScript, the prompt/state tests in `tests/guide.test.ts`, and the production build.

## Routes and ownership

- `/de` and `/en`: toolkit homepage.
- `/{lang}/guides`: guide library; future guides are marked as not yet available.
- `/{lang}/guides/business-website`: the website guide, one page with six steps.

`lib/types.ts` holds the shared types. `lib/guide.ts` holds the questions, the terminal commands and the prompt builders for both languages, plus the validation for saved progress. `components/Guide.tsx` is the interactive client page. `lib/i18n.ts` and `components/SiteShell.tsx` hold the homepage and shell copy.

## How the website guide works

The guide asks four questions (computer, AI, already installed?, domain) and then shows five steps. Each step has one or two prompts the visitor copies into their own AI:

1. **Set up your AI**: install Claude Code or Codex (skipped if already installed) and start it in `~/my-website`.
2. **Tools & accounts**: one prompt installs Git, Node.js and the GitHub CLI and walks the visitor through creating and signing in to GitHub and Cloudflare. A second, read-only prompt checks that everything is ready.
3. **Build**: the AI asks about the business, then builds a static, cookie-free site in `site/`, with an Impressum and privacy policy for DACH businesses.
4. **Preview**: the AI runs a local server and opens the browser.
5. **Go live**: the AI checks everything, backs up to a private GitHub repository, deploys a Cloudflare Worker with static assets after an explicit yes, and connects or buys a domain if the visitor wants one. It then writes `MEINE-WEBSITE.md` / `MY-WEBSITE.md`, covering live addresses, every account and its costs, how to change things, and how to remove everything.

Only the four answers and the current step are saved, in `localStorage`. No business data is entered on this site; the AI collects it in the visitor's own terminal. The page cannot see the visitor's computer or accounts, and step completion is self-reported.

## Vercel deployment

This is an ordinary Next.js project; no custom runtime, server, environment variables, API keys or hosted agent are required.

1. Push this directory as its own GitHub repository (do not push the parent workspace).
2. Import the repository into Vercel and select the automatically detected **Next.js** preset. If this directory is inside your repository, set the Vercel root directory to `diy-with-ai`.
3. Use the default install/build configuration (`npm ci`, `npm run build`). Vercel serves the standard `.next` build output.
4. Review the preview deployment before assigning the production subdomain.
5. Add `diywithai.cekask.in` in Vercel’s domain settings and follow the exact DNS record shown by Vercel. Do not alter unrelated records or the root domain’s email setup.

No hosting account has been accessed and no deployment, GitHub push or DNS edit has been performed by this implementation.

## Before public release

The imprint and privacy policy live on the main domain (`https://cekask.in/<lang>/impressum` and `/datenschutz`) and explicitly cover this subdomain (hosting on Vercel, the guide progress in `localStorage`, links to AI and account providers). The footer links there; this site has no legal pages of its own. Keep them in sync when this site starts processing anything new (the portfolio repo's `content/<locale>/legal.tsx`). No optional tracking scripts, analytics, third-party fonts or embedded provider dashboards are included, so this site needs no consent banner.

The guide tells the AI to draft an Impressum and privacy policy from the visitor’s real details and to say clearly that this is not legal advice. The generated sites avoid trackers, cookies and third-party embeds, so they don’t need a consent banner.

## Tutorial maintenance

Install commands, official links and prompts live in `lib/guide.ts`. `docs/provider-research.md` records the source-review findings and important restrictions. Review provider UI labels, assistant installers, account eligibility, pricing links and legal-service capabilities before release and whenever a report arrives. Documentation review is not an end-to-end account test. Use the portfolio contact link to report outdated steps. Rerun `npm run verify` after edits.

See `docs/implementation-plan.md` for scope/acceptance and recorded verification. No production secrets are needed for any check.

