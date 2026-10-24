import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { listUsers } from "@/server/admin";

export const metadata = { title: "Users" };

const fmt = (d: Date) => d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminPage();
  const { q = "" } = await searchParams;
  const rows = await listUsers(await getDb(), q.trim().slice(0, 80));
  return (
    <>
      <PageHeader icon="workspaces" title="Users" description="Everyone who has signed up, with the business they set up." />
      <form className="admin-search" role="search">
        <label htmlFor="q" className="sr-only">Search users</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by email, business or city" />
        <button type="submit">Search</button>
      </form>
      {rows.length === 0 ? (
        <EmptyState title={q ? "No users match" : "No users yet"}>
          {q ? "Try a different email, business name or city." : "New sign-ups will appear here."}
        </EmptyState>
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Business</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Joined</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={`${u.id}-${u.workspaceId ?? "none"}`}>
                  <td>
                    <span className="admin-user">
                      <span className="admin-avatar" aria-hidden="true">{u.email.slice(0, 1).toUpperCase()}</span>
                      <span>
                        <strong>{u.email}</strong>
                        <span>{u.hasPassword ? "Password" : "Email link"}{u.role ? ` · ${u.role}` : ""}</span>
                      </span>
                    </span>
                  </td>
                  <td>{u.business ? <><strong>{u.business}</strong><span className="admin-sub">{u.city}</span></> : <span className="admin-sub">Not set up</span>}</td>
                  <td>
                    {u.connected ? <Badge tone="ok">Website connected</Badge> : u.onboarded ? <Badge tone="info">Set up</Badge> : <Badge tone="warn">Onboarding</Badge>}
                  </td>
                  <td className="capitalize">{u.plan ?? "free"}</td>
                  <td className="admin-sub">{fmt(u.createdAt)}</td>
                  <td>{u.workspaceId && <Link className="admin-link" href={`/admin/support/${u.workspaceId}`}>Support</Link>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="admin-footnote">Showing up to 100 newest accounts. Password hashes are never shown.</p>
    </>
  );
}
