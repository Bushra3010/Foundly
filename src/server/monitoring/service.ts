import { createHash } from "node:crypto";
import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lt, lte, or, sql } from "drizzle-orm";
import type { Db, DbOrTx } from "@/db";
import {
  brandMatches,
  businesses,
  competitors,
  customDomains,
  monitoringRuns,
  observations,
  sites,
  trackedQuestions,
  type BrandMatch,
  type Observation,
} from "@/db/schema";
import { hostOf } from "@/server/safe-fetch";
import { billingEnforced, planSpec } from "@/lib/plans";
import { effectivePlan } from "../billing/service";
import { requireBusiness } from "../business";
import { AppError, audit, requireRole, type Ctx } from "../context";
import { reserveCredits, settleReservation } from "../credits";
import { EXTRACTION_VERSION, extractBrands, type BrandSpec } from "./extract";
import { computeMetrics, matchedPairs, VALID_STATUSES, type MetricObservation } from "./metrics";
import { adapterFor, enabledAdapters } from "./registry";
import type { ProviderAdapter } from "./types";

export const MAX_QUESTIONS = 25;
export const MAX_SAMPLES = 3;
const OBSERVATION_TIMEOUT_MS = 90_000;

// ---------- Questions ----------

/** Keywords allowed by the workspace's plan; the hard maximum while billing isn't enforced. */
export async function questionLimit(db: DbOrTx, workspaceId: string) {
  if (!billingEnforced()) return MAX_QUESTIONS;
  return Math.min(planSpec(await effectivePlan(db, workspaceId)).keywords, MAX_QUESTIONS);
}

export async function listQuestions(db: DbOrTx, ctx: Ctx) {
  return db
    .select()
    .from(trackedQuestions)
    .where(and(eq(trackedQuestions.workspaceId, ctx.workspaceId), isNull(trackedQuestions.archivedAt)))
    .orderBy(asc(trackedQuestions.group), asc(trackedQuestions.createdAt));
}

export type NewQuestion = {
  text: string;
  group: (typeof trackedQuestions.$inferInsert)["group"];
  location?: string | null;
  language?: string;
  /** What the owner typed, when the question was built from a keyword. */
  keyword?: string | null;
  replacesId?: string | null;
};

/** The owner approves questions; only approved, unarchived questions are ever sent to a provider. */
export async function approveQuestions(db: Db, ctx: Ctx, items: NewQuestion[]) {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  const existing = await listQuestions(db, ctx);
  const seen = new Set(existing.map((q) => q.text.trim().toLowerCase()));
  const seenKeywords = new Set(existing.flatMap((q) => (q.keyword ? [q.keyword.toLowerCase()] : [])));
  const fresh = items
    .map((i) => ({ ...i, text: i.text.trim().replace(/\s+/g, " ") }))
    .filter((i) => i.text.length >= 8 && i.text.length <= 300 && !seen.has(i.text.toLowerCase()))
    .filter((i) => !i.keyword || !seenKeywords.has(i.keyword.toLowerCase()));
  const limit = await questionLimit(db, ctx.workspaceId);
  if (existing.length + fresh.length > limit) {
    throw new AppError("invalid", `Your plan tracks up to ${limit} keywords. Archive some or upgrade for more.`, { upgrade: true });
  }
  // Discovery questions that name the business bias inclusion; keep them in the branded group.
  const name = b.name.toLowerCase();
  const rows = fresh.map((i) => ({
    workspaceId: ctx.workspaceId,
    businessId: b.id,
    text: i.text,
    group: i.text.toLowerCase().includes(name) ? ("branded" as const) : i.group,
    location: i.location ?? null,
    language: i.language ?? "en",
    keyword: i.keyword ?? null,
    replacesId: i.replacesId ?? null,
    approvedBy: ctx.userId,
  }));
  if (rows.length) await db.insert(trackedQuestions).values(rows);
  await audit(db, ctx, "questions.approved", undefined, { count: rows.length });
  return rows.length;
}

export async function archiveQuestion(db: Db, ctx: Ctx, questionId: string) {
  requireRole(ctx, "editor");
  await db
    .update(trackedQuestions)
    .set({ archivedAt: new Date() })
    .where(and(eq(trackedQuestions.id, questionId), eq(trackedQuestions.workspaceId, ctx.workspaceId)));
}

// ---------- Brands ----------

export async function updateBrandTerms(db: Db, ctx: Ctx, aliases: string[], ownedDomains: string[]) {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  const clean = (xs: string[], max: number) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))].slice(0, max);
  const domains = clean(ownedDomains, 10).map((d) => hostOf(d));
  await db.update(businesses).set({ aliases: clean(aliases, 10), ownedDomains: domains, updatedAt: new Date() }).where(eq(businesses.id, b.id));
}

export async function listCompetitors(db: DbOrTx, ctx: Ctx) {
  return db.select().from(competitors).where(eq(competitors.workspaceId, ctx.workspaceId)).orderBy(asc(competitors.createdAt));
}

export async function addCompetitor(db: Db, ctx: Ctx, name: string, domain?: string) {
  requireRole(ctx, "editor");
  if ((await listCompetitors(db, ctx)).length >= 10) throw new AppError("invalid", "You can track up to 10 competitors.");
  const n = name.trim();
  if (n.length < 2) throw new AppError("invalid", "Enter the competitor's business name.");
  await db.insert(competitors).values({ workspaceId: ctx.workspaceId, name: n.slice(0, 120), domains: domain?.trim() ? [hostOf(domain)] : [] });
}

export async function removeCompetitor(db: Db, ctx: Ctx, id: string) {
  requireRole(ctx, "editor");
  await db.delete(competitors).where(and(eq(competitors.id, id), eq(competitors.workspaceId, ctx.workspaceId)));
}

export async function brandSpecs(db: DbOrTx, workspaceId: string): Promise<BrandSpec[]> {
  const [b] = await db.select().from(businesses).where(eq(businesses.workspaceId, workspaceId)).limit(1);
  if (!b) return [];
  const [site] = await db.select({ slug: sites.slug }).from(sites).where(eq(sites.businessId, b.id));
  const custom = await db
    .select({ hostname: customDomains.hostname })
    .from(customDomains)
    .where(and(eq(customDomains.workspaceId, workspaceId), eq(customDomains.status, "verified")));
  const domains = new Set<string>(b.ownedDomains);
  if (b.websiteUrl) domains.add(hostOf(b.websiteUrl));
  if (site && process.env.SITES_ROOT_DOMAIN) domains.add(`${site.slug}.${process.env.SITES_ROOT_DOMAIN}`);
  for (const c of custom) domains.add(c.hostname.replace(/^www\./, ""));
  const comps = await db.select().from(competitors).where(eq(competitors.workspaceId, workspaceId));
  // A Foundly site without its own domain lives under the app's host; match it by path.
  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const urlPrefixes = site ? [`${appUrl}/s/${site.slug}`] : [];
  return [
    { key: "self", name: b.name, aliases: b.aliases, domains: [...domains], urlPrefixes },
    ...comps.map((c) => ({ key: c.id, name: c.name, aliases: c.aliases, domains: c.domains })),
  ];
}

// ---------- Runs ----------

export function estimateCredits(questions: number, providers: number, samples: number) {
  return questions * providers * samples;
}

function configHash(questionIds: string[], providers: { key: string; method: string; model: string; locale: string }[]) {
  return createHash("sha256")
    .update(JSON.stringify({ q: [...questionIds].sort(), p: providers, x: EXTRACTION_VERSION }))
    .digest("hex")
    .slice(0, 16);
}

function isoWeek(d: Date) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const year = t.getUTCFullYear();
  const week = Math.ceil(((t.getTime() - Date.UTC(year, 0, 1)) / 86_400_000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * Creates a run and reserves its credits in one transaction. The idempotency
 * key makes a repeated request (double click, cron retry) return the same run.
 */
export async function createRun(
  db: Db,
  ctx: Pick<Ctx, "workspaceId" | "userId"> & { role?: Ctx["role"] },
  opts: { trigger: "manual" | "scheduled"; samples?: number; idempotencyKey: string; adapters?: ProviderAdapter[] },
) {
  if (opts.trigger === "manual" && ctx.role) requireRole(ctx as Ctx, "editor");
  const samples = Math.min(Math.max(opts.samples ?? 1, 1), MAX_SAMPLES);
  const adapters = opts.adapters ?? enabledAdapters();
  if (adapters.length === 0) throw new AppError("precondition_failed", "No AI sources are connected yet.");

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(monitoringRuns)
      .where(and(eq(monitoringRuns.workspaceId, ctx.workspaceId), eq(monitoringRuns.idempotencyKey, opts.idempotencyKey)));
    if (existing) return existing;

    const active = await tx
      .select({ id: monitoringRuns.id })
      .from(monitoringRuns)
      .where(and(eq(monitoringRuns.workspaceId, ctx.workspaceId), inArray(monitoringRuns.status, ["queued", "running"])));
    if (active.length) throw new AppError("conflict", "A check is already running. Wait for it to finish.");

    const [b] = await tx.select().from(businesses).where(eq(businesses.workspaceId, ctx.workspaceId)).limit(1);
    if (!b) throw new AppError("not_found", "Add your business first.");
    const questions = await tx
      .select({ id: trackedQuestions.id })
      .from(trackedQuestions)
      .where(and(eq(trackedQuestions.workspaceId, ctx.workspaceId), isNull(trackedQuestions.archivedAt)));
    if (questions.length === 0) throw new AppError("precondition_failed", "Approve at least one question to track.");

    const providers = adapters.map((a) => ({ key: a.key, method: a.method, model: a.configuredModel() ?? "unknown", locale: a.locale }));
    const planned = estimateCredits(questions.length, adapters.length, samples);
    const [run] = await tx
      .insert(monitoringRuns)
      .values({
        workspaceId: ctx.workspaceId,
        businessId: b.id,
        trigger: opts.trigger,
        idempotencyKey: opts.idempotencyKey,
        questionIds: questions.map((q) => q.id),
        providers,
        samples,
        configHash: configHash(questions.map((q) => q.id), providers),
        plannedObservations: planned,
        createdBy: ctx.userId || null,
      })
      .returning();
    const reservation = await reserveCredits(tx, ctx.workspaceId, planned, { type: "monitoring_run", id: run.id });
    const [withRes] = await tx.update(monitoringRuns).set({ reservationId: reservation.id }).where(eq(monitoringRuns.id, run.id)).returning();
    await audit(tx, ctx.userId ? { workspaceId: ctx.workspaceId, userId: ctx.userId } : null, "monitoring.run_created", run.id, { planned, trigger: opts.trigger });
    return withRes;
  });
}

export function manualRunKey(requestId: string) {
  return `manual:${requestId.slice(0, 64)}`;
}

export function scheduledRunKey(now = new Date()) {
  return `scheduled:${isoWeek(now)}`;
}

/**
 * Executes (or resumes) a run. Each observation has its own idempotency key,
 * so a resumed run skips work already captured and never pays twice.
 * Failed provider calls are stored as failures, not as zero visibility.
 */
export async function executeRun(db: Db, runId: string, deps: { adapters?: ProviderAdapter[] } = {}) {
  const [run] = await db.select().from(monitoringRuns).where(eq(monitoringRuns.id, runId));
  if (!run || run.status === "completed" || run.status === "failed" || run.status === "cancelled") return run;
  await db.update(monitoringRuns).set({ status: "running", startedAt: run.startedAt ?? new Date() }).where(eq(monitoringRuns.id, run.id));

  const [b] = await db.select().from(businesses).where(eq(businesses.id, run.businessId));
  const questions = await db.select().from(trackedQuestions).where(inArray(trackedQuestions.id, run.questionIds));
  const brands = await brandSpecs(db, run.workspaceId);

  const tasks: { q: (typeof questions)[number]; adapter: ProviderAdapter; sample: number; key: string }[] = [];
  for (const q of questions)
    for (const p of run.providers) {
      const adapter = deps.adapters?.find((a) => a.key === p.key) ?? adapterFor(p.key);
      if (!adapter) continue;
      for (let s = 1; s <= run.samples; s++) tasks.push({ q, adapter, sample: s, key: `${run.id}:${q.id}:${p.key}:${s}` });
    }

  const done = new Set(
    (await db.select({ key: observations.idempotencyKey }).from(observations).where(eq(observations.runId, run.id))).map((r) => r.key),
  );
  const pending = tasks.filter((t) => !done.has(t.key));

  // Small fixed concurrency keeps provider rate limits and costs predictable.
  const CONCURRENCY = 3;
  let cursor = 0;
  async function worker() {
    while (cursor < pending.length) {
      const t = pending[cursor++];
      const started = Date.now();
      const result = await t.adapter
        .ask(
          { question: t.q.text, location: t.q.location, country: b?.country ?? "IN", language: t.q.language },
          AbortSignal.timeout(OBSERVATION_TIMEOUT_MS),
        )
        .catch((err) => ({ status: "error" as const, answer: null, citations: [], model: null, appliedLocale: "none" as const, raw: null, error: String(err) }));
      await db.transaction(async (tx) => {
        const [obs] = await tx
          .insert(observations)
          .values({
            workspaceId: run.workspaceId,
            runId: run.id,
            questionId: t.q.id,
            questionText: t.q.text,
            provider: t.adapter.key,
            sourceType: t.adapter.method,
            model: result.model,
            requestedLocale: t.q.location,
            appliedLocale: result.appliedLocale,
            searchEnabled: true,
            sample: t.sample,
            idempotencyKey: t.key,
            status: result.status,
            rawAnswer: result.answer,
            citations: result.citations,
            rawResponse: result.raw,
            errorMessage: result.error ?? null,
            latencyMs: Date.now() - started,
            extractionVersion: EXTRACTION_VERSION,
          })
          .onConflictDoNothing()
          .returning();
        if (!obs || !(VALID_STATUSES as readonly string[]).includes(obs.status)) return;
        const matches = extractBrands(obs.rawAnswer, obs.citations, brands);
        if (matches.length) {
          await tx.insert(brandMatches).values(
            matches.map((m) => ({ ...m, workspaceId: run.workspaceId, observationId: obs.id, extractionVersion: EXTRACTION_VERSION })),
          );
        }
      });
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker));

  const all = await db.select({ status: observations.status }).from(observations).where(eq(observations.runId, run.id));
  const valid = all.filter((o) => (VALID_STATUSES as readonly string[]).includes(o.status)).length;
  const status = valid === 0 ? "failed" : valid < tasks.length ? "partial" : "completed";
  const [finished] = await db
    .update(monitoringRuns)
    .set({ status, finishedAt: new Date() })
    .where(eq(monitoringRuns.id, run.id))
    .returning();
  // Bill only successful observations; the rest of the reservation is released.
  if (run.reservationId) await settleReservation(db, run.reservationId, valid);
  return finished;
}

export async function listRuns(db: DbOrTx, ctx: Ctx, limit = 10) {
  return db.select().from(monitoringRuns).where(eq(monitoringRuns.workspaceId, ctx.workspaceId)).orderBy(desc(monitoringRuns.createdAt)).limit(limit);
}

/** Whether a plan's schedule includes this ISO week. Biweekly plans run on even weeks. */
export function checksDue(checks: "weekly" | "biweekly" | null, now: Date) {
  if (!checks) return false;
  return checks === "weekly" || Number(isoWeek(now).slice(-2)) % 2 === 0;
}

/**
 * Cron: runs for every workspace that pressed Start and has active keywords,
 * on each plan's schedule.
 */
export async function scheduleDueRuns(db: Db, now = new Date()) {
  if (enabledAdapters().length === 0) return { created: 0, skipped: "no providers" };
  const workspaces = await db
    .selectDistinct({ workspaceId: trackedQuestions.workspaceId })
    .from(trackedQuestions)
    .innerJoin(businesses, eq(businesses.id, trackedQuestions.businessId))
    .where(and(isNull(trackedQuestions.archivedAt), isNotNull(businesses.monitoringStartedAt)));
  let created = 0;
  for (const { workspaceId } of workspaces) {
    try {
      if (billingEnforced() && !checksDue(planSpec(await effectivePlan(db, workspaceId)).checks, now)) continue;
      const run = await createRun(db, { workspaceId, userId: "" }, { trigger: "scheduled", idempotencyKey: scheduledRunKey(now) });
      if (run.status === "queued") created++;
    } catch {
      // Out of credits or already running: skipped for this week, visible in the owner's run list.
    }
  }
  return { created };
}

/** Cron: picks up queued runs and runs left "running" by a crashed process. */
export async function resumeRuns(db: Db, limit = 5) {
  const stale = new Date(Date.now() - 30 * 60_000);
  const runs = await db
    .select({ id: monitoringRuns.id })
    .from(monitoringRuns)
    .where(or(eq(monitoringRuns.status, "queued"), and(eq(monitoringRuns.status, "running"), lt(monitoringRuns.startedAt, stale))))
    .orderBy(asc(monitoringRuns.createdAt))
    .limit(limit);
  for (const r of runs) await executeRun(db, r.id);
  return runs.length;
}

// ---------- Evidence and metrics ----------

export type EvidenceFilters = { from?: Date; to?: Date; provider?: string; questionId?: string; status?: string; runId?: string };

export async function queryObservations(db: DbOrTx, ctx: Ctx, f: EvidenceFilters, limit = 500) {
  requireRole(ctx, "viewer");
  const conds = [eq(observations.workspaceId, ctx.workspaceId)];
  if (f.from) conds.push(gte(observations.capturedAt, f.from));
  if (f.to) conds.push(lte(observations.capturedAt, f.to));
  if (f.provider) conds.push(eq(observations.provider, f.provider));
  if (f.questionId) conds.push(eq(observations.questionId, f.questionId));
  if (f.runId) conds.push(eq(observations.runId, f.runId));
  if (f.status) conds.push(sql`${observations.status} = ${f.status}`);
  const rows = await db.select().from(observations).where(and(...conds)).orderBy(desc(observations.capturedAt)).limit(limit);
  const matches = rows.length
    ? await db.select().from(brandMatches).where(and(eq(brandMatches.workspaceId, ctx.workspaceId), inArray(brandMatches.observationId, rows.map((r) => r.id))))
    : [];
  const byObs = new Map<string, BrandMatch[]>();
  for (const m of matches) byObs.set(m.observationId, [...(byObs.get(m.observationId) ?? []), m]);
  return rows.map((o) => ({ ...o, matches: byObs.get(o.id) ?? [] }));
}

export type ObservationWithMatches = Observation & { matches: BrandMatch[] };

export function toMetricRows(rows: ObservationWithMatches[]): MetricObservation[] {
  return rows.map((r) => ({ id: r.id, status: r.status, questionId: r.questionId, provider: r.provider, matches: r.matches }));
}

export async function visibilitySummary(db: DbOrTx, ctx: Ctx, days = 30, provider?: string) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const prevFrom = new Date(from.getTime() - days * 86_400_000);
  const brands = await brandSpecs(db, ctx.workspaceId);
  const keys = brands.map((b) => b.key);
  const [current, previous] = await Promise.all([
    queryObservations(db, ctx, { from, to, provider }),
    queryObservations(db, ctx, { from: prevFrom, to: from, provider }),
  ]);
  const metrics = computeMetrics(toMetricRows(current), keys);
  const pairs = matchedPairs(toMetricRows(current), toMetricRows(previous));
  const comparison = previous.length
    ? {
        current: computeMetrics(pairs.a, keys),
        previous: computeMetrics(pairs.b, keys),
        sharedPairs: pairs.sharedPairs,
        fullOverlap: pairs.fullOverlap,
        configChanged:
          new Set(current.map((o) => `${o.extractionVersion}`)).size > 1 ||
          [...new Set(previous.map((o) => o.extractionVersion))].some((v) => !current.some((c) => c.extractionVersion === v)),
      }
    : null;
  return { from, to, brands, metrics, comparison };
}

/** Owner correction of a derived match. The raw answer is never changed. */
export async function correctMatch(db: Db, ctx: Ctx, matchId: string, correction: "confirmed" | "rejected" | null, reason: string) {
  requireRole(ctx, "editor");
  if (correction && reason.trim().length < 3) throw new AppError("invalid", "Say briefly why, so the change is clear later.");
  const [updated] = await db
    .update(brandMatches)
    .set({ correction, correctionReason: correction ? reason.trim().slice(0, 500) : null, correctedBy: ctx.userId, correctedAt: new Date() })
    .where(and(eq(brandMatches.id, matchId), eq(brandMatches.workspaceId, ctx.workspaceId)))
    .returning();
  if (!updated) throw new AppError("not_found", "Match not found.");
  await audit(db, ctx, "monitoring.match_corrected", matchId, { correction, reason });
  return updated;
}

/** Last successful observation per provider for this workspace. */
export async function lastSuccessByProvider(db: DbOrTx, workspaceId: string) {
  const rows = await db
    .select({ provider: observations.provider, at: sql<Date>`max(${observations.capturedAt})` })
    .from(observations)
    .where(and(eq(observations.workspaceId, workspaceId), inArray(observations.status, [...VALID_STATUSES])))
    .groupBy(observations.provider);
  return Object.fromEntries(rows.map((r) => [r.provider, new Date(r.at)]));
}
