"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "@/components/icon";
import { adminLogInAction } from "@/app/login/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="adm-button" disabled={pending} aria-disabled={pending}>
      {pending ? "Checking…" : <>Enter admin console <Icon name="arrow" size={18} /></>}
    </button>
  );
}

export function AdminLoginForm() {
  const [state, action] = useActionState(adminLogInAction, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="adm-form" noValidate>
      <label className="adm-field" htmlFor="email">
        <span>Admin email</span>
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus defaultValue={state.values?.email} />
      </label>
      <label className="adm-field" htmlFor="password">
        <span>Password</span>
        <span className="adm-password">
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required />
          <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show} aria-controls="password">{show ? "Hide" : "Show"}</button>
        </span>
      </label>
      {state.message && <p className="adm-error" role="alert">{state.message}</p>}
      <Submit />
    </form>
  );
}
