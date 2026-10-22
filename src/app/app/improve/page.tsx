import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Badge, Card, EmptyState, LinkButton, Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { CHECKLIST_VERSION } from "@/server/audit/checks";
import { latestAudit, listActions } from "@/server/audit/service";
import { requireBusiness } from "@/server/business";
import { can } from "@/server/context";
import { getSite } from "@/server/sites";
import {
  applyActionAction,
  approveActionAction,
  rejectActionAction,
  rollbackActionAction,
  saveDraftAction,
  startAuditAction,
  verifyActionAction,
} from "./actions";

export const metadata = { title: "Improve My Business" };

const STATUS = {
  detected: ["neutral", "Found"],
  proposed: ["info", "Suggested"],
  owner_edited: ["info", "Edited — needs approval"],
  approved: ["ok", "Approved"],
  queued: ["info", "Applying"],
  applied: ["warn", "Applied — not yet confirmed live"],
  verified: ["ok", "Confirmed live"],
  rejected: ["neutral", "Dismissed"],
  failed: ["err", "Not confirmed"],
  rolled_back: ["neutral", "Rolled back"],
} as const;

const CATEGORY = { facts: "Business facts", technical: "Technical access", content: "Content", structured_data: "Structured data", accessibility: "Accessibility and mobile" } as Record<string, string>;

export default async function ImprovePage() {
  const ctx = await requireCtx();
  const locale = await getLocale();
  const db = await getDb();
  const b = await requireBusiness(db, ctx);
  const [audit, actions, site] = await Promise.all([latestAudit(db, ctx), listActions(db, ctx), getSite(db, ctx)]);
  const open = actions.filter((a) => !["verified", "rejected", "rolled_back"].includes(a.status));
  const closed = actions.filter((a) => ["verified", "rejected", "rolled_back"].includes(a.status));
  const isOwner = can(ctx, "owner");
  const canEdit = can(ctx, "editor");
  const running = audit && (audit.status === "queued" || audit.status === "running");
  const failed = audit?.findings.filter((f) => !f.passed) ?? [];
  const passed = audit?.findings.filter((f) => f.passed) ?? [];

  return (
    <>
      <PageHeader
        title={t(locale, "nav.improve")}
        description="Small, specific changes that make your information clearer for customers. They can make pages more useful; they can't guarantee that any AI service will mention you."
        actions={
          actions.length > 0 ? (
            <LinkButton href="/app/improve/export" variant="secondary" prefetch={false}>
              Download fixes
            </LinkButton>
          ) : undefined
        }
      />

      <Card>
        <h2 className="font-semibold">Check your website</h2>
        <p className="mt-1 text-sm text-muted">
          {b.websiteUrl
            ? `We read up to 8 public pages of ${b.websiteUrl}. We never need your website login, and nothing on your site is changed.`
            : "We check your platform website's content."}
        </p>
        {running ? (
          <p className="mt-3" aria-live="polite">
            <Badge tone="info">Audit running</Badge> <span className="text-sm text-muted">Refresh in a moment.</span>
          </p>
        ) : (
          canEdit && (
            <div className="mt-3 flex flex-wrap gap-3">
              {b.websiteUrl && (
                <ActionForm action={startAuditAction} submitLabel="Check my website" pendingLabel="Starting…">
                  <input type="hidden" name="kind" value="external" />
                </ActionForm>
              )}
              {site && (
                <ActionForm action={startAuditAction} submitLabel="Check my platform website" variant={b.websiteUrl ? "secondary" : "primary"} pendingLabel="Starting…">
                  <input type="hidden" name="kind" value="hosted" />
                </ActionForm>
              )}
              {!b.websiteUrl && !site && <p className="text-sm text-muted">Add your website address in My Business, or create a website first.</p>}
            </div>
          )
        )}
        {audit?.status === "failed" && (
          <div className="mt-3">
            <Notice tone="err" title="The last audit couldn't finish">
              {audit.error}
            </Notice>
          </div>
        )}
        {audit?.status === "completed" && (
          <div className="mt-4">
            <p className="text-sm">
              Last checked {audit.finishedAt?.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {audit.pagesScanned.length} page(s) · checklist v{CHECKLIST_VERSION} ·{" "}
              <strong>{passed.length}</strong> passed, <strong>{failed.length}</strong> to improve
            </p>
            {audit.notRun.length > 0 && (
              <p className="mt-1 text-sm text-warn-fg">
                Some pages couldn&apos;t be read: {audit.notRun.map((n) => `${n.check} (${n.reason})`).join("; ")}. Checks for them didn&apos;t run.
              </p>
            )}
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold">See all checks</summary>
              <ul className="mt-2 space-y-1 text-sm">
                {audit.findings.map((f) => (
                  <li key={f.id} className="flex flex-wrap gap-2">
                    <Badge tone={f.passed ? "ok" : f.severity === "high" ? "err" : "warn"}>{f.passed ? "Pass" : "Improve"}</Badge>
                    <span className="text-muted">{CATEGORY[f.category]}:</span> {f.evidence}
                    {f.partial && <span className="text-xs text-muted">(automated check — confirm manually)</span>}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </Card>

      <h2 className="mt-8 mb-3 text-lg font-semibold">Your tasks</h2>
      {open.length === 0 ? (
        <EmptyState title={audit ? "Nothing to do right now" : "Run a check to get suggestions"}>
          {audit ? "Every task is done or dismissed." : "We'll turn what we find into small tasks with a draft for each."}
        </EmptyState>
      ) : (
        <ol className="space-y-4">
          {open.map((a) => (
            <li key={a.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-sm text-muted">
                      {a.page ? `Page: ${a.page} · ` : ""}Importance: {a.severity}
                    </p>
                  </div>
                  <Badge tone={STATUS[a.status][0]}>{STATUS[a.status][1]}</Badge>
                </div>
                <dl className="mt-3 grid gap-2 text-sm">
                  <div>
                    <dt className="font-semibold">What we found</dt>
                    <dd className="text-muted">{a.evidence}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Why it may help</dt>
                    <dd className="text-muted">{a.hypothesis}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">What to change</dt>
                    <dd className="text-muted">{a.proposedChange}</dd>
                  </div>
                </dl>
                {a.verificationNote && <p className="mt-2 text-sm">{a.verificationNote}</p>}
                {canEdit && !["applied", "queued"].includes(a.status) && (a.draft || a.applyKind !== "manual") && (
                  <div className="mt-3">
                    <ActionForm action={saveDraftAction} submitLabel="Save draft" variant="secondary">
                      <input type="hidden" name="actionId" value={a.id} />
                      <input type="hidden" name="revision" value={a.draftRevision} />
                      <label htmlFor={`draft-${a.id}`} className="block text-sm font-semibold">
                        Draft {a.applyKind === "manual" ? "(copy this to your website)" : "(added to your website when you apply it)"}
                      </label>
                      <textarea id={`draft-${a.id}`} name="draft" defaultValue={a.draft} rows={Math.min(12, Math.max(3, a.draft.split("\n").length + 1))} className="block w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm" />
                    </ActionForm>
                  </div>
                )}
                {a.draft && ["applied", "queued"].includes(a.status) && <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-sm">{a.draft}</pre>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {isOwner && ["detected", "proposed", "owner_edited", "failed", "rolled_back"].includes(a.status) && (
                    <ActionForm action={approveActionAction} submitLabel="Approve" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                      <input type="hidden" name="revision" value={a.draftRevision} />
                    </ActionForm>
                  )}
                  {isOwner && a.status === "approved" && (
                    <ActionForm action={applyActionAction} submitLabel={a.applyKind === "manual" ? "I've made this change" : "Apply to my website draft"} inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
                  )}
                  {canEdit && (a.status === "applied" || a.status === "failed") && (
                    <ActionForm action={verifyActionAction} submitLabel="Check it's live" variant="secondary" pendingLabel="Checking…" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
                  )}
                  {isOwner && a.status === "applied" && a.applyKind !== "manual" && (
                    <ActionForm action={rollbackActionAction} submitLabel="Roll back" variant="ghost" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
                  )}
                  {canEdit && !["applied", "queued"].includes(a.status) && (
                    <ActionForm action={rejectActionAction} submitLabel="Dismiss" variant="ghost" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
                  )}
                  {a.status === "applied" && a.applyKind !== "manual" && (
                    <Link href="/app/website" className="inline-flex min-h-11 items-center text-sm font-semibold underline">
                      Review and publish
                    </Link>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}

      {closed.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer font-semibold">History ({closed.length})</summary>
          <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-surface text-sm">
            {closed.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <span>{a.title}</span>
                <span className="flex items-center gap-2">
                  <Badge tone={STATUS[a.status][0]}>{STATUS[a.status][1]}</Badge>
                  <span className="text-muted">{(a.verifiedAt ?? a.updatedAt).toLocaleDateString("en-IN")}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Visibility results before and after a change are shown with dates on AI Visibility. Because AI answers vary and other things change at the same time, we can&apos;t prove that one change caused a difference.
          </p>
        </details>
      )}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Keep your details the same everywhere</h2>
          <p className="mt-1 text-sm text-muted">Copy these exact details to every profile you already manage (maps listings, social pages, local directories):</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-2 p-3 text-sm">{[b.name, b.category, b.city, b.phone && `Phone: ${b.phone}`, b.whatsapp && `WhatsApp: ${b.whatsapp}`, b.email, b.websiteUrl].filter(Boolean).join("\n")}</pre>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>Use the same business name spelling on every profile.</li>
            <li>Update old phone numbers and addresses wherever they appear.</li>
            <li>Only list locations where you really operate.</li>
          </ul>
          <p className="mt-2 text-xs text-muted">We don&apos;t submit to other sites on your behalf.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Asking customers for reviews</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>Ask real customers after a completed job, with a direct link to your review page.</li>
            <li>Ask everyone, not only happy customers, and never offer payment or discounts for reviews.</li>
            <li>Reply politely to every review, including negative ones.</li>
            <li>Never write reviews yourself or ask friends to pose as customers.</li>
          </ul>
        </Card>
      </section>
    </>
  );
}
