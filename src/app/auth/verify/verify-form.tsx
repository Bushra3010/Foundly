"use client";

import { useActionState } from "react";
import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui";
import type { ActionState } from "@/lib/actions";
import { completeSignIn } from "@/app/login/actions";

export function VerifyForm({ token }: { token: string }) {
  const [state, action] = useActionState<ActionState, FormData>(completeSignIn, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.message && (
        <Notice tone="err">
          {state.message}{" "}
          <Link href="/login" className="font-semibold underline">
            Get a new link
          </Link>
        </Notice>
      )}
      <SubmitButton className="w-full" pendingLabel="Signing in…">
        Continue
      </SubmitButton>
    </form>
  );
}
