# AI Business Growth Platform

Product requirements document

Prepared for Softgress  |  Version 1.0  |  23 October 2026

A business owner adds their business, services, location and website. The platform helps them create or improve their online presence and measures mentions and citations in supported AI answers. Owners without a website can generate an editable site from their confirmed details.

## What this document specifies

- A simple experience for business owners across web and mobile.

- Business listing, one click website drafting, editing, hosting and lead capture.

- AI visibility monitoring with inspectable evidence and honest measurement.

- Approved improvement workflows, security, data model and rollout gates.

## How to use this PRD

Use the product sections to align scope, the acceptance criteria to review implementation and the architecture sections to guide engineering. All performance targets, plan structures and stack selections are proposed defaults. Provider coverage is enabled only after feasibility validation.

## Contents

01   Product definition

02   Goals and release scope

03   Roles and access

04   Onboarding and first session

05   Navigation and user friendly design

06   Business directory and public profiles

07   One click website generation

08   Website editing hosting and domains

09   AI visibility monitoring

10   Metrics and evidence

11   Audit and improvement engine

12   Owner operations and administration

13   System architecture and background jobs

14   Data model and API contract

15   Security performance and quality gates

16   Rollout costs and implementation order

17   Development handoff and acceptance checklist

## 01  Product definition

Build a simple business growth platform that combines a public business profile, website creation, website improvements and evidence based AI search visibility tracking.

### Product ownership

Prepared for Softgress. Version 1.0 • 23 October 2026. Working product label: AI Business Growth Platform. Final brand name and domain remain open. This document is an implementation proposal, not a statement that integrations or ranking outcomes are already available.

### Core promise

Help business owners create an accurate online presence, improve useful website content and understand whether supported AI answers mention or cite their business. The product must never promise guaranteed first position, inclusion, indexing or leads.

### Primary customers

- Local service businesses, tour operators, clinics, consultants and other businesses with little technical knowledge.

- Businesses with existing websites that want clearer content and measurable AI visibility.

- Agencies managing multiple customer businesses, added after the owner experience is proven.

### Product surfaces

A responsive marketing website, business owner web app, installable mobile PWA, public directory, hosted customer websites and an internal administration console. Native iOS and Android applications follow after the shared workflows work reliably.

### Release principle

Launch the complete narrow journey: add business → generate or connect website → run baseline → approve improvements → track subsequent answers. Avoid shipping many empty dashboards or pretending unavailable AI sources are supported.

## 02  Goals and release scope

The first release should help an owner reach a useful result without understanding GEO, schema markup, prompts or model APIs.

### Goals

- An owner can create a business profile and generate a website draft in one short session.

- An owner with a website can obtain a clear audit and prioritized actions without giving editing access.

- Every visibility number opens the underlying saved answers and source details.

- Each business gets a simple weekly action list and a history of completed improvements.

### Release scope

| Capability | MVP | Later |
| --- | --- | --- |
| Business profile and claim | Owner profile and verification | Multiple locations and complex transfers |
| Website creation | Curated templates and block editor | Advanced layouts and ecommerce |
| Visibility | Validated provider adapters | More sources after validation |
| Improvements | Audit and approved drafts | CMS publishing and approved recurring rules |
| Mobile | Responsive PWA | Native iOS and Android |
| Agency | One owner workspace | White label and portfolio reporting |

### Non goals

- No model training service, purchased AI rankings or guaranteed recommendations.

- No fabricated testimonials, unsupported business claims or automated spam directories.

- No unrestricted AI generated application code inside customer websites.

- No full ecommerce checkout, marketplace payments, domain registrar or appointment management in MVP. Link to existing booking and payment pages instead.

### Launch assumption

Start with India oriented service businesses, English and Hindi content, INR plan presentation and one location per business. Keep the data model country and currency aware. Provider coverage, final prices and domain supplier selection are launch decisions.

## 03  Roles and access

Each private record belongs to a workspace. A workspace can contain businesses, but public profile ownership is verified separately.

### Access matrix

| Role | Allowed work | Restricted work |
| --- | --- | --- |
| Business owner | Business, website, billing and approvals | Other workspace records |
| Editor | Edit drafts and prepare actions | Billing and owner transfer |
| Viewer | Read reports and evidence | Editing or publishing |
| Agency manager later | Manage explicitly assigned clients | Unassigned clients |
| Platform support | Scoped support tools with audit trail | Unlogged impersonation |
| Public visitor | Read published pages and contact business | Private analytics and lead exports |

### Ownership and claims

Email or phone verification confirms account access, not business ownership. A claimed business additionally needs website DNS or file verification, verified business email where appropriate, or a documented manual review. Prevent duplicate claims; support a disputed ownership state and reversible transfer process.

### Sensitive actions

- Owner approval is required for first publication, website content changes, directory submissions, third party outreach and connecting external accounts.

- Permissions are checked on the server and in database policies, including background jobs, exports, leads and storage objects.

- Support access must have a recorded reason, expiry and audit event. Do not expose provider keys, business tokens or private customer messages.

### Account lifecycle

Allow invitation acceptance, session revocation, owner transfer, business archive and deletion requests. Keep an owner from removing the last owner accidentally. Account deletion and public website deletion must be separate, clearly explained actions with a recovery window where supported.

## 04  Onboarding and first session

Use a guided flow with autosave, a visible progress indicator and a clear route back. Ask only what is needed for the next result.

### Step by step

| Step | Owner input | System output |
| --- | --- | --- |
| 1 Sign in | Email link or supported phone OTP | Verified session and workspace |
| 2 Business basics | Name, category, city, contact | Editable business summary |
| 3 Website choice | I have one or Create one | Correct journey selected |
| 4 Business offer | Services, audience, service areas | Suggested customer questions |
| 5 Review | Confirm details and selected questions | Website draft or first audit |
| 6 First result | Preview and approve next action | Published site or improvement plan |

### Existing website journey

Accept a public URL, normalize it and scan permitted pages. Show discovered facts as suggestions, with their source page, for owner confirmation. A scan does not grant editing rights. Start with an audit and drafts; website publishing requires ownership verification plus an authorized connection.

### No website journey

Collect business name, primary service, city and public contact method. Logo, photos, opening hours and detailed pricing are optional. Use defaults and clear placeholders for missing information. One Generate website action builds a private preview from confirmed data; a separate Publish website action makes it public.

### Failure and recovery

- If generation fails, preserve answers and offer retry without another usage charge for the same failed job.

- If the website blocks scanning, allow manual entry and explain which checks could not run.

- If an owner leaves midway, resume at the last completed step. Do not publish incomplete information.

### First session success

Proposed usability target: at least 80% of pilot owners complete the core flow without assistance. Measure actual completion time; target a preview within five minutes of starting the form, excluding owner delays and domain setup.

## 05  Navigation and user friendly design

Present useful business outcomes in plain language. Keep technical evidence available behind an explanation rather than putting jargon in the main journey.

### Information architecture

| Web navigation | Main content |
| --- | --- |
| Home | Current status, three next actions and recent activity |
| My Business | Business facts, services, photos and public profile |
| My Website | Preview, simple editing, domain and publishing |
| AI Visibility | Tracked questions, provider results and saved evidence |
| Improve My Business | Prioritized actions and drafts awaiting approval |
| Leads | Website enquiries and follow up status |
| Reports | History and export |
| Settings | Team, plans, connections and notifications |

### Mobile design

Use Home, Website, Visibility and More as bottom navigation. Keep a persistent primary action appropriate to each screen. Replace wide tables with readable cards and detail sheets. Show progress for running jobs and allow the owner to leave the screen safely.

### Interaction requirements

- Support 360 pixel mobile layouts upward without page level horizontal scrolling. Use comfortable tap targets of at least 44 by 44 CSS pixels as a product standard.

- Use keyboard navigation, visible focus, labeled fields, accessible contrast, semantic headings and screen reader announcements for job status. Target WCAG 2.2 AA and verify before launch.

- Explain errors beside the relevant field; retain entered data and offer a specific next action.

- Support English and Hindi interface copy with a manual language switch. Keep interface language separate from website language and monitored question language.

- Use colorful status cards with text labels and icons; color must never be the only status signal.

### Required interface states

Every major screen needs loading, empty, partial data, error, permission denied, disconnected integration, quota exhausted and success states. A new user sees real setup guidance; sample data must carry a Demo label and never appear as measured results.

## 06  Business directory and public profiles

The directory provides an accurate public business page. Being listed is an online presence feature, not a paid placement inside external AI answers.

### Business data

Store legal or trading name, public aliases, category, description, services, service areas, address visibility preference, phone, email, website, hours, logo, photos, booking URL and verified social links. Public contact fields require explicit confirmation before publication.

### Public page requirements

- Readable stable URL, unique title and description, useful service details, contact buttons, owner supplied photos and accurate location information.

- Generate applicable structured data from verified facts. Never create ratings, prices, credentials, awards or availability that the owner has not supplied.

- Offer Call, WhatsApp, Visit website and Send enquiry as relevant. Country code formatting and owner configured contact preferences must be respected.

- Show verification type and last update date without implying the platform guarantees service quality.

### Discovery and quality

Search and filter by category and service area. Use a documented directory ordering rule such as relevance and completeness; label paid placements. Prevent mass near identical location pages, duplicate profiles, keyword stuffing and copied descriptions. Owner confirmed facts remain authoritative over imported suggestions.

### Reviews and moderation

Launch with reviews disabled unless verification, abuse handling, reporting and moderation are implemented. If enabled later, preserve evidence of consent and genuine customer relationship, allow business responses and never let owners fabricate reviews through AI.

### Acceptance criteria

- An owner can preview exactly what will become public and choose not to show a home address.

- Public and private profile fields are separated in storage and API responses.

- A duplicate claim enters review; it does not replace the existing owner.

- Unpublished, disputed and suspended profiles follow clear indexing and visibility rules.

- Profile removal also updates internal discovery, sitemap entries and cached public content.

## 07  One click website generation

The product should feel automatic while keeping the business owner in control of facts and publication. Generate a website from a validated content model and curated components.

### Generation pipeline

Confirmed business facts → choose suitable industry template → draft factual content → validate structured page data → render responsive preview → owner review → publish immutable version. Show honest job progress with queued, generating, validating, ready and failed states.

### Website package

| Page or block | Required content |
| --- | --- |
| Home | Business offer, location, trust facts and contact CTA |
| Services | Overview and useful service descriptions |
| About | Owner approved business background |
| Contact | Preferred contact channels, hours and service area |
| Policy pages | Owner editable drafts where applicable |
| Technical output | Metadata, canonical URLs, sitemap and appropriate structured data |

### Template and content rules

- Start with service business, travel and professional service templates. Use the same stable blocks with category specific defaults.

- Missing logo uses a text wordmark; missing images use clearly licensed assets or neutral visuals. Never present generated imagery as completed customer work.

- No invented years of experience, reviews, client logos, certifications, prices or outcome guarantees. Highlight missing optional facts for the owner.

- One click generation does not purchase a domain, connect external accounts or automatically publish customer content.

### Acceptance criteria

- One action generates a complete editable preview after required details are confirmed. Proposed generation SLO: 95% within 120 seconds under supported load, excluding provider outages.

- Retry is idempotent and preserves the last successful draft. Regenerating one section leaves other edits intact.

- Owner can change text, photos, colors, section order and contact details without code.

- A failed render cannot replace the live site. Preview pages are private or access controlled and excluded from indexing.

## 08  Website editing hosting and domains

Provide a constrained editor that a nontechnical owner can understand. Advanced code editing is outside the first release.

### Editing model

Use pages composed of validated blocks: hero, services, gallery, FAQ, about, contact and footer. Owners edit fields inline or in a simple panel. Draft autosaves do not modify the published version. Maintain immutable publish versions with author, timestamp and rollback target.

### Publishing and domains

- Offer a platform subdomain at first publication. Check uniqueness, reserved names and abusive names; preserve redirects if a slug changes.

- Custom domains require owner verified DNS. Show exact records, verification status, certificate status and actionable troubleshooting. Never claim a site is live while DNS or TLS remains incomplete.

- Separate domain purchase from domain connection. MVP connects an existing domain; purchasing or renewing a domain requires a later registrar integration and explicit transaction flow.

- Serve sites from an isolated customer origin, with automatic certificates, caching and a rollback path. Keep the owner dashboard on a separate origin.

### Lead capture

Contact forms collect only necessary fields, display a configurable privacy notice, apply rate limits and spam protection, and save leads within the correct workspace. Confirm receipt to the visitor without exposing private owner contact information. Provide a clear failed submission message and retry path.

### Content safeguards

Sanitize rich text and uploaded SVGs or disallow unsafe file types. No arbitrary scripts, raw AI generated HTML execution or cross tenant template access. Scan uploads, constrain file sizes and keep original asset ownership metadata.

### Cancellation and portability

Before checkout, explain hosting, custom domain and export entitlements. Support data and website content export. Define a cancellation grace period before unpublishing; notify the owner and retain an export path according to the published retention policy. Never silently transfer ownership of a customer domain.

### Release checks

Test publishing, rollback, broken media, slug collision, domain verification failure, expired connection, form spam, preview leakage and simultaneous edits. A publish operation binds a validated version atomically; partial deploys cannot appear as success.

## 09  AI visibility monitoring

Track a defined sample of questions and answers. Results describe those observations, not the complete behavior or market share of an AI service.

### Question setup

Owners enter keywords and locations. The platform suggests natural questions grouped by service, purchase intent, comparison and location. Owners approve a stable tracked set. Avoid forcing the business name into discovery questions because that biases inclusion; keep branded questions in a separate group.

### Provider coverage

Requested targets are ChatGPT, Perplexity, Gemini and Claude. Each adapter must pass feasibility and output validation before being enabled. Record whether results come from a direct model API, a search grounded API or a validated consumer surface measurement provider. Label these separately; API outputs must not be represented as identical to consumer app answers.

### Per observation fields

Save exact question and version, provider, source type, model when exposed, requested locale, actual supported locale settings, search setting, capture timestamp, run status, raw answer, citation metadata and extraction version. Do not imply city specific collection when the source only supports a textual location instruction.

### Scheduling and failures

- Default weekly checks with optional manual checks within credits. Repeated samples can be offered with their additional cost shown.

- Treat timeout, source unavailable, refusal, partial answer and no citations as distinct states. An empty citation list is not a failed request if the provider returned a valid uncited answer.

- Use provider retry policies, queue limits and an idempotency key. Failed runs do not become zero visibility scores.

- Retain original evidence so an owner can challenge a false brand match or inspect a cited URL.

### Acceptance criteria

Each supported source displays its collection method and last successful run. Unavailable providers show Not connected or Not supported, never fabricated results. Historical comparisons warn when questions, provider configuration, locale or extraction method change.

## 10  Metrics and evidence

Separate website readiness from observed AI visibility. A well configured website may still receive no mentions; an AI mention does not prove a lead or a sale.

### Metric definitions

| Metric | Formula or rule |
| --- | --- |
| Mention rate | Valid answers mentioning the business divided by eligible valid answers |
| Citation rate | Valid answers citing an owned domain divided by eligible valid answers |
| Competitor share | Answers mentioning a brand divided by the sum of brand answer counts across the fixed tracked brand set |
| Listed position | Ordinal position only inside an explicit recommendation list |
| Website readiness | Versioned checklist of completed applicable audit checks |
| Lead count | Successfully recorded enquiries with source when available |

### Counting rules

Count a brand at most once per answer for mention rate and competitor share. An answer can mention several brands. Citation rate is answer based, while citation counts are a separate metric. Normalize business aliases and owned domains; keep ambiguous matches flagged for review. Do not turn first text occurrence into a rank.

### Denominators and comparison

Always display numerator, denominator, date range and source filters. Exclude failed observations and show failure coverage separately. Compare matched questions and source configurations; if only a subset overlaps, say so. Do not silently combine unequal run frequencies into one market wide score.

### Uncertainty

Label small samples and variable answers. Show repeated sample frequency when available. Sentiment is optional and must be marked as an automated estimate with supporting text. Use Unclear for mixed or ambiguous statements and allow corrections without overwriting the raw evidence.

### Worked example

If 30 of 100 valid eligible answers mention a business, mention rate is 30%. If 12 of those 100 cite its domain, citation rate is 12%. If tracked brands have 30, 40 and 50 brand answer counts, the first brand has 25% competitor share: 30 divided by 120. These are illustrative calculations, not customer results.

### Evidence screen

Selecting a metric opens filtered observations with question, source, timestamp, status, full answer and linked citations. Export must preserve filters and metric definition versions. Provide a correction workflow and an audit trail for extraction changes.

## 11  Audit and improvement engine

Turn findings into small tasks with reasons, examples and a clear owner action. Suggestions improve site usefulness and accessibility; they cannot ensure AI inclusion.

### Audit coverage

- Business facts: name, contact, service areas and opening hours are consistent on scanned pages.

- Technical access: HTTP status, redirect behavior, index directives, robots access, sitemap discovery, canonical tags and basic rendering.

- Content: useful service information, transparent business identity, original evidence, pricing context where supplied and clear answers to customer questions.

- Structured data: parseability, applicable type and agreement with visible content. Do not require every schema type for every business.

- Accessibility and mobile checks: label automated findings as partial, with manual validation where needed.

### Task model

Each task includes affected page, observed evidence, severity, expected benefit stated as a hypothesis, proposed change, editable draft, approval status and verification check. Assign priority based on user impact and effort, not a fictional guaranteed ranking lift.

### Action workflow

Detected → proposed → owner edited → approved → queued → applied → verified. Rejected, failed and rolled back are explicit states. Generated drafts cannot execute tools or publish themselves. Owner changes invalidate any approval on the previous content version.

### Existing websites

MVP offers downloadable content and step by step fixes. A later WordPress connector uses least privilege and a preview of exact changes. Other CMS tools require their own supported adapters. Recheck content revision before applying changes to prevent overwriting newer external edits.

### Offsite work

Provide legitimate profile consistency and review request checklists. Third party submissions, outreach and account changes are user approved activities with provider specific support; do not promise automatic placement everywhere. Never generate fake backlinks, reviews or business locations.

### Evidence after changes

Verify the changed page and record its published version. Subsequent monitoring shows before and after observations with dates. Explain that concurrent changes and variable AI answers prevent proving that one content change caused a visibility increase.

## 12  Owner operations and administration

The platform should keep routine work visible, bounded and reversible while providing useful lead handling and clear billing.

### Home dashboard

Show website status, latest measured mention rate with sample size, new leads and three prioritized next actions. Use first run guidance before any monitoring completes. Show scheduled check date and honest progress for background tasks.

### Leads and notifications

Lead records include name, contact, enquiry, receiving business, timestamp, source when known and New, Contacted, Qualified or Closed status. Allow search, notes and export. Default weekly summary is opt in with configurable channels; transactional security and billing messages are separate. Deduplicate alerts and support unsubscribe preferences.

### Billing requirements

- Use a hosted payment flow and a replaceable payment adapter. Provider availability, settlement, taxes and subscription support must be validated before launch.

- Show credits, hosting features, custom domain entitlement, renewal date and applicable charges before purchase. Block accidental unlimited spending.

- Deduplicate payment webhook events and persist billing state changes. A failed payment cannot delete customer content immediately.

- Support upgrades, scheduled downgrades, cancellation, payment failure and refunds with auditable entitlements.

### Illustrative packaging

Free: business draft and limited trial preview. Website: hosted site and forms. Growth: website plus a capped monitoring allowance. Agency: multiple businesses and reporting. These are proposed plan structures; set prices only after measuring provider, hosting and support costs. No unlimited AI monitoring.

### Admin console

Include business moderation, ownership disputes, account support, job failures, provider health, usage cost, plan entitlements, deployment status, refund support and audit history. Redact secrets and sensitive lead fields by default. Admin overrides require a reason and recorded actor.

### Acceptance criteria

Owners understand what one check consumes before running it. Lead exports and reports remain tenant scoped. A duplicate webhook does not double credit or charge an account. Disabling one provider does not prevent owners from editing their website.

## 13  System architecture and background jobs

Use a shared backend for web and mobile clients. Keep public website delivery independent from AI monitoring so provider failures cannot take customer websites offline.

### Proposed stack

| Layer | Proposed implementation |
| --- | --- |
| Web and PWA | Next.js with TypeScript and accessible shared components |
| Identity and data | Supabase Auth and Postgres with tenant policies |
| Media | Object storage with tenant scoped private uploads |
| Jobs | Node.js workers and a durable queue |
| Public websites | Validated templates rendered into versioned deployments |
| Monitoring | Adapters for validated provider integrations |
| Payments | Hosted checkout through a validated payment provider |
| Native apps later | React Native or Flutter consuming the same APIs |

### Job types

Business import, website scan, website generation, site validation, publication, domain verification, observation collection, answer extraction, audit generation and report export. Store state, attempt count, timestamps, cost estimate, execution cost and a tenant scoped idempotency key.

### Reliability

Use bounded retries with backoff, dead letter handling and operator retry controls. Only bill successful eligible usage according to a published credit policy. Reserve credits atomically before accepting work and settle or release the reservation afterward. Never retry a purchase or publication blindly.

### Versioning

Version business facts, questions, extraction logic, audit checklists, generated drafts and published websites. Jobs reference immutable input versions. Before publishing, confirm the approved version is still current; otherwise request another review.

### Operations

Track latency, queue age, error rate, provider throttling, cost per workspace and deployment success. Use correlation IDs across requests and jobs. Store API secrets server side and integration tokens encrypted. Exact SDK versions, quotas and provider contracts are engineering validation gates, not assumptions in this PRD.

## 14  Data model and API contract

All private business entities carry workspace_id and appropriate business_id references. Public projections expose only approved published fields.

### Core entities

| Entity group | Key records and purpose |
| --- | --- |
| Accounts | users, workspaces, memberships and role assignments |
| Business | businesses, locations, services, aliases and ownership claims |
| Public presence | profiles, moderation events and public revisions |
| Websites | sites, pages, blocks, assets, drafts, versions and domains |
| Monitoring | question sets, question versions, runs and observations |
| Analysis | brand matches, citations, competitors and metric snapshots |
| Improvements | audits, findings, actions, approvals and verification events |
| Operations | leads, integrations, notifications and audit events |
| Commercial | subscriptions, entitlements, credit reservations and usage ledger |

### Important constraints

A published site points to one immutable validated version. One external payment event maps to one processed webhook. One scheduled observation key maps to one chargeable execution. Domain claims are unique while active. Approval stores exact content revision, approver and timestamp. Raw evidence remains distinct from derived annotations.

### API families

POST /businesses; PATCH /businesses/{id}; POST /businesses/{id}/claims; POST /sites/generate; GET /jobs/{id}; PATCH /sites/{id}/draft; POST /sites/{id}/publish; POST /sites/{id}/rollback; POST /businesses/{id}/audits; POST /businesses/{id}/runs; GET /businesses/{id}/observations; POST /actions/{id}/approve; GET /businesses/{id}/leads. These are proposed resource boundaries, not deployed endpoints.

### API rules

Use authenticated tenant scoped requests, strict schemas, pagination, rate limiting and consistent error codes. Require idempotency keys for job creation and publication. Use version preconditions for updates. Verify payment and integration webhooks. Never accept a client supplied workspace_id as proof of authorization.

### Retention proposal

Keep lead and observation retention configurable by plan and published policy. Proposed defaults for costing: 90 days of raw observations and 12 months of aggregated history. Final retention, deletion and export policies must be approved before launch; deletion includes storage, indexes and eventual backup expiry.

## 15  Security performance and quality gates

These are proposed product acceptance targets. Validate them against measured costs and real infrastructure before committing them in customer contracts.

### Security requirements

- Website scans must block private, loopback, link local and cloud metadata addresses, including redirects and DNS rebinding. Limit crawl depth, bytes, time and concurrency.

- Treat crawled pages and model answers as untrusted data. Embedded instructions must not trigger tool calls, change approvals, expose secrets or override system rules.

- Use tenant isolation tests for every read, write, export, job and storage route. Apply upload validation, rate limits, session controls and dependency scanning.

- Keep customer website origins separate from authenticated app origins. Configure security headers, sanitization and asset policies.

### Performance targets

| Area | Proposed launch target |
| --- | --- |
| Owner navigation | Useful content within 3 seconds on representative mobile tests |
| Public website | LCP at most 2.5 seconds at p75 where measured |
| Website generation | 95% ready within 120 seconds under supported load |
| Publishing | 95% within 60 seconds excluding domain setup |
| Scheduled monitoring | 95% attempted within 24 hours of scheduled time |
| Availability | 99.5% monthly core app target with measured reporting |
| Recovery | Daily backups and tested restore; RPO 24 hours, RTO 8 hours |

### Data integrity and resilience

Use transactional entitlement changes, durable jobs, content hashes and recorded version transitions. Test backup restoration before accepting paying users. One provider outage must degrade only its own monitoring source. Surface stale results with timestamps instead of silently presenting them as current.

### Required verification

Test the real core journey on mobile and desktop. Include duplicate billing events, credit races, failed generation, site rollback, inaccessible domains, citation mismatches, question changes, owner transfer and blocked website crawling. Verify that supported provider labels match the actual collection methods.

### Trust requirements

Publish understandable terms, privacy and retention policies. Provide business fact correction, profile reporting and account deletion routes. Confirm relevant jurisdiction and provider obligations with appropriate review before launch; this document does not prescribe legal conclusions.

## 16  Rollout costs and implementation order

Build in vertical slices that demonstrate a complete owner outcome. Do not spend the first phase building a complex agency dashboard.

### Delivery sequence

| Phase | Build and exit condition |
| --- | --- |
| 0 Feasibility | Validate provider outputs, costs, hosting and one real business journey |
| 1 Foundation | Accounts, tenant access, profile and responsive onboarding work |
| 2 Website | Generate, edit, publish, contact form and rollback pass real tests |
| 3 Visibility | Validated sources, raw evidence, citations and transparent metrics |
| 4 Improvements | Audit, action drafts, approvals and export work end to end |
| 5 Paid pilot | Billing, quotas, support, backup restore and monitoring verified |
| 6 Expansion | CMS integrations, agencies and native apps after pilot evidence |

### Cost model

Monthly responses = active businesses × tracked questions × supported sources × runs per month × samples per question. Example: 100 businesses × 25 questions × 3 sources × 4 runs × 1 sample = 30,000 responses. Add generation, extraction, crawl, deployment, storage and support costs. Retry overhead must be budgeted separately, even when not charged to the customer.

### Business validation

Measure actual provider cost per successful observation and gross contribution per plan before setting prices. Cap trial usage, concurrent jobs and regeneration. Use weekly monitoring initially. Paid plans need a clear cost ceiling, not merely a large number of nominal keywords.

### Pilot measurement

Recruit a small set of owners with and without websites. Track onboarding completion, preview completion, first publication, first valid monitoring run, approved action completion, weekly active owners, support requests and paid retention. Track enquiry quality separately; do not claim AI attribution from a direct visit without supporting evidence.

### Release exit gate

A nontechnical owner can complete onboarding, publish or connect a site, inspect real observation evidence, approve a useful improvement and export their data. Security isolation, cost limits, rollback, provider outage handling and support runbooks have passed review. Native app store release is not a dependency for the first paid web pilot.

## 17  Development handoff and acceptance checklist

Use this document as a build specification for Claude Code or another coding agent. Implement one verified release slice at a time.

### Build instruction

Create the AI Business Growth Platform described in this PRD. Start with a responsive TypeScript web app and PWA backed by tenant scoped data. Implement business onboarding, verified public profiles, constrained website generation, preview and publication before expanding monitoring. Keep all secrets server side. Use explicit provider adapters and feature flags. Demonstration data must be visibly marked and isolated from live reports.

### Engineering deliverables

- Repository with reproducible setup, environment variable example, migration history and deployment instructions.

- Shared validation schemas, permission policies, background jobs and typed API contracts.

- Responsive owner screens, public directory, hosted website templates and administration tools.

- Provider capability matrix, usage ledger, billing adapter and documented unsupported states.

- Focused integration tests covering tenant isolation, credit reservation, observation evidence and approved publishing.

- Operational runbooks for provider outage, deployment rollback, failed payment, ownership dispute and restore.

### Acceptance checklist

- Owner with no website generates a factual editable preview and publishes only after approval.

- Owner with an existing site receives an audit without surrendering website credentials.

- Website revisions preserve manual edits and can be rolled back.

- Every live visibility metric opens its exact evidence and denominator.

- An unsupported provider never produces invented answers or simulated scores.

- Keyword and city selection create useful owner approved questions rather than doorway page spam.

- Failed jobs preserve work and do not create duplicate charges.

- Only authorized workspace members can access business leads and private reports.

- Mobile users can finish onboarding, review a draft and approve an action.

### Decisions before implementation

Confirm final product name, pilot categories, exact provider coverage and collection methods, hosting and custom domain supplier, payment provider, trial allowance and retention policy. Treat these as bounded configuration or feasibility decisions; they must not block building the validated business and website flows.

### Source and scope note

Concept reference: https://llmpulse.ai/blog/best-geo-tools/ and the owner requirements in this conversation. This PRD adds original proposed workflows and acceptance criteria. It does not adopt the article’s vendor rankings, pricing or unverified claims as product facts.
