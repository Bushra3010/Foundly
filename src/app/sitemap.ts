import type { MetadataRoute } from "next";
import { getDb } from "@/db";
import { listPublishedProfiles } from "@/server/directory";
import { slugify } from "@/lib/geo";
import { GUIDES } from "@/lib/guides";
import { INDUSTRIES } from "@/lib/industries";
import { SERVICE_CITIES } from "@/lib/locations";

export const dynamic = "force-dynamic";

// Published profiles kept out of the sitemap. Their pages stay live.
const SITEMAP_EXCLUDED_PROFILES = new Set(["alok-mumbai", "kindbridge-pune", "blinks-ai-mumbai"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const profiles = (await listPublishedProfiles(db)).filter((p) => !SITEMAP_EXCLUDED_PROFILES.has(p.slug));
  const cities = new Set<string>();
  const cityCategories = new Set<string>();
  for (const p of profiles) {
    const city = slugify(p.profile.city);
    cities.add(city);
    cityCategories.add(`${city}/${slugify(p.profile.category)}`);
  }
  return [
    { url: base, changeFrequency: "weekly" },
    { url: `${base}/pricing`, changeFrequency: "monthly" },
    { url: `${base}/about`, changeFrequency: "monthly" },
    { url: `${base}/guides`, changeFrequency: "monthly" },
    ...GUIDES.map((g) => ({ url: `${base}/guides/${g.slug}`, lastModified: g.updated, changeFrequency: "monthly" as const })),
    { url: `${base}/for`, changeFrequency: "monthly" },
    ...INDUSTRIES.map((i) => ({ url: `${base}/for/${i.slug}`, changeFrequency: "monthly" as const })),
    { url: `${base}/tools/ai-crawler-checker`, changeFrequency: "monthly" },
    { url: `${base}/ai-visibility-audit`, changeFrequency: "monthly" },
    { url: `${base}/services`, changeFrequency: "monthly" },
    { url: `${base}/services/chatgpt-ads`, changeFrequency: "monthly" },
    { url: `${base}/services/local-seo`, changeFrequency: "monthly" },
    ...SERVICE_CITIES.map((c) => ({ url: `${base}/services/${c.slug}`, changeFrequency: "monthly" as const })),
    { url: `${base}/terms`, changeFrequency: "yearly" },
    { url: `${base}/privacy`, changeFrequency: "yearly" },
    { url: `${base}/directory`, changeFrequency: "daily" },
    { url: `${base}/llms.txt`, changeFrequency: "daily" },
    ...[...cities].map((c) => ({ url: `${base}/directory/${c}`, changeFrequency: "daily" as const })),
    ...[...cityCategories].map((c) => ({ url: `${base}/directory/${c}`, changeFrequency: "daily" as const })),
    ...profiles.map((p) => ({ url: `${base}/b/${p.slug}`, lastModified: p.profile.updatedAt })),
  ];
}
