import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { improvementActions, workspaces } from "@/db/schema";
import { presenceKit } from "@/lib/presence";
import { toPublicProfile } from "@/lib/profile";
import { draftActionWithAi, factSheet } from "@/server/audit/ai-draft";
import { approveAction } from "@/server/audit/service";
import { requireBusiness } from "@/server/business";
import { AppError, type Ctx } from "@/server/context";
import { grantCredits } from "@/server/credits";
import { performanceFor } from "@/server/insights";
import { addKeywords } from "@/server/keywords";
import { getListingText, writeListingText } from "@/server/listing-text";
import { addCompetitor, createRun, executeRun, getSamples, manualRunKey, setSamples } from "@/server/monitoring/service";
import type { AskResult, ProviderAdapter } from "@/server/monitoring/types";
import { sendWeeklySummaries, setPrefs } from "@/server/notifications";
import { kitInputFor } from "@/server/presence-input";
import { buildWeeklyReport, buildWeeklyReports, listWeeklyReports, reportToText, templateReport, weekKeyOf } from "@/server/weekly-report";
import { makeDb, onboard, signUp } from "./helpers";

function fake(key: ProviderAdapter["key"], answer: (q: string, n: number) => Partial<AskResult>): ProviderAdapter {
  let n = 0;
  return {
    key,
    label: key,
    method: "model_api",
    locale: "text_instruction",
    requiredEnv: [],
    configuredModel: () => "test-model",
    async ask(input) {
      return { status: "answered", answer: "", citations: [], model: "test-model", appliedLocale: "text_instruction", raw: {}, ...answer(input.question, n++) };
    },
  };
}

describe("AI writing from confirmed facts", () => {
  let db: Db;
  let ctx: Ctx;

  beforeEach(async () => {
    db = await makeDb();
    ctx = await signUp(db, "owner@example.com");
    await onboard(db, ctx, "Sharma Plumbing");
  });

  it("drafts a task's text with AI and leaves what it can't know in brackets", async () => {
    const b = await requireBusiness(db, ctx);
    const [a] = await db
      .insert(improvementActions)
      .values({ workspaceId: ctx.workspaceId, businessId: b.id, checkKey: "about", applyKind: "manual", title: "Tell customers who you are", evidence: "No about section", severity: "medium", priority: 22, hypothesis: "h", proposedChange: "p", draft: "[Who runs the business]" })
      .returning();
    const prompts: string[] = [];
    const complete = async (system: string, user: string) => {
      prompts.push(system, user);
      return "```\nWe are Sharma Plumbing, plumbers in Pune serving Kothrud and Baner. Founded in [year founded].\n```";
    };
    const u = await draftActionWithAi(db, ctx, a.id, { complete });
    expect(u.draft).toBe("We are Sharma Plumbing, plumbers in Pune serving Kothrud and Baner. Founded in [year founded].");
    expect(u.draftRevision).toBe(2);
    expect(u.status).toBe("proposed");
    // The model gets the owner's facts and nothing else; the fact sheet never claims what isn't set.
    expect(prompts[1]).toContain("Business name: Sharma Plumbing");
    expect(prompts[1]).toContain("- Bathroom fitting: Taps, showers and drains.");
    expect(prompts[1]).not.toContain("In business since");
    expect(prompts[0]).toMatch(/Never invent/);
    // The owner approves the new revision like any edit; the earlier revision no longer matches.
    await expect(approveAction(db, ctx, a.id, 1)).rejects.toMatchObject({ code: "precondition_failed" });
    expect((await approveAction(db, ctx, a.id, 2)).status).toBe("approved");

    // Technical tasks keep their fixed drafts.
    const [t] = await db
      .insert(improvementActions)
      .values({ workspaceId: ctx.workspaceId, businessId: b.id, checkKey: "https", applyKind: "manual", title: "HTTPS", evidence: "e", severity: "high", priority: 30, hypothesis: "h", proposedChange: "p", draft: "" })
      .returning();
    await expect(draftActionWithAi(db, ctx, t.id, { complete })).rejects.toMatchObject({ code: "invalid" });
    // Without an AI source the owner is told, not left waiting.
    await expect(draftActionWithAi(db, ctx, a.id, { complete: null })).rejects.toMatchObject({ code: "precondition_failed" });
    expect(factSheet(b, ["Can you recommend the best plumber in Pune?"])).toContain("Questions customers ask AI assistants:\n- Can you recommend the best plumber in Pune?");
  });

  it("writes listing text within each platform's limit and feeds it to the kit and the syncs", async () => {
    const complete = async () =>
      JSON.stringify({
        description750: "Sharma Plumbing fixes leaks and fits bathrooms across Pune. ".repeat(20),
        description500: "Plumbers in Pune for leak repair and bathroom fitting [since 2001].",
        short255: "Sharma Plumbing: plumbers in Pune.",
        about1000: "We are Sharma Plumbing.\n\nWe serve Kothrud and Baner.",
        bio150: "Plumber in Pune · Leak repair · Bathroom fitting",
        tagline120: "Plumbers in Pune",
      });
    const data = await writeListingText(db, ctx, { complete });
    expect(data.description750.length).toBeLessThanOrEqual(750);
    expect(data.description750.endsWith(".")).toBe(true);
    expect(data.description500).toBe("Plumbers in Pune for leak repair and bathroom fitting.");
    expect((await getListingText(db, ctx))?.data.bio150).toBe("Plumber in Pune · Leak repair · Bathroom fitting");

    const b = await requireBusiness(db, ctx);
    const { input, stale } = await kitInputFor(db, ctx, b);
    expect(stale).toBe(false);
    const kit = presenceKit(input);
    const field = (platform: string, label: string) => kit.find((k) => k.key === platform)!.fields.find((f) => f.label === label)!.value;
    expect(field("google", "Description")).toBe(data.description750);
    expect(field("justdial", "Description")).toBe(data.description500);
    expect(field("facebook", "Short description")).toBe("Sharma Plumbing: plumbers in Pune.");
    expect(field("facebook", "About")).toBe("We are Sharma Plumbing.\n\nWe serve Kothrud and Baner.");
    expect(field("instagram", "Bio")).toBe(data.bio150);
    expect(field("linkedin", "Tagline")).toBe("Plumbers in Pune");
    // Without AI text the kit still writes everything from the template.
    const p = toPublicProfile(b);
    const plain = presenceKit({ ...p, websiteUrl: "https://x.in", profileUrl: "https://x.in/p" });
    expect(plain.find((k) => k.key === "google")!.fields.find((f) => f.label === "Description")!.value).toContain("Sharma Plumbing is a plumber in Pune");
    // A model reply with nothing usable is refused, not stored.
    await expect(writeListingText(db, ctx, { complete: async () => "sorry" })).rejects.toMatchObject({ code: "invalid" });
    await expect(writeListingText(db, ctx, { complete: null })).rejects.toMatchObject({ code: "precondition_failed" });
  });

  it("asks each prompt 3 times when the workspace chooses so, and reads the majority per assistant", async () => {
    await addKeywords(db, ctx, ["plumber in Pune"]);
    await grantCredits(db, ctx.workspaceId, 100, "test", `t:${ctx.workspaceId}`);
    expect(await getSamples(db, ctx.workspaceId)).toBe(1);
    await expect(setSamples(db, ctx, 2)).rejects.toBeInstanceOf(AppError);
    await setSamples(db, ctx, 3);
    expect((await db.select().from(workspaces).where(eq(workspaces.id, ctx.workspaceId)))[0].samples).toBe(3);
    // Two of three answers name the business, at #1 and #3.
    const adapter = fake("chatgpt", (_q, n) => ({ answer: n === 1 ? "1. Apex Plumbers\n2. Other" : n === 0 ? "1. Sharma Plumbing\n2. Apex" : "1. Apex\n2. Other\n3. Sharma Plumbing" }));
    const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: manualRunKey("s3"), adapters: [adapter] });
    expect(run.samples).toBe(3);
    expect(run.plannedObservations).toBe(3);
    await executeRun(db, run.id, { adapters: [adapter], sentiment: null });
    const p = await performanceFor(db, ctx, 30);
    expect(p.answers).toBe(3);
    expect(p.score).toBe(67);
    const cell = p.keywords[0].byEngine.chatgpt!;
    expect(cell).toEqual({ named: true, position: 2, samples: 3 });
    expect(p.keywords[0].rate).toBe(67);
    expect(p.keywords[0].status).toBe("won");
  });

  it("writes a weekly report comparing this week with last, from a model or from the numbers", async () => {
    await addKeywords(db, ctx, ["plumber in Pune", "leak repair"]);
    await addCompetitor(db, ctx, "Apex Plumbers");
    await grantCredits(db, ctx.workspaceId, 100, "test", `t:${ctx.workspaceId}`);
    // Last week: named for neither prompt.
    const before = fake("chatgpt", () => ({ answer: "1. Apex Plumbers\n2. Other", citations: [{ url: "https://justdial.com/pune/plumbers" }] }));
    const r1 = await createRun(db, ctx, { trigger: "manual", idempotencyKey: manualRunKey("w1"), adapters: [before] });
    await executeRun(db, r1.id, { adapters: [before], sentiment: null });
    await db.execute(`update observations set captured_at = now() - interval '8 days' where run_id = '${r1.id}'`);
    // This week: named for "plumber in Pune" only.
    const after = fake("chatgpt", (q) => ({ answer: q.includes("plumber") ? "1. Sharma Plumbing\n2. Apex Plumbers" : "1. Apex Plumbers\n2. Other", citations: [{ url: "https://justdial.com/pune/plumbers" }] }));
    const r2 = await createRun(db, ctx, { trigger: "manual", idempotencyKey: manualRunKey("w2"), adapters: [after] });
    await executeRun(db, r2.id, { adapters: [after], sentiment: null });
    const now = new Date();

    // From the numbers alone.
    const t = await buildWeeklyReport(db, ctx, { now, complete: null });
    expect(t.weekKey).toBe(weekKeyOf(now));
    expect(t.data.source).toBe("template");
    expect(t.data.numbers).toMatchObject({ coverage: 50, prevCoverage: 0, answers: 2, won: ["plumber in Pune"], lost: [], sources: ["justdial.com"] });
    expect(t.data.numbers.gaps).toEqual([{ keyword: "leak repair", rivals: ["Apex Plumbers"] }]);
    expect(t.data.headline).toBe("Coverage rose to 50% (+50 pts vs last week).");
    expect(t.data.summary).toContain("Newly recommended for: plumber in Pune.");
    expect(t.data.actions[0]).toContain("“leak repair”");
    expect(t.data.actions[1]).toContain("justdial.com");

    // From a model: it sees the numbers and its text replaces the template; the numbers stay.
    let seen = "";
    const complete = async (_s: string, u: string) => {
      seen = u;
      return '{"headline":"You are now recommended for plumber in Pune.","summary":"Coverage went from 0% to 50%.","actions":["Describe leak repair on your website.","Complete your Justdial listing.","Add a prompt."]}';
    };
    const r = await buildWeeklyReport(db, ctx, { now, complete });
    expect(seen).toContain('"won": [\n  "plumber in Pune"\n ]');
    expect(r.data.source).toBe("ai");
    expect(r.data.headline).toBe("You are now recommended for plumber in Pune.");
    expect(r.data.actions).toHaveLength(3);
    // One report per week: rewriting replaced it.
    expect(await listWeeklyReports(db, ctx)).toHaveLength(1);
    // A broken model reply falls back to the template rather than failing.
    const f = await buildWeeklyReport(db, ctx, { now, complete: async () => "oops" });
    expect(f.data.source).toBe("template");
    expect(reportToText("Sharma Plumbing", f.weekKey, f.data)).toContain("What to do this week:\n1. ");
    // Manual rewrites are limited per day.
    await buildWeeklyReport(db, ctx, { now, complete: null, manual: true });
    await buildWeeklyReport(db, ctx, { now, complete: null, manual: true });
    await expect(buildWeeklyReport(db, ctx, { now, complete: null, manual: true })).rejects.toMatchObject({ code: "rate_limited" });

    // The Monday job builds one for every workspace with answers, and the email carries it.
    const other = await signUp(db, "other@example.com");
    await onboard(db, other, "Other Plumbing");
    expect(await buildWeeklyReports(db, now)).toBe(1);
    await setPrefs(db, ctx, { weeklySummary: true });
    expect(await sendWeeklySummaries(db, weekKeyOf(now))).toBe(1);
    expect(await sendWeeklySummaries(db, weekKeyOf(now))).toBe(0);
    expect(templateReport("X", { coverage: null, prevCoverage: null, avgPosition: null, prevAvgPosition: null, share: null, prevShare: null, answers: 0, won: [], lost: [], gaps: [], sources: [], openTasks: [] }).actions).toHaveLength(1);
  });
});
