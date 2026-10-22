"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Checkbox, Notice, TextArea, TextField } from "@/components/ui";
import type { ActionState } from "@/lib/actions";
import { confirmContactAction, publishProfileAction, saveDetailsAction, unpublishProfileAction } from "./actions";

function Message({ state }: { state: ActionState }) {
  return state.message ? <Notice tone={state.ok ? "ok" : "err"}>{state.message}</Notice> : null;
}

export function DetailsForm({ initial, disabled }: { initial: Record<string, string>; disabled: boolean }) {
  const [state, action] = useActionState(saveDetailsAction, {});
  const v: Record<string, string> = { ...initial, ...(state.values && { showAddress: "", ...state.values }) };
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-8" noValidate>
      <input type="hidden" name="expectedVersion" value={initial.expectedVersion} />
      <fieldset disabled={disabled} className="space-y-5">
        <legend className="mb-2 text-lg font-semibold">Basics</legend>
        <TextField label="Business name" name="name" defaultValue={v.name} errors={e.name} />
        <TextField label="Category" name="category" defaultValue={v.category} errors={e.category} />
        <TextArea
          label="Description"
          name="description"
          optional
          hint="In your own words. Used for your About page. Please don't include claims you can't back up."
          defaultValue={v.description}
          errors={e.description}
        />
        <TextField label="Who are your customers?" name="audience" optional defaultValue={v.audience} errors={e.audience} />
      </fieldset>

      <fieldset disabled={disabled} className="space-y-5">
        <legend className="mb-2 text-lg font-semibold">Services and areas</legend>
        <TextArea
          label="Services"
          name="services"
          hint="One per line. Add a description after a colon, e.g. “Leak repair: Same-day fixes for taps and pipes”."
          rows={6}
          defaultValue={v.services}
          errors={e.services}
        />
        <TextField label="Areas you serve" name="serviceAreas" optional hint="Separate with commas" defaultValue={v.serviceAreas} errors={e.serviceAreas} />
        <TextArea label="Opening hours" name="hours" optional hint="One per line, e.g. “Mon–Sat: 9am–7pm”" defaultValue={v.hours} errors={e.hours} />
      </fieldset>

      <fieldset disabled={disabled} className="space-y-5">
        <legend className="mb-2 text-lg font-semibold">Location and contact</legend>
        <TextField label="City" name="city" defaultValue={v.city} errors={e.city} />
        <TextField label="State or region" name="region" optional defaultValue={v.region} errors={e.region} />
        <TextField label="Street address" name="address" optional autoComplete="street-address" defaultValue={v.address} errors={e.address} />
        <Checkbox
          name="showAddress"
          label="Show my street address publicly"
          hint="Leave unticked if you work from home or visit customers."
          defaultChecked={v.showAddress === "on"}
        />
        <TextField label="Phone" name="phone" type="tel" optional defaultValue={v.phone} errors={e.phone} />
        <TextField label="WhatsApp number" name="whatsapp" type="tel" optional defaultValue={v.whatsapp} errors={e.whatsapp} />
        <TextField label="Email" name="email" type="email" optional defaultValue={v.email} errors={e.email} />
        <TextField label="Existing website" name="websiteUrl" optional inputMode="url" defaultValue={v.websiteUrl} errors={e.websiteUrl} />
        <TextField label="Booking or payment page" name="bookingUrl" optional inputMode="url" hint="A link to where customers already book or pay." defaultValue={v.bookingUrl} errors={e.bookingUrl} />
      </fieldset>

      <Message state={state} />
      {!disabled && <SubmitButton>Save details</SubmitButton>}
    </form>
  );
}

export function ConfirmContactForm() {
  const [state, action] = useActionState(confirmContactAction, {});
  return (
    <form action={action} className="space-y-2">
      <SubmitButton variant="secondary">Yes, these can be public</SubmitButton>
      <Message state={state} />
    </form>
  );
}

export function ProfilePublishForm({ published }: { published: boolean }) {
  const [state, action] = useActionState(publishProfileAction, {});
  const [unState, unAction] = useActionState(unpublishProfileAction, {});
  return (
    <div className="flex flex-wrap gap-3">
      <form action={action} className="space-y-2">
        <SubmitButton>{published ? "Update public profile" : "Publish profile"}</SubmitButton>
        <Message state={state} />
      </form>
      {published && (
        <form action={unAction} className="space-y-2">
          <SubmitButton variant="secondary">Hide from directory</SubmitButton>
          <Message state={unState} />
        </form>
      )}
    </div>
  );
}
