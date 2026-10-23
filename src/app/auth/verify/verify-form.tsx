"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Icon } from "@/components/icon";
import type { ActionState } from "@/lib/actions";
import { completeSignIn } from "@/app/login/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="start-button" disabled={pending} aria-disabled={pending} autoFocus>
      {pending ? <><span className="start-spinner" aria-hidden="true" />Opening…</> : <>Continue <Icon name="arrow" size={18} /></>}
    </button>
  );
}

export function VerifyForm({ token, next }: { token: string; next?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(completeSignIn, {});
  return (
    <form action={action} className="start-form">
      <input type="hidden" name="token" value={token} />
      {next && <input type="hidden" name="next" value={next} />}
      {state.message && (
        <p className="start-message err" role="alert">
          {state.message}{" "}
          <Link href="/login">Get a new link</Link>
        </p>
      )}
      <Submit />
    </form>
  );
}
