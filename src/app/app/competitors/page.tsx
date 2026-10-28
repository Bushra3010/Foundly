import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { performanceFor } from "@/server/insights";
import { listCompetitors } from "@/server/monitoring/service";
import { requireCurrentBusiness } from "@/server/current";
import { saveBrandAction } from "../visibility/actions";
import { addRivalAction, removeRivalAction } from "../keywords/actions";
import { brandSlots, RankingTable, Swatch } from "../overview-parts";
import "../overview.css";

export const metadata = { title: "Competitors" };

const PERIODS = [7, 14, 30, 90];

export default async function CompetitorsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = PERIODS.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const ctx = await requireCtx();
  const db = await getDb();
  const [p, rivals, business] = await Promise.all([performanceFor(db, ctx, days), listCompetitors(db, ctx), requireCurrentBusiness(db, ctx)]);
  const slots = brandSlots(p.brandSeries.series);

  return (
    <div className="dash ov">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-eyebrow">Competitors</span>
          <h1>Who AI recommends</h1>
          <p>Your brand ranked against the competitors you track · last {days} days</p>
        </div>
        <div className="dash-hero-actions">
          <nav aria-label="Period" className="ov-seg">
            {PERIODS.map((d) => (
              <Link key={d} href={d === 30 ? "/app/competitors" : `/app/competitors?days=${d}`} aria-current={d === days ? "page" : undefined}>
                {d} days
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="dash-panel ov-panel" aria-labelledby="cp-rank">
        <h2 id="cp-rank">Brand ranking</h2>
        <p className="ov-sub">Mentions, share of voice, coverage, position and tone for every tracked brand</p>
        {p.answers === 0 ? (
          <p className="ov-sub" style={{ marginTop: 12 }}>Rankings appear after your first AI check.</p>
        ) : (
          <RankingTable ranking={p.ranking} slots={slots} />
        )}
      </section>

      <section className="dash-panel ov-panel" aria-labelledby="cp-brand">
        <h2 id="cp-brand">Your brand</h2>
        <p className="ov-sub">AI assistants don&apos;t always write your name the same way. Add the variations and the domains that are yours, so every mention and link counts.</p>
        <ActionForm action={saveBrandAction} submitLabel="Save" pendingLabel="Saving…" variant="secondary" inline>
          <div className="st-field" style={{ marginTop: 10, flex: "1 1 260px" }}>
            <label htmlFor="aliases">Name variations</label>
            <input id="aliases" name="aliases" placeholder={`e.g. ${business.name.split(" ")[0]}, ${business.name.replace(/\s+/g, "")}`} defaultValue={business.aliases.join(", ")} />
          </div>
          <div className="st-field" style={{ marginTop: 10, flex: "1 1 260px" }}>
            <label htmlFor="domains">Your domains</label>
            <input id="domains" name="domains" placeholder="yourbusiness.in, yourbusiness.com" defaultValue={business.ownedDomains.join(", ")} />
          </div>
        </ActionForm>
        <p className="ov-sub" style={{ marginTop: 8 }}>Tracking as <strong>{business.name}</strong>{business.websiteUrl ? ` · ${business.websiteUrl.replace(/^https?:\/\//, "")}` : ""}. Comma separated.</p>
      </section>

      <section className="dash-panel ov-panel" aria-labelledby="cp-list">
        <h2 id="cp-list">Tracked competitors</h2>
        <p className="ov-sub">We look for these names and websites in every AI answer about your keywords. Up to 10.</p>
        {rivals.length > 0 && (
          <ul className="ov-list">
            {rivals.map((r) => (
              <li key={r.id}>
                <span className="ov-row" style={{ gap: 8, flexWrap: "nowrap" }}>
                  <Swatch slot={slots.get(r.id) ?? 0} />
                  <strong>{r.name}</strong>
                  {r.domains[0] && <span className="ov-muted">· {r.domains[0]}</span>}
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
        {p.gaps.length > 0 && (
          <p className="ov-note" style={{ marginTop: 14 }}>
            Not tracking someone AI keeps naming? Open a keyword from <Link href="/app#ov-gaps" className="underline">Where competitors beat you</Link> to see every business it mentioned.
          </p>
        )}
      </section>

      <p className="ov-sub">
        Head-to-head with one competitor, including their website checks: <Link href="/app/compare" className="underline">Compare <Icon name="arrow" size={12} /></Link>
      </p>
    </div>
  );
}
