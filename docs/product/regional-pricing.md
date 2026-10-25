# Regional launch pricing

Plans are priced by GEO keywords. A keyword is one tracked question, such as "best dentist in Pune", checked on ChatGPT, Gemini, Perplexity and Claude. Three plans are on sale: Growth (5 keywords, checked every 2 weeks), Pro (10 keywords, checked every week) and Enterprise (stored as `agency`; up to ten businesses with 5 keywords each, checked every 2 weeks). The old Website plan (`website`, shown as Base) is retired. It is no longer sold, but existing subscriptions keep working.

Credits per month = keywords × 4 AIs × runs per month, where a weekly plan budgets 4.5 runs (enough for a month with 5 Mondays) and a biweekly plan budgets 2.25. That gives Growth 45, Pro 180 and Enterprise 45 per business. With billing enforced, tracked questions are capped at the plan's keywords, and biweekly plans run on even ISO weeks.

These are fixed local prices, not exchange-rate conversions. Each one keeps at least a 90% gross margin even when every credit is used. `tests/regional-pricing.test.ts` checks this.

| Market | Currency | Growth | Pro | Enterprise |
| --- | --- | ---: | ---: | ---: |
| India | INR | 2,999 | 10,999 | 29,999 |
| United States / other countries | USD | 45 | 159 | 449 |
| United Kingdom | GBP | 35 | 129 | 349 |
| Supported euro countries | EUR | 45 | 149 | 399 |
| Canada | CAD | 59 | 219 | 599 |
| Australia | AUD | 69 | 249 | 649 |
| New Zealand | NZD | 79 | 269 | 729 |
| United Arab Emirates | AED | 159 | 579 | 1,599 |
| Singapore | SGD | 59 | 209 | 589 |
| South Africa | ZAR | 799 | 2,799 | 7,999 |

Extra keywords can be added to any plan for a monthly price per keyword: ₹999, $15, £12, €15, C$22, A$25, NZ$27, AED 59, S$21 or R279. On biweekly plans (Growth, Enterprise) the cost is about ₹36 per keyword, a 93% margin. On Pro, which checks weekly, it is about ₹72, so ₹999 sits at 89.9%. Selling add-ons needs Razorpay subscription add-ons plus raising the keyword cap and credits for that workspace. The cards show the price, but buying an add-on is not built yet.

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

Worst case, India, with every credit used (₹4 per credit, ₹25 platform cost per business, 3% payment fee):

| Plan | Price | Credits | Total cost | Margin |
| --- | ---: | ---: | ---: | ---: |
| Growth | ₹2,999 | 45 | ₹295 | 90.2% |
| Pro | ₹10,999 | 180 | ₹1,075 | 90.2% |
| Enterprise | ₹29,999 | 450 | ₹2,950 | 90.2% |

The ₹25 platform cost assumes about 100 or more paying businesses sharing fixed hosting, database and email bills. With fewer customers, margins are lower. Support time, salaries and taxes are outside this model.

Before turning on `BILLING_ENFORCED`, record the real cost per successful observation (see the checklist in `docs/providers.md`). If it is above $0.045, raise prices or lower credits until the margin test passes again.

## Display and billing

The catalogue lives in `src/lib/regional-pricing.ts`. The country is picked automatically: the proxy reads the hosting platform's IP location header (`x-vercel-ip-country`, or `cf-ipcountry` when Cloudflare is in front) and stores it in the `foundly-geo-country` cookie for a day. The pricing cards use it, falling back to the device timezone and locale when no header is present. A manual choice overrides both and persists in local storage. Unsupported countries use USD. No third-party location service is called. Location is for display only; it never verifies billing eligibility.

Existing configured INR plan prices override the Indian catalogue on the landing page. Billing settings and the Razorpay adapter still use the existing server configuration, which has not been changed by this display update. Localized prices do not configure provider plans or enable multi-currency charging.

Before accepting payment, configure matching provider plans and server-side country/currency validation; never trust local storage or a client-submitted amount. Keep the provider price, billing screen and regional catalogue synchronized. Final tax treatment must be handled in checkout for the verified billing country.
