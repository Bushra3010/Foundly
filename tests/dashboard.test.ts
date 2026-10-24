import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { listingLabel } from "@/lib/geo";
import { keywordGroup, suggestKeywords } from "@/lib/questions";
import { parseListingLinks } from "@/lib/validation";
import { addListing, completeOnboarding, getBusiness, saveWebsiteChoice } from "@/server/business";
import type { Ctx } from "@/server/context";
import { approveQuestions, createRun, executeRun } from "@/server/monitoring/service";
import type { AskResult, ProviderAdapter } from "@/server/monitoring/types";
import { dashboardData, rankPoints } from "@/server/performance";
import { createWebsiteRequest } from "@/server/website-requests";
import { makeDb, onboard, signUp } from "./helpers";

function fakeAdapter(key: ProviderAdapter["key"], answer: (q: string) => Partial<AskResult>): ProviderAdapter {
  return {
    key,
    label: key,
    method: "model_api",
    locale: "text_instruction",
    requiredEnv: [],
    configuredModel: () => "test-model",
    async ask(input: { question: string }): Promise<AskResult> {
      return { status: "answered", answer: "", citations: [], model: "test-model", appliedLocale: "text_instruction", raw: {}, ...answer(input.question) };
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

const load = async () => dashboardData(db, ctx, (await getBusiness(db, ctx))!);

describe("keywords", () => {
  it("suggests short keywords from what the owner typed, and groups typed ones", () => {
    expect(suggestKeywords({ category: "Plumber", city: "Pune" })).toEqual(["best plumber in Pune", "plumber near me in Pune", "affordable plumber in Pune"]);
    expect(suggestKeywords({ category: "", city: "Pune" })).toEqual([]);
    expect(keywordGroup("plumber near Baner")).toBe("location");
    expect(keywordGroup("best plumber in Pune")).toBe("comparison");
    expect(keywordGroup("leak repair in Pune")).toBe("service");
  });
});

describe("keyword limit", () => {
  it("allows up to 5 keywords per business", async () => {
    const five = ["a", "b", "c", "d", "e"].map((x) => ({ text: `plumber ${x} in Pune`, group: "service" as const }));
    await approveQuestions(db, ctx, five);
    await expect(approveQuestions(db, ctx, [{ text: "plumber f in Pune", group: "service" }])).rejects.toThrow(/up to 5 keywords/);
    expect((await load()).keywordLimit).toBe(5);
  });
});

describe("ranking score", () => {
  it("scores each answer by where the business is named", () => {
    expect([1, 2, 3, 7].map((listedPosition) => rankPoints({ mentioned: true, listedPosition }))).toEqual([100, 80, 60, 40]);
    expect(rankPoints({ mentioned: true, listedPosition: null })).toBe(50);
    expect(rankPoints({ mentioned: false, listedPosition: null })).toBe(0);
  });
});

describe("social links", () => {
  it("reads any mix of pasted links and recognises each platform", () => {
    const { urls, bad } = parseListingLinks("instagram.com/sharma  https://www.facebook.com/sharmaplumbing,\nhttps://maps.app.goo.gl/abc123\ninstagram.com/sharma");
    expect(bad).toBeNull();
    expect(urls.map(listingLabel)).toEqual(["Instagram", "Facebook", "Google Business Profile"]);
    expect(parseListingLinks("instagram.com/sharma my page").bad).toBe("my");
    expect(parseListingLinks("   ").urls).toEqual([]);
  });
});

describe("setup progress", () => {
  it("counts keywords, website, social media and tracking, and links each step", async () => {
    let d = await load();
    expect(d.setup.done).toBe(0);
    expect(d.setup.steps.map((s) => s.href)).toEqual(["/onboarding?step=keywords", "/onboarding?step=website", "/onboarding?step=social", "/onboarding?step=start"]);

    await approveQuestions(db, ctx, [{ text: "best plumber in Pune", group: "comparison" }]);
    await saveWebsiteChoice(db, ctx, true, "https://sharmaplumbing.in");
    await addListing(db, ctx, "https://www.instagram.com/sharmaplumbing");
    d = await load();
    expect(d.setup.steps.map((s) => s.done)).toEqual([true, true, true, false]);
    expect(d.social.find((s) => s.key === "instagram")?.state).toBe("linked");

    await completeOnboarding(db, ctx);
    d = await load();
    expect(d.setup.done).toBe(4);
    // After setup, the same steps open the app pages.
    expect(d.setup.steps[0].href).toBe("/app/visibility");
  });

  it("a website request keeps the website step open until a website is connected", async () => {
    await createWebsiteRequest(db, ctx, { goal: "Get more bookings in Pune", pages: null, style: null, examples: null, contactMethod: "phone", contactValue: "+91 98765 43210", contactTime: null });
    let d = await load();
    expect(d.setup.steps[1]).toMatchObject({ done: false, label: "Connect website (being built)" });
    expect(d.website.requested?.status).toBe("new");

    await saveWebsiteChoice(db, ctx, true, "https://sharmaplumbing.in");
    d = await load();
    expect(d.setup.steps[1].done).toBe(true);
    expect(d.website.requested).toBeNull();
  });
});

describe("performance", () => {
  it("shows real results per keyword and per week, and never counts failed answers", async () => {
    await approveQuestions(db, ctx, [
      { text: "best plumber in Pune", group: "comparison" },
      { text: "leak repair in Pune", group: "service" },
    ]);
    let d = await load();
    expect(d.metrics.valid).toBe(0);
    expect(d.trend.every((t) => t.rate === null)).toBe(true);
    expect(d.keywords.every((k) => k.checked === 0)).toBe(true);

    const claude = fakeAdapter("claude", (q) => ({ answer: q.includes("best") ? "1. Sharma Plumbing\n2. Apex" : "Try a local plumber.", citations: [{ url: "https://sharmaplumbing.in" }] }));
    const gemini = fakeAdapter("gemini", () => ({ status: "timeout", answer: null }));
    const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: "manual:dash", adapters: [claude, gemini] });
    await executeRun(db, run.id, { adapters: [claude, gemini] });

    d = await load();
    expect(d.metrics.mention).toMatchObject({ numerator: 1, denominator: 2 });
    const best = d.keywords.find((k) => k.text === "best plumber in Pune")!;
    expect(best).toMatchObject({ checked: 1, mentioned: 1, mentionedBy: ["claude"] });
    expect(d.keywords.find((k) => k.text === "leak repair in Pune")).toMatchObject({ checked: 1, mentioned: 0 });
    expect(d.trend.at(-1)).toMatchObject({ answers: 2, rate: 0.5 });
    expect(d.trend.slice(0, -1).every((t) => t.rate === null)).toBe(true);
    expect(d.lastRun?.id).toBe(run.id);
    // Ranking score per platform: Claude named Sharma 1st for one keyword (100) and not at all for the other (0).
    expect(d.platforms.find((p) => p.key === "claude")).toMatchObject({ checked: 2, named: 1, score: 50, best: 1 });
    // Keyword × platform: "best" was named 1st by Claude (100); "leak" wasn't named (0); Gemini never answered.
    expect(best).toMatchObject({ scores: { claude: 100, gemini: null }, overall: 100 });
    expect(d.keywords.find((k) => k.text === "leak repair in Pune")).toMatchObject({ scores: { claude: 0, gemini: null }, overall: 0 });
    expect(best.trend.at(-1)).toBe(100);
    expect(d.overall).toBe(50);
    expect(d.scoreTrend.at(-1)).toMatchObject({ answers: 2, score: 50 });
    // Gemini only timed out, so it has no score rather than zero.
    expect(d.platforms.find((p) => p.key === "gemini")).toMatchObject({ checked: 0, score: null });
  });
});
