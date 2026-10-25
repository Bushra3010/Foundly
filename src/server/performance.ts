import "server-only";
import { and, desc, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { audits, monitoringRuns, type Business } from "@/db/schema";
import { listingStatus } from "@/lib/geo";
import { currentWebsiteCheck } from "./audit/service";
import { computeMetrics, effectiveMention, VALID_STATUSES } from "./monitoring/metrics";
import { ADAPTERS, enabledAdapters } from "./monitoring/registry";
import { brandSpecs, listQuestions, queryObservations, questionLimit, toMetricRows } from "./monitoring/service";
import type { Ctx } from "./context";
import { getFacebookConnection } from "./facebook-page";
import { getGoogleConnection } from "./google-business";
import { latestWebsiteRequest, OPEN_STATUSES } from "./website-requests";

/**
 * Everything the owner's dashboard and setup show, from real data only:
 * tracked keywords, AI answers, the website check and connected accounts.
 */

export const SOCIAL_KEYS = ["google", "facebook", "instagram"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];
export type SocialStatus = { key: SocialKey; label: string; state: "synced" | "linked" | "none"; url: string | null; error: string | null };

const isValid = (status: string) => (VALID_STATUSES as readonly string[]).includes(status);
const WEEK = 7 * 86_400_000;

/** Monday 00:00 UTC of the week a date falls in. */
function weekStart(d: Date) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t;
}

export async function socialStatus(db: Db, ctx: Ctx, business: Business): Promise<SocialStatus[]> {
  const [google, facebook] = await Promise.all([getGoogleConnection(db, ctx), getFacebookConnection(db, ctx)]);
  const links = listingStatus(business.listings);
  const sync = { google, facebook, instagram: null } as const;
  return SOCIAL_KEYS.map((key) => {
    const link = links.find((l) => l.key === key)!;
    const conn = sync[key];
    return {
      key,
      label: key === "google" ? "Google Business Profile" : key === "facebook" ? "Facebook" : "Instagram",
      state: conn ? "synced" : link.url ? "linked" : "none",
      url: conn?.siteUrl ?? link.url,
      error: conn?.status === "error" ? conn.lastError : null,
    };
  });
}

/**
 * Keyword ranking score for one AI platform, 0–100. For each keyword, the
 * platform's latest answer scores 100 if it names the business first in a
 * list, 80 second, 60 third, 40 lower; 50 if named outside a list; 0 if not
 * named. The score is the average across the keywords it has answered.
 */
export function rankPoints(m: { mentioned: boolean; listedPosition: number | null } | null): number {
  if (!m?.mentioned) return 0;
  if (m.listedPosition === null) return 50;
  return m.listedPosition === 1 ? 100 : m.listedPosition === 2 ? 80 : m.listedPosition === 3 ? 60 : 40;
}

/** The four setup steps and whether each is done. */
export function setupSteps(input: { keywords: number; business: Business; websiteRequested: boolean; social: SocialStatus[]; trackingStarted: boolean }) {
  // Before tracking starts the steps live in setup; afterwards, in the app.
  const inApp = input.trackingStarted;
  const steps = [
    { key: "keywords", label: "Enter keywords", done: input.keywords > 0, href: inApp ? "/app/keywords" : "/onboarding?step=keywords" },
    // A website request isn't a connected website yet, so the step stays open.
    { key: "website", label: input.websiteRequested ? "Connect website (being built)" : "Connect website", done: Boolean(input.business.hasWebsite && input.business.websiteUrl), href: inApp ? "/app/website" : "/onboarding?step=website" },
    { key: "social", label: "Connect social media", done: input.social.some((s) => s.state !== "none"), href: inApp ? "/app/connections" : "/onboarding?step=social" },
    { key: "tracking", label: "Start tracking", done: input.trackingStarted, href: inApp ? "/app" : "/onboarding?step=start" },
  ] as const;
  return { steps, done: steps.filter((s) => s.done).length, total: steps.length };
}

export async function dashboardData(db: Db, ctx: Ctx, business: Business) {
  const now = new Date();
  const from = new Date(weekStart(now).getTime() - 7 * WEEK);
  const [questions, obs, brands, social, request, [audit], runs, keywordLimit] = await Promise.all([
    listQuestions(db, ctx),
    queryObservations(db, ctx, { from }, 2000),
    brandSpecs(db, ctx.workspaceId),
    socialStatus(db, ctx, business),
    latestWebsiteRequest(db, ctx),
    db.select().from(audits).where(and(eq(audits.workspaceId, ctx.workspaceId), eq(audits.kind, "external"))).orderBy(desc(audits.createdAt)).limit(1),
    db
      .select({ id: monitoringRuns.id, status: monitoringRuns.status, createdAt: monitoringRuns.createdAt })
      .from(monitoringRuns)
      .where(eq(monitoringRuns.workspaceId, ctx.workspaceId))
      .orderBy(desc(monitoringRuns.createdAt))
      .limit(1),
    questionLimit(db, ctx.workspaceId),
  ]);
  // Only a check of the website connected now counts.
  const current = business.hasWebsite ? await currentWebsiteCheck(db, ctx, business.websiteUrl) : null;
  const checks = current?.findings ?? [];

  const self = (o: (typeof obs)[number]) => o.matches.find((m) => m.brandKey === "self");
  const mentioned = (o: (typeof obs)[number]) => {
    const m = self(o);
    return !!m && effectiveMention(m);
  };

  // Last 30 days, with the same rules as AI Visibility.
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);
  const recent = obs.filter((o) => o.capturedAt >= monthAgo);
  const metrics = computeMetrics(toMetricRows(recent), brands.map((b) => b.key));

  // Weekly mention rate for the last 8 weeks; null where nothing was checked.
  const trend = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(from.getTime() + i * WEEK);
    const end = new Date(start.getTime() + WEEK);
    const week = obs.filter((o) => isValid(o.status) && o.capturedAt >= start && o.capturedAt < end);
    return { week: start, answers: week.length, rate: week.length ? week.filter(mentioned).length / week.length : null };
  });

  // Score of one answer: where it names the business (see rankPoints).
  const points = (o: (typeof obs)[number]) => {
    const m = self(o);
    return rankPoints(m && effectiveMention(m) ? { mentioned: true, listedPosition: m.listedPosition ?? null } : null);
  };
  const average = (xs: number[]) => (xs.length ? Math.round(xs.reduce((n, x) => n + x, 0) / xs.length) : null);
  const live = new Set(enabledAdapters().map((a) => a.key));
  const weeks = Array.from({ length: 8 }, (_, i) => new Date(from.getTime() + i * WEEK));
  const inWeek = (o: (typeof obs)[number], start: Date) => o.capturedAt >= start && o.capturedAt < new Date(start.getTime() + WEEK);

  // Each keyword: its score on every platform from that platform's latest answer,
  // an overall score (the average of the platforms that answered), and a weekly trend.
  const keywords = questions.map((q) => {
    const mine = obs.filter((o) => o.questionId === q.id && isValid(o.status));
    const latest = new Map<string, (typeof obs)[number]>();
    for (const o of mine) if (!latest.has(o.provider)) latest.set(o.provider, o);
    const answers = [...latest.values()];
    const scores = Object.fromEntries(ADAPTERS.map((a) => [a.key, latest.has(a.key) ? points(latest.get(a.key)!) : null])) as Record<string, number | null>;
    const position = Object.fromEntries(ADAPTERS.map((a) => [a.key, latest.has(a.key) && mentioned(latest.get(a.key)!) ? (self(latest.get(a.key)!)?.listedPosition ?? null) : null])) as Record<string, number | null>;
    return {
      id: q.id,
      text: q.text,
      checked: answers.length,
      mentioned: answers.filter(mentioned).length,
      cited: answers.filter((o) => self(o)?.cited).length,
      mentionedBy: answers.filter(mentioned).map((o) => o.provider),
      lastChecked: answers[0]?.capturedAt ?? null,
      scores,
      position,
      overall: average(answers.map(points)),
      trend: weeks.map((w) => average(mine.filter((o) => inWeek(o, w)).map(points))),
    };
  });

  // Each platform: the average of its keyword scores, side by side.
  const platforms = ADAPTERS.map((a) => {
    const scored = keywords.flatMap((k) => (k.scores[a.key] === null ? [] : [k.scores[a.key]!]));
    const positions = keywords.flatMap((k) => (k.position[a.key] ? [k.position[a.key]!] : []));
    return {
      key: a.key,
      name: a.label.replace(/\s*\(.*\)$/, ""),
      on: live.has(a.key),
      checked: scored.length,
      named: keywords.filter((k) => k.mentionedBy.includes(a.key)).length,
      score: average(scored),
      best: positions.length ? Math.min(...positions) : null,
    };
  });

  // Overall: every keyword's overall score averaged, and the same each week.
  const overall = average(keywords.flatMap((k) => (k.overall === null ? [] : [k.overall])));
  const scoreTrend = weeks.map((w) => {
    const week = obs.filter((o) => isValid(o.status) && inWeek(o, w) && questions.some((q) => q.id === o.questionId));
    return { week: w, answers: week.length, score: average(week.map(points)) };
  });

  const passed = checks.filter((f) => f.passed).length;
  const website = {
    url: business.hasWebsite ? business.websiteUrl : null,
    requested: !business.hasWebsite && !!request && (OPEN_STATUSES as readonly string[]).includes(request.status) ? request : null,
    checkedAt: current?.audit.finishedAt ?? null,
    auditRunning: audit?.status === "queued" || audit?.status === "running",
    health: checks.length ? Math.round((passed / checks.length) * 100) : null,
    passed,
    total: checks.length,
    issues: checks.filter((f) => !f.passed).sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1)).slice(0, 3),
  };

  const run = runs[0] ?? null;
  return {
    questions,
    keywordLimit,
    keywords,
    platforms,
    overall,
    scoreTrend,
    metrics,
    trend,
    website,
    social,
    sources: enabledAdapters().length,
    running: run?.status === "queued" || run?.status === "running",
    lastRun: run,
    setup: setupSteps({ keywords: questions.length, business, websiteRequested: !!website.requested, social, trackingStarted: Boolean(business.onboardingCompletedAt) }),
  };
}
