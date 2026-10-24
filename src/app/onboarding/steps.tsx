"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "@/components/icon";
import type { ActionState } from "@/lib/actions";
import { suggestKeywords } from "@/lib/questions";
import { saveKeywordsAction, saveWebsiteStepAction, startTrackingAction } from "./actions";

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

/** Step 1: three facts about the business, then keywords suggested from them. */
export function KeywordsStep({ initial, tracked }: { initial: { name: string; category: string; city: string }; tracked: string[] }) {
  const [state, action] = useActionState(saveKeywordsAction, {});
  const v: Record<string, string> = { ...initial, ...state.values };
  const e = state.fieldErrors ?? {};
  const [category, setCategory] = useState(v.category ?? "");
  const [city, setCity] = useState(v.city ?? "");
  const have = useMemo(() => new Set(tracked.map((t) => t.toLowerCase())), [tracked]);
  const suggestions = suggestKeywords({ category, city }).filter((s) => !have.has(s.toLowerCase()));

  return (
    <form action={action} className="start-form" noValidate>
      <Field label="Business name" name="name" required autoComplete="organization" placeholder="The Sunday Studio" defaultValue={v.name} error={e.name} autoFocus={!v.name} />
      <div className="start-row">
        <Field label="What do you do?" name="category" required placeholder="Interior designer" value={category} onChange={(ev) => setCategory(ev.target.value)} error={e.category} />
        <Field label="City" name="city" required autoComplete="address-level2" placeholder="Pune" value={city} onChange={(ev) => setCity(ev.target.value)} error={e.city} />
      </div>

      <fieldset className="start-keywords">
        <legend className="start-label">Keywords to track</legend>
        <p className="start-hint">What would customers type or ask an AI assistant to find you? We check each keyword on ChatGPT, Gemini, Perplexity and Claude.</p>
        {tracked.length > 0 && (
          <ul className="start-chips" aria-label="Already tracking">
            {tracked.map((k) => (
              <li key={k} className="start-chip on"><Icon name="check" size={13} />{k}</li>
            ))}
          </ul>
        )}
        {suggestions.length > 0 ? (
          <ul className="start-chips" aria-label="Suggested keywords">
            {suggestions.map((k, i) => (
              <li key={k}>
                <label className="start-chip">
                  <input type="checkbox" name="keyword" value={k} defaultChecked={tracked.length === 0 && i < 3} />
                  {k}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          tracked.length === 0 && <p className="start-hint">Fill in what you do and your city to see suggestions.</p>
        )}
        <label className="start-field" htmlFor="custom">
          <span className="start-label">Your own keywords <em>(one per line, optional)</em></span>
          <textarea id="custom" name="custom" rows={2} placeholder={city ? `wedding photographer in ${city}` : "wedding photographer in Pune"} defaultValue={v.custom} aria-invalid={e.custom ? true : undefined} />
          {e.custom && <span className="start-error">{e.custom[0]}</span>}
        </label>
      </fieldset>

      <Message state={state} />
      <Submit pending="Saving…">Continue <Icon name="arrow" size={18} /></Submit>
    </form>
  );
}

/** Step 2: the website address. Owners without one can say so and carry on. */
export function WebsiteStep({ initialUrl }: { initialUrl: string }) {
  const [state, action] = useActionState(saveWebsiteStepAction, {});
  const e = state.fieldErrors ?? {};
  return (
    <div className="start-choices">
      <form action={action} className="start-form" noValidate>
        <input type="hidden" name="choice" value="connect" />
        <Field label="Your website address" name="websiteUrl" type="url" inputMode="url" placeholder="example.com" hint="We only read your public pages. We never need your login." defaultValue={state.values?.websiteUrl ?? initialUrl} error={e.websiteUrl} autoFocus />
        <Message state={state} />
        <Submit pending="Connecting…">Connect website <Icon name="arrow" size={18} /></Submit>
      </form>
      <form action={action}>
        <input type="hidden" name="choice" value="none" />
        <Submit pending="One moment…" className="start-choice-alt">I don&apos;t have a website yet</Submit>
        <p className="start-hint start-center">No problem. Our team can build one for you. You can ask from your dashboard.</p>
      </form>
    </div>
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
