import type { Business } from "@/db/schema";
import type { SiteContent } from "@/lib/site/content";
import { buildBlock } from "@/lib/site/generate";
import { localBusinessJsonLd, toPublicProfile } from "@/lib/profile";
import type { CheckResult } from "./checks";

/**
 * Turns failed checks into owner tasks. Drafts are built only from the
 * owner's confirmed facts; where a fact is missing the draft asks the owner
 * to write it rather than inventing it. Benefits are stated as hypotheses.
 */

export type ApplyKind = "manual" | "wordpress_append" | "hosted_seo_description" | "hosted_faq_add" | "hosted_service_descriptions" | "hosted_about";

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

function faqDraft(b: Business): string {
  const faq = buildBlock("faq", b, "draft");
  return faq?.type === "faq" ? faq.items.map((i) => `Q: ${i.question}\nA: ${i.answer}`).join("\n\n") : "";
}

export function templateFor(check: CheckResult, b: Business, hosted: boolean): ActionTemplate | null {
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
      return { title: "Write a search description", hypothesis: "A clear description may improve how your page appears in results.", proposedChange: hosted ? "Replace your website's search description." : "Add a meta description to the homepage.", draft, applyKind: hosted ? "hosted_seo_description" : "manual", priority: base + 1 };
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
      return { title: "Explain each service", hypothesis: "Specific descriptions answer customers' questions before they call.", proposedChange: "Add a description for each service. Replace every [bracket] with your own words before approving.", draft: b.services.map((s) => `${s.name}: ${s.description ?? "[What's included, who it's for, typical timing]"}`).join("\n"), applyKind: "hosted_service_descriptions", priority: base + 5 };
    case "structured_data":
    case "structured_data_agrees":
      return { title: "Add accurate structured data", hypothesis: "Structured data that matches the page may help search tools read your details correctly.", proposedChange: "Add this JSON-LD to your homepage <head>. It contains only details you confirmed.", draft: `<script type="application/ld+json">\n${JSON.stringify(localBusinessJsonLd({ ...facts, url: b.websiteUrl ?? undefined }), null, 2)}\n</script>`, applyKind: "manual", priority: base };
    case "faq":
      return { title: "Answer common customer questions", hypothesis: "Clear answers to real questions make your page more useful to customers and to tools that summarise it.", proposedChange: hosted ? "Add these questions to your website's Questions section." : "Add a questions-and-answers section with these answers.", draft: faqDraft(b), applyKind: hosted ? "hosted_faq_add" : "manual", priority: base + 3 };
    case "about":
      return { title: "Tell customers who you are", hypothesis: "A short, honest background helps customers trust who they're contacting.", proposedChange: "Write a few sentences about your business. We won't write this for you, so the facts stay yours.", draft: b.description ?? "[Who runs the business, since when, and what you focus on — only what's true]", applyKind: "hosted_about", priority: base + 2 };
    case "hours":
      return { title: "Add your opening hours", hypothesis: "Customers often check hours before contacting a business.", proposedChange: "Add your hours in My Business. They appear on your Contact page automatically.", draft: "", applyKind: "manual", priority: base };
    case "photos":
      return { title: "Add photos of your real work", hypothesis: "Genuine photos help customers see what you do. Don't use stock images presented as your work.", proposedChange: "Upload photos in My Website → Photos section.", draft: "", applyKind: "manual", priority: base - 2 };
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

/** Applies an approved draft to site content. Returns the new content, or null if not applicable. */
export function applyToContent(kind: ApplyKind, draft: string, content: SiteContent): SiteContent | null {
  const next: SiteContent = structuredClone(content);
  const allBlocks = next.pages.flatMap((p) => p.blocks);
  switch (kind) {
    case "hosted_seo_description":
      next.seo.description = draft.trim().slice(0, 170);
      return next;
    case "hosted_faq_add": {
      const items = parseFaqDraft(draft);
      if (!items.length) return null;
      let faq = allBlocks.find((x) => x.type === "faq");
      if (!faq) {
        faq = { id: `home-faq-${Date.now().toString(36)}`, type: "faq", heading: "Common questions", items: [] };
        next.pages[0].blocks.push(faq);
      }
      if (faq.type !== "faq") return null;
      const have = new Set(faq.items.map((i) => i.question.toLowerCase()));
      faq.items.push(...items.filter((i) => !have.has(i.question.toLowerCase())));
      faq.items = faq.items.slice(0, 20);
      return next;
    }
    case "hosted_service_descriptions": {
      const byName = new Map(parseServiceDraft(draft).map((s) => [s.name.toLowerCase(), s.description]));
      let changed = false;
      for (const blk of allBlocks) {
        if (blk.type !== "services") continue;
        for (const item of blk.items) {
          const d = byName.get(item.name.toLowerCase());
          if (d) {
            item.description = d;
            changed = true;
          }
        }
      }
      return changed ? next : null;
    }
    case "hosted_about": {
      const body = draft.trim().slice(0, 3000);
      if (!body) return null;
      const existing = allBlocks.find((x) => x.type === "about");
      if (existing?.type === "about") existing.body = body;
      else {
        const page = next.pages.find((p) => p.key === "about");
        const blk = { id: `about-about-${Date.now().toString(36)}`, type: "about" as const, heading: `About ${next.facts.name}`, body };
        if (page) page.blocks.push(blk);
        else next.pages.splice(Math.min(2, next.pages.length), 0, { key: "about", title: "About", blocks: [blk] });
      }
      return next;
    }
    case "manual":
    case "wordpress_append":
      return null;
  }
}

/** Whether published content reflects an applied draft (for verification). */
export function contentReflects(kind: ApplyKind, draft: string, content: SiteContent): boolean {
  const blocks = content.pages.flatMap((p) => p.blocks);
  switch (kind) {
    case "hosted_seo_description":
      return content.seo.description === draft.trim().slice(0, 170);
    case "hosted_faq_add": {
      const faq = blocks.find((x) => x.type === "faq");
      const qs = new Set(faq?.type === "faq" ? faq.items.map((i) => i.question.toLowerCase()) : []);
      return parseFaqDraft(draft).every((i) => qs.has(i.question.toLowerCase()));
    }
    case "hosted_service_descriptions": {
      const services = blocks.flatMap((x) => (x.type === "services" ? x.items : []));
      return parseServiceDraft(draft).every((s) => services.some((i) => i.name.toLowerCase() === s.name.toLowerCase() && i.description === s.description));
    }
    case "hosted_about":
      return blocks.some((x) => x.type === "about" && x.body === draft.trim().slice(0, 3000));
    case "manual":
    case "wordpress_append":
      return false;
  }
}
