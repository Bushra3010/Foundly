import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { rateLimits } from "@/db/schema";
import { pruneRateLimits, rateLimit } from "@/server/rate-limit";
import { makeDb } from "./helpers";

let db: Db;
beforeEach(async () => {
  db = await makeDb();
});

describe("shared rate limiter", () => {
  it("allows up to the limit in a window, then refuses until the window ends", async () => {
    const t0 = new Date("2026-10-25T10:00:00Z");
    for (let i = 0; i < 3; i++) expect(await rateLimit(db, "login:a", 3, 60_000, t0)).toBe(true);
    expect(await rateLimit(db, "login:a", 3, 60_000, new Date(t0.getTime() + 30_000))).toBe(false);
    expect(await rateLimit(db, "login:b", 3, 60_000, t0)).toBe(true);
    expect(await rateLimit(db, "login:a", 3, 60_000, new Date(t0.getTime() + 60_000))).toBe(true);
  });

  it("counts every caller against one shared total", async () => {
    const now = new Date("2026-10-25T10:00:00Z");
    const results = await Promise.all(Array.from({ length: 10 }, () => rateLimit(db, "signup:ip", 4, 60_000, now)));
    expect(results.filter(Boolean)).toHaveLength(4);
  });

  it("prunes only windows that have ended", async () => {
    const t0 = new Date("2026-10-25T10:00:00Z");
    await rateLimit(db, "old", 5, 1_000, t0);
    await rateLimit(db, "fresh", 5, 60 * 60_000, t0);
    expect(await pruneRateLimits(db, new Date(t0.getTime() + 5_000))).toBe(1);
    expect((await db.select().from(rateLimits)).map((r) => r.key)).toEqual(["fresh"]);
  });
});
