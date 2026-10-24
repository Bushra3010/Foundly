import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { businesses, competitors } from "@/db/schema";
import { getBusiness } from "@/server/business";
import { latestAudit, listActions, runAudit, startAudit } from "@/server/audit/service";
import { compareData, runCompetitorCheck, setCompetitorWebsite, startCompetitorCheck } from "@/server/compare";
import { AppError, type Ctx } from "@/server/context";
import { extractBrands } from "@/server/monitoring/extract";
import { addCompetitor, approveQuestions, createRun, executeRun } from "@/server/monitoring/service";
import type { AskResult, ProviderAdapter } from "@/server/monitoring/types";
import type { SafeResponse } from "@/server/safe-fetch";
import { makeDb, onboard, signUp } from "./helpers";

const SITES: Record<string, string> = {
  "https://sharma.example.in/": `<html lang="en"><head><title>Sharma Plumbing, plumbers in Pune</title><meta name="viewport" content="width=device-width"></head><body><h1>Plumbers in Pune</h1><p>${"Leak repair and more. ".repeat(40)}</p></body></html>`,
  "https://rival.example/": `<html><head><title>Rival</title><link rel="canonical" href="https://rival.example/"><meta name="description" content="${"Rival plumbing services across Pune. ".repeat(3)}"><meta name="viewport" content="width=device-width"><script type="application/ld+json">{"@type":"LocalBusiness","name":"Rival"}</script></head><body><h1>Rival</h1><p>${"Rival plumbing. ".repeat(40)}</p></body></html>`,
  "https://rival.example/sitemap.xml": "<urlset></urlset>",
};
const fetcher = async (url: string): Promise<SafeResponse> => {
  const body = SITES[url];
  return { url, status: body ? 200 : 404, headers: { "content-type": url.endsWith(".xml") ? "application/xml" : "text/html" }, body: body ?? "", redirects: [], truncated: false };
};

function fakeAdapter(key: ProviderAdapter["key"], answer: (q: string) => string): ProviderAdapter {
  return {
    key,
    label: key,
    method: "model_api",
    locale: "text_instruction",
    requiredEnv: [],
    configuredModel: () => "test-model",
    async ask(input: { question: string }): Promise<AskResult> {
      return { status: "answered", answer: answer(input.question), citations: [], model: "test-model", appliedLocale: "text_instruction", raw: {} };
    },
  };
}

let db: Db;
let ctx: Ctx;
beforeEach(async () => {
  db = await makeDb();
  ctx = await signUp(db, "owner@example.com");
  await onboard(db, ctx);
});
const load = async (id?: string) => compareData(db, ctx, (await getBusiness(db, ctx))!, id);

describe("brand matching", () => {
  it("finds a name that ends a sentence, and domains with dots", () => {
    const brands = [{ key: "c1", name: "Apex Plumbing", aliases: [], domains: ["apex.in"] }];
    expect(extractBrands("Try Apex Plumbing.", [], brands)[0].mentioned).toBe(true);
    expect(extractBrands("See apex.in.", [], brands)[0]).toMatchObject({ mentioned: true, matchedText: "apex.in" });
    expect(extractBrands("Try Apexplumbing today.", [], brands)[0].mentioned).toBe(false);
  });
});

describe("compare", () => {
  it("is empty until a competitor is added", async () => {
    const d = await load();
    expect(d.rival).toBeNull();
  });

  it("counts AI answers naming you and the competitor, per keyword, from real answers only", async () => {
    const rival = await addCompetitor(db, ctx, "Apex Plumbing", "apex.example");
    await approveQuestions(db, ctx, [
      { text: "best plumber in Pune", group: "comparison" },
      { text: "leak repair in Pune", group: "service" },
    ]);
    // Claude names both for "best", only Apex for "leak"; Gemini names only Sharma.
    const claude = fakeAdapter("claude", (q) => (q.includes("best") ? "1. Sharma Plumbing\n2. Apex Plumbing" : "Try Apex Plumbing."));
    const gemini = fakeAdapter("gemini", () => "Sharma Plumbing is well reviewed.");
    const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: "manual:cmp", adapters: [claude, gemini] });
    await executeRun(db, run.id, { adapters: [claude, gemini] });

    const d = await load();
    if (!d.rival) throw new Error("expected a competitor");
    expect(d.rival.id).toBe(rival.id);
    expect(d.ai.you).toMatchObject({ numerator: 3, denominator: 4 });
    expect(d.ai.them).toMatchObject({ numerator: 2, denominator: 4 });
    expect(d.ai.trend.at(-1)).toMatchObject({ answers: 4, you: 0.75, them: 0.5 });
    expect(d.ai.keywords.find((k) => k.text === "best plumber in Pune")).toMatchObject({ checked: 2, you: 2, them: 1, leader: "you" });
    expect(d.ai.keywords.find((k) => k.text === "leak repair in Pune")).toMatchObject({ checked: 2, you: 1, them: 1, leader: "tie" });
  });

  it("ignores answers from before the competitor was added", async () => {
    await approveQuestions(db, ctx, [{ text: "best plumber in Pune", group: "comparison" }]);
    const a = fakeAdapter("claude", () => "Sharma Plumbing and Apex Plumbing.");
    const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: "manual:early", adapters: [a] });
    await executeRun(db, run.id, { adapters: [a] });
    await addCompetitor(db, ctx, "Apex Plumbing");
    const d = await load();
    if (!d.rival) throw new Error("expected a competitor");
    expect(d.ai.answers).toBe(0);
    expect(d.ai.them.rate).toBeNull();
  });

  it("checks both websites on the same rules, without touching the owner's own check or tasks", async () => {
    await db.update(businesses).set({ hasWebsite: true, websiteUrl: "https://sharma.example.in" }).where(eq(businesses.workspaceId, ctx.workspaceId));
    const mine = await startAudit(db, ctx);
    await runAudit(db, mine.id, { fetcher });
    const tasksBefore = (await listActions(db, ctx)).length;

    const rival = await addCompetitor(db, ctx, "Rival");
    await expect(startCompetitorCheck(db, ctx, rival.id)).rejects.toSatisfy((e: unknown) => e instanceof AppError && e.code === "invalid");
    await setCompetitorWebsite(db, ctx, rival.id, "https://www.rival.example/");
    expect((await db.select().from(competitors).where(eq(competitors.id, rival.id)))[0].domains).toEqual(["rival.example"]);
    const theirs = await startCompetitorCheck(db, ctx, rival.id);
    await runCompetitorCheck(db, theirs.id, { fetcher });

    const d = await load(rival.id);
    if (!d.rival) throw new Error("expected a competitor");
    expect(d.website.them.score?.total).toBe(d.website.you.score?.total);
    expect(d.website.checks.some((c) => c.checkKey.startsWith("nap_"))).toBe(false);
    expect(d.website.theyWin.map((c) => c.checkKey)).toEqual(expect.arrayContaining(["canonical", "sitemap", "structured_data"]));
    // The owner's own check and tasks are untouched by the competitor check.
    expect((await latestAudit(db, ctx))?.id).toBe(mine.id);
    expect((await listActions(db, ctx)).length).toBe(tasksBefore);
  });
});
