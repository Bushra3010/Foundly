import "server-only";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import type { Db, DbOrTx } from "@/db";
import { businesses, improvementActions, observations, weeklyReports, type WeeklyReportData } from "@/db/schema";
import { jsonObject, pickCompleter, type Completer } from "./ai/complete";
import { AppError, requireRole, type Ctx } from "./context";
import { performanceFor, type Performance } from "./insights";
import { isoWeek } from "./monitoring/service";
import { rateLimit } from "./rate-limit";

const PER_DAY = 2;
const OPEN = ["detected", "proposed", "owner_edited", "approved"] as const;

export const weekKeyOf = (d = new Date()) => isoWeek(d);

export async function listWeeklyReports(db: DbOrTx, ctx: Ctx, limit = 12) {
  requireRole(ctx, "viewer");
  return db.select().from(weeklyReports).where(eq(weeklyReports.workspaceId, ctx.workspaceId)).orderBy(desc(weeklyReports.generatedAt)).limit(limit);
}

export type WeeklyReport = typeof weeklyReports.$inferSelect;

export async function latestWeeklyReport(db: DbOrTx, ctx: Ctx): Promise<WeeklyReport | null> {
  const [row] = await listWeeklyReports(db, ctx, 1);
  return row ?? null;
}

const delta = (now: number | null, before: number | null) => (now === null || before === null ? null : Math.round((now - before) * 10) / 10);
const signed = (n: number, unit = "") => `${n > 0 ? "+" : ""}${n}${unit}`;

/** The numbers a report is written from: this week against the week before. */
export function reportNumbers(cur: Performance, prev: Performance, openTasks: string[]): WeeklyReportData["numbers"] {
  const self = (p: Performance) => p.share.find((b) => b.self) ?? null;
  const wonNow = new Set(cur.keywords.filter((k) => k.status === "won").map((k) => k.id));
  const wonBefore = new Set(prev.keywords.filter((k) => k.status === "won").map((k) => k.id));
  const checkedBefore = new Set(prev.keywords.filter((k) => k.status !== "pending").map((k) => k.id));
  return {
    coverage: cur.score,
    prevCoverage: prev.answers ? prev.score : null,
    avgPosition: cur.avgPosition,
    prevAvgPosition: prev.answers ? prev.avgPosition : null,
    share: cur.answers ? (self(cur)?.share ?? null) : null,
    prevShare: prev.answers ? (self(prev)?.share ?? null) : null,
    answers: cur.answers,
    won: cur.keywords.filter((k) => wonNow.has(k.id) && !wonBefore.has(k.id)).map((k) => k.keyword),
    lost: cur.keywords.filter((k) => k.status !== "pending" && !wonNow.has(k.id) && wonBefore.has(k.id) && checkedBefore.has(k.id)).map((k) => k.keyword),
    gaps: cur.gaps.slice(0, 5).map((g) => ({ keyword: g.keyword, rivals: g.rivals.slice(0, 3) })),
    sources: cur.sources.slice(0, 5).map((s) => s.host),
    openTasks: openTasks.slice(0, 3),
  };
}

/** A readable report from the numbers alone, used when no model is connected and as the fallback when one fails. */
export function templateReport(name: string, n: WeeklyReportData["numbers"]): Pick<WeeklyReportData, "headline" | "summary" | "actions"> {
  const dCov = delta(n.coverage, n.prevCoverage);
  const headline =
    n.coverage === null
      ? `No AI answers were collected for ${name} this week.`
      : dCov === null
        ? `AI named ${name} in ${n.coverage}% of answers this week.`
        : dCov === 0
          ? `Coverage held at ${n.coverage}% this week.`
          : `Coverage ${dCov > 0 ? "rose" : "fell"} to ${n.coverage}% (${signed(dCov, " pts")} vs last week).`;
  const parts: string[] = [`${n.answers} AI answer${n.answers === 1 ? "" : "s"} were checked.`];
  if (n.avgPosition !== null) parts.push(`When named, ${name} came ${n.avgPosition <= 1.5 ? "first" : `around #${Math.round(n.avgPosition)}`} in the list${n.prevAvgPosition !== null && delta(n.avgPosition, n.prevAvgPosition) ? ` (last week #${Math.round(n.prevAvgPosition)})` : ""}.`);
  if (n.share !== null) parts.push(`Share of voice against tracked competitors: ${n.share}%${n.prevShare !== null && n.share !== n.prevShare ? ` (${signed(n.share - n.prevShare, " pts")})` : ""}.`);
  if (n.won.length) parts.push(`Newly recommended for: ${n.won.join(", ")}.`);
  if (n.lost.length) parts.push(`No longer recommended for: ${n.lost.join(", ")}.`);
  if (n.gaps.length) parts.push(`Competitors were named instead for ${n.gaps.map((g) => `“${g.keyword}”${g.rivals.length ? ` (${g.rivals.join(", ")})` : ""}`).join(", ")}.`);
  if (n.sources.length) parts.push(`AI read ${n.sources.slice(0, 3).join(", ")} most to answer.`);
  const actions: string[] = [];
  if (n.gaps.length) actions.push(`Open “${n.gaps[0].keyword}” on Prompts and read the answer that left you out; make sure your website and listings describe that service plainly.`);
  if (n.sources.length) actions.push(`Check that your listing on ${n.sources[0]} is complete and matches your website, since AI reads it to answer.`);
  for (const t of n.openTasks) if (actions.length < 3) actions.push(`Finish the task “${t}” on GEO audit & fixes.`);
  if (actions.length === 0) actions.push("Keep your details confirmed and add one prompt for a service you want to be found for.");
  return { headline, summary: parts.join(" "), actions: actions.slice(0, 3) };
}

const SYSTEM =
  "You write a short weekly report for the owner of a small local business in India about how AI assistants (ChatGPT, Gemini, Claude, Perplexity) recommend it. " +
  "Use only the numbers given; never invent causes, numbers or names, and never derive counts that are not in the data (say 50% coverage, not 8 of 16 answers). Plain, friendly Indian English, no hype, no exclamation marks. " +
  'Reply with only JSON: {"headline": "one sentence, at most 15 words, the single most important change", "summary": "3 to 5 sentences on what changed this week versus last week and why it matters", "actions": ["3 specific things to do this week, each one sentence, each tied to a number, keyword, competitor, source or task in the data"]}.';

/**
 * This week's report: what changed against the week before and what to do,
 * written by a model from the stored numbers, or from a template when no
 * model is connected. One report per workspace per ISO week; building it
 * again replaces it.
 */
export async function buildWeeklyReport(
  db: Db,
  ctx: Ctx,
  opts: { now?: Date; complete?: Completer | null; manual?: boolean } = {},
) {
  requireRole(ctx, "viewer");
  const now = opts.now ?? new Date();
  const weekKey = weekKeyOf(now);
  if (opts.manual && !(await rateLimit(db, `weekly-report:${ctx.workspaceId}`, PER_DAY, 86_400_000))) {
    throw new AppError("rate_limited", `You can rewrite the weekly report ${PER_DAY} times a day. Try again tomorrow.`);
  }
  const [b] = await db.select({ name: businesses.name }).from(businesses).where(eq(businesses.workspaceId, ctx.workspaceId)).limit(1);
  if (!b) throw new AppError("not_found", "Add your business first.");
  const [cur, prev, tasks] = await Promise.all([
    performanceFor(db, ctx, 7, { to: now }),
    performanceFor(db, ctx, 7, { to: new Date(now.getTime() - 7 * 86_400_000) }),
    db
      .select({ title: improvementActions.title })
      .from(improvementActions)
      .where(and(eq(improvementActions.workspaceId, ctx.workspaceId), inArray(improvementActions.status, [...OPEN])))
      .orderBy(desc(improvementActions.priority))
      .limit(3),
  ]);
  if (cur.answers === 0) throw new AppError("precondition_failed", "No AI answers were collected in the last 7 days, so there is nothing to report yet. Run a check first.");
  const numbers = reportNumbers(cur, prev, tasks.map((t) => t.title));
  const complete = pickCompleter(opts.complete);
  let text = templateReport(b.name, numbers);
  let source: WeeklyReportData["source"] = "template";
  if (complete) {
    try {
      const json = jsonObject<Partial<Pick<WeeklyReportData, "headline" | "summary" | "actions">>>(await complete(SYSTEM, `Business: ${b.name}\nWeek: ${weekKey}\n\nNumbers (this week vs last week):\n${JSON.stringify(numbers, null, 1)}`));
      if (json && typeof json.headline === "string" && typeof json.summary === "string" && Array.isArray(json.actions) && json.actions.length) {
        text = { headline: json.headline.trim().slice(0, 200), summary: json.summary.trim().slice(0, 1500), actions: json.actions.map((a) => String(a).trim().slice(0, 300)).filter(Boolean).slice(0, 3) };
        source = "ai";
      }
    } catch (err) {
      console.error("[weekly-report] model failed, using the template", err);
    }
  }
  const data: WeeklyReportData = { ...text, numbers, source };
  const [row] = await db
    .insert(weeklyReports)
    .values({ workspaceId: ctx.workspaceId, weekKey, data, generatedAt: new Date() })
    .onConflictDoUpdate({ target: [weeklyReports.workspaceId, weeklyReports.weekKey], set: { data, generatedAt: new Date() } })
    .returning();
  return row;
}

/** Cron (Mondays): a report for every workspace with AI answers in the last 7 days. Never throws. */
export async function buildWeeklyReports(db: Db, now = new Date()) {
  const since = new Date(now.getTime() - 7 * 86_400_000);
  const rows = await db.selectDistinct({ workspaceId: observations.workspaceId }).from(observations).where(gte(observations.capturedAt, since));
  let built = 0;
  for (const { workspaceId } of rows) {
    try {
      await buildWeeklyReport(db, { workspaceId, userId: "", role: "viewer" }, { now });
      built++;
    } catch (err) {
      if (!(err instanceof AppError)) console.error("[weekly-report]", workspaceId, err);
    }
  }
  return built;
}

/** The report as plain text, for email. */
export function reportToText(name: string, weekKey: string, r: WeeklyReportData) {
  return [
    `${name}: your AI search week (${weekKey})`,
    "",
    r.headline,
    "",
    r.summary,
    "",
    "What to do this week:",
    ...r.actions.map((a, i) => `${i + 1}. ${a}`),
  ].join("\n");
}
