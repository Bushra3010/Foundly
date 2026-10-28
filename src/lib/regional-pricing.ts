import type { SalePlan } from "@/lib/plans";

export type PricingMarket = {
  currency: string;
  locale: string;
  monthly: Record<SalePlan, number>;
  /** Monthly price of one keyword added to any plan. */
  extraKeyword: number;
};

// India is priced in rupees; every other country pays the same numbers in US dollars.
export const PRICING_MARKETS = {
  IN: { currency: "INR", locale: "en-IN", monthly: { growth: 15000, pro: 20000, agency: 25000 }, extraKeyword: 999 },
  US: { currency: "USD", locale: "en-US", monthly: { growth: 15000, pro: 20000, agency: 25000 }, extraKeyword: 999 },
} satisfies Record<string, PricingMarket>;

export type MarketKey = keyof typeof PRICING_MARKETS;
export const PRICING_COUNTRIES = [
  { code: "IN", name: "India", market: "IN" },
  { code: "US", name: "United States", market: "US" },
  { code: "GB", name: "United Kingdom", market: "US" },
  { code: "CA", name: "Canada", market: "US" },
  { code: "AU", name: "Australia", market: "US" },
  { code: "NZ", name: "New Zealand", market: "US" },
  { code: "AE", name: "United Arab Emirates", market: "US" },
  { code: "SG", name: "Singapore", market: "US" },
  { code: "ZA", name: "South Africa", market: "US" },
  ...["AT", "BE", "BG", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES"].map(code => ({
    code, name: new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code, market: "US" as const,
  })),
  { code: "OTHER", name: "Other countries", market: "US" },
] satisfies { code: string; name: string; market: MarketKey }[];

export function pricingCountry(code: string | null | undefined) {
  return PRICING_COUNTRIES.find(country => country.code === code?.toUpperCase());
}

export function regionalPrice(countryCode: string, plan: SalePlan): number {
  const country = pricingCountry(countryCode);
  return PRICING_MARKETS[country?.market ?? "US"].monthly[plan];
}

export function formatRegionalPrice(amount: number, market: PricingMarket) {
  return new Intl.NumberFormat(market.locale, {
    style: "currency", currency: market.currency, maximumFractionDigits: 0,
  }).format(amount);
}

export const GEO_COUNTRY_COOKIE = "foundly-geo-country";

/**
 * The visitor's country from the hosting platform's IP location headers
 * (Vercel, or Cloudflare when it sits in front). Display only: never proof of a billing country.
 */
export function countryFromHeaders(headers: Headers): string | null {
  const code = (headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry"))?.trim().toUpperCase() ?? null;
  return code && /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : null;
}

/** Maps any ISO country code to a selectable pricing country; unsupported ones use "OTHER". */
export function pricingCountryFor(code: string) {
  return pricingCountry(code)?.code ?? "OTHER";
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
