"use client";

import { useActionState } from "react";
import { submitLeadAction } from "@/app/s/actions";

export function LeadForm({ siteSlug, disabled, primary }: { siteSlug: string; disabled?: boolean; primary: string }) {
  const [state, action, pending] = useActionState(submitLeadAction, {});
  const e = state.fieldErrors ?? {};
  if (state.ok) {
    return (
      <p role="status" className="rounded-lg bg-white/80 p-4 font-medium text-neutral-900">
        {state.message}
      </p>
    );
  }
  const input = "block w-full min-h-11 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900";
  const field = (name: "name" | "contact" | "message", label: string, kind: "input" | "textarea", auto?: string) => (
    <div className="space-y-1">
      <label htmlFor={`lead-${name}`} className="block text-sm font-semibold">
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
          className={input}
        />
      ) : (
        <textarea
          id={`lead-${name}`}
          name={name}
          rows={4}
          defaultValue={state.values?.[name]}
          aria-invalid={e[name] ? true : undefined}
          aria-describedby={e[name] ? `lead-${name}-err` : undefined}
          className={input}
        />
      )}
      {e[name] && (
        <p id={`lead-${name}-err`} className="text-sm font-medium text-red-700">
          {e[name]![0]}
        </p>
      )}
    </div>
  );
  return (
    <form action={action} className="space-y-4" noValidate>
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
      <p className="text-xs text-neutral-600">
        Your details are sent only to this business so they can reply to your enquiry.
      </p>
      {state.message && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={disabled || pending}
        className="min-h-11 rounded-lg px-5 font-semibold text-white disabled:opacity-60"
        style={{ background: primary }}
      >
        {disabled ? "Form works after publishing" : pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
