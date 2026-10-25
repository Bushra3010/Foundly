# AI Business Growth Platform

An implementation of [PRD.md](PRD.md). Business owners create a profile and website from facts they confirm, capture enquiries, improve their pages through an approval workflow, and see how supported AI answers mention or cite them. Every number opens the evidence behind it.

All six build phases from PRD §16 are implemented. Phase 0 (provider feasibility) needs real API keys and is an operator task, described in [docs/providers.md](docs/providers.md).

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000
```

No database or accounts are needed locally. The app uses embedded Postgres ([PGlite](https://pglite.dev)) in `.data/`, and migrations apply automatically, including new ones while the dev server is running. Sign in with any email: without an email provider, the sign-in link appears on the login page, labelled "Development only". Delete `.data/` to start fresh.

To open the admin console locally, start with `ADMIN_EMAILS=you@example.com npm run dev`.

```bash
npm test               # domain tests against an in-memory Postgres
npm run typecheck && npm run lint && npm run build
npm run seed:dev       # optional demo owner with a published profile (add -- --request for a website request)
```

All configuration is documented in [.env.example](.env.example).

## Owner journey

Sign in → **Keywords** (business name, what they do, city, and the keywords to track) → **Website** (connect it, or say they don't have one) → **Social media** (Google Business Profile and Facebook connect in one click when configured; otherwise paste the link) → **Start tracking** (one button: confirms details, lists the business, and runs the first AI check when sources are on). Then the dashboard (`/app`, built in `src/server/performance.ts`) shows connection status, AI mention and citation rates, an 8-week trend, results per keyword, website health from the last check, social status and up to three next steps. The menu has five items: Dashboard, Keywords, Website, Social media and Settings; business details, improvements and reports open from Settings.

## What's in each phase

| Phase | Delivered |
| --- | --- |
| **1 Foundation** | Magic-link sign-in. Hashed single-use tokens, consumed by POST so email link scanners can't use them up. Sessions, including sign out everywhere. Workspaces with owner, editor and viewer roles enforced in the server data layer. Six-step onboarding with per-step save and resume. Business facts with version preconditions. Public and private field separation. Directory and profile pages with JSON-LD built only from supplied facts. |
| **2 Website** | Owners with a website connect it. Owners without one send a brief (goal, pages, style, sites they like, and how to reach them by phone, WhatsApp or video call); the team is emailed, works the request in the admin console, builds the site with any tool and delivers its address, which connects it to the owner's account. One open request per business. Foundly no longer generates or hosts websites (see below). Team invitations, roles, last-owner protection and ownership transfer. Ownership claims by DNS, file or manual review, with dispute handling. English interface. |
| **3 Visibility** | Owner-approved tracked questions, with branded questions kept separate. Competitors. Adapters for ChatGPT (OpenAI Responses), Perplexity (Sonar), Gemini (Search grounding) and Claude (Messages + web search), each off until validated. Raw evidence stored unchanged. Brand and citation extraction with flags for uncertain matches. Mention rate, citation rate, competitor share and coverage, always showing numerator and denominator. Small-sample warnings. Comparisons using only matched question and source pairs. Evidence screen and owner corrections that never edit raw answers. CSV export. Weekly scheduling and resumable runs. Credits reserved atomically and charged only for valid answers. |
| **4 Improvements** | SSRF-safe crawler: blocks private networks, cloud metadata and DNS rebinding; respects robots.txt; bounded in pages, bytes and time. Versioned checklist covering facts, technical access, content, structured data, and partial accessibility checks. Tasks with evidence, a hypothesis and an editable draft. Full workflow: detected → proposed → owner edited → approved → queued → applied → verified, plus rejected, failed and rolled back. Edits invalidate approvals, and placeholders block approval. The owner copies each ready-to-paste fix to their own site and a re-scan verifies it. Downloadable fixes and off-site checklists. |
| **5 Paid pilot** | Plans and entitlements (enforcement switchable). Hosted checkout through a replaceable adapter: Razorpay, or a local test mode. Signed webhooks deduplicated by event id. Allowance credits once per billing period. Grace period on failed payment, with content never deleted for non-payment. Downgrades at period end and cancellation. Lead alerts and opt-in weekly summaries with signed unsubscribe links. Website and account deletion as separate actions with a 14-day recovery window. Admin console covering moderation, disputes, failed work, provider health, time-boxed and reasoned support access, and credit adjustments, all audited. Runbooks, backup and restore scripts. |
| **6 Expansion** | Multiple workspaces per user, a workspace switcher and portfolio view, and agency workspace limits. Installable PWA with an offline page. |

**Retired and removed:**
- **Foundly-hosted websites.** The one-click generator, block editor, hosted sites at `/s/<slug>`, custom domains, photo uploads, the lead inbox and website deletion are gone: the team builds websites instead. Migration `0012` drops their tables (`sites`, `site_versions`, `site_slug_redirects`, `custom_domains`, `leads`, `assets`) and their data.
- **WordPress connector.** Owners copy the ready-to-paste fixes instead. Migration `0012` turns WordPress tasks into ordinary tasks and deletes stored WordPress passwords. Migration `0014` drops the website generator's `jobs` table.
- **Hindi interface** and **Netlify hosting.** Foundly runs on Vercel only.

**Not built (by design or out of scope):** native iOS and Android apps (PRD: "after pilot evidence"; the PWA covers mobile), CMS connectors, white-label agency reporting, domain purchasing, and reviews (the PRD keeps them disabled until moderation exists).

## Architecture

```
src/db/              Drizzle schema + driver (PGlite locally, Postgres via DATABASE_URL)
src/server/          Domain layer — plain functions taking an explicit tenant Ctx; no Next.js imports
  monitoring/        provider adapters, extraction, metrics, runs
  audit/             crawler, checklist, task templates, workflow
  billing/           plans, payment adapters, webhook processing
src/lib/             validation, site content schema + generator, auth/session, i18n
src/app/             Next.js 16 App Router: /app (owner), /admin (incl. website requests),
                     /directory, /b/[slug], /api/cron/*, /api/webhooks/payments/[provider]
src/proxy.ts         separates customer-site origins from the app; optimistic auth redirect
drizzle/             SQL migrations     docs/       providers, deployment, runbooks
tests/               phase-by-phase domain tests
```

**Rules the code enforces** (each has tests): the workspace always comes from the session, never from the request; failed work is never charged twice; drafts use only confirmed facts; a business has one open website request at a time; unsupported providers produce no data; raw evidence is never modified; a duplicate payment webhook changes nothing.

## Deviations from the PRD's proposed stack

- **Auth:** the app has its own magic-link sessions instead of Supabase Auth, so it runs without credentials. Isolation is enforced in the data layer and covered by tests. Migration `0007_enable_rls` turns on row-level security (RLS) for every table with no policies, so Supabase's public Data API can't read or write app data. The app connects as the table owner and is unaffected. Add policies keyed on `workspace_id` only if you ever need the Data API.
- **Jobs:** background work runs through `after()`, with durable state rows (`monitoring_runs`, `audits`). Daily crons (`vercel.json`) resume and schedule work. For higher volume, move execution to a queue (for example Vercel Queues); the run functions are already idempotent.
- **Rate limiting** for sign-in, sign-up, password reset and admin sign-in uses fixed windows stored in Postgres (`rate_limits`), so every Vercel instance shares the same counts. The daily cron prunes ended windows.

## Before launch

Work through [docs/deployment.md](docs/deployment.md) and [docs/acceptance.md](docs/acceptance.md). Open decisions from PRD §17: product name, pilot categories, which providers to validate, hosting and domain supplier, payment provider settings, plan prices, trial allowance, and retention policy.
