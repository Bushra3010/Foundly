import { and, eq, isNotNull, lt, sql } from "drizzle-orm";
import type { Db, DbOrTx } from "@/db";
import { paymentEvents, subscriptions, type Plan } from "@/db/schema";
import { PLAN_RANK, planSpec } from "@/lib/plans";
import { AppError, audit, requireRole, type Ctx } from "../context";
import { grantCredits } from "../credits";
import { activeProvider, type BillingEvent } from "./providers";

const GRACE_DAYS = 14;

export async function getSubscription(db: DbOrTx, workspaceId: string) {
  const [s] = await db.select().from(subscriptions).where(eq(subscriptions.workspaceId, workspaceId));
  return s ?? { workspaceId, plan: "free" as Plan, status: "active" as const, provider: null, providerSubscriptionId: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, scheduledPlan: null, graceUntil: null, updatedAt: new Date() };
}

/** The plan whose features apply right now (past-due keeps features during the grace period). */
export async function effectivePlan(db: DbOrTx, workspaceId: string): Promise<Plan> {
  const s = await getSubscription(db, workspaceId);
  if (s.status === "cancelled") return "free";
  if (s.status === "past_due" && s.graceUntil && s.graceUntil < new Date()) return "free";
  return s.plan;
}

export async function startCheckout(db: Db, ctx: Ctx & { user: { email: string } }, plan: Plan, returnUrl: string) {
  requireRole(ctx, "owner");
  if (plan === "free") throw new AppError("invalid", "Choose a paid plan.");
  const provider = activeProvider();
  if (!provider) throw new AppError("precondition_failed", "Online payment isn't available yet. Contact us to upgrade.");
  const current = await getSubscription(db, ctx.workspaceId);
  if (current.status === "active" && current.plan === plan) throw new AppError("invalid", "You're already on this plan.");
  await audit(db, ctx, "billing.checkout_started", plan);
  return provider.createCheckout({ workspaceId: ctx.workspaceId, plan, email: ctx.user.email, returnUrl });
}

/**
 * Applies a verified billing event exactly once. The insert into
 * payment_events and the state change happen in one transaction, so a
 * duplicate delivery can never double-credit or double-charge.
 */
export async function processBillingEvent(db: Db, e: BillingEvent): Promise<"applied" | "duplicate" | "ignored"> {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(paymentEvents)
      .values({ provider: e.provider, eventId: e.eventId, type: e.type, workspaceId: e.workspaceId, payload: e.raw })
      .onConflictDoNothing()
      .returning({ id: paymentEvents.id });
    if (inserted.length === 0) return "duplicate";
    if (e.type === "ignored" || !e.workspaceId) return "ignored";

    const base = { workspaceId: e.workspaceId, provider: e.provider, updatedAt: new Date() };
    switch (e.type) {
      case "subscription.activated":
      case "subscription.renewed": {
        if (!e.plan) return "ignored";
        await tx
          .insert(subscriptions)
          .values({ ...base, plan: e.plan, status: "active", providerSubscriptionId: e.providerSubscriptionId, currentPeriodEnd: e.periodEnd, graceUntil: null })
          .onConflictDoUpdate({
            target: subscriptions.workspaceId,
            set: { plan: e.plan, status: "active", providerSubscriptionId: e.providerSubscriptionId, currentPeriodEnd: e.periodEnd, graceUntil: null, updatedAt: new Date() },
          });
        const credits = planSpec(e.plan).monthlyCredits;
        if (credits > 0) {
          // One allowance per billing period, keyed by subscription and period end.
          await grantCredits(tx as unknown as Db, e.workspaceId, credits, `${e.plan} plan allowance`, `plan:${e.providerSubscriptionId}:${e.periodEnd?.toISOString() ?? e.eventId}`, { type: "payment_event", id: e.eventId });
        }
        break;
      }
      case "payment.failed":
        // Keep features and content during the grace period; never delete for non-payment.
        await tx
          .update(subscriptions)
          .set({ status: "past_due", graceUntil: sql`coalesce(${subscriptions.graceUntil}, now() + interval '${sql.raw(String(GRACE_DAYS))} days')`, updatedAt: new Date() })
          .where(eq(subscriptions.workspaceId, e.workspaceId));
        break;
      case "subscription.cancelled":
        await tx.update(subscriptions).set({ cancelAtPeriodEnd: true, updatedAt: new Date() }).where(eq(subscriptions.workspaceId, e.workspaceId));
        break;
      case "refund.processed":
        break; // recorded in payment_events; entitlement changes are made explicitly by support
    }
    await audit(tx, { workspaceId: e.workspaceId, userId: null as unknown as string }, `billing.${e.type}`, e.eventId, { plan: e.plan });
    return "applied";
  });
}

/** Downgrades take effect at the end of the paid period; upgrades go through checkout. */
export async function scheduleDowngrade(db: Db, ctx: Ctx, plan: Plan) {
  requireRole(ctx, "owner");
  const s = await getSubscription(db, ctx.workspaceId);
  if (PLAN_RANK[plan] >= PLAN_RANK[s.plan]) throw new AppError("invalid", "Use Upgrade for a higher plan.");
  await db.update(subscriptions).set({ scheduledPlan: plan, updatedAt: new Date() }).where(eq(subscriptions.workspaceId, ctx.workspaceId));
  await audit(db, ctx, "billing.downgrade_scheduled", plan);
}

export async function cancelSubscription(db: Db, ctx: Ctx) {
  requireRole(ctx, "owner");
  const s = await getSubscription(db, ctx.workspaceId);
  if (s.plan === "free") throw new AppError("invalid", "You're on the free plan.");
  if (s.provider && s.providerSubscriptionId) {
    const { providerByKey } = await import("./providers");
    await providerByKey(s.provider)?.cancel(s.providerSubscriptionId, true);
  }
  await db.update(subscriptions).set({ cancelAtPeriodEnd: true, updatedAt: new Date() }).where(eq(subscriptions.workspaceId, ctx.workspaceId));
  await audit(db, ctx, "billing.cancel_requested");
}

/**
 * Cron: end-of-period transitions. Cancelled or long-unpaid workspaces move
 * to Free; their website is taken offline (kept, exportable), never deleted.
 */
export async function applyPeriodTransitions(db: Db, now = new Date()) {
  const ending = await db
    .select()
    .from(subscriptions)
    .where(and(isNotNull(subscriptions.currentPeriodEnd), lt(subscriptions.currentPeriodEnd, now)));
  let changed = 0;
  for (const s of ending) {
    if (s.scheduledPlan) {
      await db.update(subscriptions).set({ plan: s.scheduledPlan, scheduledPlan: null, updatedAt: now }).where(eq(subscriptions.workspaceId, s.workspaceId));
      changed++;
    } else if (s.cancelAtPeriodEnd && s.status !== "cancelled") {
      await db.update(subscriptions).set({ status: "cancelled", updatedAt: now }).where(eq(subscriptions.workspaceId, s.workspaceId));
      changed++;
    }
  }
  const lapsed = await db.select().from(subscriptions).where(and(eq(subscriptions.status, "past_due"), lt(subscriptions.graceUntil, now)));
  return { changed, lapsed: lapsed.length };
}
