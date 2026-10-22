"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/db";
import type { Plan } from "@/db/schema";
import { requireCtx } from "@/lib/auth/session";
import { signTestEvent, testProvider } from "@/server/billing/providers";
import { processBillingEvent } from "@/server/billing/service";
import { requireRole } from "@/server/context";

/** Test mode only: simulates the provider sending a signed "activated" webhook. */
export async function completeTestCheckout(form: FormData) {
  if (process.env.NODE_ENV === "production") throw new Error("Test payments are disabled in production");
  const ctx = await requireCtx();
  requireRole(ctx, "owner");
  const plan = String(form.get("plan")) as Plan;
  const body = JSON.stringify({
    id: `test_evt_${crypto.randomUUID()}`,
    type: form.get("outcome") === "fail" ? "payment.failed" : "subscription.activated",
    workspaceId: ctx.workspaceId,
    plan,
    subscriptionId: `test_sub_${ctx.workspaceId}`,
    periodEnd: new Date(Date.now() + 30 * 86_400_000).toISOString(),
  });
  const event = testProvider.parseWebhook(body, new Headers({ "x-test-signature": signTestEvent(body) }));
  if (event) await processBillingEvent(await getDb(), event);
  redirect("/app/settings?billing=done");
}
