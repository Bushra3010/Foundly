import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { businesses, monitoringRuns } from "@/db/schema";
import { normalizeKeyword, parseKeywordList, questionForKeyword, suggestKeywords } from "@/lib/keywords";
import { AppError, type Ctx } from "@/server/context";
import { grantCredits } from "@/server/credits";
import { addKeywords, editKeyword } from "@/server/keywords";
import { extractBrands, urlHasPrefix } from "@/server/monitoring/extract";
import { addCompetitor, executeRun, listQuestions, scheduleDueRuns } from "@/server/monitoring/service";
import type { AskResult, ProviderAdapter } from "@/server/monitoring/types";
import { keywordAnswers, performanceFor } from "@/server/performance";
import { setupStatus, startMonitoring } from "@/server/setup";
import { makeDb, onboard, signUp } from "./helpers";

function fake(key: ProviderAdapter["key"], answer: (q: string) => Partial<AskResult>): ProviderAdapter {
  return {
    key,
    label: key,
    method: "model_api",
    locale: "text_instruction",
    requiredEnv: [],
    configuredModel: () => "test-model",
    async ask(input) {
      return { status: "answered", answer: "", citations: [], model: "test-model", appliedLocale: "text_instruction", raw: {}, ...answer(input.question) };
    },
  };
}

describe("keywords", () => {
  it("turns what owners type into a recommendation question", () => {
    expect(questionForKeyword("dentist in Indore", "Indore")).toBe("Can you recommend the best dentist in Indore?");
    expect(questionForKeyword("Root canal treatment", "Indore")).toBe("Can you recommend the best root canal treatment in Indore?");
    expect(questionForKeyword("best dentist near Vijay Nagar", "Indore")).toBe("Can you recommend the best dentist near Vijay Nagar?");
    expect(questionForKeyword("affordable braces", "Indore")).toBe("Can you recommend an affordable braces in Indore?");
    expect(questionForKeyword("इंदौर में डेंटिस्ट", "Indore")).toContain("इंदौर में डेंटिस्ट");
  });

  it("cleans pasted lists and never suggests the business name", () => {
    expect(parseKeywordList(' "dentist in indore"?, Dentist in Indore\nx\nteeth cleaning ')).toEqual(["dentist in indore", "teeth cleaning"]);
    expect(normalizeKeyword("  plumber   in Pune!! ")).toBe("plumber in Pune");
    const s = suggestKeywords({ category: "Dentist", city: "Indore", services: [{ name: "Teeth cleaning" }], serviceAreas: ["Palasia"] });
    expect(s).toContain("dentist in Indore");
    expect(s).toContain("teeth cleaning in Indore");
    expect(s).toContain("dentist near Palasia");
    expect(s.length).toBeLessThanOrEqual(8);
  });
});

describe("own website on a shared host", () => {
  it("counts a citation of the business's Foundly page as its own, but not other pages on the host", () => {
    const prefixes = ["https://foundly.co.in/s/green-leaf"];
    expect(urlHasPrefix("https://www.foundly.co.in/s/green-leaf/services/braces", prefixes)).toBe(true);
    expect(urlHasPrefix("https://foundly.co.in/s/green-leaf", prefixes)).toBe(true);
    expect(urlHasPrefix("https://foundly.co.in/s/green-leaf-2", prefixes)).toBe(false);
    expect(urlHasPrefix("https://foundly.co.in/s/other", prefixes)).toBe(false);
    const [m] = extractBrands("Green Leaf Dental Care is good.", [{ url: "https://foundly.co.in/s/green-leaf/contact" }], [
      { key: "self", name: "Green Leaf Dental Care", aliases: [], domains: [], urlPrefixes: prefixes },
    ]);
    expect(m.cited).toBe(true);
  });
});

describe("setup, start and performance", () => {
  let db: Db;
  let ctx: Ctx;
  let other: Ctx;

  beforeEach(async () => {
    db = await makeDb();
    ctx = await signUp(db, "owner@example.com");
    other = await signUp(db, "other@example.com");
    await onboard(db, ctx, "Sharma Plumbing");
    await onboard(db, other, "Other Plumbing");
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.MONITOR_VALIDATED_PROVIDERS;
  });

  it("keywords become tracked questions, once each, within the workspace", async () => {
    expect(await addKeywords(db, ctx, ["plumber in Pune", "leak repair"])).toBe(2);
    expect(await addKeywords(db, ctx, ["Plumber in Pune"])).toBe(0);
    const qs = await listQuestions(db, ctx);
    expect(qs.map((q) => q.keyword).sort()).toEqual(["leak repair", "plumber in Pune"]);
    expect(qs.find((q) => q.keyword === "leak repair")?.text).toBe("Can you recommend the best leak repair in Pune?");
    // Another workspace can't change them.
    await expect(editKeyword(db, other, qs[0].id, "hacked")).rejects.toBeInstanceOf(AppError);
    await editKeyword(db, ctx, qs[0].id, "emergency plumber in Pune");
    expect((await listQuestions(db, ctx)).map((q) => q.keyword)).toContain("emergency plumber in Pune");
    expect(await listQuestions(db, other)).toHaveLength(0);
  });

  it("Start needs a keyword, then runs the first check once and shows results", async () => {
    await expect(startMonitoring(db, ctx, { adapters: [] })).rejects.toBeInstanceOf(AppError);
    await addKeywords(db, ctx, ["plumber in Pune", "bathroom fitting"]);
    await addCompetitor(db, ctx, "Apex Plumbers");
    await grantCredits(db, ctx.workspaceId, 100, "test", `t:${ctx.workspaceId}`);

    const claude = fake("claude", (q) =>
      q.includes("plumber")
        ? { answer: "1. Sharma Plumbing\n2. Apex Plumbers", citations: [{ url: "https://www.justdial.com/Pune/plumbers" }] }
        : { answer: "1. Apex Plumbers\n2. City Fitters" },
    );
    const gemini = fake("gemini", () => ({ answer: "Try Apex Plumbers.", citations: [{ url: "https://justdial.com/x" }] }));

    const first = await startMonitoring(db, ctx, { adapters: [claude, gemini] });
    expect(first.note).toBe("running");
    expect(first.runId).toBeTruthy();
    const again = await startMonitoring(db, ctx, { adapters: [claude, gemini] });
    expect(again.runId).toBeNull();
    expect(await db.select().from(monitoringRuns).where(eq(monitoringRuns.workspaceId, ctx.workspaceId))).toHaveLength(1);

    await executeRun(db, first.runId!, { adapters: [claude, gemini] });
    const p = await performanceFor(db, ctx);
    expect(p.answers).toBe(4);
    expect(p.score).toBe(25);
    expect(p.avgPosition).toBe(1);
    expect(p.trend).toHaveLength(1);
    // "Try Apex Plumbers." alone is an unconfirmed (ambiguous) mention, so only the two listed answers count.
    expect(p.share[0]).toMatchObject({ name: "Apex Plumbers", answers: 2, share: 67 });
    expect(p.keywords.find((k) => k.keyword === "plumber in Pune")).toMatchObject({ status: "won", rate: 50, rivals: ["Apex Plumbers"] });
    expect(p.keywords.find((k) => k.keyword === "bathroom fitting")).toMatchObject({ status: "lost", rate: 0 });
    expect(p.sources[0]).toMatchObject({ host: "justdial.com", count: 3, own: false });

    const plumber = p.keywords.find((k) => k.keyword === "plumber in Pune")!;
    const detail = await keywordAnswers(db, ctx, plumber.id);
    expect(detail?.answers).toHaveLength(2);
    expect(detail?.answers.find((a) => a.provider === "claude")?.named.map((n) => n.name)).toContain("Sharma Plumbing");
    expect(await keywordAnswers(db, other, plumber.id)).toBeNull();

    const status = await setupStatus(db, ctx);
    expect(status?.done.keywords).toBe(true);
    expect(status?.done.start).toBe(true);
    expect((await performanceFor(db, other)).answers).toBe(0);
  });

  it("Start without any AI source still starts, and says so", async () => {
    await addKeywords(db, ctx, ["plumber in Pune"]);
    const r = await startMonitoring(db, ctx, { adapters: [] });
    expect(r).toMatchObject({ runId: null, note: "no_engines" });
    const [b] = await db.select().from(businesses).where(eq(businesses.workspaceId, ctx.workspaceId));
    expect(b.monitoringStartedAt).toBeInstanceOf(Date);
  });

  it("scheduled checks only run for businesses that pressed Start", async () => {
    process.env.ANTHROPIC_API_KEY = "test";
    process.env.MONITOR_VALIDATED_PROVIDERS = "claude";
    await addKeywords(db, ctx, ["plumber in Pune"]);
    await addKeywords(db, other, ["plumber in Pune"]);
    await grantCredits(db, ctx.workspaceId, 100, "test", `t:${ctx.workspaceId}`);
    await grantCredits(db, other.workspaceId, 100, "test", `t:${other.workspaceId}`);
    await startMonitoring(db, ctx, { adapters: [] });
    const r = await scheduleDueRuns(db);
    expect(r.created).toBe(1);
    expect(await db.select().from(monitoringRuns).where(eq(monitoringRuns.workspaceId, other.workspaceId))).toHaveLength(0);
  });
});
