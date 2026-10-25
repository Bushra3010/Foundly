# Architecture: Foundly simple dashboard (Otterly's core loop, Foundly's way)

Source: `replica/recon.md`, `replica/features.csv`. This is a plan for changes on top of the existing Foundly app. It is not a new app.

The owner's whole journey becomes:

```
Keywords  ->  Website  ->  Social & listings  ->  Start  ->  Performance
(step 1)      (step 2)     (step 3)               (step 4)   (home from then on)
```

Nav (desktop sidebar and mobile bar): **Performance · Keywords · Website · Connections · Settings**.

## Stack (unchanged)

| layer | choice | why |
| --- | --- | --- |
| web | Next.js 16 App Router + TypeScript, server actions | already built; read `node_modules/next/dist/docs` before writing code |
| styling | existing `dashboard.css` + tokens | consistency with the rest of the app |
| database | Supabase Postgres (Singapore), Drizzle, migrations in `drizzle/` | one database, already in production |
| auth | own email/password sessions (`src/server/auth.ts`) | already built |
| payments | Razorpay plans priced by keyword count (`src/lib/plans.ts`) | matches Otterly's prompt-based model |
| email | Resend (`src/lib/auth/mailer.ts`) | needs `RESEND_API_KEY` and `MAIL_FROM` in production |
| jobs | Vercel Cron, daily, calls `/api/cron/monitoring` and `/api/cron/daily` | Hobby plan allows daily jobs; runs are resumable |
| AI engines | official APIs: OpenAI, Perplexity, Gemini, Anthropic (`src/server/monitoring/*`) | only the user's own keys; never scraping |
| hosting | Vercel `sin1`, next to the database | already live |

## Schema

Most of what the loop needs already exists:

| need | existing table |
| --- | --- |
| keywords / questions | `tracked_questions` |
| competitors | `competitors` |
| check runs | `monitoring_runs` |
| AI answers and cited sources | `observations` |
| mention, cited, position per brand | `brand_matches` |
| GEO audit | `audits`, `findings` |
| fixes to-do | `improvement_actions` |
| Google and Facebook sync | `integrations` |
| owner's own site URL, brand terms, listings | `businesses` (`website_url`, `aliases`, `owned_domains`, `listings`) |

Only three changes are needed (full SQL in `replica/schema.sql`):

1. `tracked_questions.keyword`: what the owner typed ("dentist in Indore"). The question we ask AI is built from it. One keyword is one tracked question, which keeps the plan maths (`keywords × sources × checks`) unchanged.
2. `businesses.monitoring_started_at`: set when the owner presses **Start**. Before it, `/app` shows the setup steps. After it, `/app` shows Performance.
3. `brand_matches.sentiment` (should-have, milestone 3): `positive | neutral | negative | null`, filled during extraction.

Domain ranking and share of voice need no table. They are aggregations over `observations.citations` and `brand_matches` for a date range.

Access rules: data-layer checks, as today. Every query takes `ctx` (from `requireCtx()`) and filters on `workspace_id`. Supabase RLS is not used, because the app connects through one pooled server role.

## Screens (new names → existing code)

| ID | screen | route | built from |
| --- | --- | --- | --- |
| N1 | Setup step 1: Keywords | `/app/start?step=keywords` | `suggestQuestions()`, `approveQuestions()`, `questionLimit()` |
| N2 | Setup step 2: Website | `/app/start?step=website` | site generate/publish (`src/server/sites.ts`), `businesses.website_url`, external audit |
| N3 | Setup step 3: Social & listings | `/app/start?step=connections` | Connect buttons (`/api/connect/[provider]/start`), add-listing form, presence kit |
| N4 | Setup step 4: Start | `/app/start?step=start` | `createRun()`, `startAudit()` |
| N5 | Performance (home) | `/app` | `visibilitySummary()`, `computeMetrics()`, `listActions()`, `readinessFor()`, leads count |
| N6 | Keywords | `/app/keywords` | today's question list and competitors from `/app/visibility` |
| N7 | Answer viewer | `/app/keywords/[id]` | `queryObservations()` for one question: the answer text per engine, sources, who was named |
| N8 | Website | `/app/website` (existing) | business details move here as a "Your details" section |
| N9 | Connections | `/app/connections` (today `/app/presence`) | existing presence page, renamed |
| N10 | Settings | `/app/settings` (existing) | plus plan, team, account; leads and reports reachable from here and from Performance |

### What the Performance page shows

A one-screen layout, in order:

1. **AI visibility score** (0–100) with the trend line for the last 30 days, and "checked N times on ChatGPT, Gemini, Perplexity, Claude".
2. **You vs competitors**: one bar per brand (share of mentions). Brand names come from `competitors`.
3. **Keywords you win / lose**: two short lists. A keyword is won when the business was named in at least half the latest answers for it. Each row links to N7.
4. **Next 3 fixes**: the top open `improvement_actions`, or readiness items when there are none, each with one button.
5. **Enquiries this week** (leads count) with a link to `/app/leads`.

Empty state (before the first run finishes): "Your first check is running. Results in a few minutes." If no AI engine is configured, it says so honestly and shows the readiness score and fixes instead.

### What moves where

| old nav item | goes to |
| --- | --- |
| Home | becomes Performance |
| My Business | Website → "Your details" (still `/app/business`, linked) |
| My Website | Website |
| AI Visibility | Keywords (questions, competitors) + Performance (results); `/app/visibility` stays as "All data" for power users |
| Improve | Performance → "Next 3 fixes"; full list stays at `/app/improve`, linked from there |
| Get listed | Connections |
| Leads | Performance card, and Settings → Enquiries |
| Reports | Settings → Reports |
| Settings | Settings |

Old routes keep working. Nothing is deleted, so links in emails and bookmarks don't break.

## API (server actions and routes)

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| action `addKeywordsAction` | turns typed keywords into questions and tracks them (within the plan's keyword limit) | editor+ | `keywords: string[]` (1–10, ≤80 chars each) | created questions or a limit message | N1, N6 |
| action `suggestKeywordsAction` | proposes keywords from the business (category × city, services × city, areas) | editor+ | none | `string[]` | N1 |
| action `editKeywordAction` | edits a keyword and rebuilds its question (archives the old one, keeps history via `replaces_id`) | editor+ | `id`, `keyword` | updated row | N6 |
| action `archiveKeywordAction` | stops tracking a keyword | editor+ | `id` | ok | N6 |
| action `addCompetitorAction` / `removeCompetitorAction` | existing | editor+ | name, domain | ok | N6 |
| action `useFoundlyWebsiteAction` | generates (if needed) and publishes the hosted site | owner | none | live URL | N2 |
| action `useOwnWebsiteAction` | saves `website_url`, adds its domain to `owned_domains`, starts the external audit | owner | `url` | ok | N2 |
| GET `/api/connect/[provider]/start` + callback | existing Google and Facebook OAuth | owner | none | redirect | N3 |
| action `addListingAction` | existing paste-a-link | editor+ | `url` | ok | N3 |
| action `startMonitoringAction` | sets `monitoring_started_at`, creates the first run, starts the audit (both in `after()`), redirects to `/app` | owner | none | redirect | N4 |
| action `runCheckNowAction` | existing manual run, limited by credits | owner | none | run id | N5 |
| page `/app` | Performance or the setup steps | member | `?days=30` | page | N5 |
| page `/app/keywords/[id]` | answers for one keyword | member | id | page | N7 |

Webhooks in: Razorpay (existing). Webhooks out: none.

Jobs:
- `/api/cron/monitoring` (daily, 02:00 UTC): `scheduleDueRuns()` only for businesses with `monitoring_started_at` set and checks due on their plan, then `resumeRuns()`.
- `/api/cron/daily` (daily, 01:30 UTC): existing billing, deletions, weekly summary (now "your visibility this week"), GEO maintenance, confirm reminders.

## The parts that bite

- **Engine keys in production.** No `OPENAI_API_KEY` / `PERPLEXITY_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` means no checks. Start must still work and say so; the Performance page falls back to readiness and fixes.
- **Cost.** Each run costs `keywords × engines` API calls, and the first run fires the moment Start is pressed. Keep credit reservations (`credit_reservations`) as the guard. Cap free/trial at 3 keywords and one run.
- **Long runs on Vercel.** A run can exceed one function's time. Runs already checkpoint per observation and `resumeRuns()` picks them up. Start runs it in `after()` and never waits on it in the request.
- **Honest numbers.** With 3 keywords × 4 engines = 12 answers, percentages jump. Keep `SMALL_SAMPLE` warnings, show "based on 12 answers", and never compare runs with different config hashes as a trend.
- **Keyword → question quality.** Build questions with templates (no model call, no cost): "Who is the best {keyword}?", "Can you recommend {keyword}?" with the keyword as typed. Hindi/Hinglish keywords pass through as typed, with `language` detected simply (Devanagari → `hi`).
- **Idempotency.** Start pressed twice → the run's idempotency key (`first:{businessId}`) makes the second a no-op. OAuth callbacks already use signed state.
- **Races.** Two owners editing keywords at once: each action re-reads the limit inside its transaction (`questionLimit()`).
- **Multi-tenancy.** Every new query filters on `ctx.workspaceId`; tests assert another workspace can't read or archive a keyword (pattern exists in `tests/domain.test.ts`).
- **Deleting data.** Archive, never delete, questions and observations, so history and trends stay true. Account deletion already cascades.

## Build order

1. **Vertical slice.** N1 → N4 → N5, ugly:
   - Tables: migration with `keyword` and `monitoring_started_at`.
   - Actions: `addKeywordsAction`, `startMonitoringAction`.
   - Pages: `/app/start`, Performance with score, the won/lost list and an empty state.
   - Tests: keywords become questions within the limit, Start creates exactly one run, and Performance reads only the workspace's own data.
   - Proved locally with the fake provider used in tests.
2. **Must-haves:**
   - N2 website step (Foundly site or own URL).
   - N3 connections step (existing OAuth and listings).
   - N6 Keywords page with competitors.
   - N7 answer viewer.
   - Next 3 fixes and the enquiries card on Performance.
   - New 5-item nav, with `/app/presence` → `/app/connections` redirect.
   - `/app` switching between setup and Performance.
3. **Should-haves:**
   - You-vs-competitors bars (share of mentions).
   - Sentiment column and extraction.
   - Top cited sites (domain ranking).
   - "Competitor named, you weren't" gap list.
   - Engine and date filters.
   - Weekly visibility email (needs Resend).
4. **Could-haves:**
   - Country/language per keyword.
   - CSV import.
   - How AI describes you (brand profiling).
   - PDF report.
   - Licensed provider for Google AI Overviews and Copilot.
5. **Fixes from replica-entrepreneur:** after it runs.
