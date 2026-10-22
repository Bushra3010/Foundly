import { ActionForm } from "@/components/action-form";
import { Card, DefinitionList, Notice, PageHeader, TextField } from "@/components/ui";
import { getDb } from "@/db";
import { getCurrentUser } from "@/lib/auth/session";
import { activeGrant, requireAdmin, supportView } from "@/server/admin";
import { adjustCreditsAction, grantAccessAction } from "../../actions";

export default async function SupportPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const db = await getDb();
  const admin = requireAdmin(await getCurrentUser());
  const grant = await activeGrant(db, admin, workspaceId);
  if (!grant) {
    return (
      <>
        <PageHeader title="Support access" description={`Workspace ${workspaceId}`} />
        <Card className="max-w-lg">
          <p className="mb-3 text-sm text-muted">Access is read-only, time-limited, and recorded with your reason. Lead messages and secrets are never shown.</p>
          <ActionForm action={grantAccessAction} submitLabel="Open support view">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <TextField label="Reason" name="reason" hint="e.g. ticket number and what the owner asked for" />
            <TextField label="Hours (max 24)" name="hours" type="number" min={1} max={24} defaultValue="2" />
          </ActionForm>
        </Card>
      </>
    );
  }
  const v = await supportView(db, admin, workspaceId);
  return (
    <>
      <PageHeader title={v.business?.name ?? "Workspace"} description={`Support view · expires ${grant.expiresAt.toLocaleString("en-IN")} · reason: ${grant.reason}`} />
      <Notice tone="warn">Read-only. Everything you open here is logged.</Notice>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <DefinitionList
            items={[
              ["Business", v.business ? `${v.business.name} · ${v.business.category} · ${v.business.city} (v${v.business.version})` : "None"],
              ["Website", v.site ? `/s/${v.site.slug} · ${v.site.live ? "live" : "not live"}` : "None"],
              ["Plan", v.subscription ? `${v.subscription.plan} · ${v.subscription.status}` : "free"],
              ["Leads", `${v.leadCount} (contents hidden)`],
            ]}
          />
        </Card>
        <Card>
          <h2 className="font-semibold">Adjust credits</h2>
          <ActionForm action={adjustCreditsAction} submitLabel="Adjust">
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <TextField label="Amount (negative to remove)" name="amount" type="number" />
            <TextField label="Reason" name="reason" />
          </ActionForm>
        </Card>
        <Card>
          <h2 className="font-semibold">Recent checks</h2>
          <ul className="mt-2 text-sm">
            {v.runs.map((r) => (
              <li key={r.id} className="border-t border-border py-1">
                {r.createdAt.toLocaleString("en-IN")} · {r.status} · {r.plannedObservations} planned
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-2 text-xs">
            {v.recent.map((e, i) => (
              <li key={i} className="border-t border-border py-1">
                {e.action} · {e.createdAt.toLocaleString("en-IN")}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
