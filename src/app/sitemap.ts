import type { MetadataRoute } from "next";
import { getDb } from "@/db";
import { siteUrl } from "@/app/s/load";
import { listPublishedProfileSlugs } from "@/server/directory";
import { listPublishedSiteSlugs } from "@/server/sites";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const [profiles, sites] = await Promise.all([listPublishedProfileSlugs(db), listPublishedSiteSlugs(db)]);
  return [
    { url: base, changeFrequency: "weekly" },
    { url: `${base}/directory`, changeFrequency: "daily" },
    ...profiles.map((p) => ({ url: `${base}/b/${p.slug}`, lastModified: p.updatedAt })),
    ...sites.map((s) => ({ url: siteUrl(s.slug), lastModified: s.updatedAt })),
  ];
}
