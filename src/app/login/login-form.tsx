"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice, TextField } from "@/components/ui";
import { requestSignIn, type SignInState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<SignInState, FormData>(requestSignIn, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <TextField
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      {state.message && <Notice tone={state.ok ? "ok" : "err"}>{state.message}</Notice>}
      {state.devLink && (
        <Notice tone="demo" title="Development only">
          No email provider is configured, so here is the link that would have been emailed:{" "}
          <a className="break-all font-semibold underline" href={state.devLink}>
            Open sign-in link
          </a>
        </Notice>
      )}
      <SubmitButton className="w-full" pendingLabel="Sending link…">
        Email me a sign-in link
      </SubmitButton>
    </form>
  );
}
