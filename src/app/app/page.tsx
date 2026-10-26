import { randomUUID } from "node:crypto";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { listActions } from "@/server/audit/service";
import { requireCurrentBusiness } from "@/server/current";
import { readinessFor } from "@/server/geo";
import { enabledAdapters } from "@/server/monitoring/registry";
import { performanceFor } from "@/server/insights";
import { setupSteps, socialStatus } from "@/server/performance";
import { latestWebsiteRequest, OPEN_STATUSES } from "@/server/website-requests";
import { CoverageChart } from "./coverage-chart";
import { checkNowAction } from "./keywords/actions";
import { brandSlots, Mini, RankingTable } from "./overview-parts";
import "./overview.css";

export const metadata = { title: "Overview" };

const OPEN = new Set(["detected", "proposed", "owner_edited", "approved", "queued"]);
const PERIODS = [7, 14, 30, 90];

// Set by the last setup step: "1" when the first check started, "later" when it couldn't yet.
const STARTED_NOTE: Record<string, { tone: "ok" | "warn"; text: string }> = {
  "1": { tone: "ok", text: "Tracking is on. Your first check is running — results appear here in a few minutes." },
  later: { tone: "warn", text: "Tracking is on. AI answer checks are being switched on for your account; your first results will appear here automatically." },
};

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ days?: string; started?: string; engine?: string }> }) {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireCurrentBusiness(db, ctx);
  const sp = await searchParams;
  const days = PERIODS.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const engine = sp.engine && /^[a-z]+$/.test(sp.engine) ? sp.engine : undefined;
  const href = (next: { days?: number; engine?: string | null }) => {
    const q = new URLSearchParams();
    const d = next.days ?? days;
    const e = next.engine === undefined ? engine : next.engine;
    if (d !== 30) q.set("days", String(d));
    if (e) q.set("engine", e);
    return q.size ? `/app?${q}` : "/app";
  };
  const [p, actions, readiness, social, request] = await Promise.all([
    performanceFor(db, ctx, days, engine),
    listActions(db, ctx),
    readinessFor(db, ctx, business),
    socialStatus(db, ctx, business),
    latestWebsiteRequest(db, ctx),
  ]);
  const requested = !business.hasWebsite && !!request && (OPEN_STATUSES as readonly string[]).includes(request.status);
  const todo = setupSteps({ keywords: p.keywords.length, business, websiteRequested: requested, social, trackingStarted: true }).steps.filter((s) => !s.done);
  const fixes = [
    ...actions.filter((a) => OPEN.has(a.status)).map((a) => ({ title: a.title, why: a.hypothesis, href: "/app/improve" })),
    ...readiness.items.filter((i) => !i.done).map((i) => ({ title: i.label, why: i.why, href: i.href })),
  ].slice(0, 3);

  const slots = brandSlots(p.brandSeries.series);
  // The business plus up to four competitors with the most mentions; the full list is in the ranking.
  const chartSeries = [
    ...p.brandSeries.series.filter((s) => s.self),
    ...p.brandSeries.series
      .filter((s) => !s.self)
      .sort((a, b) => b.values.reduce((n, v) => n + v, 0) - a.values.reduce((n, v) => n + v, 0))
      .slice(0, 4),
  ].map((s) => ({ ...s, slot: slots.get(s.key) ?? 0 }));
  const me = p.ranking.find((b) => b.self);
  const running = p.lastRun && (p.lastRun.status === "queued" || p.lastRun.status === "running");
  const note = sp.started ? STARTED_NOTE[sp.started] : undefined;
  const canCheck = enabledAdapters().length > 0;
  const engineLabel = engine ? (p.engines.find((e) => e.key === engine)?.label ?? engine) : null;

  return (
    <div className="dash ov">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-eyebrow">Overview</span>
          <h1>{business.name}</h1>
          <p>Your brand in AI answers{engineLabel ? ` · ${engineLabel}` : " · all assistants"} · last {days} days</p>
        </div>
        <div className="dash-hero-actions">
          {canCheck && (
            <ActionForm action={checkNowAction} submitLabel={running ? "Checking…" : "Check now"} pendingLabel="Starting…" variant="secondary" className="">
              <input type="hidden" name="requestId" value={randomUUID()} />
            </ActionForm>
          )}
          <a href={`/app/keywords/export?days=${days}`} className="dash-btn ghost" download>Export</a>
        </div>
      </header>

      <div className="ov-filters" role="group" aria-label="Filters">
        <nav aria-label="Period" className="ov-seg">
          {PERIODS.map((d) => (
            <Link key={d} href={href({ days: d })} aria-current={d === days ? "page" : undefined}>
              {d === 7 ? "7 days" : d === 14 ? "14 days" : d === 30 ? "30 days" : "90 days"}
            </Link>
          ))}
        </nav>
        {p.engines.length > 0 && (
          <nav aria-label="AI assistant" className="ov-seg">
            <Link href={href({ engine: null })} aria-current={!engine ? "page" : undefined}>All</Link>
            {p.engines.map((e) => (
              <Link key={e.key} href={href({ engine: e.key })} aria-current={engine === e.key ? "page" : undefined}>
                {e.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {note && <p className={`ov-note ${note.tone}`} role="status">{note.text}</p>}
      {todo.length > 0 && (
        <p className="ov-note" role="note">
          Finish setting up to be recommended more often:{" "}
          {todo.map((s, i) => (
            <span key={s.key}>
              {i > 0 && " · "}
              <Link href={s.href} className="font-semibold underline">{s.label}</Link>
            </span>
          ))}
        </p>
      )}

      {p.answers === 0 ? (
        <section className="dash-panel ov-empty" aria-labelledby="ov-wait">
          {running ? <div className="ov-pulse" aria-hidden="true" /> : <Icon name="visibility" size={34} />}
          <h2 id="ov-wait">{running ? "Asking AI assistants about your keywords…" : "No AI answers in this period yet"}</h2>
          <p>
            {running
              ? `We're asking every connected assistant about your ${p.keywords.length} keyword${p.keywords.length === 1 ? "" : "s"}. Refresh in a few minutes.`
              : canCheck
                ? "Run a check to see whether AI assistants recommend you, or pick a longer period."
                : "Your keywords are saved. Results appear here as soon as the first check finishes. Meanwhile, the fixes below raise your chances."}
          </p>
          <p style={{ marginTop: 12 }}>
            <Link href="/app/keywords" className="font-semibold underline">Review your keywords</Link>
          </p>
        </section>
      ) : (
        <>
          <section className="ov-kpis six" aria-label="Key numbers">
            <div className="ov-kpi hero">
              <span className="ov-kpi-label"><Icon name="visibility" size={16} /> Brand mentions</span>
              <strong className="ov-kpi-value">{p.named}</strong>
              <span className="ov-kpi-note">of {p.answers} AI answers{p.smallSample ? " · early data" : ""}</span>
            </div>
            <div className="ov-kpi">
              <span className="ov-kpi-label">Coverage</span>
              <strong className="ov-kpi-value">{p.score ?? 0}<small>%</small></strong>
              <span className="ov-kpi-note">Answers that name you</span>
              <span className="ov-meter" aria-hidden="true"><span style={{ width: `${p.score ?? 0}%` }} /></span>
            </div>
            <div className="ov-kpi">
              <span className="ov-kpi-label">Share of voice</span>
              <strong className="ov-kpi-value">{me?.share ?? 0}<small>%</small></strong>
              <span className="ov-kpi-note">Your part of all brand mentions</span>
            </div>
            <div className="ov-kpi">
              <span className="ov-kpi-label">Avg. position</span>
              <strong className="ov-kpi-value">{p.avgPosition ? <>#{p.avgPosition}</> : "—"}</strong>
              <span className="ov-kpi-note">{p.avgPosition ? "When AI lists options" : "Not in a list yet"}</span>
            </div>
            <div className="ov-kpi">
              <span className="ov-kpi-label">Cited your site</span>
              <strong className="ov-kpi-value">{p.citedRate ?? 0}<small>%</small></strong>
              <span className="ov-kpi-note">Answers linking to your website</span>
            </div>
            <div className="ov-kpi">
              <span className="ov-kpi-label">Positive tone <em className="ov-est">est.</em></span>
              <strong className="ov-kpi-value">{p.tone.positiveRate ?? "—"}{p.tone.positiveRate !== null && <small>%</small>}</strong>
              <span className="ov-kpi-note">{p.named ? `${p.tone.negative} negative mention${p.tone.negative === 1 ? "" : "s"}` : "Once AI names you"}</span>
            </div>
          </section>

          <section className="dash-panel ov-panel" aria-labelledby="ov-cov">
            <div className="ov-row between">
              <div>
                <h2 id="ov-cov">Brand coverage over time</h2>
                <p className="ov-sub">Share of AI answers that name each brand, per check</p>
              </div>
              <Link href="/app/competitors" className="ov-sub">Competitors</Link>
            </div>
            <CoverageChart points={p.brandSeries.points.map((d) => d.toISOString())} series={chartSeries} />
          </section>

          <section className="dash-panel ov-panel" aria-labelledby="ov-rank">
            <div className="ov-row between">
              <div>
                <h2 id="ov-rank">Brand ranking</h2>
                <p className="ov-sub">Who AI recommends most for your keywords</p>
              </div>
              <Link href="/app/competitors" className="ov-sub">Manage</Link>
            </div>
            {p.ranking.length > 1 ? (
              <RankingTable ranking={p.ranking} slots={slots} />
            ) : (
              <p className="ov-sub" style={{ marginTop: 12 }}>
                <Link href="/app/competitors" className="font-semibold underline">Add competitors</Link> to rank yourself against them.
              </p>
            )}
          </section>
          <div className="ov-two">
            <section className="dash-panel ov-panel" aria-labelledby="ov-eng">
              <h2 id="ov-eng">By AI assistant</h2>
              <p className="ov-sub">Coverage on each assistant</p>
              <ul className="ov-engine-bars">
                {p.engines.map((e) => (
                  <li key={e.key}>
                    <div className="ov-bar-top">
                      <Link href={href({ engine: e.key })} className="ov-link">{e.label}</Link>
                      <span>{e.rate === null ? "—" : `${e.rate}%`}</span>
                    </div>
                    <div className="ov-bar" role="presentation">
                      <span style={{ width: `${e.rate ?? 0}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section className="dash-panel ov-panel" aria-labelledby="ov-src">
              <div className="ov-row between">
                <h2 id="ov-src">Top cited domains</h2>
                <Link href={`/app/sources?days=${days}`} className="ov-sub">All citations</Link>
              </div>
              <p className="ov-sub">Sites AI reads to answer your keywords</p>
              {p.sources.length === 0 ? (
                <p className="ov-sub" style={{ marginTop: 12 }}>No sources cited yet.</p>
              ) : (
                <ul className="ov-list">
                  {p.sources.map((s) => (
                    <li key={s.host}>
                      <span className={s.own ? "own" : undefined}>{s.host}{s.own ? " (your site)" : ""}</span>
                      <span className="ov-muted"><Mini rate={p.answers ? Math.round((s.count / p.answers) * 100) : 0} />{s.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <section className="dash-panel ov-panel" aria-labelledby="ov-gaps">
            <h2 id="ov-gaps">Where competitors beat you</h2>
            <p className="ov-sub">AI recommended a competitor and left you out</p>
            {p.gaps.length === 0 ? (
              <p className="ov-sub" style={{ marginTop: 12 }}>No gaps in this period. Nice.</p>
            ) : (
              <ul className="ov-list">
                {p.gaps.slice(0, 6).map((g) => (
                  <li key={g.id}>
                    <span>
                      <Link href={`/app/keywords/${g.id}`} className="ov-link"><strong>{g.keyword}</strong></Link>
                      <span className="ov-q">
                        {g.rivals.join(", ")} on {g.engines.join(", ")}
                        {g.sources.length > 0 && <> · read {g.sources.join(", ")}</>}
                      </span>
                    </span>
                    <Link href={`/app/keywords/${g.id}`} className="ov-sub" aria-label={`See answers for ${g.keyword}`}>
                      <Icon name="arrow" size={15} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section className="dash-panel ov-panel" aria-labelledby="ov-fix">
        <div className="ov-row between">
          <div>
            <h2 id="ov-fix">Recommendations</h2>
            <p className="ov-sub">The changes most likely to get you recommended</p>
          </div>
          <Link href="/app/improve" className="ov-sub">All recommendations</Link>
        </div>
        {fixes.length === 0 ? (
          <p className="ov-sub" style={{ marginTop: 12 }}>Nothing to fix right now. We&apos;ll suggest more after the next check.</p>
        ) : (
          <div style={{ marginTop: 6 }}>
            {fixes.map((f, i) => (
              <Link key={f.title} href={f.href} className="ov-fix">
                <span className="ov-fix-n">{i + 1}</span>
                <span>
                  <strong>{f.title}</strong>
                  <span className="ov-why">{f.why}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
