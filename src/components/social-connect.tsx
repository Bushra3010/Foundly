"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addListingsAction } from "@/app/app/business/actions";
import { Icon } from "./icon";
import "./social-connect.css";

export type SocialRow = { key: "google" | "facebook" | "instagram"; label: string; state: "synced" | "linked" | "none" };

function Save() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="sc-save" disabled={pending}>
      {pending ? "Saving…" : "Save links"}
    </button>
  );
}

/**
 * The whole social step in one place: see what's connected, use one-click
 * connect where it's switched on, or paste any links into one box.
 */
export function SocialConnect({ social, oneClick, back }: { social: SocialRow[]; oneClick: { google: boolean; facebook: boolean }; back?: "setup" }) {
  const [state, action] = useActionState(addListingsAction, {});
  const q = back ? "?back=setup" : "";
  const missing = social.filter((s) => s.state === "none");
  return (
    <div className="sc">
      <ul className="sc-status" aria-label="Your accounts">
        {social.map((s) => (
          <li key={s.key} className={s.state === "none" ? "" : "on"}>
            <span className="sc-dot" aria-hidden="true">{s.state !== "none" && <Icon name="check" size={12} />}</span>
            <span>
              <strong>{s.label}</strong>
              <em>{s.state === "synced" ? "Connected · kept up to date" : s.state === "linked" ? "Connected" : "Not connected"}</em>
            </span>
          </li>
        ))}
      </ul>

      {missing.length > 0 && (oneClick.google || oneClick.facebook) && (
        <div className="sc-buttons">
          {oneClick.google && missing.some((s) => s.key === "google") && (
            <a href={`/api/connect/google/start${q}`} className="sc-btn">Connect Google</a>
          )}
          {oneClick.facebook && missing.some((s) => s.key !== "google") && (
            <a href={`/api/connect/facebook/start${q}`} className="sc-btn">Connect Facebook &amp; Instagram</a>
          )}
        </div>
      )}

      {missing.length > 0 && (
        <form action={action} className="sc-form" noValidate>
          <label htmlFor="links">
            <strong>{oneClick.google || oneClick.facebook ? "Or paste your page links" : "Paste your page links"}</strong>
            <span>Open your page, copy the address from the browser, and paste it here. Add as many as you like.</span>
          </label>
          <textarea
            id="links"
            name="links"
            rows={3}
            placeholder={"instagram.com/yourbusiness\nfacebook.com/yourbusiness"}
            defaultValue={state.ok ? "" : state.values?.links}
            aria-invalid={state.fieldErrors?.links ? true : undefined}
          />
          {state.fieldErrors?.links && <span className="sc-error">{state.fieldErrors.links[0]}</span>}
          {state.message && <span className={state.ok ? "sc-ok" : "sc-error"}>{state.message}</span>}
          <Save />
        </form>
      )}
    </div>
  );
}
