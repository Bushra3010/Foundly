import { planSpec, SALE_PLANS } from "@/lib/plans";
import { PRICING_MARKETS } from "@/lib/regional-pricing";
import { SERVICE_CITIES, type ServiceCity } from "@/lib/locations";

/** Structured data for Foundly's own marketing pages, so search engines and AI assistants can describe the product correctly. */

export const SITE_NAME = "Foundly";
export const SITE_DESCRIPTION =
  "Foundly is an SEO, AEO and GEO agency and AI search visibility platform for local businesses, based in Pune, India. It checks whether ChatGPT, Gemini, Perplexity and Claude recommend your business, shows who they recommend instead, and tells you what to fix.";

export function siteUrl(path = ""): string {
  return `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}${path}`;
}

const orgId = () => siteUrl("/#organization");

const OFFICE_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "801, C Wing, Phase 2, Shubhshree Residency, Near Akurdi Chowk, Akurdi",
  addressLocality: "Pune",
  addressRegion: "Maharashtra",
  postalCode: "411035",
  addressCountry: "IN",
};

/** Company facts shown on the About page, in llms.txt and in structured data, so every source says the same thing. */
export const COMPANY = {
  founded: "2026",
  founders: ["Alok Kumar", "Bushra Khan"],
  telephone: "+91-7004054302",
  telephoneDisplay: "+91 70040 54302",
  /** WhatsApp number in wa.me format (country code, no plus). */
  whatsapp: "917004054302",
  email: "support@foundly.co.in",
  address: "801, C Wing, Phase 2, Shubhshree Residency, Near Akurdi Chowk, Akurdi, Pune, Maharashtra 411035, India",
  /** Foundly's own profiles on other sites. Keep in line with docs/listings-kit.md; add each new listing here once it is live. */
  profiles: [
    { name: "Clutch", url: "https://clutch.co/profile/foundly" },
    { name: "Crunchbase", url: "https://www.crunchbase.com/organization/foundly-d101" },
  ],
};
const TELEPHONE = COMPANY.telephone;

/** A WhatsApp chat link with a prefilled first message. */
export const whatsappLink = (text: string) => `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
const SAME_AS = COMPANY.profiles.map((p) => p.url);

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": orgId(),
    name: SITE_NAME,
    url: siteUrl("/"),
    logo: siteUrl("/icon-512.png"),
    description: SITE_DESCRIPTION,
    address: OFFICE_ADDRESS,
    email: COMPANY.email,
    telephone: TELEPHONE,
    foundingDate: COMPANY.founded,
    founder: COMPANY.founders.map((name) => ({ "@type": "Person", name })),
    numberOfEmployees: { "@type": "QuantitativeValue", value: 2 },
    sameAs: SAME_AS,
    areaServed: [{ "@type": "Country", name: "India" }, "Worldwide"],
    knowsAbout: ["Generative engine optimization", "Answer engine optimization", "AI search visibility", "Local SEO", "ChatGPT", "Gemini", "Perplexity", "Claude"],
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": siteUrl("/#website"),
    name: SITE_NAME,
    url: siteUrl("/"),
    publisher: { "@id": orgId() },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: siteUrl("/directory?q={search_term_string}") },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareLd() {
  return {
    "@type": "SoftwareApplication",
    "@id": siteUrl("/#software"),
    name: SITE_NAME,
    url: siteUrl("/"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    publisher: { "@id": orgId() },
    offers: [
      { "@type": "Offer", name: "Free", price: 0, priceCurrency: "INR", url: siteUrl("/signup") },
      ...SALE_PLANS.map((key) => ({
        "@type": "Offer",
        name: planSpec(key).name,
        price: PRICING_MARKETS.IN.monthly[key],
        priceCurrency: "INR",
        url: siteUrl("/pricing"),
        priceSpecification: { "@type": "UnitPriceSpecification", price: PRICING_MARKETS.IN.monthly[key], priceCurrency: "INR", unitCode: "MON", valueAddedTaxIncluded: false },
      })),
    ],
  };
}

/** The Pune office as a local business: the only place Foundly has a physical presence. */
export function officeLd() {
  return {
    "@type": "ProfessionalService",
    "@id": siteUrl("/services/pune#office"),
    name: "Foundly",
    url: siteUrl("/services/pune"),
    image: siteUrl("/icon-512.png"),
    description: "SEO, AEO and GEO agency in Pune helping businesses get recommended by ChatGPT, Gemini, Perplexity and Claude.",
    address: OFFICE_ADDRESS,
    email: "support@foundly.co.in",
    telephone: TELEPHONE,
    priceRange: "₹₹₹",
    parentOrganization: { "@id": orgId() },
  };
}

/** The SEO, AEO and GEO service, nationally or for one city. Cities without an office get areaServed only, never an address. */
export function serviceLd(opts: { name?: string; url?: string; city?: ServiceCity } = {}) {
  const { city } = opts;
  return {
    "@type": "Service",
    "@id": `${opts.url ?? siteUrl("/services")}#service`,
    name: opts.name ?? "SEO, AEO and GEO services",
    serviceType: ["Generative engine optimization", "Answer engine optimization", "Local SEO", "ChatGPT Ads management"],
    url: opts.url ?? siteUrl("/services"),
    provider: { "@id": orgId() },
    areaServed: city
      ? { "@type": "City", name: city.name, containedInPlace: { "@type": "Country", name: "India" } }
      : [...SERVICE_CITIES.map((c) => ({ "@type": "City", name: c.name })), { "@type": "Country", name: "India" }, "Worldwide"],
    offers: { "@type": "Offer", url: siteUrl("/pricing"), priceSpecification: { "@type": "UnitPriceSpecification", price: PRICING_MARKETS.IN.monthly.growth, priceCurrency: "INR", unitCode: "MON", valueAddedTaxIncluded: false } },
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: siteUrl(t.path) })),
  };
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
