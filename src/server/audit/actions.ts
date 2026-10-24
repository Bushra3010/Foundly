import type { Business } from "@/db/schema";
import { toPublicProfile } from "@/lib/profile";
import { businessGraph, discoveryFaq, listToText } from "@/lib/geo";
import type { CheckResult } from "./checks";

/**
 * Turns failed checks into owner tasks. Drafts are built only from the
 * owner's confirmed facts; where a fact is missing the draft asks the owner
 * to write it rather than inventing it. Benefits are stated as hypotheses.
 */

export type ApplyKind = "manual" | "wordpress_append";

/** Tasks for websites Foundly used to host. Those websites are retired, so these can't be applied. */
export const isHostedKind = (k: string) => k.startsWith("hosted_");

export type ActionTemplate = {
  title: string;
  hypothesis: string;
  proposedChange: string;
  draft: string;
  applyKind: ApplyKind;
  /** Higher first: user impact minus effort. */
  priority: number;
};

const SEVERITY_WEIGHT = { high: 30, medium: 20, low: 10 } as const;

/** Questions people ask AI assistants, answered from confirmed facts only. */
function faqDraft(b: Business): string {
  const f = toPublicProfile(b);
  const items = discoveryFaq({ ...f, services: b.services });
  items.push({ question: `Which areas does ${f.name} serve?`, answer: `We serve ${f.serviceAreas.length ? listToText(f.serviceAreas) : f.city}.` });
  if (b.services.length) items.push({ question: "What services do you offer?", answer: `We offer ${listToText(b.services.map((s) => s.name.trim()))}.` });
  const methods = [f.phone && `call ${f.phone}`, f.whatsapp && `message us on WhatsApp at ${f.whatsapp}`, f.email && `email ${f.email}`].filter((m): m is string => !!m);
  if (methods.length) items.push({ question: `How can I contact ${f.name}?`, answer: `You can ${listToText(methods)}${f.bookingUrl ? ", or book online" : ""}.` });
  if (f.hours.length) items.push({ question: "What are your opening hours?", answer: f.hours.map((h) => `${h.days}: ${h.hours}`).join("; ") + "." });
  return items.map((i) => `Q: ${i.question}\nA: ${i.answer}`).join("\n\n");
}

export function templateFor(check: CheckResult, b: Business): ActionTemplate | null {
  const base = SEVERITY_WEIGHT[check.severity];
  const facts = toPublicProfile(b);
  switch (check.checkKey) {
    case "http_status":
      return { title: "Fix your homepage so it loads", hypothesis: "Visitors and search tools can't read a page that doesn't load.", proposedChange: "Ask your web host why the homepage returns an error and fix it.", draft: check.evidence, applyKind: "manual", priority: base + 9 };
    case "https":
      return { title: "Serve your site over HTTPS", hypothesis: "Browsers warn visitors about insecure pages, which may reduce trust.", proposedChange: "Turn on a free TLS certificate with your host and redirect http to https.", draft: "", applyKind: "manual", priority: base + 6 };
    case "indexable":
      return { title: "Allow search engines to index your homepage", hypothesis: "A noindex directive asks search engines to leave the page out of results.", proposedChange: "Remove the noindex robots meta tag or X-Robots-Tag header from the homepage.", draft: check.evidence, applyKind: "manual", priority: base + 9 };
    case "robots_allows":
      return { title: "Stop robots.txt from blocking your site", hypothesis: "Crawlers that respect robots.txt can't read blocked pages.", proposedChange: "Edit robots.txt so it doesn't disallow “/” for all user agents.", draft: "User-agent: *\nAllow: /", applyKind: "manual", priority: base + 8 };
    case "sitemap":
      return { title: "Publish a sitemap", hypothesis: "A sitemap helps crawlers find all your pages.", proposedChange: "Add /sitemap.xml (most website builders can generate one) and list it in robots.txt.", draft: "", applyKind: "manual", priority: base };
    case "canonical":
      return { title: "Add a canonical link", hypothesis: "A canonical link tells search tools which address is the main one.", proposedChange: "Add <link rel=\"canonical\"> to the homepage <head>.", draft: "", applyKind: "manual", priority: base - 2 };
    case "rendering":
      return { title: "Make your main text readable without JavaScript", hypothesis: "Some crawlers and AI tools read only the HTML that's sent, not what scripts add later.", proposedChange: "Ask your developer to render the main content on the server.", draft: "", applyKind: "manual", priority: base + 3 };
    case "title":
      return { title: "Write a clear page title", hypothesis: "A specific title helps people and search tools understand the page.", proposedChange: "Set the homepage title to name your business, service and city.", draft: `${b.name} — ${b.category} in ${b.city}`.slice(0, 70), applyKind: "manual", priority: base + 2 };
    case "meta_description": {
      const draft = `${b.name}: ${b.category} in ${b.city}. ${b.services.slice(0, 4).map((s) => s.name).join(", ")}.`.slice(0, 170);
      return { title: "Write a search description", hypothesis: "A clear description may improve how your page appears in results.", proposedChange: "Add a meta description to the homepage.", draft, applyKind: "manual", priority: base + 1 };
    }
    case "h1":
      return { title: "Use one main heading", hypothesis: "One clear H1 makes the page's topic obvious.", proposedChange: "Keep exactly one H1 on the homepage, naming what you do.", draft: `${b.category} in ${b.city} — ${b.name}`, applyKind: "manual", priority: base - 3 };
    case "nap_name":
    case "nap_phone":
    case "nap_whatsapp":
    case "nap_city":
      return { title: "Show your business details consistently", hypothesis: "Matching name, phone and location everywhere helps people and tools confirm they've found the right business.", proposedChange: "Add these confirmed details to your website, for example in the footer.", draft: [facts.name, facts.phone && `Phone: ${facts.phone}`, facts.whatsapp && `WhatsApp: ${facts.whatsapp}`, facts.city].filter(Boolean).join("\n"), applyKind: "manual", priority: base + 4 };
    case "service_coverage":
      return { title: "Describe every service you offer", hypothesis: "Customers can only find services your site actually describes.", proposedChange: "Add a short section for each missing service, in your own words.", draft: b.services.map((s) => `${s.name}: ${s.description ?? "[Describe what's included, who it's for and the area you cover]"}`).join("\n"), applyKind: "manual", priority: base + 5 };
    case "service_descriptions":
      return { title: "Explain each service", hypothesis: "Specific descriptions answer customers' questions before they call.", proposedChange: "Add a description for each service. Replace every [bracket] with your own words before approving.", draft: b.services.map((s) => `${s.name}: ${s.description ?? "[What's included, who it's for, typical timing]"}`).join("\n"), applyKind: "manual", priority: base + 5 };
    case "structured_data":
    case "structured_data_agrees":
      return { title: "Add accurate structured data", hypothesis: "Structured data that matches the page may help search tools read your details correctly.", proposedChange: "Add this JSON-LD to your homepage <head>. It contains only details you confirmed.", draft: `<script type="application/ld+json">\n${JSON.stringify(businessGraph({ ...facts, url: b.websiteUrl ?? undefined }), null, 2)}\n</script>`, applyKind: "manual", priority: base };
    case "faq":
      return { title: "Answer common customer questions", hypothesis: "Clear answers to real questions make your page more useful to customers and to tools that summarise it.", proposedChange: "Add a questions-and-answers section with these answers.", draft: faqDraft(b), applyKind: "manual", priority: base + 3 };
    case "about":
      return { title: "Tell customers who you are", hypothesis: "A short, honest background helps customers trust who they're contacting.", proposedChange: "Write a few sentences about your business. We won't write this for you, so the facts stay yours.", draft: b.description ?? "[Who runs the business, since when, and what you focus on — only what's true]", applyKind: "manual", priority: base + 2 };
    case "hours":
      return { title: "Add your opening hours", hypothesis: "Customers often check hours before contacting a business.", proposedChange: "Add your hours in My Business, and show them on your website's contact page.", draft: "", applyKind: "manual", priority: base };
    case "photos":
      return { title: "Add photos of your real work", hypothesis: "Genuine photos help customers see what you do. Don't use stock images presented as your work.", proposedChange: "Add photos of your work and premises to your website.", draft: "", applyKind: "manual", priority: base - 2 };
    case "viewport":
      return { title: "Make your site work on phones", hypothesis: "Most visitors use phones; without a viewport tag pages render tiny.", proposedChange: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> and check the site on a phone.', draft: "", applyKind: "manual", priority: base + 4 };
    case "img_alt":
      return { title: "Describe your images", hypothesis: "Alt text helps people using screen readers and tools that can't see images.", proposedChange: "Add a short alt description to each meaningful image. (Automated check — please confirm manually.)", draft: "", applyKind: "manual", priority: base - 3 };
    case "html_lang":
      return { title: "Declare your page language", hypothesis: "Screen readers use it to pronounce text correctly.", proposedChange: 'Add lang="en" (or your language) to the <html> tag.', draft: "", applyKind: "manual", priority: base - 4 };
    case "redirects":
      return { title: "Shorten your redirect chain", hypothesis: "Long redirect chains slow pages down.", proposedChange: "Point links directly to your final homepage address.", draft: check.evidence, applyKind: "manual", priority: base - 4 };
    default:
      return null;
  }
}

/** Placeholders like "[...]" must be replaced by the owner before approval. */
export function hasPlaceholder(draft: string): boolean {
  return /\[[^\]]{3,}\]/.test(draft);
}

/** Parses "Q: ... / A: ..." pairs from a FAQ draft. */
export function parseFaqDraft(draft: string) {
  return draft
    .split(/\n\s*\n/)
    .map((chunk) => ({ q: chunk.match(/^Q:\s*(.+)$/m)?.[1]?.trim(), a: chunk.match(/^A:\s*([\s\S]+)$/m)?.[1]?.trim() }))
    .filter((x): x is { q: string; a: string } => !!x.q && !!x.a)
    .map((x) => ({ question: x.q.slice(0, 200), answer: x.a.slice(0, 1000) }));
}

/** Parses "Service name: description" lines. */
export function parseServiceDraft(draft: string) {
  return draft
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i === -1 ? null : { name: l.slice(0, i).trim(), description: l.slice(i + 1).trim().slice(0, 600) };
    })
    .filter((x): x is { name: string; description: string } => !!x && !!x.description);
}
