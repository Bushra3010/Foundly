import { parse, type HTMLElement } from "node-html-parser";
import type { Business } from "@/db/schema";
import type { SiteContent } from "@/lib/site/content";
import { robotsDisallows, type CrawlResult } from "./crawl";

/** Bump when checks change; reports show which checklist produced them. */
export const CHECKLIST_VERSION = 1;

export type Severity = "high" | "medium" | "low";
export type CheckResult = {
  checkKey: string;
  category: "facts" | "technical" | "content" | "structured_data" | "accessibility";
  page: string | null;
  passed: boolean;
  severity: Severity;
  evidence: string;
  partial?: boolean;
};

const textOf = (root: HTMLElement) => root.querySelector("body")?.text.replace(/\s+/g, " ").trim() ?? "";
const digits = (s: string) => s.replace(/\D/g, "");
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

function jsonLdBlocks(root: HTMLElement): { ok: unknown[]; errors: number } {
  const ok: unknown[] = [];
  let errors = 0;
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const v = JSON.parse(s.text);
      ok.push(...(Array.isArray(v) ? v : [v]));
    } catch {
      errors++;
    }
  }
  return { ok, errors };
}

function ldTypes(items: unknown[]): string[] {
  const out: string[] = [];
  const visit = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    const t = o["@type"];
    if (typeof t === "string") out.push(t);
    if (Array.isArray(t)) out.push(...t.filter((x): x is string => typeof x === "string"));
    if (Array.isArray(o["@graph"])) o["@graph"].forEach(visit);
  };
  items.forEach(visit);
  return out;
}

const BUSINESS_TYPES = /LocalBusiness|Organization|Store|Restaurant|Dentist|Physician|Plumber|Electrician|TravelAgency|ProfessionalService|HomeAndConstructionBusiness|MedicalBusiness|LegalService|AccountingService/;

/** Checks for an owner's existing website, from a bounded crawl. */
export function externalChecks(crawl: CrawlResult, b: Business): CheckResult[] {
  const home = crawl.pages[0];
  const out: CheckResult[] = [];
  if (!home) return out;
  const r = (x: CheckResult) => out.push(x);
  const homeUrl = home.url;

  r({ checkKey: "http_status", category: "technical", page: homeUrl, passed: home.status === 200, severity: "high", evidence: `Homepage returned HTTP ${home.status}` });
  r({ checkKey: "https", category: "technical", page: homeUrl, passed: homeUrl.startsWith("https://"), severity: "high", evidence: homeUrl.startsWith("https://") ? "Served over HTTPS" : `Final address is ${homeUrl}` });
  r({ checkKey: "redirects", category: "technical", page: homeUrl, passed: home.redirects.length <= 2, severity: "low", evidence: home.redirects.length ? `${home.redirects.length} redirect(s): ${[...home.redirects, homeUrl].join(" → ")}` : "No redirects" });

  const root = parse(home.html);
  const metaRobots = root.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";
  const headerRobots = home.headers["x-robots-tag"] ?? "";
  const noindex = /noindex/i.test(metaRobots) || /noindex/i.test(headerRobots);
  r({ checkKey: "indexable", category: "technical", page: homeUrl, passed: !noindex, severity: "high", evidence: noindex ? `Homepage says noindex (${metaRobots || headerRobots})` : "No noindex directive" });
  const blocked = robotsDisallows(crawl.robotsTxt, "/");
  r({ checkKey: "robots_allows", category: "technical", page: `${new URL(homeUrl).origin}/robots.txt`, passed: !blocked, severity: "high", evidence: blocked ? "robots.txt blocks all crawlers from the homepage" : crawl.robotsTxt ? "robots.txt allows the homepage" : "No robots.txt (crawlers allowed by default)" });
  r({ checkKey: "sitemap", category: "technical", page: crawl.sitemapUrl, passed: crawl.sitemapFound, severity: "low", evidence: crawl.sitemapFound ? `Sitemap found at ${crawl.sitemapUrl}` : `No sitemap at ${crawl.sitemapUrl}` });
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute("href");
  r({ checkKey: "canonical", category: "technical", page: homeUrl, passed: !!canonical, severity: "low", evidence: canonical ? `Canonical: ${canonical}` : "No canonical link on the homepage" });
  const bodyText = textOf(root);
  r({ checkKey: "rendering", category: "technical", page: homeUrl, passed: bodyText.length >= 200, severity: "medium", evidence: `${bodyText.length} characters of text in the page HTML${bodyText.length < 200 ? " — content may only appear after JavaScript runs" : ""}` });

  const title = root.querySelector("title")?.text.trim() ?? "";
  r({ checkKey: "title", category: "content", page: homeUrl, passed: title.length >= 10 && title.length <= 70, severity: "medium", evidence: title ? `Title (${title.length} chars): “${title}”` : "No page title" });
  const desc = root.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "";
  r({ checkKey: "meta_description", category: "content", page: homeUrl, passed: desc.length >= 50 && desc.length <= 170, severity: "low", evidence: desc ? `Description (${desc.length} chars): “${desc}”` : "No meta description" });
  const h1s = root.querySelectorAll("h1");
  r({ checkKey: "h1", category: "content", page: homeUrl, passed: h1s.length === 1, severity: "low", evidence: `${h1s.length} H1 heading(s)${h1s[0] ? `: “${h1s[0].text.trim().slice(0, 80)}”` : ""}` });

  const allText = norm(crawl.pages.map((p) => textOf(parse(p.html))).join(" "));
  r({ checkKey: "nap_name", category: "facts", page: homeUrl, passed: norm(bodyText).includes(norm(b.name)), severity: "medium", evidence: norm(bodyText).includes(norm(b.name)) ? `“${b.name}” appears on the homepage` : `“${b.name}” doesn't appear in the homepage text` });
  for (const [key, label, value] of [["nap_phone", "phone number", b.phone], ["nap_whatsapp", "WhatsApp number", b.whatsapp]] as const) {
    if (!value) continue;
    const last10 = digits(value).slice(-10);
    const found = digits(allText).includes(last10) || crawl.pages.some((p) => digits(p.html).includes(last10));
    r({ checkKey: key, category: "facts", page: null, passed: found, severity: "medium", evidence: found ? `Your ${label} appears on the scanned pages` : `Your ${label} (${value}) wasn't found on ${crawl.pages.length} scanned page(s)` });
  }
  if (b.city) {
    const found = allText.includes(norm(b.city));
    r({ checkKey: "nap_city", category: "facts", page: null, passed: found, severity: "medium", evidence: found ? `“${b.city}” appears on your site` : `Your city “${b.city}” isn't mentioned on the scanned pages` });
  }
  const missingServices = b.services.filter((s) => !allText.includes(norm(s.name)));
  r({ checkKey: "service_coverage", category: "content", page: null, passed: missingServices.length === 0, severity: "medium", evidence: missingServices.length ? `Not found on the scanned pages: ${missingServices.map((s) => s.name).join(", ")}` : "Every service you listed is mentioned" });

  const ld = crawl.pages.map((p) => jsonLdBlocks(parse(p.html)));
  const items = ld.flatMap((x) => x.ok);
  const parseErrors = ld.reduce((a, x) => a + x.errors, 0);
  const types = ldTypes(items);
  const hasBiz = types.some((t) => BUSINESS_TYPES.test(t));
  r({ checkKey: "structured_data", category: "structured_data", page: homeUrl, passed: hasBiz && parseErrors === 0, severity: "low", evidence: parseErrors ? `${parseErrors} structured data block(s) couldn't be parsed` : hasBiz ? `Found ${[...new Set(types)].join(", ")}` : types.length ? `Structured data found (${[...new Set(types)].join(", ")}) but no business type` : "No structured data" });
  if (hasBiz) {
    const names = items.flatMap((i) => (i && typeof i === "object" && typeof (i as Record<string, unknown>).name === "string" ? [(i as Record<string, string>).name] : []));
    const agrees = names.some((n) => norm(n) === norm(b.name));
    r({ checkKey: "structured_data_agrees", category: "structured_data", page: homeUrl, passed: agrees, severity: "low", evidence: agrees ? "Structured data name matches your business name" : `Structured data names (${names.join(", ") || "none"}) differ from “${b.name}”` });
  }
  const faq = types.includes("FAQPage") || /frequently asked|faq|common questions/i.test(allText);
  r({ checkKey: "faq", category: "content", page: null, passed: faq, severity: "low", evidence: faq ? "Found a questions-and-answers section" : "No section answering common customer questions" });

  const viewport = !!root.querySelector('meta[name="viewport"]');
  r({ checkKey: "viewport", category: "accessibility", page: homeUrl, passed: viewport, severity: "medium", evidence: viewport ? "Mobile viewport is set" : "No mobile viewport tag — the page may be hard to use on phones", partial: true });
  const imgs = root.querySelectorAll("img");
  const noAlt = imgs.filter((i) => i.getAttribute("alt") === undefined).length;
  r({ checkKey: "img_alt", category: "accessibility", page: homeUrl, passed: noAlt === 0, severity: "low", evidence: imgs.length ? `${noAlt} of ${imgs.length} images have no alt text` : "No images on the homepage", partial: true });
  const lang = root.querySelector("html")?.getAttribute("lang");
  r({ checkKey: "html_lang", category: "accessibility", page: homeUrl, passed: !!lang, severity: "low", evidence: lang ? `Language declared: ${lang}` : "Page language isn't declared", partial: true });
  return out;
}

/** Content checks for a platform-hosted site. Technical output is generated correctly by the platform. */
export function hostedChecks(content: SiteContent, b: Business): CheckResult[] {
  const blocks = content.pages.flatMap((p) => p.blocks);
  const out: CheckResult[] = [];
  const services = blocks.find((x) => x.type === "services");
  const undescribed = services?.type === "services" ? services.items.filter((i) => i.description.trim().length < 20) : [];
  out.push({ checkKey: "service_descriptions", category: "content", page: "services", passed: !!services && undescribed.length === 0, severity: "medium", evidence: undescribed.length ? `No useful description for: ${undescribed.map((i) => i.name).join(", ")}` : "Each service has a description" });
  const about = blocks.find((x) => x.type === "about");
  out.push({ checkKey: "about", category: "content", page: "about", passed: !!about, severity: "medium", evidence: about ? "Your site has an About section" : "No About section — customers can't see who runs the business" });
  const faq = blocks.find((x) => x.type === "faq");
  const faqCount = faq?.type === "faq" ? faq.items.length : 0;
  out.push({ checkKey: "faq", category: "content", page: "home", passed: faqCount >= 3, severity: "low", evidence: `${faqCount} questions answered` });
  out.push({ checkKey: "hours", category: "facts", page: "contact", passed: b.hours.length > 0, severity: "low", evidence: b.hours.length ? "Opening hours are shown" : "Opening hours aren't shown" });
  out.push({ checkKey: "meta_description", category: "content", page: "home", passed: content.seo.description.length >= 50, severity: "low", evidence: `Search description (${content.seo.description.length} chars): “${content.seo.description}”` });
  const images = blocks.flatMap((x) => (x.type === "gallery" ? x.images : []));
  out.push({ checkKey: "photos", category: "content", page: null, passed: images.length > 0, severity: "low", evidence: images.length ? `${images.length} photo(s) of your work` : "No photos of your work or premises" });
  return out;
}
