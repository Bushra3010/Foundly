import { randomUUID } from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { AutoRefresh } from "@/components/auto-refresh";
import { Icon } from "@/components/icon";
import { Sparkline } from "@/components/sparkline";
import { TrendChart } from "@/components/trend-chart";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { can } from "@/server/context";
import { currentBusiness } from "@/server/current";
import { dashboardData } from "@/server/performance";
import { STATUS_TEXT } from "@/server/website-requests";
import { runCheckAction } from "./visibility/actions";

export const metadata = { title: "Dashboard" };

const pct = (r: number | null) => (r === null ? "—" : `${Math.round(r * 100)}%`);
const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const day = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ started?: string }> }) {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await currentBusiness(db, ctx);
  // New owners start with setup; the layout redirects too, but the page renders alongside it.
  if (!business?.onboardingCompletedAt) redirect("/onboarding");
  const d = await dashboardData(db, ctx, business);
  const { started } = await searchParams;
  const m = d.metrics;
  const canEdit = can(ctx, "editor");
  const hasResults = m.valid > 0;
  const socialOn = d.social.filter((s) => s.state !== "none").length;
  const failing = d.website.total - d.website.passed;

  // At most three next steps, most useful first.
  const insights: { title: string; body: string; href: string; cta: string }[] = [];
  if (!d.website.url && !d.website.requested)
    insights.push({ title: "Connect your website", body: "AI assistants cite websites. Connect yours, or ask our team to build one.", href: "/app/website", cta: "Connect" });
  const unseen = d.keywords.filter((k) => k.checked > 0 && k.mentioned === 0);
  if (unseen.length)
    insights.push({ title: `Not mentioned yet for “${unseen[0].text}”`, body: `${unseen.length} of your keywords don't bring you up yet. Clearer website content and more listings help.`, href: "/app/improve", cta: "See how" });
  if (d.website.url && d.website.total === 0 && !d.website.auditRunning)
    insights.push({ title: "Check your website", body: "See what AI assistants can read on your site, and what to fix.", href: "/app/improve", cta: "Check" });
  if (d.website.issues.length)
    insights.push({ title: `Fix ${failing} website issue${failing === 1 ? "" : "s"}`, body: d.website.issues[0].evidence, href: "/app/improve", cta: "Fix" });
  if (!d.social.some((s) => s.key === "google" && s.state !== "none"))
    insights.push({ title: "Connect your Google Business Profile", body: "Gemini and Google's AI answers read it first for local businesses.", href: "/app/presence", cta: "Connect" });
  if (socialOn > 0 && socialOn < d.social.length)
    insights.push({ title: "Add your other social accounts", body: "The same details in more places make AI assistants more confident about you.", href: "/app/presence", cta: "Add" });

  return (
    <div className="pf">
      <AutoRefresh active={d.running || d.website.auditRunning} />
      <header className="pf-head">
        <div>
          <p className="pf-eyebrow">Dashboard</p>
          <h1>{business.name}</h1>
          <p className="pf-sub">
            {d.lastRun ? `Last AI check ${day(d.lastRun.createdAt)}` : "No AI checks yet"} · {d.questions.length} keyword{d.questions.length === 1 ? "" : "s"}
          </p>
        </div>
        {d.running ? (
          <span className="pf-badge info"><span className="pf-pulse" aria-hidden="true" /> Checking now…</span>
        ) : (
          canEdit && d.sources > 0 && d.questions.length > 0 && (
            <ActionForm action={runCheckAction} submitLabel="Check now" pendingLabel="Starting…" inline>
              <input type="hidden" name="requestId" value={randomUUID()} />
            </ActionForm>
          )
        )}
      </header>

      {started && (
        <p className="pf-notice" role="status">
          <Icon name="check" size={16} />
          {started === "later"
            ? "Tracking is on. Our team is switching on the AI checks, and your first results will appear here."
            : "Tracking is on. Your first AI check is running, and results will appear here in a few minutes."}
        </p>
      )}

      {d.setup.done < d.setup.total && (
        <section className="pf-card pf-setup" aria-labelledby="setup-title">
          <div className="pf-card-head">
            <h2 id="setup-title">Finish setting up</h2>
            <span>{d.setup.done} of {d.setup.total} done</span>
          </div>
          <div className="pf-progress" aria-hidden="true"><span style={{ width: `${(d.setup.done / d.setup.total) * 100}%` }} /></div>
          <ol className="pf-steps">
            {d.setup.steps.map((s, i) => (
              <li key={s.key} className={s.done ? "done" : ""}>
                <Link href={s.href}>
                  <span className="pf-step-dot" aria-hidden="true">{s.done ? <Icon name="check" size={12} /> : i + 1}</span>
                  {s.label}
                  <span className="sr-only">{s.done ? " (done)" : " (to do)"}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="pf-status" aria-label="Connections">
        <Link href="/app/website" className="pf-chip">
          <Status on={!!d.website.url} wait={!!d.website.requested} />
          <span>
            <strong>Website</strong>
            <em>{d.website.url ? host(d.website.url) : d.website.requested ? STATUS_TEXT[d.website.requested.status] : "Not connected"}</em>
          </span>
        </Link>
        <Link href="/app/presence" className="pf-chip">
          <Status on={socialOn > 0} />
          <span>
            <strong>Social media</strong>
            <em>{socialOn ? `${socialOn} of ${d.social.length} connected` : "Not connected"}</em>
          </span>
        </Link>
        <Link href="/app/visibility" className="pf-chip">
          <Status on={d.sources > 0 && d.questions.length > 0} wait={d.sources === 0} />
          <span>
            <strong>AI tracking</strong>
            <em>{d.sources === 0 ? "Being switched on" : d.questions.length ? `On · ${d.sources} AI assistant${d.sources === 1 ? "" : "s"}` : "Add keywords"}</em>
          </span>
        </Link>
      </section>

      <section className="pf-kpis" aria-label="Performance">
        <div className="pf-kpi pf-kpi-main">
          <span className="pf-kpi-label">Overall score</span>
          <strong>{d.overall ?? "—"}{d.overall !== null && <em>/100</em>}</strong>
          <span className="pf-kpi-detail">{d.overall === null ? "After your first check" : "Average across your keywords and AI platforms"}</span>
        </div>
        <Kpi label="AI mentions" value={pct(m.mention.rate)} detail={hasResults ? `${m.mention.numerator} of ${m.mention.denominator} answers, last 30 days${m.smallSample ? " · small sample" : ""}` : "After your first check"} />
        <Kpi label="Cited as a source" value={pct(m.citation.rate)} detail={hasResults ? `${m.citation.numerator} of ${m.citation.denominator} answers link to you` : "After your first check"} />
        <Kpi label="Keywords tracked" value={`${d.questions.length}/${d.keywordLimit}`} detail={`${d.keywords.filter((k) => k.mentioned > 0).length} bring you up`} />
      </section>

      <section className="pf-card" aria-labelledby="scores-title">
        <div className="pf-card-head">
          <h2 id="scores-title">Keyword scores on each AI platform</h2>
          <Link href="/app/visibility">{d.questions.length < d.keywordLimit ? "Add keywords" : "Manage"} <Icon name="arrow" size={13} /></Link>
        </div>
        {d.keywords.length === 0 ? (
          <p className="pf-empty">No keywords yet. <Link href="/app/visibility">Add up to {d.keywordLimit} keywords</Link> to start tracking.</p>
        ) : (
          <div className="pf-scroll">
            <table className="pf-table pf-scores">
              <thead>
                <tr>
                  <th scope="col">Keyword</th>
                  {d.platforms.map((p) => <th key={p.key} scope="col">{p.name}</th>)}
                  <th scope="col">Overall</th>
                  <th scope="col">Trend</th>
                </tr>
              </thead>
              <tbody>
                {d.keywords.map((k) => (
                  <tr key={k.id}>
                    <th scope="row">
                      {k.text}
                      <span>{k.lastChecked ? `Checked ${day(k.lastChecked)}` : "Not checked yet"}</span>
                    </th>
                    {d.platforms.map((p) => (
                      <td key={p.key}><Score value={k.scores[p.key]} off={!p.on} position={k.position[p.key]} /></td>
                    ))}
                    <td><Score value={k.overall} strong /></td>
                    <td><Sparkline values={k.trend} label={k.text} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Platform average</th>
                  {d.platforms.map((p) => <td key={p.key}><Score value={p.score} off={!p.on} strong /></td>)}
                  <td><Score value={d.overall} strong /></td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        <p className="pf-method">
          <strong>How scores work:</strong> we ask each AI platform your keyword and read its latest answer. Named 1st in a list = 100, 2nd = 80, 3rd = 60, lower = 40, named but not in a list = 50, not named = 0. Overall is the average of the platforms that answered. &ldquo;Off&rdquo; means that platform isn&apos;t switched on yet; &ldquo;—&rdquo; means it hasn&apos;t answered yet. We never estimate a score.
        </p>
      </section>

      <section className="pf-card" aria-labelledby="trend-title">
        <div className="pf-card-head">
          <h2 id="trend-title">Your overall score over time</h2>
          <span>Weekly, last 8 weeks</span>
        </div>
        <TrendChart unit="score" label="Your overall score out of 100, by week" points={d.scoreTrend.map((t) => ({ label: day(t.week), rate: t.score === null ? null : t.score / 100, answers: t.answers }))} />
      </section>

      <div className="pf-grid pf-grid-even">
          <section className="pf-card" aria-labelledby="site-title">
            <div className="pf-card-head">
              <h2 id="site-title">Website</h2>
              <Link href={d.website.url ? "/app/improve" : "/app/website"}>{d.website.url ? "Details" : "Connect"} <Icon name="arrow" size={13} /></Link>
            </div>
            {d.website.url ? (
              <>
                <p className="pf-line"><strong>{host(d.website.url)}</strong>{d.website.checkedAt && <span>Checked {day(d.website.checkedAt)}</span>}</p>
                {d.website.auditRunning ? (
                  <p className="pf-muted">Checking your website now…</p>
                ) : d.website.issues.length ? (
                  <ul className="pf-issues">
                    {d.website.issues.map((f) => <li key={f.id}>{f.evidence}</li>)}
                  </ul>
                ) : (
                  <p className="pf-muted">{d.website.total ? "Everything we check passes." : "Run a check to see what AI assistants can read."}</p>
                )}
              </>
            ) : (
              <p className="pf-muted">{d.website.requested ? `Our team is building your website (${STATUS_TEXT[d.website.requested.status].toLowerCase()}).` : "Connect your website, or ask our team to build one."}</p>
            )}
          </section>

          <section className="pf-card" aria-labelledby="social-title">
            <div className="pf-card-head">
              <h2 id="social-title">Social media</h2>
              <Link href="/app/presence">Manage <Icon name="arrow" size={13} /></Link>
            </div>
            <ul className="pf-social">
              {d.social.map((s) => (
                <li key={s.key}>
                  <Status on={s.state !== "none"} bad={!!s.error} />
                  <span>
                    <strong>{s.label}</strong>
                    <em>{s.error ? "Update failed. Reconnect it" : s.state === "synced" ? "Connected · kept up to date" : s.state === "linked" ? "Linked" : "Not connected"}</em>
                  </span>
                </li>
              ))}
            </ul>
          </section>
      </div>

      {insights.length > 0 && (
        <section className="pf-card" aria-labelledby="next-title">
          <div className="pf-card-head"><h2 id="next-title">What to do next</h2></div>
          <ul className="pf-insights">
            {insights.slice(0, 3).map((i) => (
              <li key={i.title}>
                <Link href={i.href}>
                  <span><strong>{i.title}</strong><em>{i.body}</em></span>
                  <span className="pf-cta">{i.cta} <Icon name="arrow" size={13} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Kpi({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="pf-kpi">
      <span className="pf-kpi-label">{label}</span>
      <strong>{value}</strong>
      <span className="pf-kpi-detail">{detail}</span>
    </div>
  );
}

/** One score cell: the number, or "Off"/"—" when there's no answer to score. */
function Score({ value, off = false, strong = false, position }: { value: number | null; off?: boolean; strong?: boolean; position?: number | null }) {
  if (value === null) return <span className="pf-muted">{off ? "Off" : "—"}</span>;
  const band = value >= 70 ? "high" : value >= 40 ? "mid" : "low";
  return (
    <span className={`pf-score ${band}${strong ? " strong" : ""}`} title={position ? `Named #${position}` : value === 0 ? "Not named" : value === 50 ? "Named, not in a list" : undefined}>
      {value}
    </span>
  );
}

/** Connection state as an icon and text, never colour alone. */
function Status({ on, wait = false, bad = false }: { on: boolean; wait?: boolean; bad?: boolean }) {
  const state = bad ? "bad" : on ? "on" : wait ? "wait" : "off";
  return (
    <span className={`pf-dot ${state}`} aria-hidden="true">
      {state === "on" ? <Icon name="check" size={12} /> : state === "bad" ? "!" : state === "wait" ? <Icon name="clock" size={12} /> : ""}
    </span>
  );
}
