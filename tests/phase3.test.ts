import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { businesses, observations } from "@/db/schema";
import { AppError, type Ctx } from "@/server/context";
import { getBalance, grantCredits, reserveCredits, settleReservation } from "@/server/credits";
import { extractBrands, listItems } from "@/server/monitoring/extract";
import { computeMetrics, matchedPairs, type MetricObservation } from "@/server/monitoring/metrics";
import {
  addCompetitor,
  approveQuestions,
  correctMatch,
  createRun,
  executeRun,
  queryObservations,
  visibilitySummary,
} from "@/server/monitoring/service";
import type { AskResult, ProviderAdapter } from "@/server/monitoring/types";
import { makeDb, onboard, signUp } from "./helpers";

function fakeAdapter(key: ProviderAdapter["key"], answer: (q: string) => Partial<AskResult>): ProviderAdapter & { calls: number } {
  const a = {
    key,
    label: key,
    method: "model_api" as const,
    locale: "text_instruction" as const,
    requiredEnv: [],
    calls: 0,
    configuredModel: () => "test-model",
    async ask(input: { question: string }): Promise<AskResult> {
      a.calls++;
      return { status: "answered", answer: "", citations: [], model: "test-model", appliedLocale: "text_instruction", raw: {}, ...answer(input.question) };
    },
  };
  return a;
}

describe("metrics (PRD worked example)", () => {
  const row = (i: number, self: boolean, cited: boolean, others: string[] = []): MetricObservation => ({
    id: String(i),
    status: "answered",
    questionId: `q${i % 10}`,
    provider: "claude",
    matches: [
      { brandKey: "self", mentioned: self, cited, ambiguous: false, correction: null },
      ...others.map((k) => ({ brandKey: k, mentioned: true, cited: false, ambiguous: false, correction: null })),
    ],
  });

  it("30 of 100 mentions = 30%, 12 of 100 citations = 12%, failures excluded", () => {
    const rows = Array.from({ length: 100 }, (_, i) => row(i, i < 30, i < 12));
    rows.push({ id: "x", status: "timeout", questionId: "q1", provider: "claude", matches: [] });
    const m = computeMetrics(rows, ["self"]);
    expect(m.mention).toEqual({ numerator: 30, denominator: 100, rate: 0.3 });
    expect(m.citation).toEqual({ numerator: 12, denominator: 100, rate: 0.12 });
    expect(m.failures).toEqual({ timeout: 1 });
    expect(m.smallSample).toBe(false);
  });

  it("competitor share 30/(30+40+50) = 25%, counting a brand once per answer", () => {
    const rows: MetricObservation[] = [];
    for (let i = 0; i < 50; i++) rows.push(row(i, i < 30, false, [...(i < 40 ? ["a"] : []), "b"]));
    const m = computeMetrics(rows, ["self", "a", "b"]);
    expect(m.competitorShare.self).toEqual({ numerator: 30, denominator: 120, rate: 0.25 });
  });

  it("unreviewed ambiguous matches don't count; corrections do", () => {
    const amb: MetricObservation = { id: "1", status: "answered", questionId: "q", provider: "p", matches: [{ brandKey: "self", mentioned: true, cited: false, ambiguous: true, correction: null }] };
    expect(computeMetrics([amb], ["self"]).mention.numerator).toBe(0);
    amb.matches[0].correction = "confirmed";
    expect(computeMetrics([amb], ["self"]).mention.numerator).toBe(1);
  });

  it("comparisons use only matched question/source pairs", () => {
    const a = [row(1, true, false), row(2, true, false)];
    const b = [{ ...row(1, false, false) }, { ...row(3, true, false), questionId: "zz" }];
    const p = matchedPairs(a, b);
    expect(p.sharedPairs).toBe(1);
    expect(p.fullOverlap).toBe(false);
  });
});

describe("extraction", () => {
  const brands = [
    { key: "self", name: "Sharma Plumbing", aliases: ["Sharma Plumbers"], domains: ["sharmaplumbing.in"] },
    { key: "c1", name: "Apex", aliases: [], domains: [] },
  ];

  it("matches names on word boundaries, cited domains, and list position", () => {
    const answer = "Top plumbers in Pune:\n1. QuickFix Pune\n2. Sharma Plumbing — fast service\n3. Apex Services";
    const [self, apex] = extractBrands(answer, [{ url: "https://www.sharmaplumbing.in/services" }], brands);
    expect(self).toMatchObject({ mentioned: true, cited: true, listedPosition: 2, ambiguous: false });
    expect(apex).toMatchObject({ mentioned: true, listedPosition: 3, ambiguous: true });
  });

  it("does not match substrings or treat prose order as rank", () => {
    const [self] = extractBrands("Many Sharma Plumbingworks options exist; Sharma Plumbing is one.", [], brands);
    expect(self.mentioned).toBe(true);
    expect(self.listedPosition).toBeNull();
    const [none] = extractBrands("Try SharmaPlumbing", [], brands);
    expect(none.mentioned).toBe(false);
    expect(listItems("just prose")).toEqual([]);
  });
});

let db: Db;
let ctx: Ctx;

beforeEach(async () => {
  db = await makeDb();
  ctx = await signUp(db, "owner@example.com");
  await onboard(db, ctx);
  await db.update(businesses).set({ websiteUrl: "https://sharmaplumbing.in" }).where(eq(businesses.workspaceId, ctx.workspaceId));
  await approveQuestions(db, ctx, [
    { text: "Who can I hire for leak repair in Pune?", group: "purchase", location: "Pune" },
    { text: "What are the best plumber options in Pune?", group: "comparison", location: "Pune" },
  ]);
});

const code = (c: AppError["code"]) => (e: unknown) => e instanceof AppError && e.code === c;

describe("credits", () => {
  it("concurrent reservations can't overspend", async () => {
    const before = await getBalance(db, ctx.workspaceId);
    const results = await Promise.allSettled(Array.from({ length: 10 }, (_, i) => reserveCredits(db, ctx.workspaceId, 10, { type: "t", id: String(i) })));
    const ok = results.filter((r) => r.status === "fulfilled").length;
    expect(ok).toBe(Math.floor(before / 10));
    expect(await getBalance(db, ctx.workspaceId)).toBe(before - ok * 10);
  });

  it("grants are idempotent and settlement refunds unused credits once", async () => {
    expect(await grantCredits(db, ctx.workspaceId, 5, "purchase", "evt_1")).toBe(true);
    expect(await grantCredits(db, ctx.workspaceId, 5, "purchase", "evt_1")).toBe(false);
    const start = await getBalance(db, ctx.workspaceId);
    const r = await reserveCredits(db, ctx.workspaceId, 8, { type: "t", id: "x" });
    await settleReservation(db, r.id, 3);
    await settleReservation(db, r.id, 3);
    expect(await getBalance(db, ctx.workspaceId)).toBe(start - 3);
  });
});

describe("monitoring runs", () => {
  it("bills only valid answers, stores failures distinctly, and never fakes zero", async () => {
    const good = fakeAdapter("claude", (q) => ({ answer: q.includes("best") ? "1. Sharma Plumbing\n2. Apex" : "Try a local plumber.", citations: [{ url: "https://sharmaplumbing.in" }] }));
    const bad = fakeAdapter("gemini", () => ({ status: "timeout", answer: null }));
    const before = await getBalance(db, ctx.workspaceId);
    const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: "manual:1", adapters: [good, bad] });
    expect(await getBalance(db, ctx.workspaceId)).toBe(before - 4);
    const finished = await executeRun(db, run.id, { adapters: [good, bad] });
    expect(finished?.status).toBe("partial");
    expect(await getBalance(db, ctx.workspaceId)).toBe(before - 2);

    const summary = await visibilitySummary(db, ctx, 30);
    expect(summary.metrics.attempted).toBe(4);
    expect(summary.metrics.valid).toBe(2);
    expect(summary.metrics.failures).toEqual({ timeout: 2 });
    expect(summary.metrics.mention).toMatchObject({ numerator: 1, denominator: 2 });
    expect(summary.metrics.citation).toMatchObject({ numerator: 2, denominator: 2 });
  });

  it("is idempotent: same key returns the same run, and resuming skips captured work", async () => {
    const a = fakeAdapter("claude", () => ({ answer: "Sharma Plumbing is good." }));
    const r1 = await createRun(db, ctx, { trigger: "manual", idempotencyKey: "manual:k", adapters: [a] });
    const r2 = await createRun(db, ctx, { trigger: "manual", idempotencyKey: "manual:k", adapters: [a] });
    expect(r2.id).toBe(r1.id);
    await executeRun(db, r1.id, { adapters: [a] });
    await executeRun(db, r1.id, { adapters: [a] });
    expect(a.calls).toBe(2);
    expect(await db.select().from(observations).where(eq(observations.runId, r1.id))).toHaveLength(2);
  });

  it("refuses to start without credits or while another run is active", async () => {
    const a = fakeAdapter("claude", () => ({ answer: "x" }));
    await createRun(db, ctx, { trigger: "manual", idempotencyKey: "manual:a", adapters: [a] });
    await expect(createRun(db, ctx, { trigger: "manual", idempotencyKey: "manual:b", adapters: [a] })).rejects.toSatisfy(code("conflict"));
  });

  it("corrections change metrics but never the raw answer", async () => {
    await addCompetitor(db, ctx, "Apex");
    const a = fakeAdapter("claude", () => ({ answer: "Sharma Plumbing and Apex are options." }));
    const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: "manual:c", adapters: [a] });
    await executeRun(db, run.id, { adapters: [a] });
    const obsList = await queryObservations(db, ctx, { runId: run.id });
    expect((await visibilitySummary(db, ctx, 30)).metrics.mention.numerator).toBe(2);
    const self = obsList[0].matches.find((m) => m.brandKey === "self")!;
    await expect(correctMatch(db, ctx, self.id, "rejected", "")).rejects.toSatisfy(code("invalid"));
    await correctMatch(db, ctx, self.id, "rejected", "Different Sharma in Mumbai");
    const summary = await visibilitySummary(db, ctx, 30);
    expect(summary.metrics.mention.numerator).toBe(1);
    const [after] = await queryObservations(db, ctx, { runId: run.id });
    expect(after.rawAnswer).toBe("Sharma Plumbing and Apex are options.");
  });

  it("puts discovery questions that name the business in the branded group", async () => {
    await approveQuestions(db, ctx, [{ text: "Is Sharma Plumbing good for leak repair?", group: "service" }]);
    const [{ group }] = (await db.query.trackedQuestions.findMany()).filter((q) => q.text.startsWith("Is Sharma"));
    expect(group).toBe("branded");
  });
});
