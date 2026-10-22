import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { requireCtx } from "@/lib/auth/session";
import { can } from "@/server/context";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const ctx = await requireCtx();
  return (
    <>
      <PageHeader title="Reports" description="History and exports for your business." />
      <div className="grid gap-4 md:grid-cols-2">
        <EmptyState title="No visibility reports yet">
          Reports appear after your first AI visibility checks complete. We never show sample data as your results.
        </EmptyState>
        <Card>
          <h2 className="font-semibold">Export your data</h2>
          <p className="mt-1 text-sm text-muted">
            Download your business details, website content, every published version and your leads. You own this data.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {can(ctx, "owner") && (
              <LinkButton href="/app/reports/export" variant="secondary" prefetch={false}>
                Download everything (JSON)
              </LinkButton>
            )}
            <LinkButton href="/app/leads/export" variant="secondary" prefetch={false}>
              Leads (CSV)
            </LinkButton>
          </div>
        </Card>
      </div>
    </>
  );
}
