"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { addListingAction, linkCandidateAction } from "@/app/app/business/actions";
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

export type PickerCandidate = { platform: "google" | "facebook" | "instagram"; title: string; url: string; detail?: string };

function LinkButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="share-btn kit-create" disabled={pending}>
      {pending ? "Linking…" : "Link this"}
    </button>
  );
}

/** After the platform login: the listings that account manages, one click to link. */
export function CandidatePicker({ candidates, label }: { candidates: PickerCandidate[]; label: string }) {
  const [state, action] = useActionState(linkCandidateAction, {});
  return (
    <section className="kit-picker" aria-labelledby="picker-title">
      <h2 id="picker-title">Found on {label}. Which one is this business?</h2>
      <ul>
        {candidates.map((c) => (
          <li key={c.url}>
            <form action={action}>
              <input type="hidden" name="url" value={c.url} />
              <span className="kit-title">
                <strong>{c.title}</strong>
                <span>{c.detail ?? c.url.replace(/^https?:\/\//, "")}</span>
              </span>
              <span className="kit-pill">{c.platform === "instagram" ? "Instagram" : c.platform === "facebook" ? "Facebook Page" : "Google Business Profile"}</span>
              <LinkButton />
            </form>
          </li>
        ))}
      </ul>
      {state.message && <p className="start-error">{state.message}</p>}
      <p className="kit-hint">Not here? The listing may belong to another account. Log in with that account, or paste the link on the platform&apos;s card below.</p>
    </section>
  );
}
