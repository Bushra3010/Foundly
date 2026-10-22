# AI Business Growth Platform

Implementation of [PRD.md](PRD.md). This repository currently covers **Phase 1 (Foundation)** and **Phase 2 (Website)** of the delivery sequence in PRD §16.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional; defaults work locally
npm run dev                  # http://localhost:3000
```

No database setup is needed locally. The app uses embedded Postgres ([PGlite](https://pglite.dev)) stored in `.data/`, and migrations run automatically on first use. Delete `.data/` to start fresh.

Sign in with any email address. In development the sign-in link prints to the server console and appears on the login page, labelled "Development only".

```bash
npm test           # domain tests against an in-memory Postgres
npm run typecheck
npm run lint
npm run build
npm run seed:dev   # optional: a demo owner with a published site in the dev DB (prints a session cookie)
```

## What works

| Area | Status |
| --- | --- |
| Email magic-link sign in, sessions, sign out everywhere | ✅ single-use hashed tokens; the token is consumed by POST so link scanners can't use it up |
| Workspaces and roles (owner / editor / viewer) | ✅ checked on the server for every read and write |
| Onboarding steps 1–6 | ✅ saved after each step, resumes where you left off, can go back |
| My Business (facts, hours, services, areas, address visibility) | ✅ version precondition; contact changes need re-confirmation before publishing |
| Public directory and profile pages | ✅ public routes read only the published projection; JSON-LD built only from supplied facts |
| One-click website generation | ✅ deterministic, from confirmed facts only; idempotent job record (queued → generating → validating → ready/failed) |
| Block editor | ✅ autosave, reorder, remove, colours with contrast warning, SEO fields, rewrite a single section |
| Preview / publish / rollback / unpublish | ✅ private noindex preview; immutable content-hashed versions; publish checks the reviewed draft revision |
| Site address (slug) | ✅ reserved and blocked names; old addresses redirect |
| Lead capture | ✅ honeypot, rate limits, works without JavaScript; leads list, status, notes, CSV export (formula-safe) |
| Data export | ✅ full JSON export (business, profile, draft, versions, leads) |
| AI Visibility | ⏸ honest "Not connected" for all four providers (`src/lib/providers.ts`); suggested questions with branded ones kept separate. No observations, scores or demo data. |
| Improve My Business | ⏸ suggestions from missing facts only; audits come in Phase 4 |
| PWA | ✅ manifest and icons; no offline service worker yet |

## Architecture

```
src/
  db/schema.ts        Drizzle schema (Postgres). Every private row carries workspace_id.
  db/index.ts         PGlite locally / postgres-js when DATABASE_URL is set
  server/*            Domain layer: plain functions taking an explicit tenant Ctx. No Next.js imports, fully unit-tested.
  lib/site/*          Site content schema (zod) and the deterministic generator
  lib/auth/*          Cookie session (DAL entry point: requireCtx) and the mail adapter
  app/                Next.js 16 App Router: owner app (/app), onboarding, directory (/directory, /b/[slug]),
                      hosted sites (/s/[slug]), auth
  proxy.ts            Rewrites <slug>.<SITES_ROOT_DOMAIN> to /s/<slug>; redirects signed-out users away from /app
drizzle/              SQL migrations (generate with `npm run db:generate`)
tests/                Vitest: tenant isolation, roles, idempotency, publish/rollback, slugs, privacy
```

Key rules the code enforces (with tests in `tests/domain.test.ts`):
- The workspace always comes from the session, never from the request. Every query filters by `workspace_id`.
- Draft edits can't change server-owned facts. Facts are refreshed from My Business when you publish.
- A publish binds an immutable version in one transaction, and it fails if the draft changed after review.
- A failed generation never replaces the existing draft. A retry reuses the same job, so it isn't counted twice.
- Generated copy uses only owner-supplied facts: no years in business, reviews, prices, credentials or guarantees.

## Deviations from the PRD's proposed stack

- **Auth:** this repo has its own magic-link sessions instead of Supabase Auth, so it runs without external credentials. Tenant isolation is enforced in the server data layer. **Before production on Supabase:** either switch to Supabase Auth or add row-level security (RLS) policies that set the workspace in the session, so the database also enforces isolation (PRD §03).
- **Jobs:** generation runs inside the request, but its state and attempts are recorded on a durable `jobs` row. Move it to a queue worker (for example Vercel Queues) when AI-assisted drafting or crawling is added.
- **Rate limiting** is in-process. Use a shared store before running more than one instance.
- **Customer-site origin:** set `SITES_ROOT_DOMAIN` to serve sites from their own origin. Without it they're served at `/s/<slug>` on the app origin, which is fine for development but not for production (PRD §08).

## Next slices (in PRD order)

1. Phase 2 remainder: team invitations, ownership claims (DNS/file verification), custom domains, media uploads to tenant-scoped storage, policy pages, English/Hindi interface copy.
2. Phase 3: provider feasibility → adapters behind `PROVIDERS`, observation storage with raw evidence, metrics with numerator and denominator.
3. Phase 4: SSRF-safe website scanner, audit checklist, approval workflow.
4. Phase 5: billing adapter, credit reservations, usage ledger, admin console.

Open decisions (PRD §17): product name, pilot categories, provider coverage, hosting and domain supplier, payment provider, trial allowance, retention policy.
