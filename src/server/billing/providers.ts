import { createHmac, timingSafeEqual } from "node:crypto";
import type { Plan } from "@/db/schema";

/** Normalised billing events every payment adapter produces. */
export type BillingEvent = {
  provider: string;
  eventId: string;
  type: "subscription.activated" | "subscription.renewed" | "payment.failed" | "subscription.cancelled" | "refund.processed" | "ignored";
  workspaceId: string | null;
  plan: Plan | null;
  providerSubscriptionId: string | null;
  periodEnd: Date | null;
  raw: unknown;
};

export interface PaymentProvider {
  key: string;
  /** Hosted checkout — card details never touch our servers. */
  createCheckout(input: { workspaceId: string; plan: Plan; email: string; returnUrl: string }): Promise<{ url: string }>;
  cancel(providerSubscriptionId: string, atPeriodEnd: boolean): Promise<void>;
  /** Returns null when the signature doesn't verify. */
  parseWebhook(rawBody: string, headers: Headers): BillingEvent | null;
}

function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

const PLAN_IDS: Partial<Record<Plan, string | undefined>> = {
  website: process.env.RAZORPAY_PLAN_WEBSITE,
  growth: process.env.RAZORPAY_PLAN_GROWTH,
  agency: process.env.RAZORPAY_PLAN_AGENCY,
};

/**
 * Razorpay Subscriptions. Must be validated (settlement, GST invoices,
 * mandate limits) before launch — see docs/runbooks/failed-payment.md.
 */
export const razorpay: PaymentProvider = {
  key: "razorpay",
  async createCheckout({ workspaceId, plan, email }) {
    const planId = PLAN_IDS[plan];
    if (!planId) throw new Error(`No Razorpay plan configured for ${plan}`);
    const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan_id: planId, total_count: 120, customer_notify: 1, notes: { workspace_id: workspaceId, plan, email } }),
    });
    const json = (await res.json()) as { short_url?: string; error?: { description?: string } };
    if (!res.ok || !json.short_url) throw new Error(json.error?.description ?? `Razorpay returned ${res.status}`);
    return { url: json.short_url };
  },
  async cancel(id, atPeriodEnd) {
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancel_at_cycle_end: atPeriodEnd ? 1 : 0 }),
    });
    if (!res.ok) throw new Error(`Razorpay cancel returned ${res.status}`);
  },
  parseWebhook(rawBody, headers) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const sig = headers.get("x-razorpay-signature") ?? "";
    if (!secret || !safeEqualHex(createHmac("sha256", secret).update(rawBody).digest("hex"), sig)) return null;
    const body = JSON.parse(rawBody) as { event: string; payload?: { subscription?: { entity?: { id: string; notes?: Record<string, string>; current_end?: number } } } };
    const sub = body.payload?.subscription?.entity;
    const map: Record<string, BillingEvent["type"]> = {
      "subscription.activated": "subscription.activated",
      "subscription.charged": "subscription.renewed",
      "subscription.halted": "payment.failed",
      "subscription.pending": "payment.failed",
      "subscription.cancelled": "subscription.cancelled",
      "refund.processed": "refund.processed",
    };
    const plan = sub?.notes?.plan as Plan | undefined;
    return {
      provider: "razorpay",
      eventId: headers.get("x-razorpay-event-id") ?? createHmac("sha256", "id").update(rawBody).digest("hex"),
      type: map[body.event] ?? "ignored",
      workspaceId: sub?.notes?.workspace_id ?? null,
      plan: plan && ["website", "growth", "agency"].includes(plan) ? plan : null,
      providerSubscriptionId: sub?.id ?? null,
      periodEnd: sub?.current_end ? new Date(sub.current_end * 1000) : null,
      raw: body,
    };
  },
};

/**
 * Local test mode. The "checkout" is a page in this app that sends itself a
 * signed webhook. No money moves. Disabled in production.
 */
export const testProvider: PaymentProvider = {
  key: "test",
  async createCheckout({ workspaceId, plan, returnUrl }) {
    const params = new URLSearchParams({ workspaceId, plan, returnUrl });
    return { url: `/billing/test-checkout?${params}` };
  },
  async cancel() {},
  parseWebhook(rawBody, headers) {
    const sig = headers.get("x-test-signature") ?? "";
    if (!safeEqualHex(createHmac("sha256", testWebhookSecret()).update(rawBody).digest("hex"), sig)) return null;
    const e = JSON.parse(rawBody) as { id: string; type: BillingEvent["type"]; workspaceId: string; plan: Plan | null; subscriptionId: string; periodEnd: string | null };
    return { provider: "test", eventId: e.id, type: e.type, workspaceId: e.workspaceId, plan: e.plan, providerSubscriptionId: e.subscriptionId, periodEnd: e.periodEnd ? new Date(e.periodEnd) : null, raw: e };
  },
};

export function testWebhookSecret() {
  return process.env.TEST_PAYMENTS_SECRET || "dev-only-test-payments-secret";
}

export function signTestEvent(body: string) {
  return createHmac("sha256", testWebhookSecret()).update(body).digest("hex");
}

export function activeProvider(): PaymentProvider | null {
  if (process.env.PAYMENT_PROVIDER === "razorpay" && process.env.RAZORPAY_KEY_ID) return razorpay;
  if (process.env.NODE_ENV !== "production" && process.env.PAYMENT_PROVIDER !== "none") return testProvider;
  return null;
}

export function providerByKey(key: string): PaymentProvider | null {
  if (key === "razorpay") return razorpay;
  if (key === "test" && process.env.NODE_ENV !== "production") return testProvider;
  return null;
}
