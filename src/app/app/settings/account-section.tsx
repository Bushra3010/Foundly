import { ActionForm } from "@/components/action-form";
import Link from "next/link";
import { Badge, Card, Checkbox, Notice, TextField } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { billingEnforced, formatInr, PLAN_RANK, planPrice, planSpec, PLANS } from "@/lib/plans";
import { activeProvider } from "@/server/billing/providers";
import { getSubscription } from "@/server/billing/service";
import { can } from "@/server/context";
import { getBalance, recentLedger } from "@/server/credits";
import { pendingDeletions, RECOVERY_DAYS } from "@/server/lifecycle";
import { getPrefs } from "@/server/notifications";
import {
  cancelDeletionAction,
  cancelPlanAction,
  checkoutAction,
  deleteAccountAction,
  downgradeAction,
  savePrefsAction,
} from "./actions";

export async function AccountSection() {
  const ctx = await requireCtx();
  const db = await getDb();
  const [sub, balance, ledger, prefs, deletions] = await Promise.all([
    getSubscription(db, ctx.workspaceId),
    getBalance(db, ctx.workspaceId),
    recentLedger(db, ctx.workspaceId, 8),
    getPrefs(db, ctx),
    pendingDeletions(db, ctx),
  ]);
  const plan = planSpec(sub.plan);
  const provider = activeProvider();
  const isOwner = can(ctx, "owner");

  return (
    <>
      <Card className="lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Plan and credits</h2>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{plan.name} plan</Badge>
            {sub.status === "past_due" && <Badge tone="err">Payment failed</Badge>}
            {sub.cancelAtPeriodEnd && <Badge tone="warn">Ends at period end</Badge>}
          </div>
        </div>
        {!billingEnforced() && (
          <div className="mt-3">
            <Notice tone="info">Pilot: plan limits are shown but not enforced yet. Nothing is charged unless you complete a checkout.</Notice>
          </div>
        )}
        {sub.status === "past_due" && sub.graceUntil && (
          <div className="mt-3">
            <Notice tone="err" title="We couldn't take your last payment">
              Your features stay on until {sub.graceUntil.toLocaleDateString("en-IN")}. After that your plan moves to Free. Nothing is deleted for non-payment, and you can export everything.
            </Notice>
          </div>
        )}
        <p className="mt-3 text-sm">
          Credits: <strong>{balance}</strong> — 1 credit is one AI answer collected. Failed attempts are free. Credits never top up automatically.
          {sub.currentPeriodEnd && ` Renews ${sub.currentPeriodEnd.toLocaleDateString("en-IN")}.`}
          {sub.scheduledPlan && ` Changes to ${planSpec(sub.scheduledPlan).name} at the end of this period.`}
        </p>
        <p className="mt-2 text-xs text-muted">Read the <Link href="/terms" className="underline">Terms &amp; Conditions</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link> before choosing a paid plan. Confirm the final price, tax and renewal terms at checkout.</p>
        <ul className="settings-plans mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Compare plans">
          {PLANS.filter((p) => !p.retired || p.key === sub.plan).map((p) => {
            const price = planPrice(p);
            const current = p.key === sub.plan;
            return (
              <li key={p.key} className={`rounded-lg border p-4 ${current ? "border-brand" : "border-border"}`}>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-muted">{p.summary}</p>
                <p className="mt-2 font-semibold">{p.key === "free" ? "Free" : price ? `${formatInr(price)} / month` : "Price to be confirmed"}</p>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                  {p.monthlyCredits > 0 && <li>{p.monthlyCredits} credits per month (capped)</li>}
                </ul>
                {current ? (
                  <p className="mt-3">
                    <Badge tone="ok">Current plan</Badge>
                  </p>
                ) : isOwner && PLAN_RANK[p.key] > PLAN_RANK[sub.plan] ? (
                  provider && price ? (
                    <div className="mt-3">
                      <ActionForm action={checkoutAction} submitLabel={`Upgrade to ${p.name}`} variant="secondary">
                        <input type="hidden" name="plan" value={p.key} />
                        <p className="text-xs text-muted">You&apos;ll pay on the payment provider&apos;s secure page. {provider.key === "test" ? "(Test mode — no charge.)" : ""}</p>
                      </ActionForm>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted">Online upgrade not available yet.</p>
                  )
                ) : (
                  isOwner &&
                  sub.plan !== "free" && (
                    <div className="mt-3">
                      <ActionForm action={downgradeAction} submitLabel={`Switch to ${p.name} at renewal`} variant="ghost">
                        <input type="hidden" name="plan" value={p.key} />
                      </ActionForm>
                    </div>
                  )
                )}
              </li>
            );
          })}
        </ul>
        {isOwner && sub.plan !== "free" && !sub.cancelAtPeriodEnd && (
          <div className="mt-4">
            <ActionForm action={cancelPlanAction} submitLabel="Cancel plan" variant="ghost" />
          </div>
        )}
        {ledger.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold">Credit history</summary>
            <ul className="mt-2 text-sm">
              {ledger.map((l) => (
                <li key={l.id} className="flex justify-between gap-2 border-t border-border py-1">
                  <span>{l.reason}</span>
                  <span className={l.delta < 0 ? "text-err-fg" : "text-ok-fg"}>
                    {l.delta > 0 ? "+" : ""}
                    {l.delta}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </Card>

      <div className="grid content-start gap-4">
        <Card>
          <h2 className="font-semibold">Email notifications</h2>
          <ActionForm action={savePrefsAction} submitLabel="Save" variant="secondary">
            <Checkbox name="weeklySummary" label="Send me a weekly summary" hint="AI visibility and improvement tasks. Off unless you turn it on." defaultChecked={prefs.weeklySummary} />
          </ActionForm>
          <p className="mt-2 text-xs text-muted">Security and billing messages are always sent.</p>
        </Card>

        <Card>
          <h2 className="font-semibold">Delete</h2>
          {deletions.map((d) => (
            <div key={d.id} className="mt-3">
              <Notice tone="warn" title={`Account deletion scheduled for ${d.scheduledFor.toLocaleDateString("en-IN")}`}>
                <ActionForm action={cancelDeletionAction} submitLabel="Cancel deletion" variant="secondary">
                  <input type="hidden" name="requestId" value={d.id} />
                </ActionForm>
              </Notice>
            </div>
          ))}
          <p className="mt-2 text-sm text-muted">
            Deleting your account removes your access and any workspace only you use. It can be cancelled for {RECOVERY_DAYS} days. Download your data from Reports first.
          </p>
          <div className="mt-4">
            <ActionForm action={deleteAccountAction} submitLabel="Delete my account" variant="danger">
              <TextField label="Type DELETE ACCOUNT to confirm" name="confirm" autoComplete="off" />
            </ActionForm>
          </div>
        </Card>
      </div>
    </>
  );
}
