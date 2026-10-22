import { randomUUID } from "node:crypto";
import Link from "next/link";
import { Badge, Card, EmptyState, LinkButton, Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { missingOptionalFacts, requiredFactsProblems } from "@/lib/site/generate";
import { requireBusiness } from "@/server/business";
import { can } from "@/server/context";
import { getSite, latestGenerationJob, listVersions } from "@/server/sites";
import { listDomains } from "@/server/domains";
import { DomainsCard } from "./domains-card";
import { SiteEditor } from "./editor";
import { GenerateForm, PublishForm, RollbackForm, SlugForm, UnpublishForm } from "./panels";

export const metadata = { title: "My Website" };

const JOB_TEXT = {
  queued: ["neutral", "Queued"],
  generating: ["info", "Generating"],
  validating: ["info", "Checking"],
  ready: ["ok", "Ready"],
  failed: ["err", "Failed"],
} as const;

export default async function WebsitePage({ searchParams }: { searchParams: Promise<{ generated?: string }> }) {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireBusiness(db, ctx);
  const [site, job, versions, domains] = await Promise.all([getSite(db, ctx), latestGenerationJob(db, ctx), listVersions(db, ctx), listDomains(db, ctx)]);
  const { generated } = await searchParams;
  const problems = requiredFactsProblems(business);
  const missing = missingOptionalFacts(business);
  const canEdit = can(ctx, "editor");
  const isOwner = can(ctx, "owner");

  if (!site) {
    return (
      <>
        <PageHeader title="My Website" />
        {job?.status === "failed" && (
          <div className="mb-4">
            <Notice tone="err" title="The last attempt didn't finish">
              Your details are saved. Try again — a retry for the same details isn&apos;t charged twice.
            </Notice>
          </div>
        )}
        <EmptyState
          title={business.hasWebsite ? "You told us you already have a website" : "Create your website"}
          action={
            problems.length ? (
              <LinkButton href="/app/business">Complete my details</LinkButton>
            ) : canEdit ? (
              <GenerateForm requestId={randomUUID()} label="Generate website" pendingLabel="Building your private preview…" />
            ) : undefined
          }
        >
          {problems.length ? (
            <ul className="list-disc pl-5 text-left">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : (
            <p>
              {business.hasWebsite
                ? `We won't touch ${business.websiteUrl ?? "your current site"}. You can still create a simple site here — for example to try a new layout.`
                : "We'll build a private preview from the details you confirmed. Nothing is public until you publish."}
            </p>
          )}
        </EmptyState>
      </>
    );
  }

  const live = versions.find((v) => v.id === site.publishedVersionId);
  const liveIsCurrent = !!live && versions[0]?.id === live.id;
  const factsChanged = site.generatedFromVersion < business.version;

  return (
    <>
      <PageHeader
        title="My Website"
        description="Edit your draft, preview it, then publish when you're happy."
        actions={
          <>
            <LinkButton href="/app/website/preview" variant="secondary" target="_blank">
              Open private preview
            </LinkButton>
            {live && (
              <LinkButton href={`/s/${site.slug}`} variant="secondary" target="_blank">
                View live site
              </LinkButton>
            )}
          </>
        }
      />

      {generated && (
        <div className="mb-4">
          <Notice tone="ok" title="Your website draft is ready">
            Check the private preview, edit anything you like, then publish.
          </Notice>
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Status</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {live ? <Badge tone="ok">Live · version {live.versionNumber}</Badge> : <Badge tone="neutral">Not published</Badge>}
            {live && !liveIsCurrent && <Badge tone="warn">Older version live</Badge>}
            {job && <Badge tone={JOB_TEXT[job.status][0]}>Last generation: {JOB_TEXT[job.status][1]}</Badge>}
          </div>
          <p className="mt-3 text-sm text-muted">
            Address: <span className="font-mono">/s/{site.slug}</span>
          </p>
          {!business.publicContactConfirmedAt && (
            <div className="mt-3">
              <Notice tone="warn">
                Your contact details changed. <Link className="font-semibold underline" href="/app/business">Confirm them</Link>{" "}
                before publishing.
              </Notice>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {isOwner ? (
              <PublishForm revision={site.draftRevision} isLive={!!live} />
            ) : (
              <p className="text-sm text-muted">Only owners can publish. Your edits are saved to the draft.</p>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Make it better</h2>
          {missing.length === 0 ? (
            <p className="mt-2 text-muted">You&apos;ve added all the optional details we use.</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">Add these in My Business, then rewrite the related section:</p>
              <ul className="mt-2 space-y-1 text-sm">
                {missing.map((m) => (
                  <li key={m.field}>
                    <span className="font-semibold">{m.label}</span> — {m.why}
                  </li>
                ))}
              </ul>
              <LinkButton href="/app/business" variant="secondary" className="mt-3">
                Add details
              </LinkButton>
            </>
          )}
          {factsChanged && (
            <div className="mt-4">
              <Notice tone="info">Your business details changed since this draft was made. Use “Rewrite from my details” on a section to refresh it.</Notice>
            </div>
          )}
        </Card>
      </div>

      <SiteEditor initialDraft={site.draft} initialRevision={site.draftRevision} readOnly={!canEdit} />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Published versions</h2>
          {versions.length === 0 ? (
            <p className="mt-2 text-muted">Nothing published yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {versions.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span>
                    <span className="font-semibold">Version {v.versionNumber}</span>{" "}
                    <span className="text-sm text-muted">{v.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </span>
                  {v.id === site.publishedVersionId ? (
                    <Badge tone="ok">Live</Badge>
                  ) : (
                    isOwner && <RollbackForm versionId={v.id} versionNumber={v.versionNumber} />
                  )}
                </li>
              ))}
            </ul>
          )}
          {isOwner && live && (
            <div className="mt-4 border-t border-border pt-4">
              <UnpublishForm />
            </div>
          )}
        </Card>
        <Card className="space-y-6">
          {isOwner && <SlugForm slug={site.slug} />}
          {canEdit && (
            <div>
              <h2 className="font-semibold">Start over</h2>
              <p className="mt-1 mb-3 text-sm text-muted">
                Rebuild the whole draft from your current details. This replaces your draft edits; published versions are kept.
              </p>
              <GenerateForm requestId={randomUUID()} label="Regenerate whole draft" pendingLabel="Rebuilding draft…" variant="secondary" />
            </div>
          )}
        </Card>
        <div className="md:col-span-2">
          <DomainsCard domains={domains} isOwner={isOwner} />
        </div>
      </div>
    </>
  );
}
