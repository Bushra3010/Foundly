import "server-only";
import type { DbOrTx } from "@/db";
import { and, eq, inArray } from "drizzle-orm";
import { trackedQuestions, type BrandMatch } from "@/db/schema";
import { toneAround, type Tone } from "@/lib/tone";
import { requireRole, type Ctx } from "./context";
import { effectiveMention, SMALL_SAMPLE, VALID_STATUSES } from "./monitoring/metrics";
import { adapterFor } from "./monitoring/registry";
import { brandSpecs, listQuestions, listRuns, queryObservations, type ObservationWithMatches } from "./monitoring/service";

const isValid = (o: { status: string }) => (VALID_STATUSES as readonly string[]).includes(o.status);
const selfHit = (o: ObservationWithMatches) => o.matches.find((m) => m.brandKey === "self");
const named = (m: BrandMatch | undefined) => Boolean(m && effectiveMention(m));
/** "ChatGPT (OpenAI API)" -> "ChatGPT": owners know the assistant, not the API. */
const engineName = (p: string) => (adapterFor(p)?.label ?? p).replace(/\s*\(.*\)\s*$/, "");
const isTone = (v: string | null): v is Tone => v === "positive" || v === "neutral" || v === "negative";
/** The model's classification when stored; otherwise estimated from the wording around the name. */
const toneOf = (o: ObservationWithMatches, m: BrandMatch): Tone => (isTone(m.sentiment) ? m.sentiment : toneAround(o.rawAnswer, m.matchedText ?? m.brandName));
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
  tag: string;
  /** won: named in at least half the latest answers; partly: in some; lost: in none. */
  status: "won" | "partly" | "lost" | "pending";
  rate: number | null;
  answers: number;
  namedOn: string[];
  rivals: string[];
  checkedAt: Date | null;
  /** The latest answer from each assistant: whether it named the business, and where in its list. */
  byEngine: Record<string, { named: boolean; position: number | null } | undefined>;
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
export type PerformanceFilter = { engine?: string; tag?: string };

export async function performanceFor(db: DbOrTx, ctx: Ctx, days = 30, filter: PerformanceFilter | string = {}) {
  const { engine, tag } = typeof filter === "string" ? { engine: filter, tag: undefined } : filter;
  requireRole(ctx, "viewer");
  const from = new Date(Date.now() - days * 86_400_000);
  const [brands, allQuestions, allRows, runs] = await Promise.all([
    brandSpecs(db, ctx.workspaceId),
    listQuestions(db, ctx),
    queryObservations(db, ctx, { from }, 3000),
    listRuns(db, ctx, 1),
  ]);
  // Filters narrow every number; the list of engines comes from all answers.
  const groupOf = new Map(allQuestions.map((q) => [q.id, q.group]));
  const questions = tag ? allQuestions.filter((q) => q.group === tag) : allQuestions;
  const rows = allRows.filter((o) => (!engine || o.provider === engine) && (!tag || groupOf.get(o.questionId) === tag));
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

  // Brand ranking: mentions, share of voice, average position and tone for every tracked brand.
  const ranking = share.map((b) => {
    const hits = valid.flatMap((o) => o.matches.filter((m) => m.brandKey === b.key && effectiveMention(m)).map((m) => ({ o, m })));
    const pos = hits.map((h) => h.m.listedPosition).filter((x): x is number => typeof x === "number" && x > 0);
    const positive = hits.filter((h) => toneOf(h.o, h.m) === "positive").length;
    return {
      ...b,
      coverage: pct(b.answers, valid.length) ?? 0,
      avgPosition: pos.length ? Math.round((pos.reduce((a, x) => a + x, 0) / pos.length) * 10) / 10 : null,
      positive: pct(positive, hits.length),
    };
  });

  // Coverage over time for each brand: share of answers naming it, per check.
  const runOrder = [...new Set(valid.map((o) => o.runId))]
    .map((id) => ({ id, at: Math.min(...valid.filter((o) => o.runId === id).map((o) => o.capturedAt.getTime())) }))
    .sort((a, b) => a.at - b.at);
  const brandSeries = {
    points: runOrder.map((r) => new Date(r.at)),
    series: brands.map((b) => ({
      key: b.key,
      name: b.name,
      self: b.key === "self",
      values: runOrder.map((r) => {
        const list = valid.filter((o) => o.runId === r.id);
        return pct(list.filter((o) => o.matches.some((m) => m.brandKey === b.key && effectiveMention(m))).length, list.length) ?? 0;
      }),
    })),
  };

  // Per AI source.
  const providers = [...new Set(allRows.map((o) => o.provider))];
  const engines = providers
    .map((p) => {
      const list = allRows.filter((o) => o.provider === p && isValid(o));
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
      tag: q.group,
      status: list.length === 0 ? "pending" : rate! >= 50 ? "won" : hits.length > 0 ? "partly" : "lost",
      rate,
      answers: list.length,
      namedOn: [...new Set(hits.map((o) => engineName(o.provider)))],
      rivals: [...rivalCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => nameOf.get(k) ?? k),
      checkedAt: list.length ? new Date(Math.max(...list.map((o) => o.capturedAt.getTime()))) : null,
      byEngine: Object.fromEntries(
        list.map((o) => {
          const m = selfHit(o);
          return [o.provider, { named: named(m), position: named(m) ? (m!.listedPosition ?? null) : null }];
        }),
      ),
    };
  });

  // Tone of the answers that name the business (estimated from their wording).
  const tones: Record<Tone, number> = { positive: 0, neutral: 0, negative: 0 };
  let estimatedTones = 0;
  for (const o of valid) {
    const m = selfHit(o);
    if (!named(m)) continue;
    if (!m!.sentiment) estimatedTones++;
    tones[toneOf(o, m!)]++;
  }

  // Gaps: keywords where AI names a competitor in an answer that leaves the business out.
  const gaps = keywords
    .map((k) => {
      const list = latest.get(k.id) ?? [];
      const missed = list.filter((o) => !named(selfHit(o)) && o.matches.some((m) => m.brandKey !== "self" && effectiveMention(m)));
      if (missed.length === 0) return null;
      const rivals = [...new Set(missed.flatMap((o) => o.matches.filter((m) => m.brandKey !== "self" && effectiveMention(m)).map((m) => nameOf.get(m.brandKey) ?? m.brandName)))];
      const hosts = [...new Set(missed.flatMap((o) => o.citations.map((c) => hostOf(c.url)).filter(Boolean) as string[]))];
      return { id: k.id, keyword: k.keyword, rivals, engines: [...new Set(missed.map((o) => engineName(o.provider)))], sources: hosts.slice(0, 3) };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null)
    .sort((a, b) => b.engines.length - a.engines.length);

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
    engine: engine ?? null,
    tag: tag ?? null,
    ranking,
    brandSeries,
    tone: { ...tones, positiveRate: pct(tones.positive, namedCount), estimated: estimatedTones > 0 },
    gaps,
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
        tone: named(selfHit(o)) ? toneOf(o, selfHit(o)!) : null,
        named: o.matches.filter((m) => effectiveMention(m)).map((m) => ({ key: m.brandKey, name: m.brandName, position: m.listedPosition })),
      })),
  };
}

/**
 * Every site and page AI assistants cited for the business's keywords:
 * how many answers used each domain, for which keywords, and whether the
 * business was named in those answers.
 */
export async function citationsFor(db: DbOrTx, ctx: Ctx, days = 30) {
  requireRole(ctx, "viewer");
  const from = new Date(Date.now() - days * 86_400_000);
  const [brands, rows] = await Promise.all([brandSpecs(db, ctx.workspaceId), queryObservations(db, ctx, { from }, 3000)]);
  const valid = rows.filter(isValid);
  const own = brands.find((b) => b.key === "self")?.domains ?? [];
  // Keywords no longer tracked still label their past answers.
  const ids = [...new Set(valid.map((o) => o.questionId))];
  const questions = ids.length
    ? await db
        .select({ id: trackedQuestions.id, keyword: trackedQuestions.keyword, text: trackedQuestions.text })
        .from(trackedQuestions)
        .where(and(eq(trackedQuestions.workspaceId, ctx.workspaceId), inArray(trackedQuestions.id, ids)))
    : [];
  const keywordOf = new Map(questions.map((q) => [q.id, q.keyword ?? q.text]));
  const domains = new Map<string, { answers: Set<string>; keywords: Set<string>; withYou: Set<string> }>();
  const urls = new Map<string, { title: string | null; host: string; answers: Set<string>; keywords: Set<string> }>();
  for (const o of valid) {
    const you = named(selfHit(o));
    for (const c of o.citations) {
      const host = hostOf(c.url);
      if (!host) continue;
      const d = domains.get(host) ?? { answers: new Set(), keywords: new Set(), withYou: new Set() };
      d.answers.add(o.id);
      d.keywords.add(keywordOf.get(o.questionId) ?? o.questionText);
      if (you) d.withYou.add(o.id);
      domains.set(host, d);
      const u = urls.get(c.url) ?? { title: c.title ?? null, host, answers: new Set(), keywords: new Set() };
      u.answers.add(o.id);
      u.keywords.add(keywordOf.get(o.questionId) ?? o.questionText);
      urls.set(c.url, u);
    }
  }
  const withSources = valid.filter((o) => o.citations.length > 0).length;
  return {
    days,
    answers: valid.length,
    withSources,
    domains: [...domains.entries()]
      .map(([host, d]) => ({
        host,
        answers: d.answers.size,
        share: pct(d.answers.size, withSources) ?? 0,
        keywords: [...d.keywords],
        namedYou: d.withYou.size,
        own: own.some((x) => host === x || host.endsWith(`.${x}`)),
      }))
      .sort((a, b) => b.answers - a.answers),
    urls: [...urls.entries()]
      .map(([url, u]) => ({ url, title: u.title, host: u.host, answers: u.answers.size, keywords: [...u.keywords] }))
      .sort((a, b) => b.answers - a.answers)
      .slice(0, 50),
  };
}

const csvCell = (v: string | number | null) => {
  const s = v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** The keyword results as CSV, for spreadsheets and reports. */
export function keywordsCsv(p: Performance) {
  const head = ["Keyword", "Question asked", "Result", "Recommended in (%)", "Answers", "Assistants that recommend you", "Also named", "Last checked"];
  const label = { won: "Recommended", partly: "Sometimes", lost: "Not yet", pending: "Waiting" } as const;
  const lines = p.keywords.map((k) =>
    [k.keyword, k.question, label[k.status], k.rate, k.answers, k.namedOn.join("; "), k.rivals.join("; "), k.checkedAt ? k.checkedAt.toISOString().slice(0, 10) : null]
      .map(csvCell)
      .join(","),
  );
  return [head.join(","), ...lines].join("\n") + "\n";
}
