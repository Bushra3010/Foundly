# Foundly policy review — 29 October 2026

Implemented drafts: `/terms` and `/privacy`. Both are accessible without login,
linked from marketing, pricing, signup and billing settings, and marked `noindex`
until final approval. No new terms-acceptance record or consent collection is
introduced while these are drafts. They do not replace existing agreements.

## Product and pricing evidence

- `src/lib/plans.ts` is the current entitlement source: Growth has 5 questions,
  ChatGPT, biweekly checks, 12 monthly credits and 1 workspace. Pro has 10
  questions, ChatGPT/Gemini, weekly checks, 90 credits and 1 workspace. Enterprise
  has 5 questions per business, all four platforms, biweekly checks, 45 credits
  per workspace and up to 10 workspaces. The terms table imports these values.
- `src/lib/regional-pricing.ts` currently lists INR 15,000 / 20,000 / 25,000 in
  India and USD 15,000 / 20,000 / 25,000 elsewhere. Indian environment overrides
  also apply in the terms table, matching the marketing cards. **Confirm that
  the very large USD prices are intentional before live sales.**
- `docs/product/regional-pricing.md` describes older prices and provider coverage;
  its margin analysis does not describe the current catalogue. The new policies
  use the implementation. They make no gross margin claims.
- Localised price cards do not configure Razorpay plans or validate billing
  country. Settings can show “Price to be confirmed” without configured prices.
  Align server prices, provider plans, currency, tax and regional marketing
  before enabling live billing. Do not accept a different checkout amount on the
  assumption that policy language fixes a misleading displayed price.
- Add-on purchase/cap increases are not implemented. Pricing copy now makes
  availability explicit. No automatic credit expiry or monthly reset is promised.
- Cancellation, downgrades, 14-day payment grace and account recovery derive from
  `src/server/billing/service.ts` and `src/server/lifecycle.ts`.
- Enterprise grants are per workspace; confirm how all contracted client
  workspaces will be provisioned and billed before promising a pooled allowance.
- ChatGPT Ads appears in every paid plan, but a campaign implementation is not
  present. Confirm what human service is delivered, eligibility, media budget,
  approvals and any separate fees before selling it.
- The site no longer hosts customer websites. New website briefs require a
  separate statement of work. Some older marketing/signup wording still refers
  to an instant generated website; review it independently before launch.

## Required company decisions before making policies effective

1. The user supplied Foundly as the proposed legal name and the business address:
   801, C Wing, Phase 2, Shubhshree Residency, Near Akurdi Chowk, Pune, Maharashtra,
   India. Verify the name against the actual registered entity or proprietor and
   confirm whether this is the registered address. The proposed support and
   privacy mailboxes are `support@foundly.in` and `privacy@foundly.in`; the user
   explicitly made them subject to availability. Verify domain control, mailbox
   delivery, grievance contact name/designation and required business identifiers.
   `LegalContact` in `src/components/legal-page.tsx` labels these facts accordingly.
2. The user supplied the refund policy, now incorporated: requests within 7 days
   of purchase; possible approval for duplicate payments, billing errors or
   verified unresolved technical issues preventing service operation; exclusions
   for fully delivered/consumed services or terms violations; approved refunds
   to the original method within 5–10 business days subject to provider timelines;
   mandatory consumer law prevails. No unconditional seven-day refund guarantee
   is offered. Confirm provider cancellation/refund operations end to end.
3. The user selected Indian law and courts of competent jurisdiction in Pune,
   Maharashtra, subject to applicable law. These appear in the terms without an
   exclusive-forum provision overriding statutory remedies. Any liability cap,
   customer category (business/consumer), and custom work ownership/hosting terms
   remain to be confirmed.
4. Approve actual record retention by category, financial/legal retention,
   deletion processing deadlines, backup expiry and restoration handling. There
   is no implemented general 90-day observation purge. Confirm how legally held
   records interact with cascading account/workspace deletion.
5. Identify production database supplier, processing locations, subprocessors,
   contracts and international transfer safeguards. Verify each AI account's
   retention/training settings; the policy does not promise universal exclusions.
6. Confirm the working contact process for non-account holders, export/access
   requests, correction, erasure, complaints, consent withdrawal and incidents.
7. Review legal applicability and commencement with qualified local counsel;
   The user selected India/Pune jurisdiction; verify applicability to the actual
   operator and customers. Do not label this draft “DPDP/GDPR compliant”.
8. After review, remove draft/pending copy, set an actual effective date, revisit
   `robots` metadata, add both pages to the sitemap and implement any necessary
   versioned acceptance/consent flow. Merely adding links does not record assent.

## Privacy implementation evidence

Reviewed the database schema, public profile whitelist, password/session code,
monitoring adapters, AI completion, reports, website requests, Google/Facebook
token storage, weekly sync, notifications, billing webhooks, lifecycle jobs,
country selection and service worker. Persistent integration tokens are encrypted;
older comments in `connect.ts` saying tokens are never stored are stale. The
service worker caches only its offline page and icon, not account pages.

## Official legal background checked

- [MeitY: Digital Personal Data Protection Rules, 2025](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025%3B)
- [Government of India: notified rules and phased implementation](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190655&lang=2&reg=48)
- [Department of Consumer Affairs: Consumer Protection reporting and e-commerce disclosures](https://consumeraffairs.gov.in/public/upload/files/1617263115_AR2020-21_1733218509.pdf)

These are background sources, not a determination that any particular law or
commencement applies to this operator. Final review must check current amendments
and the company's actual operating countries.
