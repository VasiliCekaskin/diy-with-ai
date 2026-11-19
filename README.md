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
- `/{lang}/guides/google-search-seo`: Google Search Console & SEO, one page with five steps.

`lib/types.ts` holds the shared types. `lib/guide.ts` holds the website guide's questions, terminal commands, prompt builders and saved-progress validation, plus the helpers every guide shares (preamble, browser and safety rules, start/restart commands). `lib/seo-guide.ts` is the same for the Google guide. `components/guide-ui.tsx` holds the shared building blocks (copy boxes, "what happens", restart box, step 1 "set up your AI"); `components/Guide.tsx` and `components/SeoGuide.tsx` are the two interactive pages. A new guide gets its own `lib/<name>.ts` + component and reuses those blocks. `lib/i18n.ts` and `components/SiteShell.tsx` hold the homepage and shell copy.

## How the website guide works

The guide asks four questions (computer, AI, already installed?, domain) and then shows five steps. Each step has one or two prompts the visitor copies into their own AI:

1. **Set up your AI**: install Claude Code or Codex (skipped if already installed) and start it in `~/my-website`.
2. **Tools & accounts**: one prompt installs Git, Node.js and the GitHub CLI and walks the visitor through creating and signing in to GitHub and Cloudflare. A second, read-only prompt checks that everything is ready.
3. **Build**: the AI asks about the business, then builds a static, cookie-free site in `site/`, with an Impressum and privacy policy for DACH businesses.
4. **Preview**: the AI runs a local server and opens the browser.
5. **Go live**: the AI checks everything, backs up to a private GitHub repository, deploys a Cloudflare Worker with static assets after an explicit yes, and connects or buys a domain if the visitor wants one. It then writes `MEINE-WEBSITE.md` / `MY-WEBSITE.md`, covering live addresses, every account and its costs, how to change things, and how to remove everything.

Only the four answers and the current step are saved, in `localStorage`. No business data is entered on this site; the AI collects it in the visitor's own terminal. The page cannot see the visitor's computer or accounts, and step completion is self-reported.

## How the Google & SEO guide works

Start questions: which website (the one from the website guide, or another), and for another website what it's built with (WordPress, Wix, Squarespace, Shopify, Jimdo, Webflow, own code/framework, or "don't know"), plus computer, AI and installed. Answers from the website guide are prefilled.

1. **Start your AI**: the same step 1 as the website guide. The AI works in `~/my-website` (DIY site) or `~/my-seo` (any other website, for notes and, if needed, the code).
2. **Register with Google**: one prompt checks that Google may index the site (robots.txt, noindex, sitemap), then the AI drives Search Console in the browser: Domain property via a DNS TXT record (Cloudflare dashboard for DIY sites) or a URL prefix property (HTML file in `site/` for DIY, the platform's own way otherwise), sitemap submission and "request indexing". The visitor signs in to Google themselves. A second, read-only prompt checks the setup.
3. **Improve your SEO**: a short keyword interview, a read-only audit (indexability, titles/descriptions/headings, local info and LocalBusiness JSON-LD, images, speed via PageSpeed Insights, trust, internal links), a top-5 plan, changes only after an OK (DIY: edit `site/`, local preview, "publish my changes"; platforms: their SEO settings; own code: the framework's idiomatic tools on a Git branch), then resubmitting to Google and an optional Google Business Profile.
4. **Keep it up**: a monthly, read-only Search Console check that suggests 1–3 small improvements.

Notes go into the handbook (DIY) or `MEINE-SEO-NOTIZEN.md` / `MY-SEO-NOTES.md`. The prompts forbid ranking promises, keyword stuffing, fake reviews, bought links and paid tools without asking. Platform dashboard paths are deliberately general ("check the platform's current help") because builders move them; review `lib/seo-guide.ts` together with the other provider steps.

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

