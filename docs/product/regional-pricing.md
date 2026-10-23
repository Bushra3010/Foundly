# Regional launch pricing

Fixed monthly list prices, before applicable taxes. Website covers one business, Growth covers one business with 75 monthly AI answer credits, and Agency covers up to ten businesses with 40 credits per business. These are fixed local prices, not live exchange-rate conversions. Each price keeps at least a 90% gross margin even when every included credit is used. `tests/regional-pricing.test.ts` checks this.

| Market | Currency | Website | Growth | Agency |
| --- | --- | ---: | ---: | ---: |
| India | INR | 799 | 4,999 | 29,999 |
| United States / other countries | USD | 15 | 69 | 399 |
| United Kingdom | GBP | 12 | 59 | 329 |
| Supported euro countries | EUR | 15 | 65 | 379 |
| Canada | CAD | 19 | 99 | 579 |
| Australia | AUD | 25 | 109 | 629 |
| New Zealand | NZD | 29 | 119 | 699 |
| United Arab Emirates | AED | 49 | 259 | 1,499 |
| Singapore | SGD | 19 | 95 | 549 |
| South Africa | ZAR | 199 | 1,299 | 7,499 |

## Cost model (90% margin)

One credit is one search-grounded answer from one AI. Website generation is template based and makes no AI calls, so AI checks are the only cost that grows with usage. Per-credit estimates use public list prices (October 2026) and cheap, search-capable models:

| Source | Model | Estimated cost per answer |
| --- | --- | ---: |
| Claude | Haiku tier, web search (2–3 searches at $10/1,000) | ~$0.063 |
| ChatGPT | Reasoning mini model, web search ($10/1,000 calls) | ~$0.040 |
| Gemini | Gemini 3 Flash, Google Search grounding ($14/1,000 searches) | ~$0.033 |
| Perplexity | Sonar, medium context ($8/1,000 requests) | ~$0.009 |

The average is about $0.036 per credit. The model budgets $0.045 (₹4) to cover failed calls, which still cost Foundly but are never charged to the owner. Opus-tier Claude costs about $0.20 per answer and would break the margin, so `CLAUDE_MONITOR_MODEL` defaults to `claude-haiku-5-5`.

Other costs per business per month: hosting, database, storage and email together come to about $0.30 (₹25). Razorpay fees are 2% + 18% GST in India (budgeted at 3%) and about 3% + GST + FX on international cards (budgeted at 4.5%).

Worst case, India, with every credit used:

| Plan | Price | Credits | Infra | Payment | Total cost | Margin |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Website | ₹799 | — | ₹25 | ₹24 | ₹49 | 93.9% |
| Growth | ₹4,999 | ₹300 | ₹25 | ₹150 | ₹475 | 90.5% |
| Agency | ₹29,999 | ₹1,600 | ₹250 | ₹900 | ₹2,750 | 90.8% |

75 credits is enough to check 4 questions on all 4 AIs every week. To add allowance, sell top-up credit packs at ₹40 or more per 10 credits rather than raising plan credits. Support time, salaries and taxes are outside this model.

Before turning on `BILLING_ENFORCED`, record the real cost per successful observation (see the checklist in `docs/providers.md`). If it is above $0.045, raise prices or lower credits until the margin test passes again.

## Display and billing

The catalogue lives in `src/lib/regional-pricing.ts`. Device timezone / locale suggests a country; it does not verify location or billing eligibility. A manual choice overrides the suggestion and persists in local storage. Unsupported countries use USD. No IP lookup or third-party location service is used.

Existing configured INR plan prices override the Indian catalogue on the landing page. Billing settings and the Razorpay adapter still use the existing server configuration, which has not been changed by this display update. Localized prices do not configure provider plans or enable multi-currency charging.

Before accepting payment, configure matching provider plans and server-side country/currency validation; never trust local storage or a client-submitted amount. Keep the provider price, billing screen and regional catalogue synchronized. Final tax treatment must be handled in checkout for the verified billing country.
