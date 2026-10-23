import { discoveryFaq } from "@/lib/geo";
import type { Business } from "@/db/schema";
import { siteContent, type Block, type SiteContent, type SiteFacts } from "./content";

/**
 * Deterministic site generation from owner-confirmed facts.
 *
 * Every sentence is built from a fact the owner supplied. Nothing here may
 * invent experience, reviews, prices, credentials or guarantees; when a fact
 * is missing the related block is omitted and reported in `missing`.
 */

export type TemplateKey = SiteContent["templateKey"];

const TEMPLATE_KEYWORDS: Record<Exclude<TemplateKey, "service">, string[]> = {
  travel: ["tour", "travel", "trek", "holiday", "taxi", "cab", "hotel", "homestay", "guide"],
  professional: [
    "consult",
    "lawyer",
    "legal",
    "account",
    "ca ",
    "tax",
    "clinic",
    "doctor",
    "dentist",
    "therap",
    "architect",
    "agency",
    "tutor",
    "coach",
  ],
};

const THEMES: Record<TemplateKey, SiteContent["theme"]> = {
  // primary carries white text; accent carries dark text.
  service: { primary: "#1f3b33", accent: "#f2c94c" },
  travel: { primary: "#0e4a5a", accent: "#f6ad6b" },
  professional: { primary: "#23263a", accent: "#b9c6ff" },
};

export function chooseTemplate(category: string): TemplateKey {
  const c = ` ${category.toLowerCase()} `;
  for (const [key, words] of Object.entries(TEMPLATE_KEYWORDS)) {
    if (words.some((w) => c.includes(w))) return key as TemplateKey;
  }
  return "service";
}

export type MissingFact = { field: string; label: string; why: string };

export function missingOptionalFacts(b: Business): MissingFact[] {
  const missing: MissingFact[] = [];
  if (!b.description?.trim())
    missing.push({ field: "description", label: "Business description", why: "Adds an About section" });
  if (b.hours.length === 0)
    missing.push({ field: "hours", label: "Opening hours", why: "Shown on your Contact page" });
  if (b.serviceAreas.length === 0)
    missing.push({ field: "serviceAreas", label: "Service areas", why: "Tells customers where you work" });
  if (b.services.every((s) => !s.description?.trim()))
    missing.push({ field: "services", label: "Service descriptions", why: "Explains each service in your own words" });
  if (!b.bookingUrl) missing.push({ field: "bookingUrl", label: "Booking link", why: "Adds a Book now button" });
  return missing;
}

export function requiredFactsProblems(b: Business): string[] {
  const problems: string[] = [];
  if (!b.name.trim()) problems.push("Add your business name");
  if (!b.category.trim()) problems.push("Add your business category");
  if (!b.city.trim()) problems.push("Add your city");
  if (b.services.length === 0) problems.push("Add at least one service");
  if (!b.phone && !b.whatsapp && !b.email) problems.push("Add at least one public contact method");
  return problems;
}

export function factsFromBusiness(b: Business): SiteFacts {
  const opt = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined);
  return {
    name: b.name.trim(),
    category: b.category.trim(),
    city: b.city.trim(),
    region: opt(b.region),
    country: b.country,
    address: b.showAddress ? opt(b.address) : undefined,
    phone: opt(b.phone),
    whatsapp: opt(b.whatsapp),
    email: opt(b.email),
    bookingUrl: opt(b.bookingUrl),
    websiteUrl: opt(b.websiteUrl),
    hours: b.hours,
    serviceAreas: b.serviceAreas,
  };
}

function listToText(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function contactMethods(f: SiteFacts): string[] {
  const methods: string[] = [];
  if (f.phone) methods.push(`call ${f.phone}`);
  if (f.whatsapp) methods.push(`message us on WhatsApp at ${f.whatsapp}`);
  if (f.email) methods.push(`email ${f.email}`);
  return methods;
}

/** Builds one block from facts. Exported so a single section can be regenerated. */
export function buildBlock(type: Block["type"], b: Business, id: string): Block | null {
  const f = factsFromBusiness(b);
  const where = f.serviceAreas.length ? listToText(f.serviceAreas) : f.city;
  switch (type) {
    case "hero":
      return {
        id,
        type: "hero",
        heading: f.name,
        subheading: `${f.category} in ${f.city}${b.services.length ? ` — ${listToText(b.services.slice(0, 3).map((s) => s.name))}` : ""}.`,
        ctaLabel: f.bookingUrl ? "Book now" : "Get in touch",
      };
    case "services":
      if (b.services.length === 0) return null;
      return {
        id,
        type: "services",
        heading: "Services",
        items: b.services.map((s) => ({ name: s.name.trim(), description: s.description?.trim() ?? "" })),
      };
    case "about":
      if (!b.description?.trim()) return null;
      return { id, type: "about", heading: `About ${f.name}`, body: b.description.trim() };
    case "faq": {
      // Questions people ask AI assistants come first, answered from confirmed facts only.
      const items: { question: string; answer: string }[] = discoveryFaq({
        name: f.name,
        category: f.category,
        city: f.city,
        serviceAreas: f.serviceAreas,
        services: b.services,
      });
      items.push({
        question: `Which areas does ${f.name} serve?`,
        answer: `We serve ${where}.`,
      });
      if (b.services.length)
        items.push({
          question: "What services do you offer?",
          answer: `We offer ${listToText(b.services.map((s) => s.name.trim()))}.`,
        });
      const methods = contactMethods(f);
      if (methods.length)
        items.push({
          question: `How can I contact ${f.name}?`,
          answer: `You can ${listToText(methods)}${f.bookingUrl ? ", or book online" : ""}.`,
        });
      if (f.hours.length)
        items.push({
          question: "What are your opening hours?",
          answer: f.hours.map((h) => `${h.days}: ${h.hours}`).join("; ") + ".",
        });
      return { id, type: "faq", heading: "Common questions", items };
    }
    case "contact":
      return {
        id,
        type: "contact",
        heading: "Contact us",
        intro: `Get in touch with ${f.name} in ${f.city}.`,
        showForm: true,
      };
    case "text":
      return {
        id,
        type: "text",
        heading: "Privacy notice",
        body: [
          `When you send an enquiry through this website, ${f.name} receives the name, contact details and message you enter so that we can reply to you.`,
          "We use these details only to respond to your enquiry and to provide the service you ask about. We don't sell them.",
          `To ask what we hold about you, or to have it deleted, contact ${f.name}${f.email ? ` at ${f.email}` : f.phone ? ` on ${f.phone}` : ""}.`,
          "This website is hosted by our website provider, which stores enquiries on our behalf.",
        ].join("\n\n"),
      };
    case "gallery":
      return null;
  }
}

export function generateSite(b: Business): SiteContent {
  const templateKey = chooseTemplate(b.category);
  const f = factsFromBusiness(b);
  const block = (type: Block["type"], page: string) => buildBlock(type, b, `${page}-${type}`);
  const compact = (xs: (Block | null)[]) => xs.filter((x): x is Block => x !== null);

  const pages: SiteContent["pages"] = [
    {
      key: "home",
      title: "Home",
      blocks: compact([block("hero", "home"), block("services", "home"), block("faq", "home"), block("contact", "home")]),
    },
    { key: "services", title: "Services", blocks: compact([block("services", "services")]) },
    { key: "about", title: "About", blocks: compact([block("about", "about")]) },
    { key: "contact", title: "Contact", blocks: compact([block("contact", "contact")]) },
    // Owner-editable draft; review before publishing.
    { key: "privacy", title: "Privacy", blocks: compact([block("text", "privacy")]) },
  ];

  const content: SiteContent = {
    schemaVersion: 1,
    templateKey,
    theme: THEMES[templateKey],
    seo: {
      title: `${f.name} — ${f.category} in ${f.city}`.slice(0, 70),
      description: `${f.name}: ${f.category} in ${f.city}. ${b.services.length ? `Services: ${b.services.map((s) => s.name).join(", ")}.` : ""}`
        .trim()
        .slice(0, 170),
    },
    facts: f,
    pages: pages.filter((p) => p.blocks.length > 0),
  };

  // Validation step of the pipeline: generated output must satisfy the same schema as edits.
  return siteContent.parse(content);
}
