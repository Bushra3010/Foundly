"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "@/components/icon";
import type { ActionState } from "@/lib/actions";
import { finishSetupAction, saveAboutAction } from "./actions";

function Field({
  label,
  name,
  hint,
  error,
  ...props
}: { label: string; name: string; hint?: string; error?: string[] } & Omit<React.ComponentProps<"input">, "name">) {
  return (
    <label className="start-field" htmlFor={name}>
      <span className="start-label">{label}</span>
      <input
        id={name}
        name={name}
        aria-invalid={error?.length ? true : undefined}
        aria-describedby={error?.length ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...props}
      />
      {error?.length ? (
        <span className="start-error" id={`${name}-error`}>{error[0]}</span>
      ) : hint ? (
        <span className="start-hint" id={`${name}-hint`}>{hint}</span>
      ) : null}
    </label>
  );
}

function Submit({ children, pending: pendingLabel, className = "" }: { children: React.ReactNode; pending: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`start-button ${className}`} disabled={pending} aria-disabled={pending}>
      {pending ? <><span className="start-spinner" aria-hidden="true" />{pendingLabel}</> : children}
    </button>
  );
}

function Message({ state }: { state: ActionState }) {
  return state.message ? <p className={`start-message ${state.ok ? "ok" : "err"}`} role="alert">{state.message}</p> : null;
}

export function AboutStep({ initial }: { initial: Record<string, string> }) {
  const [state, action] = useActionState(saveAboutAction, {});
  const v = { ...initial, ...state.values };
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="start-form" noValidate>
      <input type="hidden" name="email" value={v.email ?? ""} />
      <Field label="Business name" name="name" required autoComplete="organization" placeholder="The Sunday Studio" defaultValue={v.name} error={e.name} autoFocus />
      <div className="start-row">
        <Field label="What do you do?" name="category" required placeholder="Interior designer" defaultValue={v.category} error={e.category} />
        <Field label="City" name="city" required autoComplete="address-level2" placeholder="Pune" defaultValue={v.city} error={e.city} />
      </div>
      <Field label="Main services" name="services" required placeholder="Home styling, space planning" hint="Separate with commas" defaultValue={v.services} error={e.services} />
      <Field label="Phone number" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" defaultValue={v.phone} error={e.phone ?? e.whatsapp} />
      <label className="start-check">
        <input type="checkbox" name="onWhatsapp" defaultChecked={v.onWhatsapp === "on"} />
        <span>Customers can reach me on WhatsApp at this number</span>
      </label>
      <Message state={state} />
      <Submit pending="Saving…">Continue <Icon name="arrow" size={18} /></Submit>
    </form>
  );
}

export function FinishStep({ requestId }: { requestId: string }) {
  const [state, action] = useActionState(finishSetupAction, {});
  const [existing, setExisting] = useState(state.values?.choice === "existing");
  const e = state.fieldErrors ?? {};
  // Owners with a website connect it; we only build one for owners who don't have one.
  if (existing) {
    return (
      <form action={action} className="start-existing" noValidate>
        <input type="hidden" name="choice" value="existing" />
        <Field label="Your website address" name="websiteUrl" type="url" inputMode="url" placeholder="example.com" hint="We read your public pages only. We never need your login." defaultValue={state.values?.websiteUrl} error={e.websiteUrl} autoFocus />
        <label className="start-check">
          <input type="checkbox" name="publishProfile" defaultChecked />
          <span>Also list my business in the Foundly directory</span>
        </label>
        <Message state={state} />
        <div className="start-existing-actions">
          <Submit pending="Connecting…">Connect my website <Icon name="arrow" size={18} /></Submit>
          <button type="button" className="start-link" onClick={() => setExisting(false)}>Back</button>
        </div>
      </form>
    );
  }

  return (
    <div className="start-choices">
      <button type="button" className="start-button start-choice-primary start-choice-alt" onClick={() => setExisting(true)}>
        <span className="start-choice-icon"><Icon name="globe" size={22} /></span>
        <span className="start-choice-text">
          <strong>Yes, connect my website</strong>
          <span>We keep your site. We check it and show you what to improve.</span>
        </span>
        <Icon name="arrow" size={20} />
      </button>
      <form action={action}>
        <input type="hidden" name="choice" value="create" />
        <input type="hidden" name="requestId" value={requestId} />
        <Message state={state} />
        <Submit pending="Building your website…" className="start-choice-primary">
          <span className="start-choice-icon"><Icon name="website" size={22} /></span>
          <span className="start-choice-text">
            <strong>No, create one for me</strong>
            <span>Ready in a few seconds. Only you can see it until you publish.</span>
          </span>
          <Icon name="arrow" size={20} />
        </Submit>
      </form>
    </div>
  );
}
