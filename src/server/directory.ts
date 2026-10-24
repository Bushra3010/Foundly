import { and, asc, eq, sql } from "drizzle-orm";
import type { DbOrTx } from "@/db";
import { businessProfiles } from "@/db/schema";

/**
 * Directory ordering rule (documented for owners): text relevance first, then
 * profile completeness, then name. There are no paid placements.
 */
export async function searchDirectory(db: DbOrTx, opts: { q?: string; category?: string; city?: string }) {
  const data = businessProfiles.publishedData;
  const filters = [eq(businessProfiles.status, "published")];
  const like = (v: string) => `%${v.toLowerCase().replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  if (opts.category) filters.push(sql`lower(${data}->>'category') like ${like(opts.category)}`);
  if (opts.city) {
    filters.push(
      sql`(lower(${data}->>'city') like ${like(opts.city)} or lower(${data}->>'serviceAreas') like ${like(opts.city)})`,
    );
  }
  const q = opts.q ? like(opts.q) : null;
  const relevance = q
    ? sql<number>`(case when lower(${data}->>'name') like ${q} then 3 else 0 end
        + case when lower(${data}->>'services') like ${q} then 2 else 0 end
        + case when lower(${data}->>'description') like ${q} then 1 else 0 end)`
    : null;
  if (relevance) filters.push(sql`${relevance} > 0`);
  const completeness = sql<number>`(
      (case when ${data}->>'description' is not null then 1 else 0 end)
    + (case when jsonb_array_length(${data}->'hours') > 0 then 1 else 0 end)
    + (case when jsonb_array_length(${data}->'serviceAreas') > 0 then 1 else 0 end)
    + (case when ${data}->>'bookingUrl' is not null then 1 else 0 end))`;

  return db
    .select({ slug: businessProfiles.slug, profile: businessProfiles.publishedData, verification: businessProfiles.verification })
    .from(businessProfiles)
    .where(and(...filters))
    .orderBy(...(relevance ? [sql`${relevance} desc`] : []), sql`${completeness} desc`, asc(sql`${data}->>'name'`))
    .limit(50);
}

export async function getPublicProfile(db: DbOrTx, slug: string) {
  const [row] = await db
    .select({
      slug: businessProfiles.slug,
      status: businessProfiles.status,
      verification: businessProfiles.verification,
      profile: businessProfiles.publishedData,
      publishedAt: businessProfiles.publishedAt,
    })
    .from(businessProfiles)
    .where(eq(businessProfiles.slug, slug));
  if (!row || row.status !== "published" || !row.profile) return null;
  return { ...row, profile: row.profile };
}

/** Every published profile, for llms.txt and city/category pages. */
export async function listPublishedProfiles(db: DbOrTx) {
  const rows = await db
    .select({
      slug: businessProfiles.slug,
      profile: businessProfiles.publishedData,
      verification: businessProfiles.verification,
    })
    .from(businessProfiles)
    .where(eq(businessProfiles.status, "published"))
    .limit(5000);
  return rows
    .filter((r) => r.profile)
    .map((r) => ({ slug: r.slug, profile: r.profile!, verification: r.verification }));
}
