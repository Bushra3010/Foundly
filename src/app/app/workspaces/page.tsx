import { ActionForm } from "@/components/action-form";
import { Badge, Card, PageHeader, TextField } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { listUserWorkspaces } from "@/server/workspaces";
import { createWorkspaceAction, switchWorkspaceAction } from "./actions";

export const metadata = { title: "Workspaces" };

export default async function WorkspacesPage() {
  const ctx = await requireCtx();
  const rows = await listUserWorkspaces(await getDb(), ctx.userId);
  return (
    <>
      <PageHeader icon="workspaces"
        title="Workspaces"
        description="Each workspace holds one business with its own website, leads and team. Agencies can manage several here."
      />
      <ul className="grid gap-3 md:grid-cols-2">
        {rows.map((w) => (
          <li key={w.id}>
            <Card className="h-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{w.business ?? "Setup not finished"}</h2>
                {w.id === ctx.workspaceId && <Badge tone="info">Current</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted">
                {w.role} · {w.siteLive ? "website live" : "website not live"} · {w.newLeads} new {w.newLeads === 1 ? "lead" : "leads"}
              </p>
              {w.id !== ctx.workspaceId && (
                <div className="mt-3">
                  <ActionForm action={switchWorkspaceAction} submitLabel="Switch to this workspace" variant="secondary">
                    <input type="hidden" name="workspaceId" value={w.id} />
                  </ActionForm>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>
      <Card className="mt-6 max-w-lg">
        <h2 className="font-semibold">Add another business</h2>
        <p className="mt-1 mb-3 text-sm text-muted">Creates a separate workspace that you own.</p>
        <ActionForm action={createWorkspaceAction} submitLabel="Create workspace">
          <TextField label="Workspace name" name="name" placeholder="e.g. Client: Sharma Plumbing" />
        </ActionForm>
      </Card>
    </>
  );
}
