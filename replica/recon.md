# Recon map: Otterly.ai (web app)

Scope: the core loop of an AI search monitoring product. The slice covers:
- keywords and prompts going in,
- brand, competitors and website setup,
- daily checks across AI engines,
- the performance dashboard (mentions, share of voice, position, citations),
- the GEO audit and recommendations that close the gaps.

Built clean-room from public pages only. No account was used, and no code, assets or copy were taken.

For: Foundly, an AI visibility (GEO) product for local and small businesses in India. The goal is a much simpler owner dashboard, in five steps:
1. Add keywords.
2. Connect the website.
3. Connect social profiles.
4. Start.
5. See performance.

Date: 2026-10-26

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | marketing site | https://otterly.ai/ | engines, feature list, KPI names, nav |
| 2 | pricing page | https://otterly.ai/pricing | plans by prompt count, daily checks, add-on engines, limits |
| 3 | help center index | https://help.otterly.ai | full category and article list |
| 4 | onboarding guide | https://help.otterly.ai/otterlyai-onboarding-guide | 5-minute quick start and 7 lessons |
| 5 | brand report setup | https://help.otterly.ai/set-up-a-brand-report | brand, variations, domains, prompts, competitors |
| 6 | prompt monitoring | https://help.otterly.ai/search-prompt-monitoring | daily runs, what is stored, prompt list and detail |
| 7 | prompt research lesson | https://help.otterly.ai/onboarding3 | prompt sources, what a good prompt is, volume guidance |
| 8 | adding prompts | https://help.otterly.ai/add-prompts | manual, CSV import, AI prompt research |
| 9 | feature: analytics | https://otterly.ai/features/ai-search-analytics | widgets, citation tables, filters, exports |
| 10 | feature: optimization | https://otterly.ai/features/ai-search-optimization | GEO audit checks, recommendation queue, citation gaps |
| 11 | feature: brand profiling | https://otterly.ai/features/brand-profiling | how AI describes the brand, attributes, objections |
| 12 | hands-on review | https://organikpi.com/blog/reviews/otterly-ai-review/ | real screens: overview, brand ranking, prompts, citations, recommendations |
| 13 | quick-start review | https://discoveredlabs.com/blog/otterlyai-review-quick-start-guide-and-data-validation-framework | setup sequence, metric meanings (some details dated) |

No screenshots were saved. Every screen below is inferred from help articles and reviews, so layouts are approximate.

## Core loop

The user gives a brand plus the questions buyers ask AI. Every day, the product asks those questions on ChatGPT, Google AI Overviews, Perplexity and Copilot (and optionally AI Mode, Gemini and Claude). It shows:
- how often the brand is mentioned, cited and ranked against competitors,
- which sources the AI read,
- what to fix to appear more often.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Sign up | app sign-up page | free trial without a card | email form, SSO | filled, error |
| S02 | Quick start: what to track | first screen after sign-up | enter an SEO keyword, a website URL or a brand/industry, plus country and language | text input, country and language pickers | empty, loading (generating) |
| S03 | Prompt suggestions | after S02 | AI-generated buyer questions to choose from | checklist of prompts, tags, select all, save | loading, filled |
| S04 | Brand report setup | auto-created in onboarding; "+" in Brand Reports | brand name and variations, owned domains, connected prompts, competitors (suggested or manual) | multi-value inputs, competitor suggestions | empty, filled; editable from a gear icon |
| S05 | Brand report: overview | left nav, Brand Reports | the main dashboard | KPI cards (mentions, share of voice, average position, coverage, visibility index, sentiment), coverage-over-time line chart vs competitors, filters | loading, filled, small sample (needs a few days) |
| S06 | Brand ranking | tab in S05 | brands ranked by share of voice | table: brand, share of voice, mentions, sentiment, position | filled |
| S07 | Search prompts list | left nav, Search Prompts | every tracked prompt as a row | table with chosen columns (coverage %, sentiment, volume, mentions, domain citations, ads, shopping, competitors), tags, add prompts button, CSV import | empty, filled |
| S08 | Prompt detail | click a prompt in S07 | one prompt over time | engine-by-engine results, full AI answer text, citations list, brands in the answer | filled, engine failed |
| S09 | Citations / domain ranking | tab or nav | which sites AI reads for these prompts | domain table (citations, share), URL table (cited page, brand mentioned yes/no) | filled |
| S10 | Gap analyzer | in analytics | prompts where competitors appear and the brand doesn't | filtered prompt list | empty, filled |
| S11 | GEO audit | left nav, GEO Audit | crawlability and AI readiness of the user's pages | AI-bot robots.txt check, server response as each bot, structural checks, readiness score per URL | running, done, error per URL |
| S12 | Recommendations | left nav, Optimization | prioritized to-do queue, on-page and off-page | cards: prompt addressed, competitor source, next steps, impact; done/dismiss | needs ~3 days of data, filled |
| S13 | Brand profiling | left nav | how AI describes the brand vs competitors | attribute strength bars, perception gaps, objections, sources per claim | filled |
| S14 | AI prompt research tool | left nav | standalone version of S02/S03 | input, results table, add to tracking | empty, loading, filled |
| S15 | Query fan-out tool | tool | variations of one prompt | input, variants list | filled |
| S16 | Agent analytics | left nav (paid tiers) | AI bot visits from server logs | log upload, bot visit charts | empty, filled |
| S17 | Team and workspace settings | settings | unlimited members, workspaces per brand or client | member list, invite | filled |
| S18 | Billing and plans | settings | plan by prompt count, add-on engines, extra prompts | plan cards, upgrade | filled |
| S19 | Exports and integrations | report menu / settings | CSV, PDF, Looker Studio connector, API, MCP | export buttons, API keys | filled |

## Flows

```
F01 New user sees their first results
    S01 -> S02 (keyword or URL, country, language) -> S03 (pick prompts)
        -> S04 (brand, domains, competitors) -> S05 (first data)
    happy path clicks: about 6-8, plus waiting for the first daily run
    edge: no website yet, brand name is a common word (needs variations),
          a new market with no results, fewer than ~3 days of data so trends are thin

F02 Find where competitors beat you
    S05 -> S06 brand ranking -> S10 gap analyzer -> S08 prompt detail (read the answer and sources)
    happy path clicks: 3-4

F03 Fix it
    S08 or S10 -> S12 recommendation -> do the task -> mark done
        -> S05 trend moves over the next days
    optionally S11 GEO audit first to fix crawl blocks

F04 Report to a boss or client
    S05 -> filters (engine, country, tags, dates) -> export CSV/PDF or Looker Studio

F05 Add more prompts
    S07 -> add manually / CSV / S14 research -> connect to brand report
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| KPI card | number, percent, rank, with delta | loading, small sample, filled | S05, S06 |
| Trend line chart | brand vs competitors, per engine | loading, empty, filled | S05 |
| Data table | sortable, column picker, tags | empty, filled, paginated | S06, S07, S09, S10 |
| Filter bar | engine, country, tag, date range | default, active | S05-S10 |
| Prompt chip / tag | branded, non-branded, funnel stage, product | default, selected | S03, S07 |
| AI answer viewer | answer text with highlighted brands and numbered sources | filled, engine error | S08 |
| Recommendation card | on-page, off-page, impact level | open, done, dismissed | S12 |
| Audit result row | pass, warn, fail per check | running, done | S11 |
| Setup stepper | keyword/URL, prompts, brand, competitors | per step | S02-S04 |

## Inferred data model

```
Workspace     id, name, plan, prompt_limit, engines[]
              evidence: pricing (workspaces, prompt counts, add-on engines)   confidence: high
BrandReport   id, workspace_id, brand_name, brand_variations[], domains[], competitors[], prompt_ids[]
              evidence: S04 setup article                                     confidence: high
Prompt        id, workspace_id, text, country, language, tags[], search_volume?
              evidence: add-prompts article, S07 columns                      confidence: high
Run           id, prompt_id, engine, country, run_date
              evidence: "checked daily across all engines"                    confidence: high
Answer        id, run_id, text, citations[{url, domain, position}]
              evidence: S08 response-by-response, citation detail             confidence: high
BrandHit      answer_id, brand, mentioned, position, sentiment
              evidence: KPIs (mentions, avg position, sentiment)              confidence: high
DomainStat    domain, citations, share (derived per report and period)
              evidence: domain ranking                                        confidence: medium
AuditPage     url, crawlable_by[bot], checks[], readiness_score
              evidence: GEO audit feature page                                confidence: medium
Recommendation id, prompt_id, type (on/off-page), competitor_source, steps, impact, status
              evidence: optimization feature page, review                     confidence: medium
BrandProfile  brand, attributes[{term, strength}], objections[], sources[]
              evidence: brand profiling page                                  confidence: medium
```

Relationships:
- Workspace 1-n BrandReport.
- BrandReport n-n Prompt.
- Prompt 1-n Run.
- Run 1-1 Answer.
- Answer 1-n BrandHit.

Metric guesses (not documented by Otterly):
- coverage = share of answers that mention the brand;
- share of voice = brand mentions divided by all tracked brands' mentions;
- average position = mean rank where the brand is listed;
- the visibility index combines these.

## What Foundly already has (from this repo)

| Otterly piece | Foundly today | gap |
| --- | --- | --- |
| Prompts | `trackedQuestions`, `suggestQuestions()` built from the business's own facts | no "type a keyword" research; no per-question country |
| Brand + variations + domains | `updateBrandTerms(aliases, ownedDomains)` | fine |
| Competitors | `competitors` table, add/remove | no automatic competitor suggestions |
| Daily runs per engine | `monitoringRuns`, `observations`, `scheduleDueRuns`; ChatGPT, Gemini, Perplexity, Claude adapters | needs API keys set in production; no Google AI Overviews or Copilot |
| Mentions, position, citations | `brandMatches` (mentioned, cited, listedPosition), `computeMetrics` | no sentiment; no domain ranking view |
| GEO audit | `audits`, `findings`, `crawlSite`, checks | fine |
| Recommendations to-do | `improvementActions`: draft, approve, apply, verify, rollback | ahead of Otterly: applies fixes to the hosted site |
| Website | hosted site with schema, service pages, cache | ahead of Otterly: Otterly has no site builder |
| Social / listings | Google Business Profile and Facebook OAuth sync, paste-a-link presence kit | ahead of Otterly |
| Plans by keyword count | `plans.ts`: keywords x sources x checks | same model as Otterly's prompt-based pricing |

The data model is already there. The difference is the experience. Otterly's onboarding is one stepper (keyword or URL, then prompts, then brand and competitors, then the dashboard). Its home is one report page. Foundly spreads the same work over 9 nav items (Home, Business, Website, Visibility, Improve, Presence, Leads, Reports, Settings).

## Proposed simple Foundly flow (input for /replica-architect)

1. **Keywords:** type 3-10 things customers search for (for example "dentist in Indore"). Foundly turns each into real buyer questions, using `suggestQuestions` plus keyword input.
2. **Website:** use the Foundly site (one click) or paste your own URL. This feeds `ownedDomains` and runs the audit.
3. **Social and listings:** connect Google and Facebook (OAuth already built), and paste Justdial and Instagram links.
4. **Start:** the first check runs now. After that it runs on the plan's schedule.
5. **Performance:** one page shows:
   - visibility score and trend,
   - mentions vs competitors,
   - which questions you win or lose,
   - the next 3 fixes.

Nav shrinks to Performance, Keywords, Website, Connections and Settings. Leads, reports and business details move inside them.

## Feature matrix

See `features.csv` (37 rows). Must: 16, should: 11, could: 10. Foundly today: yes 12, partial 11, no 11, skip 3.

## Out of scope (cannot or should not be cloned)

- Otterly's accumulated historical answer data and benchmarks. That data is theirs, and Foundly starts collecting its own from day one.
- Search-volume estimates for prompts. These need a licensed keyword data source. Foundly can add one later through an official API.
- ChatGPT ads and shopping tracking. These are ad-surface specific and not relevant to local service businesses yet.
- Their brand, wording, layouts and help content.

## Size

The full Otterly scope is 19 screens, 5 flows and 10 entities.

For the Foundly simplification:
- **What it is:** about 6 screens (setup stepper of 4, performance page, keywords page) on top of the backend that already exists.
- **Hard parts:**
  - Turning a keyword into good questions without wasting credits.
  - Getting answers from engines with no official API (Google AI Overviews, Copilot). These need a licensed SERP or answer API, never scraping.
  - Sentiment and share-of-voice math that stays honest at small sample sizes.
  - Getting production API keys in place so checks actually run.
- **Size:** M (a few weeks) for the simple flow with today's engines. L if Google AI Overviews and Copilot data are added through a licensed provider.
