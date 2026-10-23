import { and, count, desc, eq, gte } from "drizzle-orm";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui";
import { ShareLink } from "@/components/share-link";
import { siteUrl } from "@/app/s/load";
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
  "account.password_set": "Password updated",
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

  const [focus, ...moreActions] = actions;
  const mentionRate = vm.valid > 0 && vm.mention.rate !== null ? Math.round(vm.mention.rate * 100) : null;
  const ringR = 34;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div className="dash">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-eyebrow">Welcome back</span>
          <h1>{business.name}</h1>
          <p>{[business.category, business.city].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="dash-hero-actions">
          <span className={`dash-status ${live ? "live" : site ? "draft" : ""}`}>
            <span aria-hidden="true" />
            {live ? "Website live" : site ? "Draft ready" : business.hasWebsite ? "Website connected" : "No website yet"}
          </span>
          {live && site ? (
            <a href={`/s/${site.slug}`} target="_blank" rel="noreferrer" className="dash-btn ghost">
              <Icon name="globe" size={16} /> View website
            </a>
          ) : (
            <Link href="/app/website" className="dash-btn ghost">
              <Icon name="website" size={16} /> Open website
            </Link>
          )}
        </div>
      </header>

      <section className="dash-focus" aria-label="Your next step">
        <div className="dash-focus-main">
          {focus ? (
            <>
              <span className="dash-focus-label"><Icon name="spark" size={14} /> Your next step</span>
              <h2>{focus.title}</h2>
              <p>{focus.body}</p>
              <Link href={focus.href} className="dash-btn lime">
                {focus.cta} <Icon name="arrow" size={17} />
              </Link>
              {live && site && <ShareLink url={siteUrl(site.slug)} label="Share your website with customers" shareText={business.name} />}
            </>
          ) : (
            <>
              <span className="dash-focus-label"><Icon name="check" size={14} /> All caught up</span>
              <h2>Everything is in place.</h2>
              <p>Come back to check new enquiries and your latest AI visibility results.</p>
              <Link href="/app/visibility" className="dash-btn lime">
                See AI visibility <Icon name="arrow" size={17} />
              </Link>
              {live && site && <ShareLink url={siteUrl(site.slug)} label="Share your website with customers" shareText={business.name} />}
            </>
          )}
        </div>
        <div className="dash-setup">
          <div className="dash-ring" role="progressbar" aria-label="Setup progress" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={4}>
            <svg viewBox="0 0 80 80" aria-hidden="true">
              <circle cx="40" cy="40" r={ringR} className="dash-ring-track" />
              <circle cx="40" cy="40" r={ringR} className="dash-ring-fill" strokeDasharray={ringC} strokeDashoffset={ringC * (1 - completed / 4)} />
            </svg>
            <span><strong>{completed}</strong>/4</span>
          </div>
          <ul>
            {setupSteps.map((step) => (
              <li key={step.label}>
                <Link href={step.href} className={step.done ? "done" : ""}>
                  <span className="dash-tick" aria-hidden="true">{step.done && <Icon name="check" size={11} />}</span>
                  {step.label}
                  <span className="sr-only">{step.done ? " (done)" : " (to do)"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="dash-kpis" aria-label="Business overview">
        <Link href="/app/website" className="dash-kpi">
          <span className="dash-kpi-icon peach"><Icon name="website" size={19} /></span>
          <span className="dash-kpi-label">Website</span>
          <strong className="dash-kpi-value">
            {live ? "Live" : site ? "Draft" : business.hasWebsite ? "Connected" : "Not created"}
          </strong>
          <span className="dash-kpi-detail">
            {live ? `Published · version ${live.versionNumber}` : site ? "Review and publish when ready" : business.hasWebsite ? (business.websiteUrl ?? "Your own website") : "Your home on the internet"}
          </span>
          <span className="dash-kpi-link">Manage website <Icon name="arrow" size={14} /></span>
        </Link>
        <Link href="/app/visibility" className="dash-kpi">
          <span className="dash-kpi-icon lilac"><Icon name="visibility" size={19} /></span>
          <span className="dash-kpi-label">AI mention rate <em>30 days</em></span>
          <strong className="dash-kpi-value">{mentionRate === null ? "—" : `${mentionRate}%`}</strong>
          <span className="dash-kpi-detail">
            {vm.valid > 0
              ? `${vm.mention.numerator} of ${vm.mention.denominator} answers${vm.smallSample ? " · small sample" : ""}`
              : "Run a check to see your first results"}
          </span>
          {mentionRate !== null && (
            <span className="dash-kpi-meter" aria-hidden="true"><span style={{ width: `${mentionRate}%` }} /></span>
          )}
          <span className="dash-kpi-link">{vm.valid > 0 ? "See the evidence" : "Explore AI visibility"} <Icon name="arrow" size={14} /></span>
        </Link>
        <Link href="/app/leads" className="dash-kpi">
          <span className="dash-kpi-icon amber"><Icon name="leads" size={19} /></span>
          <span className="dash-kpi-label">Enquiries <em>7 days</em></span>
          <strong className="dash-kpi-value">{weekLeads}</strong>
          <span className="dash-kpi-detail">
            {newLeads > 0 ? `${newLeads} waiting for your reply` : "No enquiries waiting"}
          </span>
          {newLeads > 0 && <span className="dash-kpi-badge">{newLeads} new</span>}
          <span className="dash-kpi-link">Open inbox <Icon name="arrow" size={14} /></span>
        </Link>
      </section>

      <div className="dash-lower">
        <section className="dash-panel" aria-labelledby="dash-more">
          <div className="dash-panel-head">
            <h2 id="dash-more">More ways to grow</h2>
            <span>{moreActions.length > 0 ? `${Math.min(moreActions.length, 3)} suggestions` : "Nothing pending"}</span>
          </div>
          {moreActions.length === 0 ? (
            <p className="dash-empty">
              <Badge tone="ok">You’re all caught up</Badge>
              <span>New suggestions will appear here as your business grows.</span>
            </p>
          ) : (
            <ul className="dash-todo">
              {moreActions.slice(0, 3).map((a) => (
                <li key={a.title}>
                  <Link href={a.href}>
                    <span className="dash-todo-dot" aria-hidden="true" />
                    <span className="dash-todo-text">
                      <strong>{a.title}</strong>
                      <span>{a.body}</span>
                    </span>
                    <span className="dash-todo-cta">{a.cta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dash-panel" aria-labelledby="dash-activity">
          <div className="dash-panel-head">
            <h2 id="dash-activity">Recent activity</h2>
            <Link href="/app/reports">Reports <Icon name="arrow" size={13} /></Link>
          </div>
          {activity.length === 0 ? (
            <p className="dash-empty"><span>Your business journey starts here. Updates will appear as you go.</span></p>
          ) : (
            <ul className="dash-activity">
              {activity.slice(0, 5).map((e) => (
                <li key={e.id}>
                  <span className="dash-activity-dot" aria-hidden="true" />
                  <span className="dash-activity-text">{ACTIVITY_TEXT[e.action] ?? e.action}</span>
                  <time dateTime={e.createdAt.toISOString()}>
                    {e.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
