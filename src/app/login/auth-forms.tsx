"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Icon } from "@/components/icon";
import type { ActionState } from "@/lib/actions";
import { logInAction, signUpAction } from "./actions";
import { LoginForm as EmailLinkForm } from "./login-form";

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
  const [linkMode, setLinkMode] = useState(false);
  const e = state.fieldErrors ?? {};

  if (linkMode) {
    return (
      <div className="start-form">
        <p className="start-note">Forgot your password? We’ll email you a one-time link to sign in. You can set a new password in Settings.</p>
        <EmailLinkForm next={next} />
        <button type="button" className="start-link" onClick={() => setLinkMode(false)}>Back to password</button>
      </div>
    );
  }

  return (
    <form action={action} className="start-form" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <EmailField defaultValue={state.values?.email} error={e.email?.[0]} autoFocus />
      <PasswordField autoComplete="current-password" error={e.password?.[0]} />
      <button type="button" className="start-forgot" onClick={() => setLinkMode(true)}>Forgot password?</button>
      <Message state={state} />
      <Submit label="Log in" pending="Logging in…" />
    </form>
  );
}
