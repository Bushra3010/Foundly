import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { AutoRefresh } from "@/components/auto-refresh";
import { CompareChart } from "@/components/compare-chart";
import { Badge, Card, Notice, PageHeader, TextField } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { CHECK_LABEL } from "@/server/audit/checks";
import { websiteCheckRunning } from "@/server/audit/service";
import { compareData } from "@/server/compare";
import { can } from "@/server/context";
import { requireCurrentBusiness } from "@/server/current";
import { addRivalAction, checkMineAction, checkRivalAction, rivalWebsiteAction } from "./actions";

export const metadata = { title: "Compare" };

const pct = (r: number | null) => (r === null ? "—" : `${Math.round(r * 100)}%`);
const day = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const host = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

function AddRival() {
  return (
    <ActionForm action={addRivalAction} submitLabel="Add competitor" className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <TextField label="Competitor's name" name="name" placeholder="Fidosofts" />
      <TextField label="Their website" name="domain" optional placeholder="fidosofts.com" />
    </ActionForm>
  );
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireCurrentBusiness(db, ctx);
  const { c } = await searchParams;
  const d = await compareData(db, ctx, business, c);
  const canEdit = can(ctx, "editor");

  if (!d.rival) {
    return (
      <>
        <PageHeader icon="visibility" title="Compare" description="See how you stack up against a competitor in AI answers and on your websites." />
        <Card>
          <h2 className="font-semibold">Who do you compete with?</h2>
          <p className="mt-1 mb-4 text-sm text-muted">Add a competitor. We&apos;ll check their website straight away and look for them in every AI answer from now on.</p>
          {canEdit ? <AddRival /> : <p className="text-sm text-muted">Ask an owner or editor to add a competitor.</p>}
        </Card>
      </>
    );
  }

  const r = d.rival;
  const mineRunning = await websiteCheckRunning(db, ctx, business.hasWebsite ? business.websiteUrl : null);
  const theirsRunning = d.website.them.status === "queued" || d.website.them.status === "running";
  const ai = d.ai;
  const hasAi = ai.answers > 0;
  const lead = ai.you.rate !== null && ai.them.rate !== null ? ai.you.rate - ai.them.rate : null;
  const ws = d.website;

  return (
    <>
      <AutoRefresh active={mineRunning || theirsRunning} />
      <PageHeader icon="visibility" title="Compare" description={`You vs ${r.name}: who AI assistants name more, and whose website they can read better.`} />

      {d.competitors.length > 1 && (
        <nav aria-label="Competitors" className="mb-4 flex flex-wrap gap-2">
          {d.competitors.map((x) => (
            <Link key={x.id} href={`/app/compare?c=${x.id}`} aria-current={x.id === r.id ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${x.id === r.id ? "border-text bg-text text-bg" : "border-border bg-surface"}`}>
              {x.name}
            </Link>
          ))}
        </nav>
      )}

      {/* ---------- Summary ---------- */}
      <section className="cmp-summary" aria-label="Summary">
        <div className="cmp-side you">
          <span className="cmp-who"><span className="cmp-swatch you" aria-hidden="true" />You · {business.name}</span>
          <strong>{pct(ai.you.rate)}</strong>
          <span>{hasAi ? `named in ${ai.you.numerator} of ${ai.you.denominator} AI answers` : "AI mentions after your first check"}</span>
          <span>Website: {ws.you.score ? `${ws.you.score.passed} of ${ws.you.score.total} checks pass` : ws.you.url ? "not checked yet" : "not connected"}</span>
        </div>
        <div className="cmp-vs" aria-hidden="true">vs</div>
        <div className="cmp-side them">
          <span className="cmp-who"><span className="cmp-swatch them" aria-hidden="true" />{r.name}</span>
          <strong>{pct(ai.them.rate)}</strong>
          <span>{hasAi ? `named in ${ai.them.numerator} of ${ai.them.denominator} AI answers` : "AI mentions after your first check"}</span>
          <span>Website: {ws.them.score ? `${ws.them.score.passed} of ${ws.them.score.total} checks pass` : theirsRunning ? "checking now…" : ws.them.url ? "not checked yet" : "no website added"}</span>
        </div>
      </section>
      {lead !== null && hasAi && (
        <p className="cmp-verdict" role="status">
          {Math.abs(lead) < 0.005
            ? `You and ${r.name} are named equally often in the last 30 days.`
            : lead > 0
              ? `You're ahead: AI assistants named you ${Math.round(lead * 100)} points more often than ${r.name} in the last 30 days.`
              : `${r.name} is ahead: AI assistants named them ${Math.round(-lead * 100)} points more often than you in the last 30 days.`}
          {ai.answers < 30 && " Small sample, so this can change quickly."}
        </p>
      )}

      {/* ---------- AI mentions ---------- */}
      <section className="pf-card mt-6" aria-labelledby="cmp-ai">
        <div className="pf-card-head">
          <h2 id="cmp-ai">How often AI assistants name each of you</h2>
          <span>Weekly, last 8 weeks</span>
        </div>
        {d.sources === 0 && (
          <div className="mb-4">
            <Notice tone="info">AI checks are being switched on. Your keywords are saved, and this fills in after the first check.</Notice>
          </div>
        )}
        <CompareChart them={r.name} points={ai.trend.map((t) => ({ label: day(t.week), answers: t.answers, you: t.you, them: t.them }))} />
        <p className="mt-3 text-xs text-muted">Counted from answers checked since you added {r.name} ({day(r.createdAt)}). Earlier answers didn&apos;t look for them.</p>
      </section>

      {/* ---------- Per keyword ---------- */}
      <section className="pf-card mt-6" aria-labelledby="cmp-kw">
        <div className="pf-card-head">
          <h2 id="cmp-kw">Keyword by keyword</h2>
          <Link href="/app/visibility">Manage keywords</Link>
        </div>
        {d.keywordCount === 0 ? (
          <p className="pf-empty">No keywords yet. <Link href="/app/visibility">Add keywords</Link> to compare.</p>
        ) : (
          <table className="pf-table">
            <thead>
              <tr><th scope="col">Keyword</th><th scope="col">You</th><th scope="col">{r.name}</th><th scope="col">Leader</th></tr>
            </thead>
            <tbody>
              {ai.keywords.map((k) => (
                <tr key={k.id}>
                  <th scope="row">{k.text}<span>{k.checked ? `Latest answers from ${k.checked} AI${k.checked === 1 ? "" : "s"}` : "Not checked yet"}</span></th>
                  <td>{k.checked ? `${k.you} of ${k.checked}` : "—"}</td>
                  <td>{k.checked ? `${k.them} of ${k.checked}` : "—"}</td>
                  <td>
                    {k.leader === null ? <span className="pf-muted">—</span> : k.leader === "tie" ? <span className="pf-badge">Tie</span> : k.leader === "you" ? <span className="pf-badge ok">You</span> : <span className="pf-badge cmp-them-badge">{r.name}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ---------- Website vs website ---------- */}
      <section className="pf-card mt-6" aria-labelledby="cmp-web">
        <div className="pf-card-head">
          <h2 id="cmp-web">Website vs website</h2>
          <span>Same checks on both sites</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold"><span className="cmp-swatch you" aria-hidden="true" /> {ws.you.url ? host(ws.you.url) : "Your website"}</p>
            <p className="mt-1 text-2xl font-bold">{ws.you.score ? `${ws.you.score.passed} / ${ws.you.score.total}` : "—"}</p>
            <p className="text-sm text-muted">{mineRunning ? "Checking now…" : ws.you.checkedAt ? `Checked ${day(ws.you.checkedAt)}` : ws.you.url ? "Not checked yet" : "Connect your website first"}</p>
            {canEdit && ws.you.url && !mineRunning && (
              <div className="mt-3"><ActionForm action={checkMineAction} submitLabel={ws.you.checkedAt ? "Check again" : "Check my website"} variant="secondary" pendingLabel="Starting…" /></div>
            )}
            {!ws.you.url && <Link href="/app/website" className="mt-3 inline-block text-sm font-semibold underline">Connect your website</Link>}
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold"><span className="cmp-swatch them" aria-hidden="true" /> {ws.them.url ?? r.name}</p>
            <p className="mt-1 text-2xl font-bold">{ws.them.score ? `${ws.them.score.passed} / ${ws.them.score.total}` : "—"}</p>
            <p className="text-sm text-muted">{theirsRunning ? "Checking now…" : ws.them.error ? ws.them.error : ws.them.checkedAt ? `Checked ${day(ws.them.checkedAt)}` : ws.them.url ? "Not checked yet" : "Add their website to compare"}</p>
            {canEdit && (ws.them.url ? (
              !theirsRunning && (
                <div className="mt-3">
                  <ActionForm action={checkRivalAction} submitLabel={ws.them.checkedAt ? "Check again" : "Check their website"} variant="secondary" pendingLabel="Starting…">
                    <input type="hidden" name="competitorId" value={r.id} />
                  </ActionForm>
                </div>
              )
            ) : (
              <div className="mt-3">
                <ActionForm action={rivalWebsiteAction} submitLabel="Save and check" variant="secondary" inline>
                  <input type="hidden" name="competitorId" value={r.id} />
                  <input name="domain" aria-label={`${r.name}'s website`} placeholder="theirsite.com" className="min-h-11 min-w-48 flex-1 rounded-lg border border-border bg-surface px-3" />
                </ActionForm>
              </div>
            ))}
          </div>
        </div>

        {(ws.theyWin.length > 0 || ws.youWin.length > 0) && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ws.theyWin.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold">Where {r.name} is ahead</h3>
                <ul className="mt-1 list-disc pl-5 text-sm">{ws.theyWin.map((x) => <li key={x.checkKey}>{CHECK_LABEL[x.checkKey] ?? x.checkKey}</li>)}</ul>
                <Link href="/app/improve" className="mt-2 inline-block text-sm font-semibold underline">Fix these on your site</Link>
              </div>
            )}
            {ws.youWin.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold">Where you&apos;re ahead</h3>
                <ul className="mt-1 list-disc pl-5 text-sm">{ws.youWin.map((x) => <li key={x.checkKey}>{CHECK_LABEL[x.checkKey] ?? x.checkKey}</li>)}</ul>
              </div>
            )}
          </div>
        )}

        {ws.checks.length > 0 && (
          <table className="pf-table mt-4">
            <thead>
              <tr><th scope="col">Check</th><th scope="col">You</th><th scope="col">{r.name}</th></tr>
            </thead>
            <tbody>
              {ws.checks.map((x) => (
                <tr key={x.checkKey}>
                  <th scope="row">{CHECK_LABEL[x.checkKey] ?? x.checkKey}</th>
                  <td><Result f={x.you} /></td>
                  <td><Result f={x.them} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-xs text-muted">Checks that compare a site with your own business details (your name, phone, services) are left out, so both sites are rated the same way.</p>
      </section>

      {canEdit && (
        <details className="mt-6 rounded-xl border border-border bg-surface p-4">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">Add another competitor</summary>
          <div className="mt-3"><AddRival /></div>
        </details>
      )}
    </>
  );
}

function Result({ f }: { f: { passed: boolean; evidence: string } | null }) {
  if (!f) return <span className="pf-muted">—</span>;
  return (
    <span title={f.evidence}>
      <Badge tone={f.passed ? "ok" : "warn"}>{f.passed ? "Pass" : "Improve"}</Badge>
    </span>
  );
}
