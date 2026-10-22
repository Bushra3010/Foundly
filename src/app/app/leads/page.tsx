import { Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import type { Lead } from "@/db/schema";
import { requireCtx } from "@/lib/auth/session";
import { can } from "@/server/context";
import { listLeads } from "@/server/leads";
import { LeadCard } from "./lead-card";

export const metadata = { title: "Leads" };

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const ctx = await requireCtx();
  const { q, status } = await searchParams;
  const validStatus = STATUSES.find((s) => s === status) as Lead["status"] | undefined;
  const rows = await listLeads(await getDb(), ctx, { q: q?.slice(0, 100), status: validStatus });
  const exportHref = `/app/leads/export?${new URLSearchParams({ ...(q ? { q } : {}), ...(validStatus ? { status: validStatus } : {}) })}`;

  return (
    <>
      <PageHeader
        title="Leads"
        description="Enquiries sent through your website's contact form."
        actions={
          rows.length > 0 ? (
            <LinkButton href={exportHref} variant="secondary" prefetch={false}>
              Export CSV
            </LinkButton>
          ) : undefined
        }
      />
      <Card className="mb-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end" role="search">
          <div>
            <label htmlFor="q" className="block text-sm font-semibold">
              Search
            </label>
            <input id="q" name="q" defaultValue={q} className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3" />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-semibold">
              Status
            </label>
            <select id="status" name="status" defaultValue={validStatus ?? ""} className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3">
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="min-h-11 rounded-lg border border-border bg-surface px-4 font-semibold">
            Filter
          </button>
        </form>
      </Card>
      {rows.length === 0 ? (
        <EmptyState title={q || validStatus ? "No leads match" : "No enquiries yet"}>
          {q || validStatus
            ? "Try a different search or status."
            : "When visitors use the contact form on your published website, their enquiries appear here."}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {rows.map((l) => (
            <li key={l.id}>
              <LeadCard
                canEdit={can(ctx, "editor")}
                lead={{ id: l.id, name: l.name, contact: l.contact, message: l.message, status: l.status, notes: l.notes, source: l.source, createdAt: l.createdAt.toISOString() }}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
