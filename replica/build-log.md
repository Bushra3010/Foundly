# Build log

| ID | date | status | missing | harder than expected |
| --- | --- | --- | --- | --- |
| N1 Setup: Keywords | 2026-10-26 | done | country/language per keyword | keyword → question wording ("best best dentist"), Hindi keywords |
| N2 Setup: Website | 2026-10-26 | done | | publish had to happen inside setup, not on the Website page |
| N3 Setup: Social & listings | 2026-10-26 | done | OAuth returns to Connections, not back to the step | |
| N4 Setup: Start | 2026-10-26 | done | | the first check must never be handed out twice (it would run twice) |
| N5 Performance | 2026-10-26 | done | engine filter | Foundly sites live on a shared host, so "cited your site" needed URL-prefix matching, not domain matching |
| N6 Keywords | 2026-10-26 | done | CSV import | |
| N7 Answer viewer | 2026-10-26 | done | answer history per check | |
| N9 Connections (renamed from Get listed) | 2026-10-26 | done | | |
| Nav (5 items + More/Settings shortcuts) | 2026-10-26 | done | | |

Verified locally with seeded fake AI answers (`.data/seed-demo.ts`, not committed) and a fresh sign-up through all four steps.
Production needs: migration 0011 applied, then AI provider keys (`OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` + `MONITOR_VALIDATED_PROVIDERS`) for checks to run.

## 2026-10-26: moved onto main

Main had meanwhile dropped hosted Foundly websites (and leads), so the port keeps main's four-step setup screen (/onboarding)
instead of /app/start, and drops the one-click "publish Foundly website" step and the enquiries card. Kept from this build:
Performance home, Keywords page, answer viewer, five-item menu, Connections, keyword → question, `tracked_questions.keyword`
(migration 0015). Main's Compare page, website requests and per-platform score code stay; Compare is under Settings/More.
