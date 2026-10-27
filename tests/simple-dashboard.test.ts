import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { trackedQuestions } from "@/db/schema";
import type { Db } from "@/db";
import { normalizeKeyword, parseKeywordList, questionForKeyword } from "@/lib/keywords";
import { AppError, type Ctx } from "@/server/context";
import { grantCredits } from "@/server/credits";
import { addKeywords, editKeyword } from "@/server/keywords";
import { addCompetitor, createRun, executeRun, listQuestions, manualRunKey } from "@/server/monitoring/service";
import type { AskResult, ProviderAdapter } from "@/server/monitoring/types";
import { citationsFor, keywordAnswers, keywordsCsv, performanceFor } from "@/server/insights";
import { researchKeywords, suggestCompetitors } from "@/server/research";
import { toneAround } from "@/lib/tone";
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
    // An area instead of the city: the city follows with a comma, never "in".
    expect(questionForKeyword("best dental clinic Andheri East", "Mumbai")).toBe("Can you recommend the best dental clinic Andheri East, Mumbai?");
    expect(questionForKeyword("dentist kothrud", "Pune", ["Kothrud", "Baner"])).toBe("Can you recommend the best dentist kothrud, Pune?");
    expect(questionForKeyword("teeth cleaning cost Mumbai", "Mumbai")).toBe("Can you recommend the best teeth cleaning cost Mumbai?");
    expect(questionForKeyword("Dental Implants", "Mumbai")).toBe("Can you recommend the best dental Implants in Mumbai?");
    // Already a question: asked as typed, never wrapped.
    expect(questionForKeyword("Who can I hire for software in Mumbai?", "Mumbai")).toBe("Who can I hire for software in Mumbai?");
    expect(questionForKeyword("which dentist is open on Sunday in Indore", "Indore")).toBe("which dentist is open on Sunday in Indore?");
  });

  it("cleans pasted lists", () => {
    expect(parseKeywordList(' "dentist in indore"?, Dentist in Indore\nx\nteeth cleaning ')).toEqual(["dentist in indore", "teeth cleaning"]);
    expect(normalizeKeyword("  plumber   in Pune!! ")).toBe("plumber in Pune");
  });
});

describe("tone", () => {
  it("reads the wording around the business name", () => {
    expect(toneAround("1. Sharma Plumbing — trusted and highly rated\n2. Apex", "Sharma Plumbing")).toBe("positive");
    expect(toneAround("Sharma Plumbing has mixed reviews; some customers report delays.", "Sharma Plumbing")).toBe("negative");
    expect(toneAround("Sharma Plumbing is not recommended for big jobs.", "Sharma Plumbing")).toBe("negative");
    expect(toneAround("1. Sharma Plumbing\n2. Apex", "Sharma Plumbing")).toBe("neutral");
    expect(toneAround("The best plumbers: Apex. Also Sharma Plumbing.", "Sharma Plumbing")).toBe("neutral");
  });
});

describe("keywords and performance", () => {
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

  it("keywords become tracked questions, once each, within the workspace", async () => {
    expect(await addKeywords(db, ctx, ["plumber in Pune", "leak repair"])).toBe(2);
    expect(await addKeywords(db, ctx, ["Plumber in Pune"])).toBe(0);
    const qs = await listQuestions(db, ctx);
    expect(qs.map((q) => q.keyword).sort()).toEqual(["leak repair", "plumber in Pune"]);
    expect(qs.find((q) => q.keyword === "leak repair")?.text).toBe("Can you recommend the best leak repair in Pune?");
    // Another workspace can't change them.
    await expect(editKeyword(db, other, qs[0].id, "hacked")).rejects.toBeInstanceOf(AppError);
    // Re-saving an unchanged keyword keeps it as is…
    expect(await editKeyword(db, ctx, qs[0].id, qs[0].keyword!)).toBe(0);
    // …but refreshes the question when the wording rules changed since it was built.
    await db.update(trackedQuestions).set({ text: "Old wording?" }).where(eq(trackedQuestions.id, qs[0].id));
    expect(await editKeyword(db, ctx, qs[0].id, qs[0].keyword!)).toBe(1);
    const refreshed = (await listQuestions(db, ctx)).find((q) => q.keyword === qs[0].keyword)!;
    expect(refreshed.id).not.toBe(qs[0].id);
    expect(refreshed.text).not.toBe("Old wording?");
    await editKeyword(db, ctx, refreshed.id, "emergency plumber in Pune");
    expect((await listQuestions(db, ctx)).map((q) => q.keyword)).toContain("emergency plumber in Pune");
    expect(await listQuestions(db, other)).toHaveLength(0);
  });

  it("shows how often AI recommends the business, per keyword, against competitors", async () => {
    await addKeywords(db, ctx, ["plumber in Pune", "bathroom fitting"]);
    await addCompetitor(db, ctx, "Apex Plumbers");
    await grantCredits(db, ctx.workspaceId, 100, "test", `t:${ctx.workspaceId}`);
    const claude = fake("claude", (q) =>
      q.includes("plumber")
        ? { answer: "1. Sharma Plumbing\n2. Apex Plumbers", citations: [{ url: "https://www.justdial.com/Pune/plumbers" }] }
        : { answer: "1. Apex Plumbers\n2. City Fitters" },
    );
    const gemini = fake("gemini", () => ({ answer: "Try Apex Plumbers.", citations: [{ url: "https://justdial.com/x" }] }));
    const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: manualRunKey("first"), adapters: [claude, gemini] });
    await executeRun(db, run.id, { adapters: [claude, gemini] });

    const p = await performanceFor(db, ctx);
    expect(p.answers).toBe(4);
    expect(p.score).toBe(25);
    expect(p.avgPosition).toBe(1);
    expect(p.trend).toHaveLength(1);
    // Apex is named in all four answers, Sharma in one: 4 of 5 recommendations.
    expect(p.share[0]).toMatchObject({ name: "Apex Plumbers", answers: 4, share: 80 });
    expect(p.keywords.find((k) => k.keyword === "plumber in Pune")).toMatchObject({ status: "won", rate: 50, rivals: ["Apex Plumbers"] });
    expect(p.keywords.find((k) => k.keyword === "bathroom fitting")).toMatchObject({ status: "lost", rate: 0 });
    expect(p.sources[0]).toMatchObject({ host: "justdial.com", count: 3, own: false });

    const plumber = p.keywords.find((k) => k.keyword === "plumber in Pune")!;
    const detail = await keywordAnswers(db, ctx, plumber.id);
    expect(detail?.answers).toHaveLength(2);
    expect(detail?.answers.find((a) => a.provider === "claude")?.named.map((n) => n.name)).toContain("Sharma Plumbing");
    expect(await keywordAnswers(db, other, plumber.id)).toBeNull();
    expect((await performanceFor(db, other)).answers).toBe(0);

    // Gaps: "bathroom fitting" named Apex and not Sharma on both assistants.
    expect(p.gaps.find((g) => g.keyword === "bathroom fitting")).toMatchObject({ rivals: ["Apex Plumbers"] });
    expect(p.gaps.find((g) => g.keyword === "bathroom fitting")?.engines).toHaveLength(2);
    // Filter to one assistant.
    const onlyGemini = await performanceFor(db, ctx, 30, "gemini");
    expect(onlyGemini.answers).toBe(2);
    expect(onlyGemini.score).toBe(0);
    expect(onlyGemini.engines).toHaveLength(2);
    // Sources page: justdial.com cited in 3 answers, 1 of them naming the business.
    const c = await citationsFor(db, ctx);
    expect(c.domains[0]).toMatchObject({ host: "justdial.com", answers: 3, namedYou: 1 });
    expect(c.urls.length).toBeGreaterThan(0);
    expect((await citationsFor(db, other)).domains).toHaveLength(0);
    // CSV export.
    const csv = keywordsCsv(p);
    expect(csv.split("\n")[0]).toContain("Keyword,Question asked,Result");
    expect(csv).toContain("plumber in Pune,Can you recommend the best plumber in Pune?,Recommended,50");
  });

  it("finds keyword ideas with AI, without the business name or tracked keywords", async () => {
    await addKeywords(db, ctx, ["plumber in Pune"]);
    const ai = fake("claude", () => ({ answer: "1. plumber in Pune\n2. emergency plumber Kothrud\n- Sharma Plumbing reviews\n3. leak repair near Baner\nx" }));
    const r = await researchKeywords(db, ctx, "", { adapter: ai });
    expect(r.source).toBe("ai");
    expect(r.ideas).toEqual(["emergency plumber Kothrud", "leak repair near Baner"]);
    const rivals = await suggestCompetitors(db, ctx, {
      adapter: fake("claude", () => ({ answer: "Here are some options:\n1. **Apex Plumbers** – fast service\n2. Sharma Plumbing\n- Pune Pipe Masters: 24x7\n3. Apex Plumbers" })),
    });
    expect(rivals).toEqual(["Apex Plumbers", "Pune Pipe Masters"]);
    expect(await suggestCompetitors(db, ctx, { adapter: null })).toEqual([]);
    const offline = await researchKeywords(db, ctx, "", { adapter: null });
    expect(offline.source).toBe("details");
    expect(offline.ideas.length).toBeGreaterThan(0);
  });
});
