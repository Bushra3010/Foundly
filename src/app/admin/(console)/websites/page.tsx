import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { requireAdminPage } from "@/lib/admin-guard";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { CONTACT_TEXT, listWebsiteRequests, STATUS_TEXT } from "@/server/website-requests";
import { deliverWebsiteAction, updateWebsiteRequestAction } from "../../actions";

const TONE = { new: "warn", contacted: "info", in_progress: "info", delivered: "ok", cancelled: "neutral" } as const;
const field = "min-h-11 rounded-lg border border-border bg-surface px-2";

export default async function AdminWebsites({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireAdminPage();
  const all = (await searchParams).show === "all";
  const rows = await listWebsiteRequests(await getDb(), all ? "all" : "open");
  return (
    <>
      <PageHeader
        icon="website"
        title="Website requests"
        description="Owners without a website asked us to build one. Contact them, build it, then deliver its address here to connect it to their account."
        actions={
          <Link href={all ? "/admin/websites" : "/admin/websites?show=all"} className="text-sm font-semibold underline">
            {all ? "Show open only" : "Show all"}
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title={all ? "No requests yet" : "No open requests"} />
      ) : (
        <ul className="space-y-3">
          {rows.map(({ request: r, business, category, city, requester }) => {
            const open = r.status === "new" || r.status === "contacted" || r.status === "in_progress";
            return (
              <li key={r.id}>
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      <span className="font-semibold">{business}</span> · {category} · {city}
                    </span>
                    <Badge tone={TONE[r.status]}>{STATUS_TEXT[r.status]}</Badge>
                  </div>
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted">What the website should do</dt>
                      <dd className="whitespace-pre-line">{r.goal}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Contact</dt>
                      <dd>
                        {CONTACT_TEXT[r.contactMethod]}: <span className="font-semibold">{r.contactValue}</span>
                        {r.contactTime && ` · ${r.contactTime}`}
                        {requester && <span className="block text-muted">Account: {requester}</span>}
                      </dd>
                    </div>
                    {r.pages && (
                      <div>
                        <dt className="text-muted">Pages</dt>
                        <dd>{r.pages}</dd>
                      </div>
                    )}
                    {r.style && (
                      <div>
                        <dt className="text-muted">Look and feel</dt>
                        <dd>{r.style}</dd>
                      </div>
                    )}
                    {r.examples && (
                      <div className="sm:col-span-2">
                        <dt className="text-muted">Websites they like</dt>
                        <dd className="whitespace-pre-line break-all">{r.examples}</dd>
                      </div>
                    )}
                    {r.teamNote && (
                      <div className="sm:col-span-2">
                        <dt className="text-muted">Note shown to the owner</dt>
                        <dd>{r.teamNote}</dd>
                      </div>
                    )}
                    {r.deliveredUrl && (
                      <div className="sm:col-span-2">
                        <dt className="text-muted">Delivered</dt>
                        <dd className="break-all">{r.deliveredUrl}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="mt-2 text-xs text-muted">Requested {r.createdAt.toLocaleString("en-IN")} · workspace {r.workspaceId}</p>
                  {open && (
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      <ActionForm action={updateWebsiteRequestAction} submitLabel="Update" variant="secondary" inline>
                        <input type="hidden" name="requestId" value={r.id} />
                        <select name="status" aria-label="Status" defaultValue={r.status === "new" ? "contacted" : "in_progress"} className={field}>
                          <option value="contacted">We&apos;ve been in touch</option>
                          <option value="in_progress">Being built</option>
                          <option value="cancelled">Cancel request</option>
                        </select>
                        <input name="note" aria-label="Note for the owner" placeholder="Note for the owner (optional)" className={`${field} min-w-56 flex-1`} />
                      </ActionForm>
                      <ActionForm action={deliverWebsiteAction} submitLabel="Deliver website" inline>
                        <input type="hidden" name="requestId" value={r.id} />
                        <input name="url" aria-label="Website address" placeholder="https://their-website.com" className={`${field} min-w-56 flex-1`} />
                        <input name="note" aria-label="Note for the owner" placeholder="Note for the owner (optional)" className={`${field} min-w-56 flex-1`} />
                      </ActionForm>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
