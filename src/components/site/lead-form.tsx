"use client";

import { useActionState } from "react";
import { submitLeadAction } from "@/app/s/actions";

export function LeadForm({ siteSlug, disabled, primary }: { siteSlug: string; disabled?: boolean; primary: string }) {
  const [state, action, pending] = useActionState(submitLeadAction, {});
  const e = state.fieldErrors ?? {};
  if (state.ok) {
    return (
      <p role="status" className="fs-success">
        {state.message}
      </p>
    );
  }
  const field = (name: "name" | "contact" | "message", label: string, kind: "input" | "textarea", auto?: string) => (
    <div className="fs-field">
      <label htmlFor={`lead-${name}`}>
        {label}
      </label>
      {kind === "input" ? (
        <input
          id={`lead-${name}`}
          name={name}
          autoComplete={auto}
          defaultValue={state.values?.[name]}
          aria-invalid={e[name] ? true : undefined}
          aria-describedby={e[name] ? `lead-${name}-err` : undefined}
        />
      ) : (
        <textarea
          id={`lead-${name}`}
          name={name}
          rows={4}
          defaultValue={state.values?.[name]}
          aria-invalid={e[name] ? true : undefined}
          aria-describedby={e[name] ? `lead-${name}-err` : undefined}
        />
      )}
      {e[name] && (
        <p id={`lead-${name}-err`} className="fs-err">
          {e[name]![0]}
        </p>
      )}
    </div>
  );
  return (
    <form action={action} className="fs-form" noValidate>
      <input type="hidden" name="siteSlug" value={siteSlug} />
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Leave this empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {field("name", "Your name", "input", "name")}
      {field("contact", "Phone or email", "input", "email")}
      {field("message", "How can we help?", "textarea")}
      <p className="fs-small">
        Your details are sent only to this business so they can reply to your enquiry.
      </p>
      {state.message && (
        <p role="alert" className="fs-err">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={disabled || pending}
        className="fs-btn fs-btn-primary"
        style={{ background: primary }}
      >
        {disabled ? "Form works after publishing" : pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
