import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Icon } from "@/components/icon";
import { getDb } from "@/db";
import type { WeeklyReportData } from "@/db/schema";
import { requireCtx } from "@/lib/auth/session";
import { can } from "@/server/context";
import { requireCurrentBusiness } from "@/server/current";
import { listWeeklyReports, weekKeyOf } from "@/server/weekly-report";
import { writeReportAction } from "./actions";
import "../overview.css";

export const metadata = { title: "Weekly report" };

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const num = (v: number | null, unit = "") => (v === null ? "—" : `${v}${unit}`);
const change = (now: number | null, before: number | null, unit = "", invert = false) => {
  if (now === null || before === null || now === before) return null;
  const d = Math.round((now - before) * 10) / 10;
  const good = invert ? d < 0 : d > 0;
  return <span className={`ov-delta ${good ? "up" : "down"}`}>{d > 0 ? "+" : ""}{d}{unit} vs last week</span>;
};

function Numbers({ n }: { n: WeeklyReportData["numbers"] }) {
  return (
    <div className="ov-kpis four" style={{ marginTop: 16 }}>
      <div className="ov-kpi"><span className="ov-kpi-label">Coverage</span><span className="ov-kpi-value">{num(n.coverage, "%")}</span>{change(n.coverage, n.prevCoverage, " pts")}</div>
      <div className="ov-kpi"><span className="ov-kpi-label">Average position</span><span className="ov-kpi-value">{n.avgPosition === null ? "—" : `#${n.avgPosition}`}</span>{change(n.avgPosition, n.prevAvgPosition, "", true)}</div>
      <div className="ov-kpi"><span className="ov-kpi-label">Share of voice</span><span className="ov-kpi-value">{num(n.share, "%")}</span>{change(n.share, n.prevShare, " pts")}</div>
      <div className="ov-kpi"><span className="ov-kpi-label">Answers checked</span><span className="ov-kpi-value">{n.answers}</span></div>
    </div>
  );
}

export default async function ReportsPage() {
  const ctx = await requireCtx();
  const db = await getDb();
  const [business, reports] = await Promise.all([requireCurrentBusiness(db, ctx), listWeeklyReports(db, ctx, 12)]);
  const thisWeek = weekKeyOf();
  const [latest, ...older] = reports;
  const current = latest?.weekKey === thisWeek;

  return (
    <div className="dash ov">
      <header className="dash-hero">
        <div className="dash-hero-text">
          <span className="dash-eyebrow">Weekly report</span>
          <h1>What changed, and what to do</h1>
          <p>Every Monday, a short report on how AI recommended {business.name} compared with the week before, and the three things worth doing next. Turn on the email in Settings.</p>
        </div>
        <div className="dash-hero-actions">
          <ActionForm action={writeReportAction} submitLabel={current ? "Rewrite this week" : "Write this week's report"} pendingLabel="Reading answers…" variant={current ? "secondary" : "primary"} className="" />
        </div>
      </header>

      {!latest ? (
        <section className="dash-panel ov-empty">
          <Icon name="reports" size={34} />
          <h2>No report yet</h2>
          <p>Reports are written from your AI answers. Once a check has run, press <strong>Write this week&apos;s report</strong>, or wait for Monday.</p>
          <p><Link href="/app/keywords" className="underline">Add prompts</Link> if you haven&apos;t yet.</p>
        </section>
      ) : (
        <>
          <section className="dash-panel ov-panel" aria-labelledby="wr-head">
            <p className="ov-sub">Week {latest.weekKey} · written {fmt(latest.generatedAt)}{latest.data.source === "template" ? " · from the numbers" : ""}</p>
            <h2 id="wr-head" style={{ fontSize: 24, lineHeight: 1.25, marginTop: 6 }}>{latest.data.headline}</h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.6, marginTop: 12 }}>{latest.data.summary}</p>
            <Numbers n={latest.data.numbers} />
          </section>
          <div className="ov-two">
            <section className="dash-panel ov-panel" aria-labelledby="wr-do">
              <h2 id="wr-do">What to do this week</h2>
              <ol className="ov-steps">
                {latest.data.actions.map((a, i) => (
                  <li key={i}><span className="ov-fix-n">{i + 1}</span><span>{a}</span></li>
                ))}
              </ol>
              <p className="ov-sub" style={{ marginTop: 12 }}>
                <Link href="/app/improve" className="underline">All fixes</Link> · <Link href="/app/keywords" className="underline">Prompts</Link>
              </p>
            </section>
            <section className="dash-panel ov-panel" aria-labelledby="wr-moves">
              <h2 id="wr-moves">Moves this week</h2>
              <dl className="ov-moves">
                <dt>Newly recommended for</dt>
                <dd>{latest.data.numbers.won.length ? latest.data.numbers.won.join(", ") : "—"}</dd>
                <dt>No longer recommended for</dt>
                <dd>{latest.data.numbers.lost.length ? latest.data.numbers.lost.join(", ") : "—"}</dd>
                <dt>Competitors named instead</dt>
                <dd>{latest.data.numbers.gaps.length ? latest.data.numbers.gaps.map((g) => `${g.keyword}${g.rivals.length ? ` (${g.rivals.join(", ")})` : ""}`).join("; ") : "—"}</dd>
                <dt>Sites AI read most</dt>
                <dd>{latest.data.numbers.sources.length ? latest.data.numbers.sources.join(", ") : "—"}</dd>
              </dl>
            </section>
          </div>
          {older.length > 0 && (
            <section className="dash-panel ov-panel" aria-labelledby="wr-old">
              <h2 id="wr-old">Earlier reports</h2>
              <ul className="ov-list">
                {older.map((r) => (
                  <li key={r.id}>
                    <span>
                      <strong>{r.data.headline}</strong>
                      <span className="ov-q">Week {r.weekKey} · coverage {num(r.data.numbers.coverage, "%")} · {r.data.numbers.answers} answers</span>
                    </span>
                    <span className="ov-muted">{fmt(r.generatedAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {can(ctx, "owner") && (
        <p className="ov-sub">
          Your data is yours: <a href="/app/reports/export" className="underline">download everything (JSON)</a>.
        </p>
      )}
    </div>
  );
}
