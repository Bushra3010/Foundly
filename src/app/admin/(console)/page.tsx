import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { ActionForm } from "@/components/action-form";
import { Badge, Card, PageHeader } from "@/components/ui";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import { failedWork, listUsers, overview, recentAudit, userStats } from "@/server/admin";
import { ADAPTERS, providerState } from "@/server/monitoring/registry";
import { resumeRunAction } from "../actions";

export default async function AdminHome() {
  await requireAdminPage();
  const db = await getDb();
  const [o, work, events, people, latest] = await Promise.all([overview(db), failedWork(db), recentAudit(db, 40), userStats(db), listUsers(db, "", 6)]);
  const growth = [
    { label: "Users", value: people.users, detail: `${people.signups7d} new this week`, icon: "workspaces", tone: "lilac" },
    { label: "Businesses set up", value: people.onboarded, detail: `${people.businesses - people.onboarded} still onboarding`, icon: "business", tone: "peach" },
    { label: "Live websites", value: o.published, detail: `${o.workspaces} workspaces in total`, icon: "website", tone: "sage" },
    { label: "Enquiries this week", value: people.leads7d, detail: "Across all businesses", icon: "leads", tone: "amber" },
  ];
  const health: [string, number][] = [
    ["Failed checks (24h)", o.failedRuns],
    ["Failed audits (24h)", o.failedAudits],
    ["Failed generation jobs", o.failedJobs],
    ["Domains awaiting DNS", o.pendingDomains],
    ["Claims to review", o.disputes],
  ];
  return (
    <>
      <PageHeader icon="shield" title="Admin overview" description="Who is signing up, what they've built, and anything that needs attention." />
      <section className="dash-kpis admin-kpis" aria-label="Growth">
        {growth.map((g) => (
          <div key={g.label} className="dash-kpi">
            <span className={`dash-kpi-icon ${g.tone}`}><Icon name={g.icon} size={19} /></span>
            <span className="dash-kpi-label">{g.label}</span>
            <strong className="dash-kpi-value">{g.value}</strong>
            <span className="dash-kpi-detail">{g.detail}</span>
          </div>
        ))}
      </section>

      <div className="dash-lower admin-lower">
        <section className="dash-panel" aria-labelledby="latest-signups">
          <div className="dash-panel-head">
            <h2 id="latest-signups">Latest sign-ups</h2>
            <Link href="/admin/users">All users <Icon name="arrow" size={13} /></Link>
          </div>
          {latest.length === 0 ? (
            <p className="dash-empty"><span>No sign-ups yet.</span></p>
          ) : (
            <ul className="dash-activity">
              {latest.map((u) => (
                <li key={`${u.id}-${u.workspaceId ?? ""}`}>
                  <span className="admin-avatar" aria-hidden="true">{u.email.slice(0, 1).toUpperCase()}</span>
                  <span className="dash-activity-text">
                    {u.email}
                    <span className="admin-sub">{u.business ?? "Not set up yet"}</span>
                  </span>
                  {u.live ? <Badge tone="ok">Live</Badge> : u.onboarded ? <Badge tone="info">Set up</Badge> : <Badge tone="warn">Onboarding</Badge>}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="dash-panel" aria-labelledby="health">
          <div className="dash-panel-head">
            <h2 id="health">System health</h2>
            <span>{health.every(([, n]) => n === 0) ? "All clear" : "Needs a look"}</span>
          </div>
          <ul className="admin-health">
            {health.map(([k, v]) => (
              <li key={k} className={v > 0 ? "warn" : ""}>
                <span>{k}</span>
                <strong>{v}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Provider health (24h)</h2>
          <table className="mt-2 w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th>Source</th>
                <th>State</th>
                <th>Valid / attempts</th>
                <th>Avg latency</th>
              </tr>
            </thead>
            <tbody>
              {ADAPTERS.map((a) => {
                const h = o.providerHealth.find((p) => p.provider === a.key);
                return (
                  <tr key={a.key} className="border-t border-border">
                    <td className="py-1">{a.label}</td>
                    <td>{providerState(a).replace("_", " ")}</td>
                    <td>{h ? `${h.valid} / ${h.total}` : "—"}</td>
                    <td>{h?.avgLatency ? `${(h.avgLatency / 1000).toFixed(1)}s` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">Usage cost: each valid answer = 1 credit. Provider spend is tracked in each provider&apos;s dashboard; see docs/providers.md.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Plans</h2>
          <ul className="mt-2 text-sm">
            {o.plans.length === 0 ? <li className="text-muted">Everyone is on Free.</li> : o.plans.map((p) => <li key={p.plan}>{p.plan}: {p.n}</li>)}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">Checks needing attention</h2>
          <ul className="mt-2 divide-y divide-border text-sm">
            {work.runs.length === 0 && <li className="py-1 text-muted">None.</li>}
            {work.runs.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <Link className="underline" href={`/admin/support/${r.workspaceId}`}>
                    {r.workspaceId.slice(0, 8)}
                  </Link>{" "}
                  · {r.status} · {r.createdAt.toLocaleString("en-IN")}
                </span>
                {r.status !== "failed" && (
                  <ActionForm action={resumeRunAction} submitLabel="Resume" variant="secondary" inline>
                    <input type="hidden" name="runId" value={r.id} />
                  </ActionForm>
                )}
              </li>
            ))}
          </ul>
          <h3 className="mt-4 text-sm font-semibold">Failed audits and generation jobs</h3>
          <ul className="mt-1 text-sm">
            {[...work.audits.map((a) => `${a.workspaceId.slice(0, 8)} audit: ${a.error}`), ...work.jobs.map((j) => `${j.workspaceId.slice(0, 8)} ${j.type} (×${j.attempts}): ${j.error}`)].map((l) => (
              <li key={l} className="border-t border-border py-1">
                {l}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">Recent audit events</h2>
          <ul className="mt-2 max-h-96 overflow-y-auto text-xs">
            {events.map((e) => (
              <li key={e.id} className="flex justify-between gap-2 border-t border-border py-1">
                <span>
                  {e.action} {e.workspaceId ? `· ${e.workspaceId.slice(0, 8)}` : ""}
                </span>
                <time className="text-muted">{e.createdAt.toLocaleString("en-IN")}</time>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
