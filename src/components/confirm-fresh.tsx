"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { confirmFreshAction } from "@/app/app/business/actions";
import { Icon } from "./icon";

function Button() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="share-btn" disabled={pending}>
      <Icon name="check" size={15} /> {pending ? "Saving…" : "Yes, still correct"}
    </button>
  );
}

/** Monthly freshness check. Content confirmed recently is cited more often by AI answers. */
export function ConfirmFresh({ daysAgo: days }: { daysAgo: number | null }) {
  const [state, action] = useActionState(confirmFreshAction, {});
  return (
    <form action={action} className="geo-fresh">
      <span className="geo-text">
        <strong>Are your details still correct?</strong>
        <span>
          {state.ok ? state.message : days === null ? "Not confirmed yet." : days === 0 ? "Confirmed today." : `Last confirmed ${days} day${days === 1 ? "" : "s"} ago. Confirming monthly keeps your pages fresh for AI answers.`}
        </span>
      </span>
      <Button />
    </form>
  );
}
