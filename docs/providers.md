# AI provider capability matrix and validation

Every adapter in `src/server/monitoring/` is off until both:

1. its credentials and model are configured, and
2. an operator lists it in `MONITOR_VALIDATED_PROVIDERS` after the checks below pass.

| Source | Adapter | Collection method | Location | Required env |
| --- | --- | --- | --- | --- |
| ChatGPT | `openai.ts` — Responses API + `web_search` | Search-grounded API (not the ChatGPT app) | Native approximate location | `OPENAI_API_KEY`, `OPENAI_MONITOR_MODEL` |
| Perplexity | `perplexity.ts` — Sonar chat completions | Search-grounded API | Text instruction only | `PERPLEXITY_API_KEY`, `PERPLEXITY_MONITOR_MODEL` |
| Gemini | `gemini.ts` — `generateContent` + Google Search grounding | Search-grounded API | Text instruction only | `GEMINI_API_KEY`, `GEMINI_MONITOR_MODEL` |
| Claude | `claude.ts` — Messages API + `web_search_20260209`, server-side fallback | Search-grounded API (not claude.ai) | Native approximate location | `ANTHROPIC_API_KEY` (model `CLAUDE_MONITOR_MODEL`, default `claude-haiku-5-5`, effort `low`) |

Only the Claude adapter's request shape was checked against the installed SDK's types. The others follow each provider's public REST docs and must be verified with real calls.

The UI labels every result with its collection method. API answers are never presented as identical to consumer-app answers. A "validated consumer-surface measurement provider" would be a new adapter with `method: "consumer_surface_provider"`.

## Feasibility checklist (per provider)

Run these with a real key in a staging workspace, using about 20 representative questions:

- [ ] **Shape:** 20/20 responses parse without an "Unexpected response shape" error.
- [ ] **Citations:** cited URLs are real and open. Gemini returns redirect URLs, so confirm the `title` holds the domain.
- [ ] **Status mapping:** force a timeout, a 429 and a refusal-style question, and confirm each is stored as `timeout`, `unavailable` or `refusal`, never as an answer.
- [ ] **Locale:** confirm whether the location setting actually changes results. If it doesn't, change `locale` to `text_instruction`.
- [ ] **Cost:** record the actual cost per successful observation. Price plans from this; the formula is in PRD §16.
- [ ] **Terms:** confirm the provider's terms permit this measurement use.
- [ ] **Variance:** run each question 3× and record how much answers vary. This informs the guidance on sample counts.

Then set `MONITOR_VALIDATED_PROVIDERS=claude,perplexity` (comma separated) and redeploy.

## Changing extraction rules

Bump `EXTRACTION_VERSION` in `extract.ts`. The comparison view warns when periods use different versions. Raw answers are never re-written; to re-analyse old observations, write a backfill that inserts new `brand_matches` rows tagged with the new version.
