import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Badge, Card, EmptyState, LinkButton, Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireAdminPage } from "@/lib/admin-guard";
import { adminListProjects, DEMO_STATUS_TEXT } from "@/server/portfolio";
import { quickUpdateAction } from "../../portfolio-actions";

export const metadata = { title: "Portfolio" };

const STATUS_TONE = { none: "neutral", coming_soon: "info", live: "ok", maintenance: "warn" } as const;

export default async function AdminPortfolio({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireAdminPage();
  const { deleted } = await searchParams;
  const rows = await adminListProjects(await getDb());
  const published = rows.filter((r) => r.published).length;
  return (
    <>
      <PageHeader
        icon="reports"
        title="Portfolio"
        description={`Projects shown on /work. ${published} of ${rows.length} are published. Client names stay hidden until you tick “Client agreed to be named” on a project.`}
        actions={
          <>
            <LinkButton href="/work" variant="secondary" target="_blank">View /work</LinkButton>
            <LinkButton href="/admin/portfolio/new">Add project</LinkButton>
          </>
        }
      />
      {deleted && <div className="mb-4"><Notice tone="ok">Project deleted.</Notice></div>}
      {rows.length === 0 ? (
        <EmptyState title="No projects yet" />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/portfolio/${r.id}`} className="font-semibold underline-offset-2 hover:underline">{r.name}</Link>
                    <p className="text-sm text-muted">
                      {r.showClient && r.clientName ? r.clientName : `${r.clientLabel}${r.clientName ? ` (private: ${r.clientName})` : ""}`} · {r.category}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={r.published ? "ok" : "neutral"}>{r.published ? "Published" : "Hidden"}</Badge>
                    <Badge tone={STATUS_TONE[r.demoStatus]}>{DEMO_STATUS_TEXT[r.demoStatus]}</Badge>
                    <Badge tone="neutral">{r.mediaCount} screenshot{r.mediaCount === 1 ? "" : "s"}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-start gap-2 border-t border-border pt-3">
                  <ActionForm action={quickUpdateAction} submitLabel={r.published ? "Hide from /work" : "Publish"} variant={r.published ? "secondary" : "primary"} inline>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="field" value="published" />
                    <input type="hidden" name="value" value={r.published ? "false" : "true"} />
                  </ActionForm>
                  <ActionForm action={quickUpdateAction} submitLabel="Set demo status" variant="secondary" inline>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="field" value="demoStatus" />
                    <select name="value" aria-label="Demo status" defaultValue={r.demoStatus} className="min-h-11 rounded-lg border border-border bg-surface px-2">
                      {Object.entries(DEMO_STATUS_TEXT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </ActionForm>
                  <LinkButton href={`/admin/portfolio/${r.id}`} variant="secondary">Edit</LinkButton>
                  {r.published && <LinkButton href={`/work/${r.slug}`} variant="secondary" target="_blank">View</LinkButton>}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
