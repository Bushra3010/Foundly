import type { Metadata } from "next";
import { ActionForm } from "@/components/action-form";
import { Card, LinkButton } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";
import { acceptInviteAction } from "./actions";

export const metadata: Metadata = { title: "Accept invitation", robots: { index: false } };

export default async function InvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const user = await getCurrentUser();
  const next = `/invite?token=${encodeURIComponent(token)}`;
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <h1 className="text-2xl font-bold">Join a team</h1>
        {user ? (
          <>
            <p className="mt-1 mb-6 text-muted">You&apos;re signed in as {user.email}.</p>
            <ActionForm action={acceptInviteAction} submitLabel="Accept invitation">
              <input type="hidden" name="token" value={token} />
            </ActionForm>
          </>
        ) : (
          <>
            <p className="mt-1 mb-6 text-muted">Sign in with the email address the invitation was sent to.</p>
            <LinkButton href={`/login?next=${encodeURIComponent(next)}`}>Sign in to accept</LinkButton>
          </>
        )}
      </Card>
    </main>
  );
}
