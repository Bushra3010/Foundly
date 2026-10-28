"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addKeywordsAction, researchKeywordsAction, type ResearchState } from "./actions";
import type { ActionState } from "@/lib/actions";

function Button({ children, pending }: { children: React.ReactNode; pending: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button type="submit" className="dash-btn ghost" disabled={busy} aria-disabled={busy}>
      {busy ? pending : children}
    </button>
  );
}

/** Ask AI what customers search for, then track the ideas the owner picks. */
export function KeywordResearch({ room, initialFocus = "" }: { room: number; initialFocus?: string }) {
  const [found, research] = useActionState<ResearchState, FormData>(researchKeywordsAction, {});
  const [added, add] = useActionState<ActionState, FormData>(addKeywordsAction, {});
  return (
    <div className="ov-research">
      <form action={research} className="ov-row" style={{ alignItems: "flex-end" }}>
        <div className="st-field" style={{ marginTop: 0, flex: "1 1 260px" }}>
          <label htmlFor="focus">Find keyword ideas with AI</label>
          <input id="focus" name="focus" placeholder="A service or area, e.g. root canal, Vijay Nagar (optional)" maxLength={80} defaultValue={initialFocus} />
        </div>
        <Button pending="Asking AI…">Find ideas</Button>
      </form>
      {found.message && !found.ok && <p className="ov-note warn" role="alert" style={{ marginTop: 10 }}>{found.message}</p>}
      {found.ideas && found.ideas.length > 0 && (
        <form action={add} style={{ marginTop: 12 }}>
          <p className="ov-sub">
            {found.source === "ai" ? "What customers ask AI, according to AI. " : "Ideas from your business details. "}
            Pick up to {room}.
          </p>
          <div className="st-chips">
            {found.ideas.map((k) => (
              <label key={k} className="st-chip">
                <input type="checkbox" name="keywords" value={k} />
                <span>{k}</span>
              </label>
            ))}
          </div>
          <Button pending="Adding…">Track selected</Button>
          {added.message && <p className={`ov-note ${added.ok ? "ok" : "warn"}`} role="status" style={{ marginTop: 10 }}>{added.message}</p>}
        </form>
      )}
    </div>
  );
}
