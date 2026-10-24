"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Notice, TextField } from "@/components/ui";
import type { ActionState } from "@/lib/actions";
import { changeSlugAction, generateAction, noWebsiteAction, publishAction, rollbackAction, unpublishAction } from "./actions";

function Message({ state }: { state: ActionState }) {
  return state.message ? <Notice tone={state.ok ? "ok" : "err"}>{state.message}</Notice> : null;
}

export function GenerateForm({ requestId, label, pendingLabel, variant = "primary" }: { requestId: string; label: string; pendingLabel: string; variant?: "primary" | "secondary" }) {
  const [state, action] = useActionState(generateAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <SubmitButton variant={variant} pendingLabel={pendingLabel}>
        {label}
      </SubmitButton>
      <div aria-live="polite">
        <Message state={state} />
      </div>
    </form>
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

export function PublishForm({ revision, isLive }: { revision: number; isLive: boolean }) {
  const [state, action] = useActionState(publishAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="revision" value={revision} />
      <SubmitButton pendingLabel="Publishing…">{isLive ? "Publish changes" : "Publish website"}</SubmitButton>
      <Message state={state} />
    </form>
  );
}

export function UnpublishForm() {
  const [state, action] = useActionState(unpublishAction, {});
  return (
    <form action={action} className="space-y-3">
      <SubmitButton variant="danger" pendingLabel="Taking offline…">
        Take website offline
      </SubmitButton>
      <Message state={state} />
    </form>
  );
}

export function RollbackForm({ versionId, versionNumber }: { versionId: string; versionNumber: number }) {
  const [state, action] = useActionState(rollbackAction, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="versionId" value={versionId} />
      <SubmitButton variant="secondary" pendingLabel="Restoring…">
        Make version {versionNumber} live
      </SubmitButton>
      <Message state={state} />
    </form>
  );
}

export function SlugForm({ slug }: { slug: string }) {
  const [state, action] = useActionState(changeSlugAction, {});
  return (
    <form action={action} className="space-y-3" noValidate>
      <TextField
        label="Website address"
        name="slug"
        hint="Lowercase letters, numbers and hyphens. Old addresses keep redirecting."
        defaultValue={state.values?.slug ?? slug}
        autoCapitalize="none"
        spellCheck={false}
      />
      <SubmitButton variant="secondary">Change address</SubmitButton>
      <Message state={state} />
    </form>
  );
}
