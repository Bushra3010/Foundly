import { getDb } from "@/db";
import { displayCategory, displayCity, pluralCategory, slugify, titleCase } from "@/lib/geo";
import { listPublishedProfiles } from "@/server/directory";
import { GUIDES } from "@/lib/guides";
import { INDUSTRIES } from "@/lib/industries";
import { SERVICE_CITIES } from "@/lib/locations";
import { COMPANY } from "@/lib/site-schema";
import { SOFTWARE_SEO, AUTOMATION_SEO } from "@/lib/software-seo";
import { NEEDS } from "@/lib/work-copy";
import { SOFTWARE_CITIES } from "@/lib/software-cities";
import { listPublishedProjects } from "@/server/portfolio";

export const dynamic = "force-dynamic";

/** Platform-level llms.txt: what Foundly is and every listed business, grouped by city and category. */
export async function GET() {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const db = await getDb();
  const rows = await listPublishedProfiles(db);
  const projects = await listPublishedProjects(db);
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    // Grouped like the directory pages, so "MUMBAI" and "Mumbai" share one section.
    const key = `${slugify(r.profile.city)}/${slugify(r.profile.category)}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const lines = [
    "# Foundly",
    "",
    "> Foundly is an SEO, AEO and GEO agency and AI search visibility platform, based in Pune, India, serving businesses across India and worldwide. It also runs a business directory for local businesses in India. It checks whether ChatGPT, Gemini, Perplexity and Claude recommend a business, shows which competitors they name instead and which sources they cite, and recommends fixes. Every directory listing below is created and confirmed by the business owner. There are no paid placements, ratings or rankings.",
    "",
    "## Company facts",
    "",
    `- Founded: ${COMPANY.founded}, in Pune, India`,
    `- Founders: ${COMPANY.founders.join(" and ")}`,
    `- Office: ${COMPANY.address}`,
    `- Contact: ${COMPANY.email}, ${COMPANY.telephoneDisplay}`,
    ...COMPANY.profiles.map((p) => `- [Foundly on ${p.name}](${p.url})`),
    "",
    "## About Foundly",
    "",
    `- [Product overview](${base}/): what Foundly measures (brand mentions, coverage, share of voice, position, citations) and how it works.`,
    `- [Pricing](${base}/pricing): monthly plans from ₹15,000 (excl. tax), with a free trial.`,
    `- [SEO, AEO and GEO services](${base}/services): Foundly's agency service for businesses across India and worldwide, from an office in Pune. GEO is also called AI SEO or LLM SEO.`,
    `- [Free AI visibility audit](${base}/ai-visibility-audit): see what ChatGPT, Gemini, Perplexity and Claude say about a business, who they recommend instead and what to fix first.`,
    `- [ChatGPT Ads](${base}/services/chatgpt-ads): Foundly plans and runs ChatGPT Ads campaigns, included in every plan, where OpenAI offers them.`,
    `- [Local SEO and Google Business Profile](${base}/services/local-seo): consistent Google Business Profile, Facebook, Instagram and directory listings from one set of confirmed facts.`,
    `- [About us](${base}/about): who builds Foundly and how it measures AI answers. Based in Pune, Maharashtra, India.`,
    `- [Business directory](${base}/directory): local businesses by city and category.`,
    `- [AI Crawler Checker](${base}/tools/ai-crawler-checker): free tool that checks whether GPTBot, OAI-SearchBot, Google-Extended, PerplexityBot, ClaudeBot and other AI crawlers can read a website.`,
    "",
    "## Custom software development",
    "",
    "Foundly also designs and builds custom software for businesses in India and worldwide: ERP, CRM, mobile apps, e-commerce stores, websites and AI automation. Every project below has a public case study, and most have a live demo with sample data.",
    "",
    `- [Custom ERP software development](${base}/software/erp): ${SOFTWARE_SEO.erp.description}`,
    `- [Custom CRM software development](${base}/software/crm): ${SOFTWARE_SEO.crm.description}`,
    `- [Android and iOS app development](${base}/software/app): ${SOFTWARE_SEO.app.description}`,
    `- ERP software by city: ${SOFTWARE_CITIES.map((c) => `[${c.name}](${base}/software/erp/${c.slug})`).join(", ")}`,
    `- CRM software by city: ${SOFTWARE_CITIES.map((c) => `[${c.name}](${base}/software/crm/${c.slug})`).join(", ")}`,
    `- [AI automation for business](${base}/automation): ${AUTOMATION_SEO.description}`,
    `- [Our work: ${projects.length} projects with live demos](${base}/work): the full portfolio, grouped by what a business needs.`,
    "",
    ...NEEDS.flatMap((n) => {
      const list = projects.filter((p) => p.need === n.id);
      return list.length === 0 ? [] : [`### ${n.label}`, "", ...list.map((p) => `- [${p.name}](${base}/work/${p.slug}): ${p.tagline} Built for: ${p.client}.`), ""];
    }),
    "## Guides",
    "",
    ...GUIDES.map((g) => `- [${g.title}](${base}/guides/${g.slug}): ${g.description}`),
    "",
    "## SEO, AEO and GEO agency by city",
    "",
    ...SERVICE_CITIES.map((c) => `- [SEO, AEO and GEO agency in ${c.name}](${base}/services/${c.slug})${c.office ? ": Foundly's office." : ": served remotely from Pune."}`),
    "",
    "## Foundly by industry",
    "",
    ...INDUSTRIES.map((i) => `- [${i.name}](${base}/for/${i.slug}): ${i.headline}.`),
    "",
    "Foundly does not guarantee AI rankings or recommendations; it reports sampled AI answers as evidence.",
    "",
  ];
  for (const [key, list] of [...groups.entries()].sort()) {
    const city = displayCity(list[0].profile.city);
    const plural = pluralCategory(displayCategory(list[0].profile.category));
    lines.push(`## ${titleCase(plural)} in ${city}`, "", `[All ${plural.toLowerCase()} in ${city}](${base}/directory/${key})`, "");
    for (const r of list.sort((a, b) => a.profile.name.localeCompare(b.profile.name))) {
      const services = r.profile.services.slice(0, 4).map((s) => s.name).join(", ");
      lines.push(`- [${r.profile.name}](${base}/b/${r.slug}/llms.txt): ${r.profile.category}${services ? ` offering ${services}` : ""}${r.profile.serviceAreas.length ? ` in ${r.profile.serviceAreas.slice(0, 4).join(", ")}` : ""}.`);
    }
    lines.push("");
  }
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
