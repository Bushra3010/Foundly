"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Checkbox, Notice, TextArea, TextField } from "@/components/ui";
import type { ActionState } from "@/lib/actions";
import {
  confirmReviewAction,
  finishWithExistingSiteAction,
  generateFirstSiteAction,
  saveBasicsAction,
  saveOfferAction,
  saveWebsiteChoiceAction,
} from "./actions";

function FormMessage({ state }: { state: ActionState }) {
  return state.message ? <Notice tone={state.ok ? "ok" : "err"}>{state.message}</Notice> : null;
}

export function BasicsStep({ initial }: { initial: Record<string, string> }) {
  const [state, action] = useActionState(saveBasicsAction, {});
  const v = { ...initial, ...state.values };
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <TextField label="Business name" name="name" required autoComplete="organization" defaultValue={v.name} errors={e.name} />
      <TextField
        label="What kind of business is it?"
        name="category"
        hint="For example: plumber, tour operator, dental clinic"
        required
        defaultValue={v.category}
        errors={e.category}
      />
      <TextField label="City" name="city" required autoComplete="address-level2" defaultValue={v.city} errors={e.city} />
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">How can customers contact you? Add at least one.</legend>
        <TextField label="Phone" name="phone" type="tel" optional autoComplete="tel" defaultValue={v.phone} errors={e.phone} />
        <TextField label="WhatsApp number" name="whatsapp" type="tel" optional defaultValue={v.whatsapp} errors={e.whatsapp} />
        <TextField label="Email" name="email" type="email" optional autoComplete="email" defaultValue={v.email} errors={e.email} />
      </fieldset>
      <FormMessage state={state} />
      <SubmitButton>Save and continue</SubmitButton>
    </form>
  );
}

export function WebsiteChoiceStep({ initial }: { initial: { hasWebsite?: "yes" | "no"; websiteUrl?: string } }) {
  const [state, action] = useActionState(saveWebsiteChoiceAction, {});
  const [choice, setChoice] = useState(state.values?.hasWebsite ?? initial.hasWebsite ?? "");
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Does your business already have a website?</legend>
        {[
          ["no", "Create one for me", "We'll build an editable website from the details you confirm."],
          ["yes", "I have one", "We'll keep your website as it is. Nothing is changed without your approval."],
        ].map(([value, label, hint]) => (
          <label
            key={value}
            className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-4 has-[:checked]:border-brand"
          >
            <input
              type="radio"
              name="hasWebsite"
              value={value}
              checked={choice === value}
              onChange={() => setChoice(value)}
              className="mt-1 size-5 accent-[var(--brand)]"
            />
            <span>
              <span className="font-semibold">{label}</span>
              <span className="block text-sm text-muted">{hint}</span>
            </span>
          </label>
        ))}
        {e.hasWebsite && <p className="text-sm font-medium text-err-fg">Choose one option</p>}
      </fieldset>
      {choice === "yes" && (
        <TextField
          label="Website address"
          name="websiteUrl"
          type="url"
          inputMode="url"
          placeholder="example.com"
          defaultValue={state.values?.websiteUrl ?? initial.websiteUrl}
          errors={e.websiteUrl}
        />
      )}
      <FormMessage state={state} />
      <SubmitButton>Save and continue</SubmitButton>
    </form>
  );
}

export function OfferStep({ initial }: { initial: Record<string, string> }) {
  const [state, action] = useActionState(saveOfferAction, {});
  const v = { ...initial, ...state.values };
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      <TextArea
        label="Services you offer"
        name="services"
        hint="One per line. You can add descriptions later."
        required
        defaultValue={v.services}
        errors={e.services}
      />
      <TextField
        label="Areas you serve"
        name="serviceAreas"
        hint="Separate with commas, e.g. Kothrud, Baner, Aundh"
        optional
        defaultValue={v.serviceAreas}
        errors={e.serviceAreas}
      />
      <TextField
        label="Who are your customers?"
        name="audience"
        hint="e.g. homeowners, families planning holidays"
        optional
        defaultValue={v.audience}
        errors={e.audience}
      />
      <FormMessage state={state} />
      <SubmitButton>Save and continue</SubmitButton>
    </form>
  );
}

export function ReviewStep() {
  const [state, action] = useActionState(confirmReviewAction, {});
  return (
    <form action={action} className="space-y-4">
      <Checkbox
        name="confirmContact"
        label="These details are correct, and the contact details above can be shown publicly"
        hint="Nothing is published yet. You'll preview everything before it goes live."
      />
      {state.fieldErrors?.confirmContact && (
        <p className="text-sm font-medium text-err-fg">{state.fieldErrors.confirmContact[0]}</p>
      )}
      <FormMessage state={state} />
      <SubmitButton>Confirm details</SubmitButton>
    </form>
  );
}

export function GenerateStep({ requestId }: { requestId: string }) {
  const [state, action] = useActionState(generateFirstSiteAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="requestId" value={requestId} />
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Building your private preview…">Generate website</SubmitButton>
      <p className="text-sm text-muted" aria-live="polite">
        This creates a private preview. It won&apos;t be public until you select Publish.
      </p>
    </form>
  );
}

export function ExistingSiteFinishStep() {
  const [state, action] = useActionState(finishWithExistingSiteAction, {});
  return (
    <form action={action} className="space-y-4">
      <Checkbox
        name="publishProfile"
        defaultChecked
        label="Publish my business profile in the directory"
        hint="Shows the details you confirmed. You can unpublish it at any time."
      />
      <FormMessage state={state} />
      <SubmitButton>Finish setup</SubmitButton>
    </form>
  );
}
