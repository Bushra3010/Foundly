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
import { checkNowAction } from "./keywords/actions";
import { Mini, ShareBars, StatusBadge, TrendChart } from "./overview-parts";
import "./overview.css";

export const metadata = { title: "Performance" };

const OPEN = new Set(["detected", "proposed", "owner_edited", "approved", "queued"]);
const PERIODS = [7, 30, 90];

// Set by the last setup step: "1" when the first check started, "later" when it couldn't yet.
const STARTED_NOTE: Record<string, { tone: "ok" | "warn"; text: string }> = {
  "1": { tone: "ok", text: "Tracking is on. Your first check is running — results appear here in a few minutes." },
  later: { tone: "warn", text: "Tracking is on. AI answer checks are being switched on for your account; your first results will appear here automatically." },
};

export default async function PerformancePage({ searchParams }: { searchParams: Promise<{ days?: string; started?: string; engine?: string }> }) {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireCurrentBusiness(db, ctx);
  const sp = await searchParams;
  const days = PERIODS.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const engine = sp.engine && /^[a-z]+$/.test(sp.engine) ? sp.engine : undefined;
  const qs = (next: { days?: number; engine?: string | null }) => {
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
  const setup = setupSteps({ keywords: p.keywords.length, business, websiteRequested: requested, social, trackingStarted: true });
  const todo = setup.steps.filter((s) => !s.done);

  const fixes = [
    ...actions.filter((a) => OPEN.has(a.status)).map((a) => ({ title: a.title, why: a.hypothesis, href: "/app/improve" })),
    ...readiness.items.filter((i) => !i.done).map((i) => ({ title: i.label, why: i.why, href: i.href })),
  ].slice(0, 3);
  const won = p.keywords.filter((k) => k.status === "won").length;
  const checked = p.keywords.filter((k) => k.status !== "pending").length;
  const running = p.lastRun && (p.lastRun.status === "queued" || p.lastRun.status === "running");
  const note = sp.started ? STARTED_NOTE[sp.started] : undefined;
  const engineNames = p.engines.length ? p.engines.map((e) => e.label).join(", ") : "ChatGPT, Gemini, Perplexity and Claude";
  const canCheck = enabledAdapters().length > 0;

  return (
    <div className="dash ov">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-eyebrow">Performance</span>
          <h1>{business.name}</h1>
          <p>How often AI assistants recommend you · last {days} days{engine ? ` · ${p.engines.find((e) => e.key === engine)?.label ?? engine} only` : ""}</p>
        </div>
        <div className="dash-hero-actions">
          <nav aria-label="Period" className="ov-row">
            {PERIODS.map((d) => (
              <Link key={d} href={qs({ days: d })} className={`dash-btn ghost${d === days ? " is-active" : ""}`} aria-current={d === days ? "page" : undefined} style={d === days ? { borderColor: "var(--d-ink)" } : undefined}>
                {d} days
              </Link>
            ))}
          </nav>
          {canCheck && (
            <ActionForm action={checkNowAction} submitLabel={running ? "Checking…" : "Check now"} pendingLabel="Starting…" variant="secondary" className="">
              <input type="hidden" name="requestId" value={randomUUID()} />
            </ActionForm>
          )}
        </div>
      </header>

      {p.engines.length > 1 && (
        <nav aria-label="AI assistant" className="ov-filter">
          <Link href={qs({ engine: null })} aria-current={!engine ? "page" : undefined}>All assistants</Link>
          {p.engines.map((e) => (
            <Link key={e.key} href={qs({ engine: e.key })} aria-current={engine === e.key ? "page" : undefined}>
              {e.label} <span>{e.rate === null ? "—" : `${e.rate}%`}</span>
            </Link>
          ))}
        </nav>
      )}
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
              ? `We're asking ${engineNames} about your ${p.keywords.length} keyword${p.keywords.length === 1 ? "" : "s"}. Refresh in a few minutes.`
              : canCheck
                ? "Run a check to see whether AI assistants recommend you, or pick a longer period."
                : "Your keywords are saved. Results appear here as soon as the first check finishes. Meanwhile, the fixes below raise your chances."}
          </p>
        </section>
      ) : (
        <>
          <section className="ov-kpis" aria-label="Key numbers">
            <div className="ov-kpi hero">
              <span className="ov-kpi-label"><Icon name="visibility" size={16} /> AI visibility</span>
              <strong className="ov-kpi-value">{p.score ?? 0}<small>%</small></strong>
              <span className="ov-kpi-note">Recommended in {p.named} of {p.answers} AI answers{p.smallSample ? " · early data" : ""}</span>
              <span className="ov-meter" aria-hidden="true"><span style={{ width: `${p.score ?? 0}%` }} /></span>
            </div>
            <div className="ov-kpi">
              <span className="ov-kpi-label">Keywords you win</span>
              <strong className="ov-kpi-value">{won}<small>/{checked || p.keywords.length}</small></strong>
              <span className="ov-kpi-note">AI names you in at least half the answers</span>
            </div>
            <div className="ov-kpi">
              <span className="ov-kpi-label">Average position</span>
              <strong className="ov-kpi-value">{p.avgPosition ? <>#{p.avgPosition}</> : "—"}</strong>
              <span className="ov-kpi-note">{p.avgPosition ? "Where you appear when AI lists options" : "Not in any list yet"}</span>
            </div>
            <div className="ov-kpi">
              <span className="ov-kpi-label">Links to your site</span>
              <strong className="ov-kpi-value">{p.citedRate ?? 0}<small>%</small></strong>
              <span className="ov-kpi-note">Answers that cite your website as a source</span>
            </div>
            <div className="ov-kpi">
              <span className="ov-kpi-label">Positive tone <em className="ov-est">estimated</em></span>
              <strong className="ov-kpi-value">{p.tone.positiveRate ?? "—"}{p.tone.positiveRate !== null && <small>%</small>}</strong>
              <span className="ov-kpi-note">
                {p.named ? `${p.tone.positive} positive · ${p.tone.neutral} neutral · ${p.tone.negative} negative` : "Shown once AI names you"}
              </span>
            </div>
          </section>

          <div className="ov-two">
            <section className="dash-panel ov-panel" aria-labelledby="ov-trend">
              <div className="ov-row between">
                <div>
                  <h2 id="ov-trend">Visibility over time</h2>
                  <p className="ov-sub">Share of answers that recommend you, per check</p>
                </div>
              </div>
              <TrendChart points={p.trend} />
            </section>
            <section className="dash-panel ov-panel" aria-labelledby="ov-share">
              <div className="ov-row between">
                <div>
                  <h2 id="ov-share">You vs competitors</h2>
                  <p className="ov-sub">Share of AI recommendations</p>
                </div>
                <Link href="/app/keywords#competitors" className="ov-sub">Edit</Link>
              </div>
              {p.share.length > 1 ? (
                <ShareBars share={p.share} />
              ) : (
                <p className="ov-sub" style={{ marginTop: 14 }}>
                  <Link href="/app/keywords#competitors" className="font-semibold underline">Add competitors</Link> to see who AI recommends instead of you.
                </p>
              )}
            </section>
          </div>
        </>
      )}

      <section className="dash-panel ov-panel" aria-labelledby="ov-kw">
        <div className="ov-row between">
          <div>
            <h2 id="ov-kw">Your keywords</h2>
            <p className="ov-sub">Latest answer for each keyword, across every AI assistant</p>
          </div>
          <div className="ov-row">
            <a href={`/app/keywords/export?days=${days}`} className="dash-btn ghost" download>Export CSV</a>
            <Link href="/app/keywords" className="dash-btn ghost">Manage keywords <Icon name="arrow" size={15} /></Link>
          </div>
        </div>
        <div className="ov-table-wrap">
          <table className="ov-table">
            <thead>
              <tr>
                <th scope="col">Keyword</th>
                <th scope="col">Result</th>
                <th scope="col">Recommended in</th>
                <th scope="col">Also named</th>
              </tr>
            </thead>
            <tbody>
              {p.keywords.slice(0, 8).map((k) => (
                <tr key={k.id}>
                  <td>
                    <Link href={`/app/keywords/${k.id}`} className="ov-kw">{k.keyword}</Link>
                  </td>
                  <td><StatusBadge status={k.status} /></td>
                  <td>
                    {k.rate === null ? <span className="ov-muted">—</span> : <><Mini rate={k.rate} />{k.rate}% <span className="ov-muted">of {k.answers}</span></>}
                  </td>
                  <td>{k.rivals.length ? k.rivals.join(", ") : <span className="ov-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {p.keywords.length > 8 && <p className="ov-sub" style={{ marginTop: 8 }}><Link href="/app/keywords" className="underline">See all {p.keywords.length} keywords</Link></p>}
      </section>

      {p.gaps.length > 0 && (
        <section className="dash-panel ov-panel" aria-labelledby="ov-gaps">
          <h2 id="ov-gaps">Where competitors beat you</h2>
          <p className="ov-sub">AI recommended a competitor here and left you out. Open a keyword to see the answer and the sites it trusted.</p>
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
        </section>
      )}

      <div className="ov-two">
        <section className="dash-panel ov-panel" aria-labelledby="ov-fix">
          <div className="ov-row between">
            <div>
              <h2 id="ov-fix">Next fixes</h2>
              <p className="ov-sub">The changes most likely to get you recommended</p>
            </div>
            <Link href="/app/improve" className="ov-sub">All fixes</Link>
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
        {p.sources.length > 0 ? (
          <section className="dash-panel ov-panel" aria-labelledby="ov-src">
            <div className="ov-row between">
              <h2 id="ov-src">Sites AI reads</h2>
              <Link href={`/app/sources?days=${days}`} className="ov-sub">See all</Link>
            </div>
            <p className="ov-sub">Sources cited in answers about your keywords</p>
            <ul className="ov-list">
              {p.sources.map((s) => (
                <li key={s.host}>
                  <span className={s.own ? "own" : undefined}>{s.host}{s.own ? " (your site)" : ""}</span>
                  <span className="ov-muted">{s.count} answer{s.count === 1 ? "" : "s"}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="dash-panel ov-panel" aria-labelledby="ov-src">
            <h2 id="ov-src">Sites AI reads</h2>
            <p className="ov-sub" style={{ marginTop: 8 }}>After your first check, the websites AI assistants cite for your keywords appear here.</p>
          </section>
        )}
      </div>
    </div>
  );
}
