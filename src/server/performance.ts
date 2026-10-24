import "server-only";
import { and, desc, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { audits, monitoringRuns, type Business } from "@/db/schema";
import { listingStatus } from "@/lib/geo";
import { currentWebsiteCheck } from "./audit/service";
import { computeMetrics, effectiveMention, VALID_STATUSES } from "./monitoring/metrics";
import { enabledAdapters } from "./monitoring/registry";
import { brandSpecs, listQuestions, queryObservations, toMetricRows } from "./monitoring/service";
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

/** The four setup steps and whether each is done. */
export function setupSteps(input: { keywords: number; business: Business; websiteRequested: boolean; social: SocialStatus[]; trackingStarted: boolean }) {
  // Before tracking starts the steps live in setup; afterwards, in the app.
  const inApp = input.trackingStarted;
  const steps = [
    { key: "keywords", label: "Enter keywords", done: input.keywords > 0, href: inApp ? "/app/visibility" : "/onboarding?step=keywords" },
    // A website request isn't a connected website yet, so the step stays open.
    { key: "website", label: input.websiteRequested ? "Connect website (being built)" : "Connect website", done: Boolean(input.business.hasWebsite && input.business.websiteUrl), href: inApp ? "/app/website" : "/onboarding?step=website" },
    { key: "social", label: "Connect social media", done: input.social.some((s) => s.state !== "none"), href: inApp ? "/app/presence" : "/onboarding?step=social" },
    { key: "tracking", label: "Start tracking", done: input.trackingStarted, href: inApp ? "/app" : "/onboarding?step=start" },
  ] as const;
  return { steps, done: steps.filter((s) => s.done).length, total: steps.length };
}

export async function dashboardData(db: Db, ctx: Ctx, business: Business) {
  const now = new Date();
  const from = new Date(weekStart(now).getTime() - 7 * WEEK);
  const [questions, obs, brands, social, request, [audit], runs] = await Promise.all([
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

  // Each keyword: the latest valid answer from each AI.
  const keywords = questions.map((q) => {
    const latest = new Map<string, (typeof obs)[number]>();
    for (const o of obs) if (o.questionId === q.id && isValid(o.status) && !latest.has(o.provider)) latest.set(o.provider, o);
    const answers = [...latest.values()];
    return {
      id: q.id,
      text: q.text,
      checked: answers.length,
      mentioned: answers.filter(mentioned).length,
      cited: answers.filter((o) => self(o)?.cited).length,
      mentionedBy: answers.filter(mentioned).map((o) => o.provider),
      lastChecked: answers[0]?.capturedAt ?? null,
    };
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
    keywords,
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
