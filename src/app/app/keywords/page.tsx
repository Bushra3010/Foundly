import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { isTag, suggestKeywords, TAG_LABEL, TAGS } from "@/lib/questions";
import { requireCurrentBusiness } from "@/server/current";
import { ADAPTERS } from "@/server/monitoring/registry";
import { getSamples, questionLimit, SAMPLE_CHOICES } from "@/server/monitoring/service";
import { performanceFor } from "@/server/insights";
import { Mini, StatusBadge } from "../overview-parts";
import { addKeywordsAction, editKeywordAction, removeKeywordAction, setSamplesAction, setTagAction } from "./actions";
import { KeywordResearch } from "./research";
import "../overview.css";

export const metadata = { title: "Keywords" };

const ago = (d: Date | null) => (d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Not checked yet");

export default async function KeywordsPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const focus = (await searchParams).focus?.slice(0, 80) ?? "";
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireCurrentBusiness(db, ctx);
  const [p, limit, samples] = await Promise.all([performanceFor(db, ctx, 90), questionLimit(db, ctx.workspaceId), getSamples(db, ctx.workspaceId)]);
  const engines = ADAPTERS.map((a) => ({ key: a.key, label: a.label.replace(/\s*\(.*\)\s*$/, "") }));
  const tracked = new Set(p.keywords.map((k) => k.keyword.toLowerCase()));
  const ideas = suggestKeywords({ category: business.category, city: business.city, services: business.services.map((s) => s.name) }).filter((k) => !tracked.has(k.toLowerCase())).slice(0, 4);
  const room = Math.max(limit - p.keywords.length, 0);

  return (
    <div className="dash ov">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-eyebrow">Prompts</span>
          <h1>What customers ask AI</h1>
          <p>The keywords and questions customers ask AI. Each one is asked to every assistant on your plan&apos;s schedule.</p>
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
        {room > 0 && <KeywordResearch room={room} initialFocus={focus} />}
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
                  <th scope="col">Tag</th>
                  <th scope="col">Result</th>
                  {engines.map((e) => (
                    <th key={e.key} scope="col">{e.label}</th>
                  ))}
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
                        <summary className="ov-sub" style={{ cursor: "pointer" }}>Edit · <Link href={`/app/keywords?focus=${encodeURIComponent(k.keyword)}#focus`} className="underline">Variations</Link></summary>
                        <ActionForm action={editKeywordAction} submitLabel="Save" pendingLabel="Saving…" variant="secondary" inline>
                          <input type="hidden" name="id" value={k.id} />
                          <label className="sr-only" htmlFor={`kw-${k.id}`}>New keyword</label>
                          <input id={`kw-${k.id}`} name="keyword" defaultValue={k.keyword} maxLength={80} style={{ minHeight: 40, padding: "6px 10px", borderRadius: 10, border: "1px solid var(--d-line)", background: "var(--d-card)", color: "var(--d-ink)", font: "inherit" }} />
                        </ActionForm>
                      </details>
                    </td>
                    <td>
                      <ActionForm action={setTagAction} submitLabel="Save" pendingLabel="…" variant="ghost" inline>
                        <input type="hidden" name="id" value={k.id} />
                        <label className="sr-only" htmlFor={`tag-${k.id}`}>Tag</label>
                        <select key={k.tag} id={`tag-${k.id}`} name="tag" defaultValue={isTag(k.tag) ? k.tag : "service"} className="ov-select">
                          {TAGS.map((t) => (
                            <option key={t} value={t}>{TAG_LABEL[t]}</option>
                          ))}
                        </select>
                      </ActionForm>
                    </td>
                    <td><StatusBadge status={k.status} /></td>
                    {engines.map((e) => {
                      const r = k.byEngine[e.key];
                      return (
                        <td key={e.key}>
                          {!r ? (
                            <span className="ov-cell none" title="Not checked">—</span>
                          ) : r.named ? (
                            <span className="ov-cell yes" title={`${e.label} recommends you${r.position ? ` at #${r.position}` : ""}${r.samples > 1 ? ` (${r.samples} samples)` : ""}`}>{r.position ? `#${r.position}` : "✓"}</span>
                          ) : (
                            <span className="ov-cell no" title={`${e.label} doesn't mention you${r.samples > 1 ? ` (${r.samples} samples)` : ""}`}>✗</span>
                          )}
                        </td>
                      );
                    })}
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

      <section className="dash-panel ov-panel" aria-labelledby="kw-samples">
        <h2 id="kw-samples">Samples per prompt</h2>
        <p className="ov-sub">
          AI answers vary from one ask to the next. Asking each prompt 3 times per check makes coverage and position steadier, and uses 3 times the credits.
        </p>
        <ActionForm action={setSamplesAction} submitLabel="Save" pendingLabel="Saving…" variant="secondary" inline>
          {/* Keyed on the saved value so the radios show it after saving, while the form keeps its message. */}
          <fieldset key={samples} className="ov-seg" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="sr-only">Samples per prompt</legend>
            {SAMPLE_CHOICES.map((n) => (
              <label key={n} className="ov-radio">
                <input type="radio" name="samples" value={n} defaultChecked={n === samples} />
                <span>{n === 1 ? "1 — one answer per assistant" : "3 — steadier numbers"}</span>
              </label>
            ))}
          </fieldset>
        </ActionForm>
      </section>

      <p className="ov-sub">
        Competitors to compare with are on <Link href="/app/competitors" className="underline">Competitors</Link>.
      </p>

      <p className="ov-sub">
        Want every answer and filter? <Link href="/app/visibility" className="underline">Open the full AI visibility data <Icon name="arrow" size={12} /></Link>
      </p>
    </div>
  );
}
