import { randomUUID } from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { listActions } from "@/server/audit/service";
import { requireCurrentBusiness } from "@/server/current";
import { readinessFor } from "@/server/geo";
import { enabledAdapters } from "@/server/monitoring/registry";
import { performanceFor } from "@/server/performance";
import { checkNowAction } from "./keywords/actions";
import { Mini, ShareBars, StatusBadge, TrendChart } from "./perf-parts";
import "./perf.css";

export const metadata = { title: "Performance" };

const OPEN = new Set(["detected", "proposed", "owner_edited", "approved", "queued"]);
const PERIODS = [7, 30, 90];

const STARTED_NOTE: Record<string, { tone: "ok" | "warn"; text: string }> = {
  running: { tone: "ok", text: "Tracking is on. Your first check is running — results appear here in a few minutes." },
  busy: { tone: "ok", text: "Tracking is on. A check is already running." },
  no_engines: { tone: "warn", text: "Tracking is on. AI answer checks are being switched on for your account; your first results will appear here automatically." },
  no_credits: { tone: "warn", text: "Tracking is on, but there aren't enough credits for a check right now. See your plan in Settings." },
};

export default async function PerformancePage({ searchParams }: { searchParams: Promise<{ days?: string; started?: string }> }) {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireCurrentBusiness(db, ctx);
  if (!business.monitoringStartedAt) redirect("/app/start");
  const sp = await searchParams;
  const days = PERIODS.includes(Number(sp.days)) ? Number(sp.days) : 30;
  const [p, actions, readiness] = await Promise.all([performanceFor(db, ctx, days), listActions(db, ctx), readinessFor(db, ctx, business)]);
  const weekLeads = p.leadsThisWeek;

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
    <div className="dash pf">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-eyebrow">Performance</span>
          <h1>{business.name}</h1>
          <p>How often AI assistants recommend you · last {days} days</p>
        </div>
        <div className="dash-hero-actions">
          <nav aria-label="Period" className="pf-row">
            {PERIODS.map((d) => (
              <Link key={d} href={`/app?days=${d}`} className={`dash-btn ghost${d === days ? " is-active" : ""}`} aria-current={d === days ? "page" : undefined} style={d === days ? { borderColor: "var(--d-ink)" } : undefined}>
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

      {note && <p className={`pf-note ${note.tone}`} role="status">{note.text}</p>}

      {p.answers === 0 ? (
        <section className="dash-panel pf-empty" aria-labelledby="pf-wait">
          {running ? <div className="pf-pulse" aria-hidden="true" /> : <Icon name="visibility" size={34} />}
          <h2 id="pf-wait">{running ? "Asking AI assistants about your keywords…" : "No AI answers in this period yet"}</h2>
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
          <section className="pf-kpis" aria-label="Key numbers">
            <div className="pf-kpi hero">
              <span className="pf-kpi-label"><Icon name="visibility" size={16} /> AI visibility</span>
              <strong className="pf-kpi-value">{p.score ?? 0}<small>%</small></strong>
              <span className="pf-kpi-note">Recommended in {p.named} of {p.answers} AI answers{p.smallSample ? " · early data" : ""}</span>
              <span className="pf-meter" aria-hidden="true"><span style={{ width: `${p.score ?? 0}%` }} /></span>
            </div>
            <div className="pf-kpi">
              <span className="pf-kpi-label">Keywords you win</span>
              <strong className="pf-kpi-value">{won}<small>/{checked || p.keywords.length}</small></strong>
              <span className="pf-kpi-note">AI names you in at least half the answers</span>
            </div>
            <div className="pf-kpi">
              <span className="pf-kpi-label">Average position</span>
              <strong className="pf-kpi-value">{p.avgPosition ? <>#{p.avgPosition}</> : "—"}</strong>
              <span className="pf-kpi-note">{p.avgPosition ? "Where you appear when AI lists options" : "Not in any list yet"}</span>
            </div>
            <div className="pf-kpi">
              <span className="pf-kpi-label">Links to your site</span>
              <strong className="pf-kpi-value">{p.citedRate ?? 0}<small>%</small></strong>
              <span className="pf-kpi-note">Answers that cite your website as a source</span>
            </div>
          </section>

          <div className="pf-two">
            <section className="dash-panel pf-panel" aria-labelledby="pf-trend">
              <div className="pf-row between">
                <div>
                  <h2 id="pf-trend">Visibility over time</h2>
                  <p className="pf-sub">Share of answers that recommend you, per check</p>
                </div>
              </div>
              <TrendChart points={p.trend} />
              <div className="pf-engines" aria-label="By AI assistant">
                {p.engines.map((e) => (
                  <span key={e.key} className="pf-engine">
                    {e.label} <strong>{e.rate === null ? "—" : `${e.rate}%`}</strong>
                  </span>
                ))}
              </div>
            </section>
            <section className="dash-panel pf-panel" aria-labelledby="pf-share">
              <div className="pf-row between">
                <div>
                  <h2 id="pf-share">You vs competitors</h2>
                  <p className="pf-sub">Share of AI recommendations</p>
                </div>
                <Link href="/app/keywords#competitors" className="pf-sub">Edit</Link>
              </div>
              {p.share.length > 1 ? (
                <ShareBars share={p.share} />
              ) : (
                <p className="pf-sub" style={{ marginTop: 14 }}>
                  <Link href="/app/keywords#competitors" className="font-semibold underline">Add competitors</Link> to see who AI recommends instead of you.
                </p>
              )}
            </section>
          </div>
        </>
      )}

      <section className="dash-panel pf-panel" aria-labelledby="pf-kw">
        <div className="pf-row between">
          <div>
            <h2 id="pf-kw">Your keywords</h2>
            <p className="pf-sub">Latest answer for each keyword, across every AI assistant</p>
          </div>
          <Link href="/app/keywords" className="dash-btn ghost">Manage keywords <Icon name="arrow" size={15} /></Link>
        </div>
        <div className="pf-table-wrap">
          <table className="pf-table">
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
                    <Link href={`/app/keywords/${k.id}`} className="pf-kw">{k.keyword}</Link>
                  </td>
                  <td><StatusBadge status={k.status} /></td>
                  <td>
                    {k.rate === null ? <span className="pf-muted">—</span> : <><Mini rate={k.rate} />{k.rate}% <span className="pf-muted">of {k.answers}</span></>}
                  </td>
                  <td>{k.rivals.length ? k.rivals.join(", ") : <span className="pf-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {p.keywords.length > 8 && <p className="pf-sub" style={{ marginTop: 8 }}><Link href="/app/keywords" className="underline">See all {p.keywords.length} keywords</Link></p>}
      </section>

      <div className="pf-two">
        <section className="dash-panel pf-panel" aria-labelledby="pf-fix">
          <div className="pf-row between">
            <div>
              <h2 id="pf-fix">Next fixes</h2>
              <p className="pf-sub">The changes most likely to get you recommended</p>
            </div>
            <Link href="/app/improve" className="pf-sub">All fixes</Link>
          </div>
          {fixes.length === 0 ? (
            <p className="pf-sub" style={{ marginTop: 12 }}>Nothing to fix right now. We&apos;ll suggest more after the next check.</p>
          ) : (
            <div style={{ marginTop: 6 }}>
              {fixes.map((f, i) => (
                <Link key={f.title} href={f.href} className="pf-fix">
                  <span className="pf-fix-n">{i + 1}</span>
                  <span>
                    <strong>{f.title}</strong>
                    <span className="pf-why">{f.why}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
        <div className="pf" style={{ gap: 14 }}>
          {p.sources.length > 0 && (
            <section className="dash-panel pf-panel" aria-labelledby="pf-src">
              <h2 id="pf-src">Sites AI reads</h2>
              <p className="pf-sub">Sources cited in answers about your keywords</p>
              <ul className="pf-list">
                {p.sources.map((s) => (
                  <li key={s.host}>
                    <span className={s.own ? "own" : undefined}>{s.host === "your website" ? "Your website" : s.host}{s.own && s.host !== "your website" ? " (your site)" : ""}</span>
                    <span className="pf-muted">{s.count} answer{s.count === 1 ? "" : "s"}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <Link href="/app/leads" className="dash-kpi">
            <span className="dash-kpi-label">Enquiries <em>7 days</em></span>
            <strong className="dash-kpi-value">{weekLeads}</strong>
            <span className="dash-kpi-detail">From your website&apos;s contact form</span>
            <span className="dash-kpi-link">Open enquiries <Icon name="arrow" size={14} /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
