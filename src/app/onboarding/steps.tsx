"use client";

import { useActionState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "@/components/icon";
import type { ActionState } from "@/lib/actions";
import { saveBusinessStepAction, saveCompetitorsStepAction, savePromptsStepAction, startTrackingAction } from "./actions";

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

/** Step 1: the business and its website. */
export function BusinessStep({ initial }: { initial: { name: string; category: string; city: string; websiteUrl: string } }) {
  const [state, action] = useActionState<ActionState, FormData>(saveBusinessStepAction, {});
  const v: Record<string, string> = { ...initial, ...state.values };
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="start-form" noValidate>
      <Field
        label="Your website"
        name="websiteUrl"
        type="url"
        inputMode="url"
        placeholder="yourbusiness.in"
        hint="Optional. We check what AI assistants can read on it. No website? Leave it empty."
        defaultValue={v.websiteUrl}
        error={e.websiteUrl}
        autoFocus={!v.websiteUrl && !v.name}
      />
      <Field label="Business name" name="name" required autoComplete="organization" placeholder="The Sunday Studio" defaultValue={v.name} error={e.name} />
      <div className="start-row">
        <Field label="What do you do?" name="category" required placeholder="Interior designer" defaultValue={v.category} error={e.category} />
        <Field label="City" name="city" required autoComplete="address-level2" placeholder="Pune" defaultValue={v.city} error={e.city} />
      </div>
      <Message state={state} />
      <Submit pending="Finding what customers ask AI…">Continue <Icon name="arrow" size={18} /></Submit>
    </form>
  );
}

/** Step 2: prompts to track, suggested by AI (or from the details) and typed. */
export function PromptsStep({ ideas, source, tracked, limit, city }: { ideas: string[]; source: "ai" | "details"; tracked: string[]; limit: number; city: string }) {
  const [state, action] = useActionState<ActionState, FormData>(savePromptsStepAction, {});
  const e = state.fieldErrors ?? {};
  const have = useMemo(() => new Set(tracked.map((t) => t.toLowerCase())), [tracked]);
  const fresh = ideas.filter((k) => !have.has(k.toLowerCase()));
  const room = Math.max(limit - tracked.length, 0);
  return (
    <form action={action} className="start-form" noValidate>
      <fieldset className="start-keywords">
        <legend className="start-label">Prompts to track <em>(up to {limit})</em></legend>
        <p className="start-hint">
          {source === "ai" ? "What customers ask AI assistants when they look for a business like yours." : "Ideas from your details."} Each one is asked to ChatGPT, Gemini, Perplexity and Claude.
        </p>
        {tracked.length > 0 && (
          <ul className="start-chips" aria-label="Already tracking">
            {tracked.map((k) => (
              <li key={k} className="start-chip on"><Icon name="check" size={13} />{k}</li>
            ))}
          </ul>
        )}
        {room > 0 && fresh.length > 0 && (
          <ul className="start-chips" aria-label="Suggested prompts">
            {fresh.map((k, i) => (
              <li key={k}>
                <label className="start-chip">
                  <input type="checkbox" name="keyword" value={k} defaultChecked={tracked.length === 0 && i < Math.min(3, room)} />
                  {k}
                </label>
              </li>
            ))}
          </ul>
        )}
        {room > 0 && (
          <label className="start-field" htmlFor="custom">
            <span className="start-label">Your own <em>(one per line, optional)</em></span>
            <textarea id="custom" name="custom" rows={2} placeholder={`wedding photographer in ${city || "Pune"}`} defaultValue={state.values?.custom} aria-invalid={e.custom ? true : undefined} />
            {e.custom && <span className="start-error">{e.custom[0]}</span>}
          </label>
        )}
      </fieldset>
      <Message state={state} />
      <Submit pending="Finding your competitors…">Continue <Icon name="arrow" size={18} /></Submit>
    </form>
  );
}

/** Step 3: competitors to compare with, suggested by AI and typed. */
export function CompetitorsStep({ ideas, tracked }: { ideas: string[]; tracked: string[] }) {
  const [state, action] = useActionState<ActionState, FormData>(saveCompetitorsStepAction, {});
  const have = useMemo(() => new Set(tracked.map((t) => t.toLowerCase())), [tracked]);
  const fresh = ideas.filter((k) => !have.has(k.toLowerCase()));
  return (
    <form action={action} className="start-form" noValidate>
      <fieldset className="start-keywords">
        <legend className="start-label">Competitors <em>(optional, up to 10)</em></legend>
        <p className="start-hint">We spot them in the same AI answers and rank you against them.</p>
        {tracked.length > 0 && (
          <ul className="start-chips" aria-label="Already comparing with">
            {tracked.map((k) => (
              <li key={k} className="start-chip on"><Icon name="check" size={13} />{k}</li>
            ))}
          </ul>
        )}
        {fresh.length > 0 && (
          <>
            <p className="start-hint">Businesses AI already recommends in your area:</p>
            <ul className="start-chips" aria-label="Suggested competitors">
              {fresh.map((k, i) => (
                <li key={k}>
                  <label className="start-chip">
                    <input type="checkbox" name="rival" value={k} defaultChecked={tracked.length === 0 && i < 3} />
                    {k}
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
        <label className="start-field" htmlFor="custom">
          <span className="start-label">Add names <em>(comma or one per line)</em></span>
          <textarea id="custom" name="custom" rows={2} placeholder="Smile Care Clinic, City Dental Studio" defaultValue={state.values?.custom} />
        </label>
      </fieldset>
      <Message state={state} />
      <Submit pending="Saving…">{fresh.length || tracked.length ? "Continue" : "Skip for now"} <Icon name="arrow" size={18} /></Submit>
    </form>
  );
}

/** Step 4: one clear button. */
export function StartStep({ requestId }: { requestId: string }) {
  const [state, action] = useActionState(startTrackingAction, {});
  return (
    <form action={action} className="start-form">
      <input type="hidden" name="requestId" value={requestId} />
      <label className="start-check">
        <input type="checkbox" name="publishProfile" defaultChecked />
        <span>List my business in the Foundly directory, which AI assistants read</span>
      </label>
      <Message state={state} />
      <Submit pending="Starting…" className="start-go">Start tracking <Icon name="arrow" size={18} /></Submit>
    </form>
  );
}
