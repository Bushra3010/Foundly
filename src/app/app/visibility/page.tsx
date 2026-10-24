import { randomUUID } from "node:crypto";
import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Badge, Card, Notice, PageHeader, TextArea, TextField } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { isPlatformAdmin } from "@/lib/admin";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { GROUP_LABEL, suggestQuestions } from "@/lib/questions";
import { can } from "@/server/context";
import { getBalance } from "@/server/credits";
import { ADAPTERS, METHOD_LABEL, providerState } from "@/server/monitoring/registry";
import {
  brandSpecs,
  estimateCredits,
  lastSuccessByProvider,
  listCompetitors,
  listQuestions,
  listRuns,
  questionLimit,
  visibilitySummary,
} from "@/server/monitoring/service";
import {
  addCompetitorAction,
  approveQuestionsAction,
  archiveQuestionAction,
  removeCompetitorAction,
  runCheckAction,
  saveBrandAction,
} from "./actions";
import { MetricCard, pct } from "./metric-card";
import { requireCurrentBusiness } from "@/server/current";

export const metadata = { title: "AI Visibility" };

const STATE_BADGE = {
  not_connected: ["neutral", "Coming soon"],
  awaiting_validation: ["warn", "Being tested"],
  connected: ["ok", "Connected"],
} as const;

const RUN_BADGE = {
  queued: ["neutral", "Queued"],
  running: ["info", "Running"],
  completed: ["ok", "Completed"],
  partial: ["warn", "Partly completed"],
  failed: ["err", "Failed"],
  cancelled: ["neutral", "Cancelled"],
} as const;

const LOCALE_TEXT = { native: "Location sent as a supported setting", text_instruction: "Location sent as a text instruction only", none: "No location setting" };

export default async function VisibilityPage({ searchParams }: { searchParams: Promise<{ days?: string; provider?: string }> }) {
  const ctx = await requireCtx();
  // Provider setup is a platform task; only admins see the variable names.
  const showSetup = isPlatformAdmin(ctx.user.email);
  const locale = await getLocale();
  const db = await getDb();
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const provider = ADAPTERS.some((a) => a.key === sp.provider) ? sp.provider : undefined;
  const business = await requireCurrentBusiness(db, ctx);
  const [questions, comps, runs, balance, lastSuccess, summary, brands, keywordLimit] = await Promise.all([
    listQuestions(db, ctx),
    listCompetitors(db, ctx),
    listRuns(db, ctx, 5),
    getBalance(db, ctx.workspaceId),
    lastSuccessByProvider(db, ctx.workspaceId),
    visibilitySummary(db, ctx, days, provider),
    brandSpecs(db, ctx.workspaceId),
    questionLimit(db, ctx.workspaceId),
  ]);
  const connected = ADAPTERS.filter((a) => providerState(a) === "connected");
  const tracked = new Set(questions.map((q) => q.text.toLowerCase()));
  const suggestions = suggestQuestions(business).filter((s) => !tracked.has(s.text.toLowerCase()));
  const cost = estimateCredits(questions.length, connected.length, 1);
  const activeRun = runs.find((r) => r.status === "queued" || r.status === "running");
  const m = summary.metrics;
  const evidence = (extra: Record<string, string>) =>
    `/app/visibility/evidence?${new URLSearchParams({ days: String(days), ...(provider ? { provider } : {}), ...extra })}`;
  const canEdit = can(ctx, "editor");
  const selfDomains = brands.find((b) => b.key === "self")?.domains ?? [];

  return (
    <>
      <PageHeader icon="visibility"
        title={t(locale, "nav.visibility")}
        description="How supported AI answers respond to the questions you track. These are observations of a sample of answers, not the full behaviour of any AI service."
      />

      {/* ---------- Sources ---------- */}
      <h2 className="mb-3 text-lg font-semibold">Sources</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {ADAPTERS.map((a) => {
          const state = providerState(a);
          return (
            <li key={a.key}>
              <Card>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{a.label}</h3>
                  <Badge tone={STATE_BADGE[state][0]}>{STATE_BADGE[state][1]}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted">{METHOD_LABEL[a.method]}</p>
                <p className="mt-1 text-sm text-muted">{LOCALE_TEXT[a.locale]}</p>
                <p className="mt-1 text-sm text-muted">
                  Last successful check: {lastSuccess[a.key] ? lastSuccess[a.key].toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "none"}
                </p>
                {state === "not_connected" && (
                  <p className="mt-1 text-xs text-muted">
                    {showSetup ? `Admin: set ${a.requiredEnv.join(", ")}` : "We're switching this on for Foundly. Nothing for you to set up."}
                  </p>
                )}
                {state === "awaiting_validation" && <p className="mt-1 text-xs text-muted">We&apos;re checking this source before turning it on for everyone.</p>}
              </Card>
            </li>
          );
        })}
      </ul>
      {connected.length === 0 && (
        <div className="mt-3">
          <Notice tone="info" title="AI checks are being switched on">
            Meanwhile, choose the customer questions you want tracked below, and keep your business details complete. Your first results appear here after the first check. We never show estimates or sample data.
          </Notice>
        </div>
      )}

      {/* ---------- Results ---------- */}
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Results</h2>
          <form className="flex flex-wrap items-end gap-2">
            <label className="text-sm">
              <span className="block font-semibold">Period</span>
              <select name="days" defaultValue={days} className="min-h-11 rounded-lg border border-border bg-surface px-3">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="block font-semibold">Source</span>
              <select name="provider" defaultValue={provider ?? ""} className="min-h-11 rounded-lg border border-border bg-surface px-3">
                <option value="">All sources</option>
                {ADAPTERS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="min-h-11 rounded-lg border border-border bg-surface px-4 font-semibold">Apply</button>
          </form>
        </div>
        {m.attempted === 0 ? (
          <Card>
            <p className="text-muted">No checks in this period yet.</p>
          </Card>
        ) : (
          <>
            {m.smallSample && (
              <div className="mb-3">
                <Notice tone="warn">
                  Small sample: {m.valid} valid answers. AI answers vary, so treat these numbers as early signals, not trends.
                </Notice>
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard
                title="Mention rate"
                ratio={m.mention}
                unit="valid answers mentioned you"
                definition="Valid answers mentioning your business ÷ valid answers checked. Unreviewed uncertain matches are not counted."
                href={evidence({ metric: "mention" })}
              />
              <MetricCard
                title="Citation rate"
                ratio={m.citation}
                unit="valid answers linked to your site"
                definition={`Valid answers citing a domain you own (${selfDomains.join(", ") || "add your website"}) ÷ valid answers checked.`}
                href={evidence({ metric: "citation" })}
              />
              <Card>
                <h3 className="text-sm font-semibold text-muted">Coverage</h3>
                <p className="mt-1 text-3xl font-bold">
                  {m.valid}/{m.attempted}
                </p>
                <p className="text-sm">attempts returned a valid answer</p>
                {Object.keys(m.failures).length > 0 && (
                  <ul className="mt-2 text-xs text-muted">
                    {Object.entries(m.failures).map(([k, n]) => (
                      <li key={k}>
                        <Link className="underline" href={evidence({ status: k })}>
                          {n} {k.replace("_", " ")}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-muted">Failed attempts are excluded from rates — they never count as zero visibility.</p>
              </Card>
            </div>
            {m.ambiguousPending > 0 && (
              <div className="mt-3">
                <Notice tone="warn">
                  {m.ambiguousPending} answer{m.ambiguousPending === 1 ? "" : "s"} might mention you but the match is uncertain.{" "}
                  <Link className="font-semibold underline" href={evidence({ metric: "ambiguous" })}>
                    Review them
                  </Link>
                </Notice>
              </div>
            )}
            {summary.brands.length > 1 && (
              <Card className="mt-3">
                <h3 className="font-semibold">Share among tracked businesses</h3>
                <p className="mt-1 text-xs text-muted">Answers mentioning a business ÷ all business mentions across your tracked set. Each answer counts a business once.</p>
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="text-muted">
                    <tr>
                      <th className="py-1">Business</th>
                      <th>Answers</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.brands.map((b) => (
                      <tr key={b.key} className="border-t border-border">
                        <td className="py-2">{b.key === "self" ? `${b.name} (you)` : b.name}</td>
                        <td>{m.competitorShare[b.key].numerator}</td>
                        <td>{pct(m.competitorShare[b.key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
            {summary.comparison && (
              <Card className="mt-3">
                <h3 className="font-semibold">Compared with the previous {days} days</h3>
                {!summary.comparison.fullOverlap && (
                  <p className="mt-1 text-sm text-warn-fg">
                    Only {summary.comparison.sharedPairs} question-and-source pairs appear in both periods, so the comparison uses just those.
                  </p>
                )}
                {summary.comparison.configChanged && <p className="mt-1 text-sm text-warn-fg">How answers were analysed changed between periods.</p>}
                <p className="mt-2 text-sm">
                  Mention rate {pct(summary.comparison.previous.mention)} → {pct(summary.comparison.current.mention)} ({summary.comparison.previous.mention.denominator} →{" "}
                  {summary.comparison.current.mention.denominator} answers)
                </p>
                <p className="mt-1 text-xs text-muted">AI answers vary between checks, and many things change at once, so a difference doesn&apos;t prove that one change caused it.</p>
              </Card>
            )}
            <p className="mt-3 text-sm">
              <Link className="font-semibold text-brand underline" href={`/app/visibility/export?${new URLSearchParams({ days: String(days), ...(provider ? { provider } : {}) })}`} prefetch={false}>
                Export these answers (CSV)
              </Link>
            </p>
          </>
        )}
      </section>

      {/* ---------- Run a check ---------- */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Run a check</h2>
          <p className="mt-1 text-sm text-muted">
            Checks run automatically once a week. Each answer collected uses 1 credit; failed attempts are not charged.
          </p>
          <p className="mt-3 text-sm">
            Credits available: <strong>{balance}</strong>
          </p>
          <p className="text-sm">
            One check now: {questions.length} questions × {connected.length} sources = <strong>{cost} credits</strong> (at most)
          </p>
          {activeRun ? (
            <p className="mt-3" aria-live="polite">
              <Badge tone="info">A check is {activeRun.status === "queued" ? "queued" : "running"}</Badge>{" "}
              <span className="text-sm text-muted">Refresh to see progress. You can leave this page.</span>
            </p>
          ) : canEdit && connected.length > 0 && questions.length > 0 ? (
            <div className="mt-3">
              <ActionForm action={runCheckAction} submitLabel={`Run check (${cost} credits)`} pendingLabel="Starting…">
                <input type="hidden" name="requestId" value={randomUUID()} />
                <label className="block text-sm">
                  <span className="font-semibold">Samples per question</span>
                  <select name="samples" defaultValue="1" className="mt-1 block min-h-11 rounded-lg border border-border bg-surface px-3">
                    <option value="1">1 (cheapest)</option>
                    <option value="2">2 — costs twice as much</option>
                    <option value="3">3 — costs three times as much</option>
                  </select>
                </label>
              </ActionForm>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              {connected.length === 0 ? "Available once a source is connected." : questions.length === 0 ? "Add questions below first." : "Ask an editor or owner to run checks."}
            </p>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">Recent checks</h2>
          {runs.length === 0 ? (
            <p className="mt-2 text-muted">None yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border text-sm">
              {runs.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    {r.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {r.trigger}
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge tone={RUN_BADGE[r.status][0]}>{RUN_BADGE[r.status][1]}</Badge>
                    <Link className="underline" href={`/app/visibility/evidence?run=${r.id}`}>
                      Answers
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* ---------- Questions ---------- */}
      <section className="mt-8">
        <h2 className="mb-1 text-lg font-semibold">
          Tracked keywords ({questions.length}/{keywordLimit})
        </h2>
        <p className="mb-3 text-sm text-muted">
          Only questions you approve are asked. Questions that name your business are kept in a separate group because they make a mention more likely.
        </p>
        <Card>
          {questions.length === 0 ? (
            <p className="text-muted">No questions yet. Pick some suggestions below.</p>
          ) : (
            <ul className="divide-y divide-border">
              {questions.map((q) => (
                <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span className="min-w-0">
                    {q.text} {q.location && <span className="text-sm text-muted">· {q.location}</span>}
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge tone={q.group === "branded" ? "warn" : "neutral"}>{GROUP_LABEL[q.group]}</Badge>
                    {canEdit && (
                      <ActionForm action={archiveQuestionAction} submitLabel="Stop tracking" variant="ghost" inline>
                        <input type="hidden" name="questionId" value={q.id} />
                      </ActionForm>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        {canEdit && (
          <Card className="mt-3">
            <ActionForm action={approveQuestionsAction} submitLabel="Track selected questions">
              {suggestions.length > 0 && (
                <fieldset>
                  <legend className="font-semibold">Suggestions from your services and areas</legend>
                  <ul className="mt-2 space-y-1">
                    {suggestions.map((s) => (
                      <li key={s.text}>
                        <label className="flex min-h-11 items-start gap-3 py-1">
                          <input type="checkbox" name="suggestion" value={`${s.group}|${business.city}|${s.text}`} className="mt-1 size-5" />
                          <span>
                            {s.text} <span className="text-sm text-muted">({GROUP_LABEL[s.group]})</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}
              <TextArea label="Your own questions" name="custom" optional hint="One per line, written the way a customer would ask." rows={3} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="customGroup" className="block text-sm font-semibold">
                    Type of question
                  </label>
                  <select id="customGroup" name="customGroup" className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3">
                    {Object.entries(GROUP_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <TextField label="Location for these questions" name="customLocation" optional defaultValue={business.city} />
              </div>
            </ActionForm>
          </Card>
        )}
      </section>

      {/* ---------- Brand and competitors ---------- */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">How we recognise you</h2>
          <p className="mt-1 text-sm text-muted">We look for &ldquo;{business.name}&rdquo; plus these names, and links to these domains.</p>
          {canEdit && (
            <div className="mt-3">
              <ActionForm action={saveBrandAction} submitLabel="Save" variant="secondary">
                <TextField label="Other names" name="aliases" optional hint="Comma separated" defaultValue={business.aliases.join(", ")} />
                <TextField label="Other domains you own" name="domains" optional hint="Your website is included automatically" defaultValue={business.ownedDomains.join(", ")} />
              </ActionForm>
            </div>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">Competitors to compare with</h2>
          <ul className="mt-2 divide-y divide-border">
            {comps.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  {c.name} {c.domains[0] && <span className="text-sm text-muted">· {c.domains[0]}</span>}
                </span>
                {canEdit && (
                  <ActionForm action={removeCompetitorAction} submitLabel="Remove" variant="ghost" inline>
                    <input type="hidden" name="competitorId" value={c.id} />
                  </ActionForm>
                )}
              </li>
            ))}
          </ul>
          {canEdit && (
            <div className="mt-3">
              <ActionForm action={addCompetitorAction} submitLabel="Add competitor" variant="secondary">
                <TextField label="Business name" name="name" />
                <TextField label="Website" name="domain" optional />
              </ActionForm>
            </div>
          )}
        </Card>
      </section>
    </>
  );
}
