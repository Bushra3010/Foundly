import "server-only";
import { and, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { businesses, monitoringRuns } from "@/db/schema";
import { listingStatus } from "@/lib/geo";
import { latestAudit, startAudit } from "./audit/service";
import { getBusiness, requireBusiness } from "./business";
import { AppError, audit, requireRole, type Ctx } from "./context";
import { getFacebookConnection } from "./facebook-page";
import { getGoogleConnection } from "./google-business";
import { createRun, listQuestions } from "./monitoring/service";
import { enabledAdapters } from "./monitoring/registry";
import type { ProviderAdapter } from "./monitoring/types";
import { getSite } from "./sites";

export type SetupStep = "keywords" | "website" | "connections" | "start";
export const SETUP_STEPS: SetupStep[] = ["keywords", "website", "connections", "start"];

/** Where the owner is in the four setup steps, from data they already entered. */
export async function setupStatus(db: Db, ctx: Ctx) {
  const b = await getBusiness(db, ctx);
  if (!b) return null;
  const [questions, site, google, facebook] = await Promise.all([
    listQuestions(db, ctx),
    getSite(db, ctx),
    getGoogleConnection(db, ctx),
    getFacebookConnection(db, ctx),
  ]);
  const linked = listingStatus(b.listings).filter((l) => l.url).length;
  const website = site?.publishedVersionId ? ("foundly" as const) : b.websiteUrl ? ("own" as const) : site ? ("draft" as const) : ("none" as const);
  const done: Record<SetupStep, boolean> = {
    keywords: questions.length > 0,
    website: website === "foundly" || website === "own",
    connections: linked > 0 || Boolean(google) || Boolean(facebook),
    start: Boolean(b.monitoringStartedAt),
  };
  return {
    business: b,
    keywords: questions,
    site,
    website,
    google,
    facebook,
    linked,
    engines: enabledAdapters().length,
    started: b.monitoringStartedAt,
    done,
    next: SETUP_STEPS.find((s) => !done[s]) ?? null,
  };
}

export type StartResult = { runId: string | null; auditId: string | null; note: "running" | "no_engines" | "busy" | "no_credits" };

/**
 * The owner pressed Start. From now on the AI checks run on the plan's
 * schedule; the first one starts right away when an AI source is connected,
 * and the website is audited so the first fixes are ready too.
 * Pressing it twice never creates a second first run.
 */
export async function startMonitoring(db: Db, ctx: Ctx, deps: { adapters?: ProviderAdapter[] } = {}): Promise<StartResult> {
  requireRole(ctx, "editor");
  const b = await requireBusiness(db, ctx);
  if ((await listQuestions(db, ctx)).length === 0) throw new AppError("precondition_failed", "Add at least one keyword first.");
  if (!b.monitoringStartedAt) {
    await db.update(businesses).set({ monitoringStartedAt: new Date(), updatedAt: new Date() }).where(eq(businesses.id, b.id));
    await audit(db, ctx, "monitoring.started", b.id);
  }

  let auditId: string | null = null;
  if (!(await latestAudit(db, ctx))) {
    const site = await getSite(db, ctx);
    const kind = site ? "hosted" : b.websiteUrl ? "external" : null;
    if (kind) auditId = (await startAudit(db, ctx, kind).catch(() => null))?.id ?? null;
  }

  const adapters = deps.adapters ?? enabledAdapters();
  if (adapters.length === 0) return { runId: null, auditId, note: "no_engines" };
  const key = `first:${b.id}`;
  const [already] = await db
    .select({ id: monitoringRuns.id })
    .from(monitoringRuns)
    .where(and(eq(monitoringRuns.workspaceId, ctx.workspaceId), eq(monitoringRuns.idempotencyKey, key)));
  // The first check exists already: never hand it out again, or it would run twice.
  if (already) return { runId: null, auditId, note: "running" };
  try {
    const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: key, adapters });
    return { runId: run.id, auditId, note: "running" };
  } catch (err) {
    if (err instanceof AppError && err.code === "conflict") return { runId: null, auditId, note: "busy" };
    if (err instanceof AppError) return { runId: null, auditId, note: "no_credits" };
    throw err;
  }
}
