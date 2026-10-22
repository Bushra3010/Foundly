import { and, count, desc, eq, gte } from "drizzle-orm";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { WorkspaceTools } from "@/components/workspace-tools";
import { Badge, Card } from "@/components/ui";
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
  "admin.support_access_granted": "Support team was given temporary access",
  "admin.support_view": "Support team viewed your workspace",
  "billing.subscription.activated": "Plan activated",
  "billing.payment.failed": "Payment failed",
  "monitoring.run_created": "AI visibility check started",
  "action.applied": "Improvement applied",
  "team.joined": "Someone joined your team",
};

export default async function HomePage() {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireBusiness(db, ctx);
  const weekAgo = daysAgo(7);
  const [
    site,
    versions,
    profile,
    [{ n: newLeads }],
    [{ n: weekLeads }],
    activity,
    visibility,
  ] = await Promise.all([
    getSite(db, ctx),
    listVersions(db, ctx),
    getProfile(db, ctx),
    db
      .select({ n: count() })
      .from(leads)
      .where(
        and(eq(leads.workspaceId, ctx.workspaceId), eq(leads.status, "new")),
      ),
    db
      .select({ n: count() })
      .from(leads)
      .where(
        and(
          eq(leads.workspaceId, ctx.workspaceId),
          gte(leads.createdAt, weekAgo),
        ),
      ),
    db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.workspaceId, ctx.workspaceId))
      .orderBy(desc(auditEvents.createdAt))
      .limit(8),
    visibilitySummary(db, ctx, 30),
  ]);
  const vm = visibility.metrics;
  const live = site && versions.find((v) => v.id === site.publishedVersionId);

  // Three next actions, in order of what unlocks the most for the owner.
  const actions: { title: string; body: string; href: string; cta: string }[] =
    [];
  if (!site && !business.hasWebsite)
    actions.push({
      title: "Create your website",
      body: "Generate a private preview from your details.",
      href: "/app/website",
      cta: "Create website",
    });
  if (site && !live)
    actions.push({
      title: "Publish your website",
      body: "Your draft is ready. Review it and publish when happy.",
      href: "/app/website",
      cta: "Review draft",
    });
  if (profile?.status !== "published")
    actions.push({
      title: "Publish your directory profile",
      body: "Give customers an accurate page about your business.",
      href: "/app/business",
      cta: "Open My Business",
    });
  if (newLeads > 0)
    actions.push({
      title: `Reply to ${newLeads} new ${newLeads === 1 ? "enquiry" : "enquiries"}`,
      body: "Customers are waiting to hear back.",
      href: "/app/leads",
      cta: "Open leads",
    });
  for (const m of missingOptionalFacts(business)) {
    actions.push({
      title: `Add ${m.label.toLowerCase()}`,
      body: m.why + ".",
      href: "/app/business",
      cta: "Add details",
    });
  }

  const setupSteps = [
    { label: "Business details", done: true, href: "/app/business" },
    {
      label: "Website published",
      done: Boolean(live || business.hasWebsite),
      href: "/app/website",
    },
    {
      label: "Directory profile",
      done: profile?.status === "published",
      href: "/app/business",
    },
    {
      label: "AI visibility check",
      done: vm.valid > 0,
      href: "/app/visibility",
    },
  ];
  const completed = setupSteps.filter((step) => step.done).length;

  return (
    <>
      <header className="dashboard-heading">
        <h1>What would you like to work on?</h1>
        <p>{business.name} · Your business workspace</p>
      </header>
      <WorkspaceTools />
      <div className="section-heading overview-heading">
        <h2>Overview</h2>
        <Link href="/app/reports">
          View reports <Icon name="arrow" size={13} />
        </Link>
      </div>

      <section aria-label="Business overview" className="dashboard-metrics">
        <Card className="metric-card">
          <div className="metric-label">
            <span>Website status</span>
            <span className="metric-icon">
              <Icon name="website" />
            </span>
          </div>
          <div className="metric-value">
            {live
              ? "Live"
              : site
                ? "Draft"
                : business.hasWebsite
                  ? "Connected"
                  : "Not created"}
            <span className={`metric-status-dot ${live ? "live" : ""}`} />
          </div>
          <p className="metric-detail">
            {live
              ? `Published · version ${live.versionNumber}`
              : site
                ? "Your next step: review and publish"
                : "Your home on the internet"}
          </p>
          <Link href="/app/website" className="metric-link">
            Manage website
            <Icon name="arrow" size={15} />
          </Link>
        </Card>
        <Card className="metric-card">
          <div className="metric-label">
            <span>AI mention rate</span>
            <span className="metric-icon violet">
              <Icon name="visibility" />
            </span>
          </div>
          <div className="metric-value">
            {vm.valid > 0 && vm.mention.rate !== null
              ? `${Math.round(vm.mention.rate * 100)}%`
              : "—"}
            <span className="metric-period">Last 30 days</span>
          </div>
          <p className="metric-detail">
            {vm.valid > 0
              ? `${vm.mention.numerator} of ${vm.mention.denominator} answers${vm.smallSample ? " · small sample" : ""}`
              : "Run a check to see your first results"}
          </p>
          <Link href="/app/visibility" className="metric-link">
            {vm.valid > 0 ? "See the evidence" : "Explore AI visibility"}
            <Icon name="arrow" size={15} />
          </Link>
        </Card>
        <Card className="metric-card">
          <div className="metric-label">
            <span>Customer enquiries</span>
            <span className="metric-icon amber">
              <Icon name="leads" />
            </span>
          </div>
          <div className="metric-value">
            {weekLeads}
            <span className="metric-period">Last 7 days</span>
          </div>
          <p className="metric-detail">
            {newLeads} {newLeads === 1 ? "enquiry" : "enquiries"} awaiting your
            reply
          </p>
          <Link href="/app/leads" className="metric-link">
            Open your inbox
            <Icon name="arrow" size={15} />
          </Link>
        </Card>
      </section>

      <div className="dashboard-lower">
        <section>
          <div className="section-heading">
            <h2>Next steps</h2>
            <span className="text-xs text-muted">Recommended for you</span>
          </div>
          <Card className="action-list">
            {actions.length === 0 ? (
              <div className="p-6">
                <Badge tone="ok">You’re all caught up</Badge>
                <p className="mt-3 text-sm text-muted">
                  Come back to review your latest results.
                </p>
              </div>
            ) : (
              <ol>
                {actions.slice(0, 3).map((a, i) => (
                  <li key={a.title}>
                    <Link href={a.href} className="action-row">
                      <span className="action-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          {a.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted">
                          {a.body}
                        </span>
                      </span>
                      <Icon
                        name="arrow"
                        size={18}
                        className="shrink-0 text-brand"
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>
          <div className="section-heading mt-7">
            <h2>Recent activity</h2>
            <Icon name="clock" size={17} className="text-muted" />
          </div>
          <Card className="activity-card">
            <ul>
              {activity.map((e) => (
                <li key={e.id} className="activity-row">
                  <span className="activity-dot">
                    <Icon name="check" size={12} />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    {ACTIVITY_TEXT[e.action] ?? e.action}
                  </span>
                  <time
                    className="text-xs text-muted"
                    dateTime={e.createdAt.toISOString()}
                  >
                    {e.createdAt.toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </li>
              ))}
            </ul>
            {activity.length === 0 && (
              <p className="py-3 text-sm text-muted">
                Your business journey starts here. Updates will appear as you
                go.
              </p>
            )}
          </Card>
        </section>
        <aside>
          <div className="section-heading">
            <h2>Your setup</h2>
            <span className="text-xs font-semibold text-brand">
              {completed} / 4
            </span>
          </div>
          <Card className="foundation-card">
            <span className="foundation-icon">
              <Icon name="business" size={24} />
            </span>
            <h3 className="mt-4 text-lg font-semibold">Complete your setup</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Help customers find accurate information about your business.
            </p>
            <div
              className="setup-progress"
              role="progressbar"
              aria-label="Business setup"
              aria-valuenow={completed}
              aria-valuemin={0}
              aria-valuemax={4}
            >
              <span style={{ width: `${completed * 25}%` }} />
            </div>
            <ul className="setup-list">
              {setupSteps.map((step) => (
                <li key={step.label}>
                  <Link href={step.href}>
                    <span
                      className={step.done ? "setup-check done" : "setup-check"}
                    >
                      {step.done && <Icon name="check" size={12} />}
                    </span>
                    <span>{step.label}</span>
                    <Icon name="chevron" size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
