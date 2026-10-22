import { and, count, desc, eq, gte } from "drizzle-orm";
import Link from "next/link";
import { Badge, Card, LinkButton, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { auditEvents, leads } from "@/db/schema";
import { requireCtx } from "@/lib/auth/session";
import { missingOptionalFacts } from "@/lib/site/generate";
import { getProfile, requireBusiness } from "@/server/business";
import { getSite, listVersions } from "@/server/sites";
import { visibilitySummary } from "@/server/monitoring/service";

export const metadata = { title: "Home" };

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const ACTIVITY_TEXT: Record<string, string> = {
  "workspace.created": "Account created",
  "business.created": "Business added",
  "business.updated": "Business details updated",
  "site.generated": "Website draft generated",
  "site.published": "Website published",
  "site.rolled_back": "Website rolled back",
  "site.unpublished": "Website taken offline",
  "site.slug_changed": "Website address changed",
  "profile.published": "Directory profile published",
  "profile.unpublished": "Directory profile hidden",
};

export default async function HomePage() {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireBusiness(db, ctx);
  const weekAgo = daysAgo(7);
  const [site, versions, profile, [{ n: newLeads }], [{ n: weekLeads }], activity, visibility] = await Promise.all([
    getSite(db, ctx),
    listVersions(db, ctx),
    getProfile(db, ctx),
    db.select({ n: count() }).from(leads).where(and(eq(leads.workspaceId, ctx.workspaceId), eq(leads.status, "new"))),
    db.select({ n: count() }).from(leads).where(and(eq(leads.workspaceId, ctx.workspaceId), gte(leads.createdAt, weekAgo))),
    db.select().from(auditEvents).where(eq(auditEvents.workspaceId, ctx.workspaceId)).orderBy(desc(auditEvents.createdAt)).limit(8),
    visibilitySummary(db, ctx, 30),
  ]);
  const vm = visibility.metrics;
  const live = site && versions.find((v) => v.id === site.publishedVersionId);

  // Three next actions, in order of what unlocks the most for the owner.
  const actions: { title: string; body: string; href: string; cta: string }[] = [];
  if (!site && !business.hasWebsite)
    actions.push({ title: "Create your website", body: "Generate a private preview from your details.", href: "/app/website", cta: "Create website" });
  if (site && !live)
    actions.push({ title: "Publish your website", body: "Your draft is ready. Review it and publish when happy.", href: "/app/website", cta: "Review draft" });
  if (profile?.status !== "published")
    actions.push({ title: "Publish your directory profile", body: "Give customers an accurate page about your business.", href: "/app/business", cta: "Open My Business" });
  if (newLeads > 0)
    actions.push({ title: `Reply to ${newLeads} new ${newLeads === 1 ? "enquiry" : "enquiries"}`, body: "Customers are waiting to hear back.", href: "/app/leads", cta: "Open leads" });
  for (const m of missingOptionalFacts(business)) {
    actions.push({ title: `Add ${m.label.toLowerCase()}`, body: m.why + ".", href: "/app/business", cta: "Add details" });
  }

  return (
    <>
      <PageHeader title={`Hello, ${business.name}`} description="Here's where things stand and what to do next." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <h2 className="text-sm font-semibold text-muted">Website</h2>
          <p className="mt-2">
            {live ? <Badge tone="ok">Live · version {live.versionNumber}</Badge> : site ? <Badge tone="warn">Draft not published</Badge> : <Badge tone="neutral">{business.hasWebsite ? "Using your own site" : "Not created"}</Badge>}
          </p>
          {live && site && (
            <Link href={`/s/${site.slug}`} className="mt-2 block truncate text-sm font-semibold text-brand underline" target="_blank">
              /s/{site.slug}
            </Link>
          )}
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-muted">AI visibility</h2>
          {vm.valid > 0 && vm.mention.rate !== null ? (
            <>
              <p className="mt-2 text-3xl font-bold">{Math.round(vm.mention.rate * 100)}%</p>
              <p className="text-sm text-muted">
                mention rate · {vm.mention.numerator} of {vm.mention.denominator} answers, last 30 days{vm.smallSample ? " · small sample" : ""}
              </p>
              <Link href="/app/visibility" className="mt-1 block text-sm font-semibold text-brand underline">
                See evidence
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2">
                <Badge tone="neutral">No results yet</Badge>
              </p>
              <p className="mt-2 text-sm text-muted">No valid AI answers collected in the last 30 days.</p>
            </>
          )}
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-muted">Leads</h2>
          <p className="mt-2 text-3xl font-bold">{weekLeads}</p>
          <p className="text-sm text-muted">
            in the last 7 days · {newLeads} awaiting reply
          </p>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Next actions</h2>
        {actions.length === 0 ? (
          <Card>
            <p className="text-muted">You&apos;re all caught up.</p>
          </Card>
        ) : (
          <ol className="grid gap-3 md:grid-cols-3">
            {actions.slice(0, 3).map((a, i) => (
              <li key={a.title}>
                <Card className="flex h-full flex-col">
                  <p className="text-sm font-semibold text-brand">{i + 1}</p>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{a.body}</p>
                  <LinkButton href={a.href} variant="secondary" className="mt-3 self-start">
                    {a.cta}
                  </LinkButton>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
        <Card>
          <ul className="divide-y divide-border">
            {activity.map((e) => (
                <li key={e.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                  <span>{ACTIVITY_TEXT[e.action] ?? e.action}</span>
                  <time className="text-muted" dateTime={e.createdAt.toISOString()}>
                    {e.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </time>
                </li>
              ))}
          </ul>
        </Card>
      </section>
    </>
  );
}
