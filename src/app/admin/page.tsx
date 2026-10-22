import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Card, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { failedWork, overview, recentAudit } from "@/server/admin";
import { ADAPTERS, providerState } from "@/server/monitoring/registry";
import { resumeRunAction } from "./actions";

export default async function AdminHome() {
  const db = await getDb();
  const [o, work, events] = await Promise.all([overview(db), failedWork(db), recentAudit(db, 40)]);
  const stats: [string, number][] = [
    ["Workspaces", o.workspaces],
    ["Live websites", o.published],
    ["Failed checks (24h)", o.failedRuns],
    ["Failed audits (24h)", o.failedAudits],
    ["Failed generation jobs", o.failedJobs],
    ["Domains awaiting DNS", o.pendingDomains],
    ["Claims to review", o.disputes],
  ];
  return (
    <>
      <PageHeader title="Overview" />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([k, v]) => (
          <li key={k}>
            <Card>
              <p className="text-sm text-muted">{k}</p>
              <p className="text-2xl font-bold">{v}</p>
            </Card>
          </li>
        ))}
      </ul>

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
