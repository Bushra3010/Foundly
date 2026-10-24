# PRD §17 acceptance checklist

| Requirement | Where it's covered |
| --- | --- |
| Owner with a website connects it; owner without one requests a website, and the team's delivery connects it | `tests/domain.test.ts` (websites) |
| Owner with an existing site gets an audit without giving credentials | `tests/phase4.test.ts` (external audit); the crawler reads public pages only |
| Revisions preserve manual edits and can be rolled back | `tests/domain.test.ts` (regenerate one section, rollback) |
| Every live visibility metric opens its exact evidence and denominator | `/app/visibility/evidence` applies the same rule as `computeMetrics`; `tests/phase3.test.ts` |
| An unsupported provider never produces invented answers or scores | `providerState()` gating; no demo data paths exist; `tests/phase3.test.ts` |
| Keyword and city selection create owner-approved questions, not doorway pages | `approveQuestions` (owner approval, branded grouping); no per-city pages are generated |
| Failed jobs keep work and don't double-charge | `tests/domain.test.ts` (generation retry), `tests/phase3.test.ts` (credits, resume) |
| Only authorised members access website requests and private reports | `tests/domain.test.ts` (tenant isolation), role checks in `src/server/*` |
| Mobile users can finish onboarding, review a draft and approve an action | Layouts from 360px up, bottom navigation, 44px tap targets. **Still needs a manual check on a real phone.** |
| Duplicate webhook doesn't double credit | `tests/phase5.test.ts` |
| Tenant isolation for exports, jobs and storage | Every route handler resolves the context from the session; uploads are stored under the workspace id |

## Manual checks still needed before launch
- [ ] Real-device test on mobile and desktop, plus a WCAG 2.2 AA review with a screen reader.
- [ ] Live call to each provider using its real key (docs/providers.md).
- [ ] Razorpay sandbox end to end: checkout, webhook, renewal, failure, refund.
- [ ] Backup restore drill.
- [ ] Hindi copy reviewed by a native speaker.
- [ ] Legal review of the terms, privacy notice and retention policy.
