"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions";
import { SubmitButton } from "./submit-button";
import { Notice, type ButtonVariant } from "./ui";

/**
 * A form bound to a server action, showing its result message beside it.
 * Fields are passed as children so server components can render them.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  variant = "primary",
  className = "space-y-3",
  inline = false,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  children?: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  className?: string;
  inline?: boolean;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className={inline ? "flex flex-wrap items-end gap-2" : className}>
      {children}
      <SubmitButton variant={variant} pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
      {state.message && (
        <div className={inline ? "basis-full" : undefined}>
          <Notice tone={state.ok ? "ok" : "err"}>
            {state.message}
            {state.link && (
              <>
                {" "}
                <a href={state.link} className="break-all font-semibold underline">
                  {state.linkLabel ?? state.link}
                </a>
              </>
            )}
          </Notice>
        </div>
      )}
    </form>
  );
}
