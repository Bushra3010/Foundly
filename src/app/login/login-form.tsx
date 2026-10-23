"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "@/components/icon";
import { requestSignIn, type SignInState } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="start-button" disabled={pending} aria-disabled={pending}>
      {pending ? <><span className="start-spinner" aria-hidden="true" />Just a second…</> : <>Continue <Icon name="arrow" size={18} /></>}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<SignInState, FormData>(requestSignIn, {});

  if (state.ok) {
    return (
      <div className="start-sent">
        <span className="start-sent-icon"><Icon name="leads" size={24} /></span>
        {state.devLink ? (
          <>
            <strong>You’re all set</strong>
            <p>Tap below to continue. In the live app, this link arrives in your email.</p>
            <a className="start-button" href={state.devLink}>Continue <Icon name="arrow" size={18} /></a>
          </>
        ) : (
          <>
            <strong>Check your email</strong>
            <p>We sent a link to <b>{state.values?.email}</b>. Open it on this device to continue. It expires in 15 minutes.</p>
          </>
        )}
      </div>
    );
  }

  const error = state.fieldErrors?.email?.[0];
  return (
    <form action={action} className="start-form" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <label className="start-field" htmlFor="email">
        <span className="start-label">Email address</span>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@business.com"
          required
          autoFocus
          defaultValue={state.values?.email}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "email-error" : undefined}
        />
        {error && <span className="start-error" id="email-error">{error}</span>}
      </label>
      {state.message && !state.ok && <p className="start-message err" role="alert">{state.message}</p>}
      <Submit />
    </form>
  );
}
