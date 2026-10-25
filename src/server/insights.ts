import "server-only";
import type { DbOrTx } from "@/db";
import type { BrandMatch } from "@/db/schema";
import { requireRole, type Ctx } from "./context";
import { effectiveMention, SMALL_SAMPLE, VALID_STATUSES } from "./monitoring/metrics";
import { adapterFor } from "./monitoring/registry";
import { brandSpecs, listQuestions, listRuns, queryObservations, type ObservationWithMatches } from "./monitoring/service";

const isValid = (o: { status: string }) => (VALID_STATUSES as readonly string[]).includes(o.status);
const selfHit = (o: ObservationWithMatches) => o.matches.find((m) => m.brandKey === "self");
const named = (m: BrandMatch | undefined) => Boolean(m && effectiveMention(m));
/** "ChatGPT (OpenAI API)" -> "ChatGPT": owners know the assistant, not the API. */
const engineName = (p: string) => (adapterFor(p)?.label ?? p).replace(/\s*\(.*\)\s*$/, "");
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : null);

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export type KeywordResult = {
  id: string;
  keyword: string;
  question: string;
  /** won: named in at least half the latest answers; partly: in some; lost: in none. */
  status: "won" | "partly" | "lost" | "pending";
  rate: number | null;
  answers: number;
  namedOn: string[];
  rivals: string[];
  checkedAt: Date | null;
};

/** Latest answers for each keyword: the run that most recently answered it. */
function latestPerQuestion(rows: ObservationWithMatches[]) {
  const latestRun = new Map<string, { runId: string; at: number }>();
  for (const o of rows) {
    const cur = latestRun.get(o.questionId);
    const at = o.capturedAt.getTime();
    if (!cur || at > cur.at) latestRun.set(o.questionId, { runId: o.runId, at });
  }
  const out = new Map<string, ObservationWithMatches[]>();
  for (const o of rows) if (latestRun.get(o.questionId)?.runId === o.runId) out.set(o.questionId, [...(out.get(o.questionId) ?? []), o]);
  return out;
}

/**
 * Everything the Performance page shows, from stored answers only:
 * how often AI names the business, the trend per check, the share against
 * competitors, results per AI source, per keyword, and the sites AI reads.
 */
export async function performanceFor(db: DbOrTx, ctx: Ctx, days = 30) {
  requireRole(ctx, "viewer");
  const from = new Date(Date.now() - days * 86_400_000);
  const [brands, questions, rows, runs] = await Promise.all([
    brandSpecs(db, ctx.workspaceId),
    listQuestions(db, ctx),
    queryObservations(db, ctx, { from }, 3000),
    listRuns(db, ctx, 1),
  ]);
  const valid = rows.filter(isValid);
  const namedCount = valid.filter((o) => named(selfHit(o))).length;
  const citedCount = valid.filter((o) => selfHit(o)?.cited).length;
  const positions = valid.map((o) => selfHit(o)).filter((m) => named(m) && m!.listedPosition).map((m) => m!.listedPosition!);

  // Trend: one point per check.
  const byRun = new Map<string, ObservationWithMatches[]>();
  for (const o of valid) byRun.set(o.runId, [...(byRun.get(o.runId) ?? []), o]);
  const trend = [...byRun.values()]
    .map((list) => ({
      at: new Date(Math.min(...list.map((o) => o.capturedAt.getTime()))),
      rate: pct(list.filter((o) => named(selfHit(o))).length, list.length) ?? 0,
      answers: list.length,
    }))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  // Share of mentions: of all answers naming any tracked brand, how many name each one.
  const brandAnswers = brands.map((b) => ({
    key: b.key,
    name: b.name,
    self: b.key === "self",
    answers: valid.filter((o) => o.matches.some((m) => m.brandKey === b.key && effectiveMention(m))).length,
  }));
  const totalNamed = brandAnswers.reduce((n, b) => n + b.answers, 0);
  const share = brandAnswers
    .map((b) => ({ ...b, share: pct(b.answers, totalNamed) ?? 0 }))
    .sort((a, b) => b.answers - a.answers || Number(b.self) - Number(a.self));

  // Per AI source.
  const providers = [...new Set(rows.map((o) => o.provider))];
  const engines = providers
    .map((p) => {
      const list = valid.filter((o) => o.provider === p);
      return { key: p, label: engineName(p), answers: list.length, rate: pct(list.filter((o) => named(selfHit(o))).length, list.length) };
    })
    .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));

  // Per keyword, from its latest answers.
  const latest = latestPerQuestion(valid);
  const nameOf = new Map(brands.map((b) => [b.key, b.name]));
  const keywords: KeywordResult[] = questions.map((q) => {
    const list = latest.get(q.id) ?? [];
    const hits = list.filter((o) => named(selfHit(o)));
    const rate = pct(hits.length, list.length);
    const rivalCounts = new Map<string, number>();
    for (const o of list)
      for (const m of o.matches) if (m.brandKey !== "self" && effectiveMention(m)) rivalCounts.set(m.brandKey, (rivalCounts.get(m.brandKey) ?? 0) + 1);
    return {
      id: q.id,
      keyword: q.keyword ?? q.text,
      question: q.text,
      status: list.length === 0 ? "pending" : rate! >= 50 ? "won" : hits.length > 0 ? "partly" : "lost",
      rate,
      answers: list.length,
      namedOn: [...new Set(hits.map((o) => engineName(o.provider)))],
      rivals: [...rivalCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => nameOf.get(k) ?? k),
      checkedAt: list.length ? new Date(Math.max(...list.map((o) => o.capturedAt.getTime()))) : null,
    };
  });

  // Sites AI read to answer.
  // Sites AI read to answer.
  const own = new Set(brands.find((b) => b.key === "self")?.domains ?? []);
  const sourceCounts = new Map<string, number>();
  for (const o of valid) for (const h of new Set(o.citations.map((c) => hostOf(c.url)).filter(Boolean) as string[])) sourceCounts.set(h, (sourceCounts.get(h) ?? 0) + 1);
  const sources = [...sourceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([host, count]) => ({ host, count, own: [...own].some((d) => host === d || host.endsWith(`.${d}`)) }));

  return {
    days,
    answers: valid.length,
    failed: rows.length - valid.length,
    smallSample: valid.length < SMALL_SAMPLE,
    score: pct(namedCount, valid.length),
    named: namedCount,
    citedRate: pct(citedCount, valid.length),
    avgPosition: positions.length ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10 : null,
    trend,
    share,
    engines,
    keywords,
    sources,
    lastRun: runs[0] ?? null,
  };
}

export type Performance = Awaited<ReturnType<typeof performanceFor>>;

/** The latest answer from each AI source for one keyword, with who it named and what it read. */
export async function keywordAnswers(db: DbOrTx, ctx: Ctx, questionId: string) {
  requireRole(ctx, "viewer");
  const [questions, brands, rows] = await Promise.all([
    listQuestions(db, ctx),
    brandSpecs(db, ctx.workspaceId),
    queryObservations(db, ctx, { questionId }, 200),
  ]);
  const question = questions.find((q) => q.id === questionId);
  if (!question) return null;
  const latest = latestPerQuestion(rows).get(questionId) ?? [];
  const history = new Map<string, ObservationWithMatches[]>();
  for (const o of rows.filter(isValid)) history.set(o.runId, [...(history.get(o.runId) ?? []), o]);
  return {
    question,
    brands,
    checks: history.size,
    answers: latest
      .sort((a, b) => a.provider.localeCompare(b.provider))
      .map((o) => ({
        id: o.id,
        provider: o.provider,
        label: engineName(o.provider),
        status: o.status,
        ok: isValid(o),
        text: o.rawAnswer,
        capturedAt: o.capturedAt,
        citations: o.citations,
        self: selfHit(o) ?? null,
        named: o.matches.filter((m) => effectiveMention(m)).map((m) => ({ key: m.brandKey, name: m.brandName, position: m.listedPosition })),
      })),
  };
}
