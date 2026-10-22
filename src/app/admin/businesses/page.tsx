import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { searchBusinesses } from "@/server/admin";
import { moderateAction } from "../actions";

export default async function AdminBusinesses({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const rows = await searchBusinesses(await getDb(), q.slice(0, 80));
  return (
    <>
      <PageHeader title="Businesses" description="Moderation changes need a reason and are recorded." />
      <form className="mb-4 flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Name or city" className="min-h-11 flex-1 rounded-lg border border-border bg-surface px-3" />
        <button className="min-h-11 rounded-lg border border-border bg-surface px-4 font-semibold">Search</button>
      </form>
      <ul className="space-y-3">
        {rows.map((b) => (
          <li key={b.id}>
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <span className="font-semibold">{b.name}</span> · {b.city}{" "}
                  {b.slug && (
                    <Link className="text-sm underline" href={`/b/${b.slug}`} target="_blank">
                      /b/{b.slug}
                    </Link>
                  )}
                </span>
                <span className="flex gap-2">
                  <Badge tone={b.status === "suspended" || b.status === "disputed" ? "err" : b.status === "published" ? "ok" : "neutral"}>{b.status ?? "no profile"}</Badge>
                  <Badge>{b.verification ?? "none"}</Badge>
                  <Link className="text-sm underline" href={`/admin/support/${b.workspaceId}`}>
                    Support
                  </Link>
                </span>
              </div>
              <div className="mt-3">
                <ActionForm action={moderateAction} submitLabel="Apply" variant="secondary" inline>
                  <input type="hidden" name="businessId" value={b.id} />
                  <select name="status" aria-label="Moderation" defaultValue="suspended" className="min-h-11 rounded-lg border border-border bg-surface px-2">
                    <option value="suspended">Suspend</option>
                    <option value="unpublished">Unpublish</option>
                    <option value="published">Restore (publish)</option>
                  </select>
                  <input name="reason" aria-label="Reason" placeholder="Reason (required)" className="min-h-11 min-w-56 flex-1 rounded-lg border border-border bg-surface px-2" />
                </ActionForm>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
