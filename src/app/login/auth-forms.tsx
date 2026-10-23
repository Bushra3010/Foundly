"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Icon } from "@/components/icon";
import type { ActionState } from "@/lib/actions";
import { logInAction, requestPasswordResetAction, resetPasswordAction, signUpAction } from "./actions";

function Submit({ label, pending }: { label: string; pending: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button type="submit" className="start-button" disabled={busy} aria-disabled={busy}>
      {busy ? <><span className="start-spinner" aria-hidden="true" />{pending}</> : <>{label} <Icon name="arrow" size={18} /></>}
    </button>
  );
}

function EmailField({ defaultValue, error, autoFocus }: { defaultValue?: string; error?: string; autoFocus?: boolean }) {
  return (
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
        autoFocus={autoFocus}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "email-error" : undefined}
      />
      {error && <span className="start-error" id="email-error">{error}</span>}
    </label>
  );
}

function PasswordField({ autoComplete, error, hint, label = "Password" }: { autoComplete: string; error?: string; hint?: string; label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="start-field" htmlFor="password">
      <span className="start-label">{label}</span>
      <span className="start-password">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={autoComplete === "new-password" ? 8 : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "password-error" : hint ? "password-hint" : undefined}
        />
        <button type="button" className="start-reveal" onClick={() => setShow((v) => !v)} aria-pressed={show} aria-controls="password">
          {show ? "Hide" : "Show"}
        </button>
      </span>
      {error ? <span className="start-error" id="password-error">{error}</span> : hint ? <span className="start-hint" id="password-hint">{hint}</span> : null}
    </label>
  );
}

function Message({ state }: { state: ActionState }) {
  return state.message ? <p className="start-message err" role="alert">{state.message}</p> : null;
}

export function SignUpForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signUpAction, {});
  const e = state.fieldErrors ?? {};
  const exists = state.message?.includes("already exists");
  return (
    <form action={action} className="start-form" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <EmailField defaultValue={state.values?.email} error={e.email?.[0]} autoFocus />
      <PasswordField autoComplete="new-password" error={e.password?.[0]} hint="At least 8 characters" />
      {state.message && (
        <p className="start-message err" role="alert">
          {state.message}{" "}
          {exists && <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Log in</Link>}
        </p>
      )}
      <Submit label="Create account" pending="Creating your account…" />
    </form>
  );
}

export function LogInForm({ next }: { next?: string }) {
  const [state, action] = useActionState(logInAction, {});
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="start-form" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <EmailField defaultValue={state.values?.email} error={e.email?.[0]} autoFocus />
      <PasswordField autoComplete="current-password" error={e.password?.[0]} />
      <Link href="/forgot-password" className="start-forgot">Forgot password?</Link>
      <Message state={state} />
      <Submit label="Log in" pending="Logging in…" />
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, {});
  const e = state.fieldErrors ?? {};
  if (state.ok) {
    return (
      <div className="start-sent">
        <span className="start-sent-icon"><Icon name="leads" size={24} /></span>
        <strong>Check your email</strong>
        <p>{state.message}</p>
        {state.devLink && (
          <a className="start-button" href={state.devLink}>Open reset link (development only) <Icon name="arrow" size={18} /></a>
        )}
        <Link href="/login" className="start-link">Back to log in</Link>
      </div>
    );
  }
  return (
    <form action={action} className="start-form" noValidate>
      <EmailField defaultValue={state.values?.email} error={e.email?.[0]} autoFocus />
      <Message state={state} />
      <Submit label="Send reset link" pending="Sending…" />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, {});
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="start-form" noValidate>
      <input type="hidden" name="token" value={token} />
      <PasswordField autoComplete="new-password" label="New password" error={e.password?.[0]} hint="At least 8 characters" />
      <label className="start-field" htmlFor="confirm">
        <span className="start-label">Confirm new password</span>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required aria-invalid={e.confirm ? true : undefined} aria-describedby={e.confirm ? "confirm-error" : undefined} />
        {e.confirm && <span className="start-error" id="confirm-error">{e.confirm[0]}</span>}
      </label>
      {state.message && (
        <p className="start-message err" role="alert">
          {state.message} <Link href="/forgot-password">Get a new link</Link>
        </p>
      )}
      <Submit label="Save new password" pending="Saving…" />
    </form>
  );
}
