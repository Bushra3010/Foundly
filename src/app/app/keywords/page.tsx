import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { suggestKeywords } from "@/lib/questions";
import { requireCurrentBusiness } from "@/server/current";
import { listCompetitors, questionLimit } from "@/server/monitoring/service";
import { performanceFor } from "@/server/insights";
import { Mini, StatusBadge } from "../overview-parts";
import { addKeywordsAction, addRivalAction, editKeywordAction, removeKeywordAction, removeRivalAction } from "./actions";
import "../overview.css";

export const metadata = { title: "Keywords" };

const ago = (d: Date | null) => (d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Not checked yet");

export default async function KeywordsPage() {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireCurrentBusiness(db, ctx);
  const [p, rivals, limit] = await Promise.all([performanceFor(db, ctx, 90), listCompetitors(db, ctx), questionLimit(db, ctx.workspaceId)]);
  const tracked = new Set(p.keywords.map((k) => k.keyword.toLowerCase()));
  const ideas = suggestKeywords({ category: business.category, city: business.city, services: business.services.map((s) => s.name) }).filter((k) => !tracked.has(k.toLowerCase())).slice(0, 4);
  const room = Math.max(limit - p.keywords.length, 0);

  return (
    <div className="dash ov">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-eyebrow">Keywords</span>
          <h1>What customers ask AI</h1>
          <p>Each keyword is asked to every AI assistant on your plan&apos;s schedule.</p>
        </div>
        <div className="dash-hero-actions">
          <span className="ov-engine">{p.keywords.length} of {limit} keywords used</span>
        </div>
      </header>

      <section className="dash-panel ov-panel" aria-labelledby="kw-add">
        <h2 id="kw-add">Add keywords</h2>
        <p className="ov-sub">
          Type what someone would search, like “{business.category.toLowerCase() || "dentist"} in {business.city || "your city"}”. One per line or comma separated.
        </p>
        {room === 0 ? (
          <p className="ov-note warn" style={{ marginTop: 12 }}>You&apos;re tracking the most keywords your plan allows. Remove one, or upgrade in Settings for more.</p>
        ) : (
          <ActionForm action={addKeywordsAction} submitLabel="Add" pendingLabel="Adding…" className="">
            <div className="st-field" style={{ marginTop: 10 }}>
              <label htmlFor="keywords" className="sr-only">Keywords</label>
              <textarea id="keywords" name="keywords" placeholder={ideas.join("\n") || "dentist in Indore"} />
              {ideas.length > 0 && <small>Ideas: {ideas.join(" · ")}</small>}
            </div>
            <div style={{ height: 10 }} />
          </ActionForm>
        )}
      </section>

      <section className="dash-panel ov-panel" aria-labelledby="kw-list">
        <h2 id="kw-list">Tracked keywords</h2>
        {p.keywords.length === 0 ? (
          <p className="ov-sub" style={{ marginTop: 10 }}>No keywords yet. Add a few above to start.</p>
        ) : (
          <div className="ov-table-wrap">
            <table className="ov-table">
              <thead>
                <tr>
                  <th scope="col">Keyword</th>
                  <th scope="col">Result</th>
                  <th scope="col">Recommended in</th>
                  <th scope="col">Last checked</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {p.keywords.map((k) => (
                  <tr key={k.id}>
                    <td>
                      <Link href={`/app/keywords/${k.id}`} className="ov-kw">{k.keyword}</Link>
                      <span className="ov-q">Asked as: {k.question}</span>
                      <details style={{ marginTop: 6 }}>
                        <summary className="ov-sub" style={{ cursor: "pointer" }}>Edit</summary>
                        <ActionForm action={editKeywordAction} submitLabel="Save" pendingLabel="Saving…" variant="secondary" inline>
                          <input type="hidden" name="id" value={k.id} />
                          <label className="sr-only" htmlFor={`kw-${k.id}`}>New keyword</label>
                          <input id={`kw-${k.id}`} name="keyword" defaultValue={k.keyword} maxLength={80} style={{ minHeight: 40, padding: "6px 10px", borderRadius: 10, border: "1px solid var(--d-line)", background: "var(--d-card)", color: "var(--d-ink)", font: "inherit" }} />
                        </ActionForm>
                      </details>
                    </td>
                    <td><StatusBadge status={k.status} /></td>
                    <td>{k.rate === null ? <span className="ov-muted">—</span> : <><Mini rate={k.rate} />{k.rate}%</>}</td>
                    <td className="ov-muted">{ago(k.checkedAt)}</td>
                    <td>
                      <ActionForm action={removeKeywordAction} submitLabel="Remove" pendingLabel="Removing…" variant="ghost" inline>
                        <input type="hidden" name="id" value={k.id} />
                      </ActionForm>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dash-panel ov-panel" id="competitors" aria-labelledby="kw-rivals">
        <h2 id="kw-rivals">Competitors</h2>
        <p className="ov-sub">Businesses you want to be compared with. We spot them in the same AI answers.</p>
        {rivals.length > 0 && (
          <ul className="ov-list">
            {rivals.map((r) => (
              <li key={r.id}>
                <span>
                  <strong>{r.name}</strong>
                  {r.domains[0] && <span className="ov-muted"> · {r.domains[0]}</span>}
                </span>
                <ActionForm action={removeRivalAction} submitLabel="Remove" pendingLabel="Removing…" variant="ghost" inline>
                  <input type="hidden" name="id" value={r.id} />
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
        {rivals.length < 10 && (
          <ActionForm action={addRivalAction} submitLabel="Add competitor" pendingLabel="Adding…" variant="secondary" inline>
            <div className="st-field" style={{ marginTop: 10, flex: "1 1 220px" }}>
              <label htmlFor="rival-name">Business name</label>
              <input id="rival-name" name="name" placeholder="e.g. Smile Care Clinic" required />
            </div>
            <div className="st-field" style={{ marginTop: 10, flex: "1 1 220px" }}>
              <label htmlFor="rival-domain">Website (optional)</label>
              <input id="rival-domain" name="domain" placeholder="smilecare.in" />
            </div>
          </ActionForm>
        )}
      </section>

      <p className="ov-sub">
        Want every answer and filter? <Link href="/app/visibility" className="underline">Open the full AI visibility data <Icon name="arrow" size={12} /></Link>
      </p>
    </div>
  );
}
