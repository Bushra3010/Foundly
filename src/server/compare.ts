import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { Db, DbOrTx } from "@/db";
import { audits, businesses, competitors, findings, type Business, type Competitor, type Finding } from "@/db/schema";
import { CHECKLIST_VERSION, externalChecks } from "./audit/checks";
import { crawlSite, type Fetcher } from "./audit/crawl";
import { currentWebsiteCheck } from "./audit/service";
import { AppError, requireRole, type Ctx } from "./context";
import { effectiveMention, VALID_STATUSES } from "./monitoring/metrics";
import { enabledAdapters } from "./monitoring/registry";
import { listQuestions, queryObservations } from "./monitoring/service";
import { normalizeSiteUrl } from "./safe-fetch";

/**
 * You vs one competitor: how often AI answers name each of you, per keyword,
 * and how your websites compare on the same checks. Real data only.
 */

/** Checks that compare the site against *our* owner's facts can't be applied to a competitor. */
const OWNER_FACT_CHECKS = new Set(["nap_name", "nap_phone", "nap_whatsapp", "nap_city", "service_coverage", "structured_data_agrees"]);
export const comparable = (checkKey: string) => !OWNER_FACT_CHECKS.has(checkKey);

const WEEK = 7 * 86_400_000;
const isValid = (status: string) => (VALID_STATUSES as readonly string[]).includes(status);

function weekStart(d: Date) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t;
}

function targetOf(domain: string | undefined) {
  if (!domain) return null;
  try {
    return normalizeSiteUrl(domain);
  } catch {
    return null;
  }
}

async function getCompetitor(db: DbOrTx, ctx: Ctx, id: string) {
  const [c] = await db.select().from(competitors).where(and(eq(competitors.id, id), eq(competitors.workspaceId, ctx.workspaceId)));
  if (!c) throw new AppError("not_found", "Competitor not found.");
  return c;
}

// ---------- Competitor website check ----------

/** Queues a check of the competitor's public website. It never creates tasks for the owner. */
export async function startCompetitorCheck(db: Db, ctx: Ctx, competitorId: string) {
  requireRole(ctx, "editor");
  const c = await getCompetitor(db, ctx, competitorId);
  const target = targetOf(c.domains[0]);
  if (!target) throw new AppError("invalid", "Add the competitor's website first.");
  const [b] = await db.select().from(businesses).where(eq(businesses.workspaceId, ctx.workspaceId)).limit(1);
  if (!b) throw new AppError("not_found", "Add your business first.");
  const running = await db
    .select({ id: audits.id })
    .from(audits)
    .where(and(eq(audits.workspaceId, ctx.workspaceId), eq(audits.kind, "competitor"), eq(audits.target, target), inArray(audits.status, ["queued", "running"])));
  if (running.length) throw new AppError("conflict", "We're already checking this website.");
  const [row] = await db
    .insert(audits)
    .values({ workspaceId: ctx.workspaceId, businessId: b.id, kind: "competitor", target, checklistVersion: CHECKLIST_VERSION, createdBy: ctx.userId })
    .returning();
  return row;
}

export async function runCompetitorCheck(db: Db, auditId: string, deps: { fetcher?: Fetcher } = {}) {
  const [a] = await db.select().from(audits).where(and(eq(audits.id, auditId), eq(audits.kind, "competitor")));
  if (!a || a.status === "completed") return;
  await db.update(audits).set({ status: "running" }).where(eq(audits.id, a.id));
  try {
    const [b] = await db.select().from(businesses).where(eq(businesses.id, a.businessId));
    const crawl = await crawlSite(a.target, deps.fetcher);
    const notRun = crawl.errors.map((e) => ({ check: e.url, reason: e.reason }));
    if (crawl.pages.length === 0) {
      await db
        .update(audits)
        .set({ status: "failed", error: `We couldn't load this website: ${crawl.errors[0]?.reason ?? "no response"}.`, notRun, finishedAt: new Date() })
        .where(eq(audits.id, a.id));
      return;
    }
    const results = externalChecks(crawl, b).filter((r) => comparable(r.checkKey));
    await db.transaction(async (tx) => {
      if (results.length) await tx.insert(findings).values(results.map((r) => ({ ...r, partial: r.partial ?? false, workspaceId: a.workspaceId, auditId: a.id })));
      await tx
        .update(audits)
        .set({ status: "completed", pagesScanned: crawl.pages.map((p) => ({ url: p.url, status: p.status })), notRun, finishedAt: new Date() })
        .where(eq(audits.id, a.id));
    });
  } catch (err) {
    await db.update(audits).set({ status: "failed", error: err instanceof Error ? err.message : String(err), finishedAt: new Date() }).where(eq(audits.id, a.id));
  }
}

/** Starts and runs a competitor check in the background; for use in after(). Never throws. */
export async function checkCompetitorSoon(db: Db, ctx: Ctx, competitorId: string) {
  try {
    const a = await startCompetitorCheck(db, ctx, competitorId);
    await runCompetitorCheck(db, a.id);
  } catch (err) {
    if (!(err instanceof AppError)) console.error("[compare] competitor check failed", err);
  }
}

async function latestCompetitorCheck(db: DbOrTx, ctx: Ctx, c: Competitor) {
  const target = targetOf(c.domains[0]);
  if (!target) return null;
  const [a] = await db
    .select()
    .from(audits)
    .where(and(eq(audits.workspaceId, ctx.workspaceId), eq(audits.kind, "competitor"), eq(audits.target, target)))
    .orderBy(desc(audits.createdAt))
    .limit(1);
  if (!a) return null;
  const f = a.status === "completed" ? await db.select().from(findings).where(and(eq(findings.auditId, a.id), eq(findings.workspaceId, ctx.workspaceId))) : [];
  return { audit: a, findings: f };
}

// ---------- The comparison ----------

export type CheckRow = { checkKey: string; category: string; you: Finding | null; them: Finding | null };

export async function compareData(db: Db, ctx: Ctx, business: Business, competitorId?: string) {
  const list = await db.select().from(competitors).where(eq(competitors.workspaceId, ctx.workspaceId)).orderBy(competitors.createdAt);
  const rival = list.find((c) => c.id === competitorId) ?? list[0] ?? null;
  if (!rival) return { competitors: list, rival: null } as const;

  const now = new Date();
  const from = new Date(weekStart(now).getTime() - 7 * WEEK);
  const [questions, obs, mine, theirs] = await Promise.all([
    listQuestions(db, ctx),
    queryObservations(db, ctx, { from }, 2000),
    business.hasWebsite ? currentWebsiteCheck(db, ctx, business.websiteUrl) : null,
    latestCompetitorCheck(db, ctx, rival),
  ]);
  const valid = obs.filter((o) => isValid(o.status));
  const named = (o: (typeof obs)[number], key: string) => o.matches.some((m) => m.brandKey === key && effectiveMention(m));
  const since = (d: Date) => valid.filter((o) => o.capturedAt >= d);
  const share = (rows: typeof valid, key: string) => ({ numerator: rows.filter((o) => named(o, key)).length, denominator: rows.length, rate: rows.length ? rows.filter((o) => named(o, key)).length / rows.length : null });

  // Answers before the competitor was added never looked for them, so they aren't counted.
  const tracked = valid.filter((o) => o.capturedAt >= rival.createdAt);
  const month = since(new Date(now.getTime() - 30 * 86_400_000)).filter((o) => o.capturedAt >= rival.createdAt);

  const trend = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(from.getTime() + i * WEEK);
    const end = new Date(start.getTime() + WEEK);
    const week = tracked.filter((o) => o.capturedAt >= start && o.capturedAt < end);
    return { week: start, answers: week.length, you: share(week, "self").rate, them: share(week, rival.id).rate };
  });

  const keywords = questions.map((q) => {
    const latest = new Map<string, (typeof obs)[number]>();
    for (const o of tracked) if (o.questionId === q.id && !latest.has(o.provider)) latest.set(o.provider, o);
    const answers = [...latest.values()];
    const you = answers.filter((o) => named(o, "self")).length;
    const them = answers.filter((o) => named(o, rival.id)).length;
    return { id: q.id, text: q.text, checked: answers.length, you, them, leader: answers.length === 0 ? null : you > them ? "you" : them > you ? "them" : "tie" };
  });

  // Website: the same comparable checks on both sites.
  const myChecks = (mine?.findings ?? []).filter((f) => comparable(f.checkKey));
  const theirChecks = theirs?.findings ?? [];
  const keys = [...new Set([...myChecks, ...theirChecks].map((f) => f.checkKey))];
  const checks: CheckRow[] = keys.map((k) => {
    const you = myChecks.find((f) => f.checkKey === k) ?? null;
    const them = theirChecks.find((f) => f.checkKey === k) ?? null;
    return { checkKey: k, category: (you ?? them)!.category, you, them };
  });
  const score = (rows: Finding[]) => (rows.length ? { passed: rows.filter((f) => f.passed).length, total: rows.length } : null);

  return {
    competitors: list,
    rival,
    sources: enabledAdapters().length,
    keywordCount: questions.length,
    ai: { you: share(month, "self"), them: share(month, rival.id), answers: month.length, trend, keywords },
    website: {
      you: { url: business.hasWebsite ? business.websiteUrl : null, score: score(myChecks), checkedAt: mine?.audit.finishedAt ?? null },
      them: {
        url: rival.domains[0] ?? null,
        score: score(theirChecks),
        status: theirs?.audit.status ?? null,
        error: theirs?.audit.status === "failed" ? theirs.audit.error : null,
        checkedAt: theirs?.audit.finishedAt ?? null,
      },
      checks,
      theyWin: checks.filter((c) => c.them?.passed && c.you && !c.you.passed),
      youWin: checks.filter((c) => c.you?.passed && c.them && !c.them.passed),
    },
  } as const;
}

/** Sets or changes the competitor's website, then it can be checked. */
export async function setCompetitorWebsite(db: Db, ctx: Ctx, competitorId: string, url: string) {
  requireRole(ctx, "editor");
  const c = await getCompetitor(db, ctx, competitorId);
  let host: string;
  try {
    host = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    throw new AppError("invalid", "Enter a web address like example.com");
  }
  if (!host.includes(".")) throw new AppError("invalid", "Enter a web address like example.com");
  await db.update(competitors).set({ domains: [host, ...c.domains.filter((d) => d !== host)] }).where(eq(competitors.id, c.id));
}
