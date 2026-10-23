import { describe, expect, it } from "vitest";
import { planSpec } from "../src/lib/plans";
import { formatRegionalPrice, PRICING_COUNTRIES, PRICING_MARKETS, regionalPrice, suggestPricingCountry } from "../src/lib/regional-pricing";

describe("regional monthly pricing", () => {
  it("uses fixed local prices and a USD fallback", () => {
    expect(regionalPrice("IN", "growth")).toBe(4999);
    expect(regionalPrice("GB", "growth")).toBe(59);
    expect(regionalPrice("DE", "growth")).toBe(65);
    expect(regionalPrice("BR", "growth")).toBe(69);
    expect(regionalPrice("IN", "free")).toBe(0);
  });

  it("gives every selectable country a complete, ascending price ladder", () => {
    expect(new Set(PRICING_COUNTRIES.map(c => c.code)).size).toBe(PRICING_COUNTRIES.length);
    for (const country of PRICING_COUNTRIES) {
      const market = PRICING_MARKETS[country.market];
      expect(market.monthly.website).toBeGreaterThan(0);
      expect(market.monthly.growth).toBeGreaterThan(market.monthly.website);
      expect(market.monthly.agency).toBeGreaterThan(market.monthly.growth);
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
      for (const plan of ["website", "growth", "agency"] as const) {
        const spec = planSpec(plan);
        const revenue = market.monthly[plan] / usdRate[market.currency];
        const cost = spec.maxWorkspaces * (spec.monthlyCredits * costPerCredit + fixedPerBusiness) + revenue * (key === "IN" ? indiaPaymentFee : paymentFee);
        expect(1 - cost / revenue, `${key} ${plan}`).toBeGreaterThanOrEqual(0.9);
      }
    }
  });
});
