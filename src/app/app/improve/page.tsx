import { ActionForm } from "@/components/action-form";
import { Badge, Card, EmptyState, LinkButton, Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { CHECK_LABEL, CHECKLIST_VERSION } from "@/server/audit/checks";
import { latestAudit, listActions } from "@/server/audit/service";
import { can } from "@/server/context";
import { readinessFor } from "@/server/geo";
import { AiReadiness } from "@/components/ai-readiness";
import { getWordPress, listPages, sectionHtml, WORDPRESS_CHECKS } from "@/server/wordpress";
import {
  applyActionAction,
  approveActionAction,
  rejectActionAction,
  applyWordPressAction,
  prepareWordPressAction,
  rollbackActionAction,
  rollbackWordPressAction,
  saveDraftAction,
  startAuditAction,
  verifyActionAction,
} from "./actions";
import { requireCurrentBusiness } from "@/server/current";
import { normalizeSiteUrl } from "@/server/safe-fetch";
import { AutoRefresh } from "@/components/auto-refresh";

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

function targetOf(url: string) {
  try {
    return normalizeSiteUrl(url);
  } catch {
    return null;
  }
}

export default async function ImprovePage() {
  const ctx = await requireCtx();
  const locale = await getLocale();
  const db = await getDb();
  const b = await requireCurrentBusiness(db, ctx);
  const [latest, actions, wp, readiness] = await Promise.all([latestAudit(db, ctx), listActions(db, ctx), getWordPress(db, ctx), readinessFor(db, ctx, b)]);
  // Only a check of the website connected now is shown; an old address's results don't apply.
  const target = b.hasWebsite && b.websiteUrl ? targetOf(b.websiteUrl) : null;
  const audit = latest && target && latest.target === target ? latest : null;
  const wpPages = wp ? await listPages(db, ctx).catch(() => null) : null;
  const open = actions.filter((a) => !["verified", "rejected", "rolled_back"].includes(a.status));
  const closed = actions.filter((a) => ["verified", "rejected", "rolled_back"].includes(a.status));
  const isOwner = can(ctx, "owner");
  const canEdit = can(ctx, "editor");
  const running = audit && (audit.status === "queued" || audit.status === "running");
  const failed = audit?.findings.filter((f) => !f.passed) ?? [];
  const passed = audit?.findings.filter((f) => f.passed) ?? [];

  return (
    <>
      <AutoRefresh active={!!running || !!readiness.websiteRunning} />
      <PageHeader icon="improve"
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

      <div className="mb-6">
        <AiReadiness readiness={readiness} fresh />
      </div>

      <Card>
        <h2 className="font-semibold">Check your website</h2>
        <p className="mt-1 text-sm text-muted">
          {b.websiteUrl
            ? `We read up to 8 public pages of ${b.websiteUrl}. We never need your website login, and nothing on your site is changed.`
            : "Connect your website and we'll check what AI assistants can read on it."}
        </p>
        {running ? (
          <p className="mt-3" aria-live="polite">
            <Badge tone="info">Checking your website…</Badge> <span className="text-sm text-muted">Usually under a minute. This page updates by itself.</span>
          </p>
        ) : (
          canEdit && (
            <div className="mt-3 flex flex-wrap gap-3">
              {b.websiteUrl && (
                <ActionForm action={startAuditAction} submitLabel="Check my website" pendingLabel="Starting…" />
              )}
              {!b.websiteUrl && (
                <LinkButton href="/app/website" variant="secondary">
                  Connect or request a website
                </LinkButton>
              )}
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
            <h3 className="mt-5 font-semibold">How we rate your website</h3>
            <p className="mt-1 text-sm text-muted">Each check below is one point. Your website score is the share that pass, scaled to 50.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {Object.entries(CATEGORY)
                .map(([key, name]) => ({ key, name, items: audit.findings.filter((f) => f.category === key) }))
                .filter((g) => g.items.length > 0)
                .map((g) => (
                  <section key={g.key} className="rounded-lg border border-border p-3">
                    <h4 className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {g.name}
                      <span className="text-muted">{g.items.filter((f) => f.passed).length} of {g.items.length}</span>
                    </h4>
                    <ul className="mt-2 space-y-2 text-sm">
                      {g.items.map((f) => (
                        <li key={f.id}>
                          <span className="flex items-center gap-2 font-medium">
                            <Badge tone={f.passed ? "ok" : f.severity === "high" ? "err" : "warn"}>{f.passed ? "Pass" : "Improve"}</Badge>
                            {CHECK_LABEL[f.checkKey] ?? f.checkKey}
                          </span>
                          <span className="mt-0.5 block text-muted">
                            {f.evidence}
                            {f.partial && " (automated check, confirm it yourself)"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
            </div>
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
                        Draft {a.applyKind === "wordpress_append" ? "(added to your WordPress page when you apply it)" : "(copy this to your website)"}
                      </label>
                      <textarea id={`draft-${a.id}`} name="draft" defaultValue={a.draft} rows={Math.min(12, Math.max(3, a.draft.split("\n").length + 1))} className="block w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm" />
                    </ActionForm>
                  </div>
                )}
                {a.draft && ["applied", "queued"].includes(a.status) && <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-sm">{a.draft}</pre>}
                {wp && WORDPRESS_CHECKS.includes(a.checkKey) && !["applied", "queued"].includes(a.status) && (
                  <div className="mt-3 rounded-lg border border-border p-3">
                    <h4 className="text-sm font-semibold">Add this to a WordPress page</h4>
                    {wpPages === null ? (
                      <p className="text-sm text-err-fg">We couldn&apos;t list your WordPress pages. Check the connection in Settings.</p>
                    ) : (
                      <ActionForm action={prepareWordPressAction} submitLabel="Preview change" variant="secondary" inline>
                        <input type="hidden" name="actionId" value={a.id} />
                        <select name="pageId" aria-label="WordPress page" defaultValue={a.externalTarget?.pageId} className="min-h-11 rounded-lg border border-border bg-surface px-2">
                          {wpPages.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </ActionForm>
                    )}
                    {a.externalTarget && (
                      <>
                        <p className="mt-2 text-sm">
                          This section will be added to the end of <strong>{a.externalTarget.pageTitle}</strong> (page last edited {a.externalTarget.previewedModified} UTC). If the page changes before you apply, nothing is written.
                        </p>
                        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-surface-2 p-2 text-xs">{sectionHtml(a.checkKey, a.draft) ?? "Nothing to add — edit the draft."}</pre>
                      </>
                    )}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {isOwner && ["detected", "proposed", "owner_edited", "failed", "rolled_back"].includes(a.status) && (
                    <ActionForm action={approveActionAction} submitLabel="Approve" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                      <input type="hidden" name="revision" value={a.draftRevision} />
                    </ActionForm>
                  )}
                  {isOwner && a.status === "approved" && a.applyKind === "wordpress_append" && (
                    <ActionForm action={applyWordPressAction} submitLabel="Apply to WordPress" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
                  )}
                  {isOwner && a.status === "approved" && a.applyKind === "manual" && (
                    <ActionForm action={applyActionAction} submitLabel="I've made this change" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
                  )}
                  {canEdit && (a.status === "applied" || a.status === "failed") && (
                    <ActionForm action={verifyActionAction} submitLabel="Check it's live" variant="secondary" pendingLabel="Checking…" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
                  )}
                  {isOwner && a.status === "applied" && a.applyKind === "wordpress_append" && (
                    <ActionForm action={rollbackWordPressAction} submitLabel="Undo in WordPress" variant="ghost" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
                  )}
                  {isOwner && a.status === "applied" && a.applyKind === "manual" && (
                    <ActionForm action={rollbackActionAction} submitLabel="Reopen" variant="ghost" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
                  )}
                  {canEdit && !["applied", "queued"].includes(a.status) && (
                    <ActionForm action={rejectActionAction} submitLabel="Dismiss" variant="ghost" inline>
                      <input type="hidden" name="actionId" value={a.id} />
                    </ActionForm>
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
