import { and, count, desc, eq, gt, gte, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import type { Db } from "@/db";
import {
  auditEvents,
  audits,
  businessProfiles,
  businesses,
  customDomains,
  jobs,
  leads,
  monitoringRuns,
  observations,
  ownershipClaims,
  sites,
  subscriptions,
  supportGrants,
  workspaces,
} from "@/db/schema";
import { isPlatformAdmin } from "@/lib/admin";
import { AppError } from "./context";
import { grantCredits } from "./credits";

export type AdminCtx = { email: string; userId: string };

export function requireAdmin(user: { email: string; id: string } | null): AdminCtx {
  if (!user || !isPlatformAdmin(user.email)) throw new AppError("forbidden", "Admins only.");
  return { email: user.email, userId: user.id };
}

async function adminAudit(db: Db, admin: AdminCtx, action: string, workspaceId: string | null, data: Record<string, unknown>) {
  await db.insert(auditEvents).values({ workspaceId, actorUserId: admin.userId, action: `admin.${action}`, data: { ...data, admin: admin.email } });
}

function requireReason(reason: string) {
  if (reason.trim().length < 5) throw new AppError("invalid", "Give a reason (at least 5 characters). It's recorded in the audit log.");
  return reason.trim().slice(0, 500);
}

export async function overview(db: Db) {
  const day = new Date(Date.now() - 86_400_000);
  const [[ws], [published], [failedRuns], [failedAudits], [failedJobs], providerHealth, [pendingDomains], [disputes], plans] = await Promise.all([
    db.select({ n: count() }).from(workspaces),
    db.select({ n: count() }).from(sites).where(sql`${sites.publishedVersionId} is not null`),
    db.select({ n: count() }).from(monitoringRuns).where(and(eq(monitoringRuns.status, "failed"), gte(monitoringRuns.createdAt, day))),
    db.select({ n: count() }).from(audits).where(and(eq(audits.status, "failed"), gte(audits.createdAt, day))),
    db.select({ n: count() }).from(jobs).where(eq(jobs.status, "failed")),
    db
      .select({
        provider: observations.provider,
        total: count(),
        valid: sql<number>`count(*) filter (where ${observations.status} in ('answered','answered_uncited'))::int`,
        avgLatency: sql<number>`avg(${observations.latencyMs})::int`,
      })
      .from(observations)
      .where(gte(observations.capturedAt, day))
      .groupBy(observations.provider),
    db.select({ n: count() }).from(customDomains).where(inArray(customDomains.status, ["pending", "failed"])),
    db.select({ n: count() }).from(ownershipClaims).where(or(eq(ownershipClaims.status, "disputed"), and(eq(ownershipClaims.method, "manual"), eq(ownershipClaims.status, "pending")))),
    db.select({ plan: subscriptions.plan, n: count() }).from(subscriptions).groupBy(subscriptions.plan),
  ]);
  return { workspaces: ws.n, published: published.n, failedRuns: failedRuns.n, failedAudits: failedAudits.n, failedJobs: failedJobs.n, providerHealth, pendingDomains: pendingDomains.n, disputes: disputes.n, plans };
}

export async function searchBusinesses(db: Db, q: string) {
  const pattern = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  return db
    .select({ id: businesses.id, workspaceId: businesses.workspaceId, name: businesses.name, city: businesses.city, status: businessProfiles.status, slug: businessProfiles.slug, verification: businessProfiles.verification })
    .from(businesses)
    .leftJoin(businessProfiles, eq(businessProfiles.businessId, businesses.id))
    .where(q ? or(ilike(businesses.name, pattern), ilike(businesses.city, pattern)) : undefined)
    .orderBy(desc(businesses.createdAt))
    .limit(50);
}

export async function setProfileModeration(db: Db, admin: AdminCtx, businessId: string, status: "suspended" | "published" | "unpublished", reason: string) {
  const why = requireReason(reason);
  const [p] = await db.update(businessProfiles).set({ status, updatedAt: new Date() }).where(eq(businessProfiles.businessId, businessId)).returning();
  if (!p) throw new AppError("not_found", "Profile not found.");
  await adminAudit(db, admin, "profile_moderated", p.workspaceId, { businessId, status, reason: why });
}

export async function listClaimsForReview(db: Db) {
  return db
    .select({ claim: ownershipClaims, business: businesses.name, city: businesses.city })
    .from(ownershipClaims)
    .innerJoin(businesses, eq(businesses.id, ownershipClaims.businessId))
    .where(or(eq(ownershipClaims.status, "disputed"), and(eq(ownershipClaims.method, "manual"), eq(ownershipClaims.status, "pending"))))
    .orderBy(desc(ownershipClaims.createdAt));
}

/** Resolves a claim. Verifying one disputed claim rejects the others for the same website. */
export async function resolveClaim(db: Db, admin: AdminCtx, claimId: string, decision: "verified" | "rejected", reason: string) {
  const why = requireReason(reason);
  await db.transaction(async (tx) => {
    const [c] = await tx.select().from(ownershipClaims).where(eq(ownershipClaims.id, claimId));
    if (!c) throw new AppError("not_found", "Claim not found.");
    await tx.update(ownershipClaims).set({ status: decision, reviewNote: why, verifiedAt: decision === "verified" ? new Date() : null }).where(eq(ownershipClaims.id, c.id));
    if (decision === "verified") {
      await tx.update(businessProfiles).set({ verification: c.method === "manual" ? "manual" : c.method, status: "unpublished" }).where(eq(businessProfiles.businessId, c.businessId));
      if (c.target) {
        const others = await tx.select().from(ownershipClaims).where(and(eq(ownershipClaims.target, c.target), eq(ownershipClaims.status, "disputed")));
        for (const o of others.filter((o) => o.id !== c.id)) {
          await tx.update(ownershipClaims).set({ status: "rejected", reviewNote: `Resolved in favour of another claim: ${why}` }).where(eq(ownershipClaims.id, o.id));
          await tx.update(businessProfiles).set({ status: "unpublished", verification: "none" }).where(eq(businessProfiles.businessId, o.businessId));
        }
      }
    }
    await tx.insert(auditEvents).values({ workspaceId: c.workspaceId, actorUserId: admin.userId, action: "admin.claim_resolved", target: c.id, data: { decision, reason: why, admin: admin.email } });
  });
}

/** Support access needs a reason and expires; the owner can see it in their activity. */
export async function grantSupportAccess(db: Db, admin: AdminCtx, workspaceId: string, reason: string, hours: number) {
  const why = requireReason(reason);
  const h = Math.min(Math.max(hours, 1), 24);
  const [g] = await db.insert(supportGrants).values({ adminEmail: admin.email, workspaceId, reason: why, expiresAt: new Date(Date.now() + h * 3_600_000) }).returning();
  await adminAudit(db, admin, "support_access_granted", workspaceId, { reason: why, hours: h, grantId: g.id });
  return g;
}

export async function activeGrant(db: Db, admin: AdminCtx, workspaceId: string) {
  const [g] = await db
    .select()
    .from(supportGrants)
    .where(and(eq(supportGrants.workspaceId, workspaceId), eq(supportGrants.adminEmail, admin.email), isNull(supportGrants.revokedAt), gt(supportGrants.expiresAt, new Date())));
  return g ?? null;
}

/** Read-only support view. Lead contents and provider secrets are never shown. */
export async function supportView(db: Db, admin: AdminCtx, workspaceId: string) {
  const grant = await activeGrant(db, admin, workspaceId);
  if (!grant) throw new AppError("forbidden", "Request support access with a reason first.");
  await adminAudit(db, admin, "support_view", workspaceId, { grantId: grant.id });
  const [[b], [s], runs, [leadCount], sub, recent] = await Promise.all([
    db.select().from(businesses).where(eq(businesses.workspaceId, workspaceId)).limit(1),
    db.select({ slug: sites.slug, live: sites.publishedVersionId, updatedAt: sites.updatedAt }).from(sites).where(eq(sites.workspaceId, workspaceId)),
    db.select().from(monitoringRuns).where(eq(monitoringRuns.workspaceId, workspaceId)).orderBy(desc(monitoringRuns.createdAt)).limit(5),
    db.select({ n: count() }).from(leads).where(eq(leads.workspaceId, workspaceId)),
    db.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId)),
    db.select({ action: auditEvents.action, createdAt: auditEvents.createdAt }).from(auditEvents).where(eq(auditEvents.workspaceId, workspaceId)).orderBy(desc(auditEvents.createdAt)).limit(20),
  ]);
  return { grant, business: b ? { name: b.name, category: b.category, city: b.city, version: b.version } : null, site: s ?? null, runs, leadCount: leadCount.n, subscription: sub[0] ?? null, recent };
}

export async function adjustCredits(db: Db, admin: AdminCtx, workspaceId: string, amount: number, reason: string) {
  const why = requireReason(reason);
  if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 10_000) throw new AppError("invalid", "Enter a whole number between -10000 and 10000.");
  const key = `admin:${crypto.randomUUID()}`;
  await grantCredits(db, workspaceId, amount, `support adjustment: ${why}`, key);
  await adminAudit(db, admin, "credits_adjusted", workspaceId, { amount, reason: why });
}

export async function recentAudit(db: Db, limit = 50) {
  return db
    .select({ id: auditEvents.id, action: auditEvents.action, workspaceId: auditEvents.workspaceId, target: auditEvents.target, createdAt: auditEvents.createdAt })
    .from(auditEvents)
    .orderBy(desc(auditEvents.createdAt))
    .limit(limit);
}

export async function failedWork(db: Db) {
  const [runs, auditRows, jobRows] = await Promise.all([
    db.select({ id: monitoringRuns.id, workspaceId: monitoringRuns.workspaceId, status: monitoringRuns.status, createdAt: monitoringRuns.createdAt }).from(monitoringRuns).where(inArray(monitoringRuns.status, ["failed", "queued", "running"])).orderBy(desc(monitoringRuns.createdAt)).limit(20),
    db.select({ id: audits.id, workspaceId: audits.workspaceId, error: audits.error, createdAt: audits.createdAt }).from(audits).where(eq(audits.status, "failed")).orderBy(desc(audits.createdAt)).limit(20),
    db.select({ id: jobs.id, workspaceId: jobs.workspaceId, type: jobs.type, error: jobs.error, attempts: jobs.attempts }).from(jobs).where(eq(jobs.status, "failed")).orderBy(desc(jobs.updatedAt)).limit(20),
  ]);
  return { runs, audits: auditRows, jobs: jobRows };
}
