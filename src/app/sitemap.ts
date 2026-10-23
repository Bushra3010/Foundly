import type { MetadataRoute } from "next";
import { getDb } from "@/db";
import { siteUrl } from "@/app/s/load";
import { listPublishedProfiles } from "@/server/directory";
import { slugify } from "@/lib/geo";
import { listPublishedSiteServices } from "@/server/sites";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const [profiles, sites] = await Promise.all([listPublishedProfiles(db), listPublishedSiteServices(db)]);
  const cities = new Set<string>();
  const cityCategories = new Set<string>();
  for (const p of profiles) {
    const city = slugify(p.profile.city);
    cities.add(city);
    cityCategories.add(`${city}/${slugify(p.profile.category)}`);
  }
  return [
    { url: base, changeFrequency: "weekly" },
    { url: `${base}/directory`, changeFrequency: "daily" },
    { url: `${base}/llms.txt`, changeFrequency: "daily" },
    ...[...cities].map((c) => ({ url: `${base}/directory/${c}`, changeFrequency: "daily" as const })),
    ...[...cityCategories].map((c) => ({ url: `${base}/directory/${c}`, changeFrequency: "daily" as const })),
    ...profiles.map((p) => ({ url: `${base}/b/${p.slug}`, lastModified: p.profile.updatedAt })),
    ...sites.map((s) => ({ url: siteUrl(s.slug), lastModified: s.updatedAt })),
    ...sites.flatMap((s) => s.services.map((svc) => ({ url: `${siteUrl(s.slug)}/services/${svc}`, lastModified: s.updatedAt }))),
  ];
}
