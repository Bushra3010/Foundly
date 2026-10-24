"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, Notice, TextArea, TextField } from "@/components/ui";
import type { ActionState } from "@/lib/actions";
import { cancelRequestAction, connectWebsiteAction, noWebsiteAction, requestWebsiteAction } from "./actions";

function Message({ state }: { state: ActionState }) {
  return state.message ? <Notice tone={state.ok ? "ok" : "err"}>{state.message}</Notice> : null;
}

/** Enter the website address to connect it. */
export function ConnectWebsiteForm({ hint, current, onCancel }: { hint?: string; current?: string; onCancel?: () => void }) {
  const [state, action] = useActionState(connectWebsiteAction, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-3" noValidate>
      {current && <input type="hidden" name="mode" value="change" />}
      <div className="min-w-56 flex-1">
        <TextField label={current ? "New website address" : "Your website address"} name="websiteUrl" type="url" inputMode="url" placeholder="example.com" hint={hint} defaultValue={state.values?.websiteUrl ?? current} errors={state.fieldErrors?.websiteUrl} autoFocus={!!current} />
      </div>
      <SubmitButton pendingLabel={current ? "Saving…" : "Connecting…"}>{current ? "Save address" : "Connect website"}</SubmitButton>
      {onCancel && (
        <button type="button" onClick={onCancel} className="min-h-11 px-3 text-sm font-semibold underline">
          Cancel
        </button>
      )}
      <div aria-live="polite" className="basis-full empty:hidden">
        <Message state={state} />
      </div>
    </form>
  );
}

/** The connected website's address, with an inline way to change it. */
export function ChangeAddress({ url, canEdit, children }: { url: string | null; canEdit: boolean; children?: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <div className="mt-4"><ConnectWebsiteForm current={url ?? ""} hint="We'll check the new address next time." onCancel={() => setEditing(false)} /></div>;
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {children}
      {canEdit && (
        <button type="button" onClick={() => setEditing(true)} className={buttonClass("secondary")}>
          {url ? "Change address" : "Add website address"}
        </button>
      )}
    </div>
  );
}

export function NoWebsiteForm() {
  const [state, action] = useActionState(noWebsiteAction, {});
  return (
    <form action={action} className="space-y-3">
      <SubmitButton variant="secondary" pendingLabel="Removing…">
        I don&apos;t have a website
      </SubmitButton>
      <div aria-live="polite">
        <Message state={state} />
      </div>
    </form>
  );
}

const CONTACT_OPTIONS = [
  { value: "phone", label: "Phone call", field: "Phone number", type: "tel" },
  { value: "whatsapp", label: "WhatsApp", field: "WhatsApp number", type: "tel" },
  { value: "video", label: "Video call", field: "Email for the meeting link", type: "email" },
] as const;

/** The brief an owner sends so Foundly's team can plan their website. */
export function RequestWebsiteForm({ defaults }: { defaults: { phone: string; email: string } }) {
  const [state, action] = useActionState(requestWebsiteAction, {});
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const [method, setMethod] = useState<(typeof CONTACT_OPTIONS)[number]["value"]>((v.contactMethod as "phone") ?? "phone");
  const option = CONTACT_OPTIONS.find((o) => o.value === method)!;
  const contactDefault = v.contactValue ?? (method === "video" ? defaults.email : defaults.phone);

  return (
    <form action={action} className="space-y-4" noValidate>
      <TextArea label="What should your website do for your business?" name="goal" rows={3} placeholder="Get more bookings from families in Pune, and show our past work" defaultValue={v.goal} errors={e.goal} />
      <TextField label="Pages you'd like" name="pages" optional placeholder="Home, services, gallery, contact" defaultValue={v.pages} errors={e.pages} />
      <TextField label="Look and feel" name="style" optional placeholder="Clean and modern, our colours are blue and white" defaultValue={v.style} errors={e.style} />
      <TextArea label="Websites you like" name="examples" optional rows={2} hint="One address per line" defaultValue={v.examples} errors={e.examples} />

      <fieldset>
        <legend className="mb-2 font-medium">How should we contact you?</legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_OPTIONS.map((o) => (
            <label key={o.value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 ${method === o.value ? "border-text" : "border-border"}`}>
              <input type="radio" name="contactMethod" value={o.value} checked={method === o.value} onChange={() => setMethod(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField key={method} label={option.field} name="contactValue" type={option.type} defaultValue={contactDefault} errors={e.contactValue} />
        <TextField label="Best time to reach you" name="contactTime" optional placeholder="Weekdays after 6 pm" defaultValue={v.contactTime} errors={e.contactTime} />
      </div>

      <SubmitButton pendingLabel="Sending…">Request my website</SubmitButton>
      <div aria-live="polite">
        <Message state={state} />
      </div>
    </form>
  );
}

export function CancelRequestForm() {
  const [state, action] = useActionState(cancelRequestAction, {});
  return (
    <form action={action} className="space-y-3">
      <SubmitButton variant="secondary" pendingLabel="Cancelling…">
        Cancel request
      </SubmitButton>
      <div aria-live="polite">
        <Message state={state} />
      </div>
    </form>
  );
}
