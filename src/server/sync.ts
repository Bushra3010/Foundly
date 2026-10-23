import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { businessProfiles, memberships } from "@/db/schema";
import type { Ctx } from "./context";
import { syncFacebookSafe } from "./facebook-page";
import { syncGoogleSafe } from "./google-business";
import { businessPublicUrls, pingIndexNow } from "./indexnow";

/** Pushes the confirmed facts to every connected listing. Never throws. */
export async function syncConnectedSafe(db: Db, ctx: Ctx) {
  await syncGoogleSafe(db, ctx);
  await syncFacebookSafe(db, ctx);
}

/**
 * Weekly GEO maintenance for every published business, run from the daily
 * cron on Mondays: resubmit all public pages to search engines (freshness)
 * and push the current facts to connected Google and Facebook listings.
 */
export async function geoMaintenance(db: Db) {
  const rows = await db
    .select({ workspaceId: businessProfiles.workspaceId, userId: memberships.userId })
    .from(businessProfiles)
    .innerJoin(memberships, and(eq(memberships.workspaceId, businessProfiles.workspaceId), eq(memberships.role, "owner")))
    .where(inArray(businessProfiles.status, ["published"]));
  const seen = new Set<string>();
  const urls: string[] = [];
  let synced = 0;
  for (const r of rows) {
    if (seen.has(r.workspaceId)) continue;
    seen.add(r.workspaceId);
    const ctx: Ctx = { workspaceId: r.workspaceId, userId: r.userId, role: "owner" };
    try {
      urls.push(...(await businessPublicUrls(db, ctx)));
      await syncConnectedSafe(db, ctx);
      synced += 1;
    } catch (err) {
      console.error("[geo-maintenance]", r.workspaceId, err);
    }
  }
  const unique = Array.from(new Set(urls));
  let submitted = 0;
  for (let i = 0; i < unique.length; i += 1000) submitted += (await pingIndexNow(unique.slice(i, i + 1000))).sent;
  return { businesses: seen.size, urls: unique.length, submitted, synced };
}
