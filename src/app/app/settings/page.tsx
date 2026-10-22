import { eq } from "drizzle-orm";
import { Badge, Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { getDb } from "@/db";
import { memberships, users } from "@/db/schema";
import { requireCtx } from "@/lib/auth/session";
import { signOut } from "@/app/login/actions";
import { signOutEverywhereAction } from "./actions";

export const metadata = { title: "Settings" };

const ROLE_TEXT = { owner: "Owner", editor: "Editor", viewer: "Viewer" } as const;

export default async function SettingsPage() {
  const ctx = await requireCtx();
  const members = await (await getDb())
    .select({ email: users.email, role: memberships.role })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.workspaceId, ctx.workspaceId));

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Your account</h2>
          <p className="mt-2 break-all">{ctx.user.email}</p>
          <p className="mt-1">
            <Badge tone="info">{ROLE_TEXT[ctx.role]}</Badge>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={signOut}>
              <SubmitButton variant="secondary">Sign out</SubmitButton>
            </form>
            <form action={signOutEverywhereAction}>
              <SubmitButton variant="secondary">Sign out on all devices</SubmitButton>
            </form>
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Team</h2>
          <ul className="mt-2 divide-y divide-border">
            {members.map((m) => (
              <li key={m.email} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="break-all">{m.email}</span>
                <Badge>{ROLE_TEXT[m.role]}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">Inviting editors and viewers is coming soon.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Plan</h2>
          <p className="mt-2 text-muted">Free pilot. Billing isn&apos;t enabled yet, and nothing you do here is charged.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Connections</h2>
          <p className="mt-2 text-muted">No external accounts are connected. We&apos;ll always ask before connecting one.</p>
        </Card>
      </div>
    </>
  );
}
