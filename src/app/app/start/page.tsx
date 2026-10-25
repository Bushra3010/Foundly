import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icon";
import { AddListingForm } from "@/components/presence-kit";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { listingStatus } from "@/lib/geo";
import { suggestKeywords } from "@/lib/keywords";
import { siteUrl } from "@/app/s/load";
import { providerConfigured } from "@/server/connect";
import { listCompetitors } from "@/server/monitoring/service";
import { SETUP_STEPS, setupStatus, type SetupStep } from "@/server/setup";
import { publishFoundlySiteAction, saveKeywordsStepAction, startAction, useOwnWebsiteAction } from "./actions";
import "../perf.css";

export const metadata = { title: "Get started" };

const LABEL: Record<SetupStep, string> = {
  keywords: "Keywords",
  website: "Website",
  connections: "Social & listings",
  start: "Start",
};

export default async function StartPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const ctx = await requireCtx();
  const db = await getDb();
  const s = await setupStatus(db, ctx);
  if (!s) redirect("/onboarding");
  const asked = (await searchParams).step as SetupStep | undefined;
  const step: SetupStep = asked && SETUP_STEPS.includes(asked) ? asked : (s.next ?? "start");
  const b = s.business;

  return (
    <div className="st">
      <nav aria-label="Setup steps">
        <ol className="st-steps">
          {SETUP_STEPS.map((key, i) => {
            const cls = `${s.done[key] ? "done" : ""} ${key === step ? "current" : ""}`.trim();
            return (
              <li key={key}>
                <Link href={`/app/start?step=${key}`} className={cls} aria-current={key === step ? "step" : undefined}>
                  <span className="st-num">{s.done[key] ? <Icon name="check" size={13} /> : i + 1}</span>
                  <span className="st-label">{LABEL[key]}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      {step === "keywords" && <KeywordsStep s={s} />}
      {step === "website" && <WebsiteStep s={s} />}
      {step === "connections" && <ConnectionsStep listings={b.listings} google={Boolean(s.google)} facebook={Boolean(s.facebook)} />}
      {step === "start" && <StartStep s={s} />}
    </div>
  );
}

type Status = NonNullable<Awaited<ReturnType<typeof setupStatus>>>;

async function KeywordsStep({ s }: { s: Status }) {
  const tracked = new Set(s.keywords.map((q) => (q.keyword ?? q.text).toLowerCase()));
  const suggestions = suggestKeywords(s.business).filter((k) => !tracked.has(k.toLowerCase()));
  const rivals = await listCompetitors(await getDb(), await requireCtx());
  const fresh = s.keywords.length === 0;
  return (
    <section className="st-card" aria-labelledby="st-title">
      <h1 id="st-title">What do customers search for?</h1>
      <p className="pf-sub">
        Add the words people would type to find a business like yours. We ask ChatGPT, Gemini, Perplexity and Claude about each one and check
        whether they recommend you.
      </p>
      {s.keywords.length > 0 && (
        <p className="pf-note ok" style={{ marginTop: 14 }}>
          Already tracking: {s.keywords.map((q) => q.keyword ?? q.text).join(", ")}
        </p>
      )}
      <ActionForm action={saveKeywordsStepAction} submitLabel="Save and continue" pendingLabel="Saving…" className="">
        {suggestions.length > 0 && (
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="st-field" style={{ fontSize: 14, fontWeight: 650, marginTop: 16 }}>Suggested for you</legend>
            <div className="st-chips">
              {suggestions.map((k, i) => (
                <label key={k} className="st-chip">
                  <input type="checkbox" name="suggested" value={k} defaultChecked={fresh && i < 4} />
                  <span>{k}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div className="st-field">
          <label htmlFor="custom">Your own keywords</label>
          <textarea id="custom" name="custom" placeholder={`e.g. ${s.business.category.toLowerCase() || "dentist"} near me, emergency ${s.business.category.toLowerCase() || "dentist"} in ${s.business.city || "your city"}`} />
          <small>One per line, or separate with commas. Hindi works too.</small>
        </div>
        <div className="st-field">
          <label htmlFor="competitors">Competitors to compare with (optional)</label>
          <input id="competitors" name="competitors" placeholder="e.g. Smile Care Clinic, City Dental" defaultValue="" />
          <small>
            {rivals.length > 0 ? `Already comparing with ${rivals.map((r) => r.name).join(", ")}. ` : ""}Up to 3 here; add more later.
          </small>
        </div>
        <div style={{ height: 8 }} />
      </ActionForm>
    </section>
  );
}

function WebsiteStep({ s }: { s: Status }) {
  const live = s.website === "foundly";
  return (
    <section className="st-card" aria-labelledby="st-title">
      <h1 id="st-title">Where should AI find you?</h1>
      <p className="pf-sub">AI assistants trust businesses with a clear website. Use the one Foundly builds for you, or connect your own.</p>
      <div className="st-choice">
        <div className={`st-option ${live ? "selected" : ""}`}>
          <h2>Your Foundly website</h2>
          {live && s.site ? (
            <>
              <p>Live and ready for AI crawlers.</p>
              <a className="dash-btn ghost" href={siteUrl(s.site.slug)} target="_blank" rel="noreferrer">
                <Icon name="globe" size={16} /> View website
              </a>
            </>
          ) : s.site ? (
            <>
              <p>Your draft is ready. Publish it so AI can read it.</p>
              <ActionForm action={publishFoundlySiteAction} submitLabel="Publish my website" pendingLabel="Publishing…" className="grid gap-2" />
              <Link className="pf-sub underline" href="/app/website/preview" target="_blank">Preview it first</Link>
            </>
          ) : (
            <>
              <p>A fast, structured site built from your details in seconds.</p>
              <Link className="dash-btn ghost" href="/app/website">Create my website <Icon name="arrow" size={15} /></Link>
            </>
          )}
        </div>
        <div className={`st-option ${s.website === "own" ? "selected" : ""}`}>
          <h2>I have my own website</h2>
          <p>We use it to spot when AI answers link to you.</p>
          <ActionForm action={useOwnWebsiteAction} submitLabel={s.business.websiteUrl ? "Update" : "Connect"} pendingLabel="Saving…" variant="secondary" className="grid gap-2">
            <label className="sr-only" htmlFor="url">Website address</label>
            <input
              id="url"
              name="url"
              inputMode="url"
              placeholder="www.yourbusiness.in"
              defaultValue={s.business.websiteUrl ?? ""}
              className="st-field-input"
              style={{ minHeight: 44, padding: "8px 12px", borderRadius: 12, border: "1px solid var(--d-line)", background: "var(--d-card)", color: "var(--d-ink)", font: "inherit" }}
            />
          </ActionForm>
        </div>
      </div>
      <div className="st-actions">
        <Link href="/app/start?step=keywords" className="dash-btn ghost">Back</Link>
        <Link href="/app/start?step=connections" className="dash-btn lime">
          {s.done.website ? "Continue" : "Skip for now"} <Icon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  );
}

function ConnectionsStep({ listings, google, facebook }: { listings: string[]; google: boolean; facebook: boolean }) {
  const linked = listingStatus(listings).filter((l) => l.url);
  const oauth = [
    { key: "google" as const, label: "Google Business Profile", on: google },
    { key: "facebook" as const, label: "Facebook & Instagram", on: facebook },
  ].filter((p) => p.on || providerConfigured(p.key));
  return (
    <section className="st-card" aria-labelledby="st-title">
      <h1 id="st-title">Connect your profiles</h1>
      <p className="pf-sub">
        AI answers trust businesses that show up the same way everywhere. Link the profiles you already have; Foundly keeps them consistent.
      </p>
      {oauth.length > 0 && (
        <div className="st-choice">
          {oauth.map((p) => (
            <div key={p.key} className={`st-option ${p.on ? "selected" : ""}`}>
              <h2>{p.label}</h2>
              {p.on ? (
                <p>Connected. Foundly keeps it updated.</p>
              ) : (
                <a className="dash-btn ghost" href={`/api/connect/${p.key}/start`}>Log in and connect <Icon name="arrow" size={15} /></a>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="st-field">
        <AddListingForm platform="Google, Justdial, Instagram or Facebook" />
      </div>
      {linked.length > 0 && (
        <ul className="st-summary">
          {linked.map((l) => (
            <li key={l.key}>
              <span className="tick" aria-hidden="true">✓</span>
              {l.label}
            </li>
          ))}
        </ul>
      )}
      <p className="pf-sub" style={{ marginTop: 14 }}>
        No profiles yet? <Link href="/app/connections" className="font-semibold underline">See where to create them</Link>, with text ready to paste.
      </p>
      <div className="st-actions">
        <Link href="/app/start?step=website" className="dash-btn ghost">Back</Link>
        <Link href="/app/start?step=start" className="dash-btn lime">
          {linked.length || google || facebook ? "Continue" : "Skip for now"} <Icon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  );
}

function StartStep({ s }: { s: Status }) {
  const rows: [boolean, string][] = [
    [s.done.keywords, s.keywords.length ? `${s.keywords.length} keyword${s.keywords.length === 1 ? "" : "s"} to track` : "No keywords yet"],
    [s.done.website, s.website === "foundly" ? "Foundly website is live" : s.website === "own" ? "Your website is connected" : "No website connected"],
    [s.done.connections, s.linked || s.google || s.facebook ? `${s.linked} profile${s.linked === 1 ? "" : "s"} linked` : "No profiles linked"],
  ];
  return (
    <section className="st-card" aria-labelledby="st-title">
      <h1 id="st-title">{s.started ? "Tracking is on" : "Ready to start"}</h1>
      <p className="pf-sub">
        {s.started
          ? "Foundly checks your keywords on a schedule. Your results are on the Performance page."
          : "We'll ask AI assistants about each keyword now, then keep checking on your plan's schedule, and check your website for quick fixes."}
      </p>
      <ul className="st-summary">
        {rows.map(([ok, text]) => (
          <li key={text}>
            <span className={`tick ${ok ? "" : "no"}`} aria-hidden="true">{ok ? "✓" : "–"}</span>
            {text}
          </li>
        ))}
      </ul>
      {s.engines === 0 && (
        <p className="pf-note warn" style={{ marginTop: 16 }}>
          AI answer checks are being switched on for your account. Your setup is saved and the first check starts automatically. Your website
          check and fixes start right away.
        </p>
      )}
      {!s.done.keywords ? (
        <div className="st-actions">
          <Link href="/app/start?step=keywords" className="dash-btn lime">Add keywords first <Icon name="arrow" size={16} /></Link>
        </div>
      ) : s.started ? (
        <div className="st-actions">
          <Link href="/app" className="dash-btn lime">See performance <Icon name="arrow" size={16} /></Link>
        </div>
      ) : (
        <div className="st-actions">
          <Link href="/app/start?step=connections" className="dash-btn ghost">Back</Link>
          <ActionForm action={startAction} submitLabel="Start tracking" pendingLabel="Starting…" className="" />
        </div>
      )}
    </section>
  );
}
