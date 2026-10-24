/**
 * Generative Engine Optimisation (GEO): making each business easy for AI
 * assistants and AI search to find, understand and cite.
 *
 * Everything here is built only from facts the owner confirmed. No ratings,
 * rankings, awards, prices or "best" claims are ever generated.
 */
import type { PublicProfile } from "./profile";

/** Crawlers used by AI assistants and AI search. They are welcome on public pages. */
export const AI_CRAWLERS = [
  "GPTBot", // OpenAI training
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT browsing on a user's behalf
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended", // Gemini
  "Applebot-Extended", // Apple Intelligence
  "Bingbot", // powers Copilot and ChatGPT search results
  "Amazonbot",
  "meta-externalagent",
  "CCBot",
] as const;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** "Interior designer" -> "Interior designers" for list headings. Conservative on purpose. */
export function pluralCategory(category: string): string {
  const c = category.trim();
  if (!c) return "Businesses";
  if (/(s|services|care|work|repair|cleaning|consulting|tutoring|coaching)$/i.test(c)) return c;
  if (/[^aeiou]y$/i.test(c)) return c.slice(0, -1) + "ies";
  if (/(ch|sh|x|z)$/i.test(c)) return c + "es";
  return c + "s";
}

/** "a plumber", "an interior designer". */
export function withArticle(noun: string): string {
  const n = noun.trim();
  return /^[aeiou]/i.test(n) ? `an ${n}` : `a ${n}`;
}

export function titleCase(s: string): string {
  return s.replace(/\b\p{L}/gu, (m) => m.toUpperCase());
}

type Faq = { question: string; answer: string };

/** Where AI assistants look for corroboration. Order matters: it is the suggested order for owners. */
export const LISTING_SITES = [
  { key: "google", label: "Google Business Profile", match: /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|g\.page|business\.google|share\.google)/i, create: "https://business.google.com/create", why: "Gemini and Google's AI answers read it first for local businesses" },
  { key: "justdial", label: "Justdial", match: /justdial\.com/i, create: "https://www.justdial.com/free-listing", why: "Appears in over half of Indian AI answers about local businesses, and has its own ChatGPT plugin" },
  { key: "bing", label: "Bing Places", match: /bingplaces\.com|bing\.com\/maps/i, create: "https://www.bingplaces.com", why: "Bing's index feeds ChatGPT search and Copilot" },
  { key: "instagram", label: "Instagram", match: /instagram\.com/i, create: "https://www.instagram.com", why: "Shows your work and confirms you are active" },
  { key: "facebook", label: "Facebook", match: /facebook\.com|fb\.com/i, create: "https://www.facebook.com/pages/create", why: "Another source with the same name, phone and address" },
  { key: "youtube", label: "YouTube", match: /youtube\.com|youtu\.be/i, create: "https://www.youtube.com/create_channel", why: "Google's AI answers cite YouTube often; even one short video of your work helps" },
  { key: "sulekha", label: "Sulekha", match: /sulekha\.com/i, create: "https://www.sulekha.com", why: "Widely read for service businesses in India" },
  { key: "indiamart", label: "IndiaMART", match: /indiamart\.com/i, create: "https://seller.indiamart.com", why: "Widely crawled business listings" },
  { key: "linkedin", label: "LinkedIn", match: /linkedin\.com/i, create: "https://www.linkedin.com/company/setup/new/", why: "Confirms the business and its people" },
] as const;

export type ListingSiteKey = (typeof LISTING_SITES)[number]["key"];

export function listingLabel(url: string): string {
  const site = LISTING_SITES.find((l) => l.match.test(url));
  if (site) return site.label;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function listingStatus(listings: string[]) {
  return LISTING_SITES.map((site) => ({ ...site, url: listings.find((u) => site.match.test(u)) ?? null }));
}

type EntityFacts = {
  name: string;
  category: string;
  city: string;
  serviceAreas: string[];
  foundedYear?: number;
  teamSize?: number;
  projectsCompleted?: number;
  credentials?: string;
};

/**
 * The one sentence an AI assistant would quote: who, what, where, since when,
 * how much experience. Only confirmed facts; every clause is optional.
 */
export function entitySentence(f: EntityFacts): string {
  const areas = f.serviceAreas.filter((a) => a.trim().toLowerCase() !== f.city.trim().toLowerCase()).slice(0, 5);
  let out = `${f.name} is ${withArticle(f.category.toLowerCase())} in ${f.city}`;
  if (areas.length) out += `, serving ${listToText(areas)}`;
  out += ".";
  const proof: string[] = [];
  if (f.foundedYear) proof.push(`in business since ${f.foundedYear}`);
  if (f.projectsCompleted) proof.push(`${f.projectsCompleted.toLocaleString("en-IN")}+ projects completed`);
  if (f.teamSize) proof.push(`a team of ${f.teamSize}`);
  if (proof.length) out += ` ${titleCase(proof[0].charAt(0)) + proof[0].slice(1)}${proof.length > 1 ? `, ${listToText(proof.slice(1))}` : ""}.`;
  if (f.credentials) out += ` ${f.credentials.trim().replace(/\.$/, "")}.`;
  return out;
}

export function listToText(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

type BusinessForLd = Pick<
  PublicProfile,
  "name" | "category" | "city" | "region" | "country" | "address" | "phone" | "whatsapp" | "email" | "hours" | "serviceAreas" | "services"
> & {
  description?: string;
  url?: string;
  profileUrl?: string;
  bookingUrl?: string;
  sameAs?: string[];
  foundedYear?: number;
  teamSize?: number;
  projectsCompleted?: number;
  credentials?: string;
  listings?: string[];
  /** When the owner last confirmed or published these details. */
  dateModified?: Date | string;
};

/**
 * schema.org graph for a business: LocalBusiness with its services, areas and
 * contact points, plus an FAQPage when the site has questions and answers.
 * AI search engines read this to understand who the business is and what it does.
 */
export function businessGraph(b: BusinessForLd, faq: Faq[] = []) {
  const id = `${b.url ?? b.profileUrl ?? ""}#business`;
  const business: Record<string, unknown> = {
    "@type": "LocalBusiness",
    "@id": id,
    name: b.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: b.city,
      ...(b.region ? { addressRegion: b.region } : {}),
      addressCountry: b.country,
      ...(b.address ? { streetAddress: b.address } : {}),
    },
  };
  if (b.category) business.additionalType = b.category;
  // A quotable summary first, then the owner's own words.
  business.description = [entitySentence(b), b.description].filter(Boolean).join(" ");
  if (b.foundedYear) business.foundingDate = String(b.foundedYear);
  if (b.teamSize) business.numberOfEmployees = { "@type": "QuantitativeValue", value: b.teamSize };
  if (b.credentials) business.award = b.credentials;
  if (b.url) business.url = b.url;
  if (b.phone) business.telephone = b.phone;
  if (b.email) business.email = b.email;
  const sameAs = [...(b.listings ?? []), ...(b.sameAs ?? []), ...(b.profileUrl && b.profileUrl !== b.url ? [b.profileUrl] : [])].filter(Boolean);
  if (sameAs.length) business.sameAs = Array.from(new Set(sameAs));
  const areas = b.serviceAreas.length ? b.serviceAreas : [b.city];
  business.areaServed = areas.map((name) => ({ "@type": "Place", name }));
  if (b.hours.length) business.openingHours = b.hours.map((h) => `${h.days} ${h.hours}`);
  if (b.services.length) {
    business.knowsAbout = b.services.map((s) => s.name);
    business.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: `${b.name} services`,
      itemListElement: b.services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          ...(s.description ? { description: s.description } : {}),
          areaServed: areas.map((name) => ({ "@type": "Place", name })),
          provider: { "@id": id },
        },
      })),
    };
  }
  const contactPoints: Record<string, unknown>[] = [];
  if (b.phone) contactPoints.push({ "@type": "ContactPoint", telephone: b.phone, contactType: "customer service" });
  if (b.whatsapp && b.whatsapp !== b.phone)
    contactPoints.push({ "@type": "ContactPoint", telephone: b.whatsapp, contactType: "customer service", contactOption: "WhatsApp" });
  if (contactPoints.length) business.contactPoint = contactPoints;
  if (b.bookingUrl)
    business.potentialAction = { "@type": "ReserveAction", target: b.bookingUrl, name: `Book with ${b.name}` };

  const graph: Record<string, unknown>[] = [business];
  if (b.url && b.dateModified) {
    const when = typeof b.dateModified === "string" ? b.dateModified : b.dateModified.toISOString();
    graph.push({ "@type": "WebPage", "@id": `${b.url}#page`, url: b.url, about: { "@id": id }, dateModified: when, isPartOf: { "@type": "WebSite", url: b.url, name: b.name } });
  }
  if (faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/**
 * Plain-markdown fact sheet (llms.txt style). Language models read this more
 * reliably than a designed page, and it gives them exact wording to quote.
 */
export function businessLlmsText(
  p: Pick<PublicProfile, "name" | "category" | "city" | "region" | "address" | "phone" | "whatsapp" | "email" | "hours" | "serviceAreas" | "services" | "updatedAt"> & {
    description?: string;
    bookingUrl?: string;
    foundedYear?: number;
    teamSize?: number;
    projectsCompleted?: number;
    credentials?: string;
    listings?: string[];
  },
  links: { website?: string; profile?: string },
  faq: Faq[] = [],
): string {
  const lines: string[] = [];
  const place = [p.city, p.region].filter(Boolean).join(", ");
  lines.push(`# ${p.name}`, "");
  lines.push(`> ${entitySentence(p)}${p.description ? ` ${p.description.split("\n")[0].trim()}` : ""}`, "");
  lines.push("## Facts", "");
  lines.push(`- Business: ${p.name}`);
  lines.push(`- Type: ${p.category}`);
  lines.push(`- Location: ${[p.address, place].filter(Boolean).join(", ")}`);
  if (p.serviceAreas.length) lines.push(`- Areas served: ${p.serviceAreas.join(", ")}`);
  if (p.phone) lines.push(`- Phone: ${p.phone}`);
  if (p.whatsapp) lines.push(`- WhatsApp: ${p.whatsapp}`);
  if (p.email) lines.push(`- Email: ${p.email}`);
  if (p.bookingUrl) lines.push(`- Book online: ${p.bookingUrl}`);
  if (p.hours.length) lines.push(`- Opening hours: ${p.hours.map((h) => `${h.days} ${h.hours}`).join("; ")}`);
  if (p.foundedYear) lines.push(`- In business since: ${p.foundedYear}`);
  if (p.projectsCompleted) lines.push(`- Projects completed: ${p.projectsCompleted.toLocaleString("en-IN")}+`);
  if (p.teamSize) lines.push(`- Team size: ${p.teamSize}`);
  if (p.credentials) lines.push(`- Credentials: ${p.credentials}`);
  if (p.listings?.length) lines.push(`- Also listed on: ${p.listings.map((u) => `${listingLabel(u)} (${u})`).join(", ")}`);
  lines.push(`- Details confirmed by the owner, last updated ${p.updatedAt.slice(0, 10)}`);
  if (p.services.length) {
    lines.push("", "## Services", "");
    for (const s of p.services) lines.push(`- ${s.name}${s.description ? `: ${s.description}` : ""}`);
  }
  if (p.description) lines.push("", "## About", "", p.description.trim());
  if (faq.length) {
    lines.push("", "## Questions and answers", "");
    for (const q of faq) lines.push(`### ${q.question}`, "", q.answer, "");
  }
  lines.push("", "## Links", "");
  if (links.website) lines.push(`- [Website](${links.website})`);
  if (links.profile) lines.push(`- [Business profile](${links.profile})`);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/**
 * Questions people actually type into AI assistants, answered only with the
 * owner's confirmed facts. Used on the website's FAQ.
 */
export function discoveryFaq(f: EntityFacts & { services: { name: string; description?: string }[] }): Faq[] {
  const out: Faq[] = [];
  const areas = f.serviceAreas.length ? ` across ${f.serviceAreas.slice(0, 4).join(", ")}` : "";
  const proof = [
    f.foundedYear ? `in business since ${f.foundedYear}` : "",
    f.projectsCompleted ? `${f.projectsCompleted.toLocaleString("en-IN")}+ projects completed` : "",
  ].filter(Boolean);
  const proofText = proof.length ? ` ${titleCase(proof[0].charAt(0)) + proof[0].slice(1)}${proof[1] ? `, ${proof[1]}` : ""}.` : "";
  for (const s of f.services.slice(0, 2)) {
    const service = s.name.trim();
    out.push({
      question: `Who offers ${service.toLowerCase()} in ${f.city}?`,
      answer: `${f.name} offers ${service.toLowerCase()} in ${f.city}${areas}.${s.description ? ` ${s.description.trim()}` : ""}`,
    });
  }
  if (f.category) {
    out.push({
      question: `Is ${f.name} ${withArticle(f.category.toLowerCase())} in ${f.city}?`,
      answer: `Yes. ${f.name} is ${withArticle(f.category.toLowerCase())} based in ${f.city}${areas}.${proofText}`,
    });
  }
  if (f.foundedYear || f.projectsCompleted || f.teamSize) {
    const bits = [
      f.foundedYear ? `${f.name} has been in business since ${f.foundedYear}` : `${f.name} is based in ${f.city}`,
      f.projectsCompleted ? `has completed ${f.projectsCompleted.toLocaleString("en-IN")}+ projects` : "",
      f.teamSize ? `works as a team of ${f.teamSize}` : "",
    ].filter(Boolean);
    out.push({ question: `How experienced is ${f.name}?`, answer: `${listToText(bits)}.${f.credentials ? ` ${f.credentials.trim().replace(/\.$/, "")}.` : ""}` });
  }
  return out;
}

/** Questions people ask AI about one service, answered from confirmed facts. */
export function serviceFaq(
  f: EntityFacts & { phone?: string; whatsapp?: string; email?: string; bookingUrl?: string; hours: { days: string; hours: string }[] },
  service: { name: string; description?: string },
): Faq[] {
  const name = service.name.trim();
  const lower = name.toLowerCase();
  const areas = f.serviceAreas.length ? listToText(f.serviceAreas.slice(0, 5)) : f.city;
  const out: Faq[] = [
    {
      question: `Who offers ${lower} in ${f.city}?`,
      answer: `${f.name} offers ${lower} in ${f.city}, serving ${areas}.${service.description ? ` ${service.description.trim().replace(/\.$/, "")}.` : ""}`,
    },
    { question: `Which areas does ${f.name} cover for ${lower}?`, answer: `${f.name} provides ${lower} across ${areas}.` },
  ];
  const ways = [
    f.bookingUrl ? "book online" : "",
    f.phone ? `call ${f.phone}` : "",
    f.whatsapp ? `message ${f.whatsapp} on WhatsApp` : "",
    f.email ? `email ${f.email}` : "",
  ].filter(Boolean);
  if (ways.length) out.push({ question: `How do I book ${lower} with ${f.name}?`, answer: `You can ${listToText(ways)}.${f.hours[0] ? ` Hours: ${f.hours.map((h) => `${h.days} ${h.hours}`).join(", ")}.` : ""}` });
  if (f.foundedYear || f.projectsCompleted) {
    out.push({
      question: `How experienced is ${f.name} in ${lower}?`,
      answer: `${f.name} has been in business${f.foundedYear ? ` since ${f.foundedYear}` : ""}${f.projectsCompleted ? ` and has completed ${f.projectsCompleted.toLocaleString("en-IN")}+ projects` : ""}.${f.credentials ? ` ${f.credentials.trim().replace(/\.$/, "")}.` : ""}`,
    });
  }
  return out;
}

export type ReadinessItem = { key: string; label: string; why: string; done: boolean; href: string };

/** How ready a business is to be found and cited by AI assistants, with next steps. */
export function geoReadiness(input: {
  /** When the owner last confirmed the details are correct. */
  confirmedAt?: Date | null;
  foundedYear?: number | null;
  projectsCompleted?: number | null;
  listings?: string[];
  description?: string | null;
  services: { name: string; description?: string }[];
  serviceAreas: string[];
  hours: unknown[];
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  /** The business has its own website connected to Foundly. */
  websiteConnected: boolean;
  /** Our latest check of the connected website, if it has been checked. */
  websiteCheck?: { passed: number; total: number } | null;
  profilePublished: boolean;
  verified: boolean;
}) {
  const items: ReadinessItem[] = [
    {
      key: "description",
      label: "Describe your business in your own words",
      why: "AI answers quote clear, specific descriptions",
      done: (input.description?.trim().length ?? 0) >= 80,
      href: "/app/business",
    },
    {
      key: "services",
      label: "Explain each service",
      why: "Lets AI match you to the exact service people ask about",
      done: input.services.length > 0 && input.services.every((s) => (s.description?.trim().length ?? 0) >= 20),
      href: "/app/business",
    },
    {
      key: "areas",
      label: "List the areas you serve",
      why: "Most AI questions name a city or neighbourhood",
      done: input.serviceAreas.length > 0,
      href: "/app/business",
    },
    {
      key: "hours",
      label: "Add opening hours",
      why: "AI assistants answer “is it open now?” from this",
      done: input.hours.length > 0,
      href: "/app/business",
    },
    {
      key: "contact",
      label: "Give a phone or WhatsApp number",
      why: "AI answers show a way to reach you",
      done: Boolean(input.phone || input.whatsapp),
      href: "/app/business",
    },
    {
      key: "proof",
      label: "Add your start year and projects completed",
      why: "AI answers favour businesses that state specifics",
      done: Boolean(input.foundedYear || input.projectsCompleted),
      href: "/app/business#proof",
    },
    {
      key: "google",
      label: "Link your Google Business Profile",
      why: "Gemini and Google read it first for local businesses",
      done: (input.listings ?? []).some((u) => LISTING_SITES[0].match.test(u)),
      href: "/app/presence",
    },
    {
      key: "listings",
      label: "Be listed in 2 more places with the same details",
      why: "AI trusts facts it sees on several sites",
      done: (input.listings ?? []).filter((u) => !LISTING_SITES[0].match.test(u)).length >= 2,
      href: "/app/presence",
    },
    {
      key: "site",
      label: "Connect your website",
      why: "Gives AI a page of yours to read and cite",
      done: input.websiteConnected,
      href: "/app/website",
    },
    {
      key: "confirmed",
      label: "Confirm your details every month",
      why: "Content confirmed in the last 30 days is cited about 3× more often",
      done: Boolean(input.confirmedAt && Date.now() - new Date(input.confirmedAt).getTime() < 30 * 86_400_000),
      href: "/app",
    },
    {
      key: "profile",
      label: "Publish your directory profile",
      why: "Lists you on Foundly’s city and category pages that AI reads",
      done: input.profilePublished,
      href: "/app/business",
    },
    {
      key: "verified",
      label: "Verify you own the business",
      why: "Verified details are more trustworthy to cite",
      done: input.verified,
      href: "/app/business",
    },
  ];
  // The website itself counts for half: what our check of the connected site found.
  const check = input.websiteConnected && input.websiteCheck && input.websiteCheck.total > 0 ? input.websiteCheck : null;
  items.splice(items.findIndex((i) => i.key === "site") + 1, 0, {
    key: "site_check",
    label: !input.websiteConnected ? "Get your website checked" : check ? `Fix what our website check found (${check.passed} of ${check.total} pass)` : "Check your website",
    why: "AI assistants can only cite what they can read on your site",
    done: !!check && check.passed === check.total,
    href: input.websiteConnected ? "/app/improve" : "/app/website",
  });
  const done = items.filter((i) => i.done).length;
  const details = items.filter((i) => i.key !== "site_check");
  const detailsScore = Math.round((details.filter((i) => i.done).length / details.length) * 50);
  const websiteScore = check ? Math.round((check.passed / check.total) * 50) : 0;
  const confirmedDaysAgo = input.confirmedAt ? Math.floor((Date.now() - new Date(input.confirmedAt).getTime()) / 86_400_000) : null;
  return { score: detailsScore + websiteScore, detailsScore, websiteScore, websiteChecked: !!check, websiteCheck: check, done, total: items.length, items, confirmedDaysAgo };
}
