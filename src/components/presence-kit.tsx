"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { addListingAction } from "@/app/app/business/actions";
import type { KitField } from "@/lib/presence";
import { Icon } from "./icon";

export function CopyField({ field }: { field: KitField }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(field.value);
    } catch {
      const t = document.createElement("textarea");
      t.value = field.value;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const multi = field.value.includes("\n") || field.value.length > 90;
  return (
    <div className="kit-field">
      <div className="kit-field-head">
        <span className="kit-label">
          {field.label}
          {field.limit && <em>{field.value.length}/{field.limit}</em>}
        </span>
        <button type="button" onClick={copy} className="share-btn kit-copy" aria-live="polite">
          <Icon name={copied ? "check" : "reports"} size={14} /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {multi ? <pre className="kit-value">{field.value}</pre> : <code className="kit-value kit-inline">{field.value}</code>}
      {field.hint && <span className="kit-hint">{field.hint}</span>}
    </div>
  );
}

function Save() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="share-btn" disabled={pending}>
      {pending ? "Saving…" : "Mark as done"}
    </button>
  );
}

export function AddListingForm({ platform }: { platform: string }) {
  const [state, action] = useActionState(addListingAction, {});
  return (
    <form action={action} className="kit-link-form">
      <label className="kit-label" htmlFor={`link-${platform}`}>Paste your {platform} link once it is live</label>
      <div className="kit-link-row">
        <input id={`link-${platform}`} name="url" inputMode="url" placeholder="https://" defaultValue={state.values?.url} aria-invalid={state.fieldErrors?.url ? true : undefined} />
        <Save />
      </div>
      {state.fieldErrors?.url && <span className="start-error">{state.fieldErrors.url[0]}</span>}
      {state.message && <span className={state.ok ? "kit-ok" : "start-error"}>{state.message}</span>}
    </form>
  );
}
