import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { deletionRequests, users, workspaces } from "@/db/schema";
import { adjustCredits, grantSupportAccess, setProfileModeration, supportView } from "@/server/admin";
import { signTestEvent, testProvider } from "@/server/billing/providers";
import { applyPeriodTransitions, effectivePlan, getSubscription, processBillingEvent, scheduleDowngrade } from "@/server/billing/service";
import { getBusiness } from "@/server/business";
import { AppError, type Ctx } from "@/server/context";
import { getBalance } from "@/server/credits";
import { planSpec } from "@/lib/plans";
import { processDueDeletions, requestAccountDeletion } from "@/server/lifecycle";
import { unsubscribeToken, verifyUnsubscribe } from "@/server/notifications";
import { acceptInvite, inviteMember } from "@/server/team";
import { makeDb, onboard, signUp } from "./helpers";

const code = (c: AppError["code"]) => (e: unknown) => e instanceof AppError && e.code === c;

function signed(event: Record<string, unknown>) {
  const body = JSON.stringify(event);
  return testProvider.parseWebhook(body, new Headers({ "x-test-signature": signTestEvent(body) }));
}

let db: Db;
let ctx: Ctx;
beforeEach(async () => {
  db = await makeDb();
  ctx = await signUp(db, "owner@example.com");
  await onboard(db, ctx);
});

describe("billing webhooks", () => {
  it("rejects bad signatures", () => {
    expect(testProvider.parseWebhook('{"id":"x"}', new Headers({ "x-test-signature": "00" }))).toBeNull();
  });

  it("a duplicate delivery never double-credits", async () => {
    const periodEnd = new Date(Date.now() + 30 * 86_400_000).toISOString();
    const e = signed({ id: "evt_1", type: "subscription.activated", workspaceId: ctx.workspaceId, plan: "growth", subscriptionId: "sub_1", periodEnd })!;
    const before = await getBalance(db, ctx.workspaceId);
    expect(await processBillingEvent(db, e)).toBe("applied");
    expect(await processBillingEvent(db, e)).toBe("duplicate");
    expect(await getBalance(db, ctx.workspaceId)).toBe(before + planSpec("growth").monthlyCredits);
    // A different event for the same period also doesn't grant twice.
    const renew = signed({ id: "evt_2", type: "subscription.renewed", workspaceId: ctx.workspaceId, plan: "growth", subscriptionId: "sub_1", periodEnd })!;
    await processBillingEvent(db, renew);
    expect(await getBalance(db, ctx.workspaceId)).toBe(before + planSpec("growth").monthlyCredits);
    expect((await getSubscription(db, ctx.workspaceId)).plan).toBe("growth");
  });

  it("failed payment keeps features and content during the grace period", async () => {
    await processBillingEvent(db, signed({ id: "a", type: "subscription.activated", workspaceId: ctx.workspaceId, plan: "website", subscriptionId: "s", periodEnd: null })!);
    await processBillingEvent(db, signed({ id: "b", type: "payment.failed", workspaceId: ctx.workspaceId, plan: null, subscriptionId: "s", periodEnd: null })!);
    const sub = await getSubscription(db, ctx.workspaceId);
    expect(sub.status).toBe("past_due");
    expect(sub.graceUntil!.getTime()).toBeGreaterThan(Date.now() + 13 * 86_400_000);
    expect(await effectivePlan(db, ctx.workspaceId)).toBe("website");
    expect(await getBusiness(db, ctx)).not.toBeNull();
  });

  it("downgrades apply at period end, not immediately", async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    await processBillingEvent(db, signed({ id: "a", type: "subscription.activated", workspaceId: ctx.workspaceId, plan: "growth", subscriptionId: "s", periodEnd: new Date(Date.now() + 86_400_000).toISOString() })!);
    await scheduleDowngrade(db, ctx, "website");
    expect((await getSubscription(db, ctx.workspaceId)).plan).toBe("growth");
    await processBillingEvent(db, signed({ id: "c", type: "subscription.renewed", workspaceId: ctx.workspaceId, plan: "growth", subscriptionId: "s", periodEnd: past })!);
    await applyPeriodTransitions(db);
    expect((await getSubscription(db, ctx.workspaceId)).plan).toBe("website");
  });
});

describe("account lifecycle", () => {
  it("the only owner of a shared workspace can't delete their account", async () => {
    const bob = await signUp(db, "bob@example.com");
    const t = await inviteMember(db, ctx, "bob@example.com", "editor");
    await acceptInvite(db, { id: bob.userId, email: "bob@example.com" }, t);
    await expect(requestAccountDeletion(db, ctx)).rejects.toSatisfy(code("precondition_failed"));
  });

  it("account deletion removes the user and workspaces only they use", async () => {
    const r = await requestAccountDeletion(db, ctx);
    await db.update(deletionRequests).set({ scheduledFor: new Date(Date.now() - 1000) }).where(eq(deletionRequests.id, r.id));
    await processDueDeletions(db);
    expect(await db.select().from(users).where(eq(users.id, ctx.userId))).toHaveLength(0);
    expect(await db.select().from(workspaces).where(eq(workspaces.id, ctx.workspaceId))).toHaveLength(0);
  });
});

describe("admin and support", () => {
  const admin = { email: "staff@example.com", userId: "" };
  beforeEach(async () => {
    admin.userId = (await signUp(db, "staff@example.com")).userId;
  });

  it("moderation and credit changes need a reason", async () => {
    const b = (await getBusiness(db, ctx))!;
    await expect(setProfileModeration(db, admin, b.id, "suspended", "")).rejects.toSatisfy(code("invalid"));
    await setProfileModeration(db, admin, b.id, "suspended", "Reported as fake listing #123");
    await expect(adjustCredits(db, admin, ctx.workspaceId, 10, "x")).rejects.toSatisfy(code("invalid"));
  });

  it("support view requires a live, reasoned grant and hides lead contents", async () => {
    await expect(supportView(db, admin, ctx.workspaceId)).rejects.toSatisfy(code("forbidden"));
    await grantSupportAccess(db, admin, ctx.workspaceId, "Ticket 42: site not loading", 2);
    const v = await supportView(db, admin, ctx.workspaceId);
    expect(v.business?.name).toBe("Sharma Plumbing");
    expect(JSON.stringify(v)).not.toContain("message");
  });
});

describe("notifications", () => {
  it("unsubscribe links are signed per user, workspace and kind", () => {
    const t = unsubscribeToken(ctx.userId, ctx.workspaceId, "weeklySummary");
    expect(verifyUnsubscribe(ctx.userId, ctx.workspaceId, "weeklySummary", t)).toBe(true);
    expect(verifyUnsubscribe(ctx.userId, ctx.workspaceId, "leadAlerts", t)).toBe(false);
  });
});
