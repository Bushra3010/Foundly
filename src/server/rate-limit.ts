import { lte, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { rateLimits } from "@/db/schema";

/**
 * Fixed-window rate limiter backed by Postgres, so every server instance
 * shares the same counts. One atomic upsert per check: it starts a new window
 * when the old one has ended, otherwise adds one to the count.
 */
export async function rateLimit(db: Db, key: string, limit: number, windowMs: number, now = new Date()): Promise<boolean> {
  const resetAt = new Date(now.getTime() + windowMs);
  // Raw SQL parameters go to the driver as-is, and postgres.js (production)
  // can't send a Date there, so times are passed as ISO text and cast.
  const nowTs = sql`${now.toISOString()}::timestamptz`;
  const resetTs = sql`${resetAt.toISOString()}::timestamptz`;
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, resetAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.resetAt} <= ${nowTs} then 1 else ${rateLimits.count} + 1 end`,
        resetAt: sql`case when ${rateLimits.resetAt} <= ${nowTs} then ${resetTs} else ${rateLimits.resetAt} end`,
      },
    })
    .returning({ count: rateLimits.count });
  return row.count <= limit;
}

/** Daily cron: removes windows that have ended. */
export async function pruneRateLimits(db: Db, now = new Date()): Promise<number> {
  const removed = await db.delete(rateLimits).where(lte(rateLimits.resetAt, now)).returning({ key: rateLimits.key });
  return removed.length;
}
