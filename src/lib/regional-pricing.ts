import type { Plan } from "@/db/schema";

export type PaidPlan = Exclude<Plan, "free">;
export type PricingMarket = {
  currency: string;
  locale: string;
  monthly: Record<PaidPlan, number>;
};

// Fixed regional list prices, not exchange-rate conversions. Amounts are major currency units.
// Each price keeps a 90% margin at full credit use; see docs/product/regional-pricing.md.
export const PRICING_MARKETS = {
  IN: { currency: "INR", locale: "en-IN", monthly: { website: 799, growth: 4999, agency: 29999 } },
  US: { currency: "USD", locale: "en-US", monthly: { website: 15, growth: 69, agency: 399 } },
  GB: { currency: "GBP", locale: "en-GB", monthly: { website: 12, growth: 59, agency: 329 } },
  EU: { currency: "EUR", locale: "de-DE", monthly: { website: 15, growth: 65, agency: 379 } },
  CA: { currency: "CAD", locale: "en-CA", monthly: { website: 19, growth: 99, agency: 579 } },
  AU: { currency: "AUD", locale: "en-AU", monthly: { website: 25, growth: 109, agency: 629 } },
  NZ: { currency: "NZD", locale: "en-NZ", monthly: { website: 29, growth: 119, agency: 699 } },
  AE: { currency: "AED", locale: "en-AE", monthly: { website: 49, growth: 259, agency: 1499 } },
  SG: { currency: "SGD", locale: "en-SG", monthly: { website: 19, growth: 95, agency: 549 } },
  ZA: { currency: "ZAR", locale: "en-ZA", monthly: { website: 199, growth: 1299, agency: 7499 } },
} satisfies Record<string, PricingMarket>;

export type MarketKey = keyof typeof PRICING_MARKETS;
export const PRICING_COUNTRIES = [
  { code: "IN", name: "India", market: "IN" },
  { code: "US", name: "United States", market: "US" },
  { code: "GB", name: "United Kingdom", market: "GB" },
  { code: "CA", name: "Canada", market: "CA" },
  { code: "AU", name: "Australia", market: "AU" },
  { code: "NZ", name: "New Zealand", market: "NZ" },
  { code: "AE", name: "United Arab Emirates", market: "AE" },
  { code: "SG", name: "Singapore", market: "SG" },
  { code: "ZA", name: "South Africa", market: "ZA" },
  ...["AT", "BE", "BG", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES"].map(code => ({
    code, name: new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code, market: "EU" as const,
  })),
  { code: "OTHER", name: "Other countries", market: "US" },
] satisfies { code: string; name: string; market: MarketKey }[];

export function pricingCountry(code: string | null | undefined) {
  return PRICING_COUNTRIES.find(country => country.code === code?.toUpperCase());
}

export function regionalPrice(countryCode: string, plan: Plan): number {
  if (plan === "free") return 0;
  const country = pricingCountry(countryCode);
  return PRICING_MARKETS[country?.market ?? "US"].monthly[plan];
}

export function formatRegionalPrice(amount: number, market: PricingMarket) {
  return new Intl.NumberFormat(market.locale, {
    style: "currency", currency: market.currency, maximumFractionDigits: 0,
  }).format(amount);
}

// A device setting is a suggestion, never proof of a billing country.
export function suggestPricingCountry(timeZone: string, languages: readonly string[]): string {
  const zones: Record<string, string> = {
    "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Europe/London": "GB",
    "Asia/Dubai": "AE", "Asia/Singapore": "SG", "Pacific/Auckland": "NZ",
    "Africa/Johannesburg": "ZA", "America/Toronto": "CA", "America/Vancouver": "CA",
    "America/Edmonton": "CA", "America/Winnipeg": "CA", "America/Halifax": "CA",
    "America/St_Johns": "CA", "America/New_York": "US", "America/Chicago": "US",
    "America/Denver": "US", "America/Los_Angeles": "US", "Pacific/Honolulu": "US",
    "Europe/Paris": "FR", "Europe/Berlin": "DE", "Europe/Rome": "IT", "Europe/Madrid": "ES",
    "Europe/Amsterdam": "NL", "Europe/Dublin": "IE", "Europe/Lisbon": "PT",
  };
  if (zones[timeZone]) return zones[timeZone];
  if (timeZone.startsWith("Australia/")) return "AU";
  for (const language of languages) {
    try {
      const region = new Intl.Locale(language).region;
      if (region) return pricingCountry(region)?.code ?? "OTHER";
    } catch { /* Ignore malformed browser locale values. */ }
  }
  return "OTHER";
}
