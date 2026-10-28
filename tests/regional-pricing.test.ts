import { describe, expect, it } from "vitest";
import { PAID_PLANS, planSpec, SALE_PLANS } from "../src/lib/plans";
import { checksDue } from "../src/server/monitoring/service";
import { countryFromHeaders, pricingCountryFor, formatRegionalPrice, PRICING_COUNTRIES, PRICING_MARKETS, regionalPrice, suggestPricingCountry } from "../src/lib/regional-pricing";

describe("regional monthly pricing", () => {
  it("uses fixed local prices and a USD fallback", () => {
    expect(regionalPrice("IN", "growth")).toBe(2999);
    expect(regionalPrice("GB", "growth")).toBe(35);
    expect(regionalPrice("DE", "growth")).toBe(45);
    expect(regionalPrice("BR", "growth")).toBe(45);
  });

  it("gives every selectable country a complete, ascending price ladder", () => {
    expect(new Set(PRICING_COUNTRIES.map(c => c.code)).size).toBe(PRICING_COUNTRIES.length);
    for (const country of PRICING_COUNTRIES) {
      const market = PRICING_MARKETS[country.market];
      expect(market.monthly.growth).toBeGreaterThan(0);
      for (let i = 1; i < SALE_PLANS.length; i++) {
        expect(market.monthly[SALE_PLANS[i]], `${country.code} ${SALE_PLANS[i]}`).toBeGreaterThan(market.monthly[SALE_PLANS[i - 1]]);
      }
      expect(formatRegionalPrice(market.monthly.agency, market)).not.toContain("NaN");
    }
  });

  it("suggests a region without mistaking a generic English locale for the US", () => {
    expect(suggestPricingCountry("Asia/Calcutta", ["en-US"])).toBe("IN");
    expect(suggestPricingCountry("America/Toronto", ["en-US"])).toBe("CA");
    expect(suggestPricingCountry("Australia/Perth", ["en-US"])).toBe("AU");
    expect(suggestPricingCountry("unknown", ["fr-FR"])).toBe("FR");
    expect(suggestPricingCountry("unknown", ["pt-BR"])).toBe("OTHER");
    expect(suggestPricingCountry("unknown", ["invalid_", "en"])).toBe("OTHER");
  });

  it("keeps a 90% margin when every included credit is used", () => {
    // Cost model from docs/product/regional-pricing.md, in USD. Rates are local units per USD.
    const costPerCredit = 0.045, fixedPerBusiness = 0.3, paymentFee = 0.045, indiaPaymentFee = 0.03;
    const usdRate: Record<string, number> = { INR: 88, USD: 1, GBP: 0.79, EUR: 0.92, CAD: 1.38, AUD: 1.52, NZD: 1.68, AED: 3.673, SGD: 1.34, ZAR: 18 };
    for (const [key, market] of Object.entries(PRICING_MARKETS)) {
      for (const plan of SALE_PLANS) {
        const spec = planSpec(plan);
        const revenue = market.monthly[plan] / usdRate[market.currency];
        const cost = spec.maxWorkspaces * (spec.monthlyCredits * costPerCredit + fixedPerBusiness) + revenue * (key === "IN" ? indiaPaymentFee : paymentFee);
        expect(1 - cost / revenue, `${key} ${plan}`).toBeGreaterThanOrEqual(0.9);
      }
    }
  });

  it("sizes credits from keywords, four AIs and the check schedule", () => {
    expect(planSpec("growth")).toMatchObject({ keywords: 5, checks: "biweekly", monthlyCredits: 45 });
    expect(planSpec("pro")).toMatchObject({ keywords: 10, checks: "weekly", monthlyCredits: 180 });
    expect(planSpec("agency")).toMatchObject({ keywords: 5, checks: "biweekly", monthlyCredits: 45, maxWorkspaces: 10 });
    // The old Website plan is off sale but still resolves for existing subscribers.
    expect(planSpec("website").retired).toBe(true);
    expect(PAID_PLANS).toContain("website");
    expect(SALE_PLANS).not.toContain("website");
  });

  it("runs daily plans every day, weekly plans on Mondays, biweekly on even weeks, and never manual-only plans", () => {
    const evenWeek = new Date("2026-10-26T06:00:00Z"); // 2026-W44
    const oddWeek = new Date("2026-10-19T06:00:00Z"); // 2026-W43
    const wednesday = new Date("2026-10-28T06:00:00Z");
    expect(checksDue("daily", wednesday)).toBe(true);
    expect(checksDue("weekly", oddWeek)).toBe(true);
    expect(checksDue("weekly", wednesday)).toBe(false);
    expect(checksDue("biweekly", evenWeek)).toBe(true);
    expect(checksDue("biweekly", oddWeek)).toBe(false);
    expect(checksDue(null, evenWeek)).toBe(false);
  });

  it("prices an extra keyword at a 90% margin on biweekly plans", () => {
    // One keyword's credits on each schedule, at the same cost model as above.
    const credits = { biweekly: 4 * 2.25, weekly: 4 * 4.5 };
    const usdRate: Record<string, number> = { INR: 88, USD: 1, GBP: 0.79, EUR: 0.92, CAD: 1.38, AUD: 1.52, NZD: 1.68, AED: 3.673, SGD: 1.34, ZAR: 18 };
    for (const [key, market] of Object.entries(PRICING_MARKETS)) {
      const revenue = market.extraKeyword / usdRate[market.currency];
      const fee = revenue * (key === "IN" ? 0.03 : 0.045);
      expect(1 - (credits.biweekly * 0.045 + fee) / revenue, `${key} biweekly`).toBeGreaterThanOrEqual(0.9);
      // On weekly plans (Pro) the add-on sits right at the line: ₹999 is 89.9% in India.
      expect(1 - (credits.weekly * 0.045 + fee) / revenue, `${key} weekly`).toBeGreaterThanOrEqual(0.895);
    }
  });

  it("reads the visitor's country from platform location headers", () => {
    expect(countryFromHeaders(new Headers({ "x-vercel-ip-country": "gb" }))).toBe("GB");
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "in" }))).toBe("IN");
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "XX" }))).toBeNull();
    expect(countryFromHeaders(new Headers())).toBeNull();
    expect(pricingCountryFor("DE")).toBe("DE");
    expect(pricingCountryFor("BR")).toBe("OTHER");
  });
});
