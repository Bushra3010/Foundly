import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "@/db";
import { businessProfiles, memberships } from "@/db/schema";
import { billingEnforced } from "@/lib/plans";
import { effectivePlan } from "./billing/service";
import type { Ctx } from "./context";
import { syncFacebookSafe } from "./facebook-page";
import { syncGoogleSafe } from "./google-business";
import { businessPublicUrls, pingIndexNow } from "./indexnow";

/** Pushes the confirmed facts to every connected listing. Never throws. */
export async function syncConnectedSafe(db: Db, ctx: Ctx) {
  await syncGoogleSafe(db, ctx);
  await syncFacebookSafe(db, ctx);
}

/** The weekday (0–6) a workspace's weekly upkeep runs on, spread evenly by its id. */
export function upkeepWeekday(workspaceId: string) {
  return parseInt(workspaceId.replace(/-/g, "").slice(0, 8), 16) % 7;
}

const UPKEEP_CONCURRENCY = 8;

/**
 * Weekly GEO maintenance, run from the daily cron: each published business is
 * handled once a week, on its own weekday, so the work spreads over seven runs.
 * Resubmits its public pages to search engines (freshness) and pushes the
 * current facts to connected Google and Facebook listings. With billing
 * enforced, Free workspaces are skipped. Stops starting new businesses at the
 * time budget so the cron finishes cleanly; the rest run next week.
 */
export async function geoMaintenance(db: Db, opts: { weekday?: number; budgetMs?: number } = {}) {
  const deadline = Date.now() + (opts.budgetMs ?? 240_000);
  const rows = await db
    .select({ workspaceId: businessProfiles.workspaceId, userId: memberships.userId })
    .from(businessProfiles)
    .innerJoin(memberships, and(eq(memberships.workspaceId, businessProfiles.workspaceId), eq(memberships.role, "owner")))
    .where(inArray(businessProfiles.status, ["published"]));
  const due = new Map<string, string>();
  for (const r of rows) {
    if (opts.weekday === undefined || upkeepWeekday(r.workspaceId) === opts.weekday) due.set(r.workspaceId, r.userId);
  }
  const queue = Array.from(due);
  const urls: string[] = [];
  let synced = 0;
  let skipped = 0;
  async function worker() {
    for (let next = queue.shift(); next; next = queue.shift()) {
      if (Date.now() > deadline) { skipped += 1; continue; }
      const [workspaceId, userId] = next;
      const ctx: Ctx = { workspaceId, userId, role: "owner" };
      try {
        if (billingEnforced() && (await effectivePlan(db, workspaceId)) === "free") continue;
        urls.push(...(await businessPublicUrls(db, ctx)));
        await syncConnectedSafe(db, ctx);
        synced += 1;
      } catch (err) {
        console.error("[geo-maintenance]", workspaceId, err);
      }
    }
  }
  await Promise.all(Array.from({ length: UPKEEP_CONCURRENCY }, worker));
  if (skipped) console.warn(`[geo-maintenance] time budget reached; ${skipped} businesses wait until next week`);
  const unique = Array.from(new Set(urls));
  let submitted = 0;
  for (let i = 0; i < unique.length; i += 1000) submitted += (await pingIndexNow(unique.slice(i, i + 1000))).sent;
  return { businesses: due.size, urls: unique.length, submitted, synced, skipped };
}
