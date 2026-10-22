/**
 * Metric definitions (PRD §10). Versioned so exports and comparisons can say
 * which rules produced a number.
 */
export const METRIC_DEFINITIONS_VERSION = 1;

export const VALID_STATUSES = ["answered", "answered_uncited"] as const;
export const SMALL_SAMPLE = 30;

export type MetricObservation = {
  id: string;
  status: string;
  questionId: string;
  provider: string;
  matches: { brandKey: string; mentioned: boolean; cited: boolean; ambiguous: boolean; correction: string | null }[];
};

export type Ratio = { numerator: number; denominator: number; rate: number | null };

const ratio = (n: number, d: number): Ratio => ({ numerator: n, denominator: d, rate: d > 0 ? n / d : null });

/** Effective mention after owner corrections; unreviewed ambiguous matches don't count. */
export function effectiveMention(m: MetricObservation["matches"][number]): boolean {
  if (m.correction === "confirmed") return true;
  if (m.correction === "rejected") return false;
  return m.mentioned && !m.ambiguous;
}

export function computeMetrics(rows: MetricObservation[], brandKeys: string[]) {
  const valid = rows.filter((r) => (VALID_STATUSES as readonly string[]).includes(r.status));
  const failures: Record<string, number> = {};
  for (const r of rows) if (!(VALID_STATUSES as readonly string[]).includes(r.status)) failures[r.status] = (failures[r.status] ?? 0) + 1;

  const self = (r: MetricObservation) => r.matches.find((m) => m.brandKey === "self");
  // A brand counts at most once per answer.
  const brandCounts = Object.fromEntries(brandKeys.map((k) => [k, valid.filter((r) => r.matches.some((m) => m.brandKey === k && effectiveMention(m))).length]));
  const totalBrandAnswers = Object.values(brandCounts).reduce((a, b) => a + b, 0);
  const ambiguousPending = valid.filter((r) => r.matches.some((m) => m.brandKey === "self" && m.ambiguous && !m.correction)).length;

  return {
    definitionsVersion: METRIC_DEFINITIONS_VERSION,
    attempted: rows.length,
    valid: valid.length,
    failures,
    smallSample: valid.length < SMALL_SAMPLE,
    ambiguousPending,
    mention: ratio(valid.filter((r) => { const m = self(r); return !!m && effectiveMention(m); }).length, valid.length),
    citation: ratio(valid.filter((r) => self(r)?.cited).length, valid.length),
    competitorShare: Object.fromEntries(brandKeys.map((k) => [k, ratio(brandCounts[k], totalBrandAnswers)])),
  };
}

/** Restricts two periods to the (question, provider) pairs present in both. */
export function matchedPairs(a: MetricObservation[], b: MetricObservation[]) {
  const key = (r: MetricObservation) => `${r.questionId}|${r.provider}`;
  const inA = new Set(a.map(key));
  const inB = new Set(b.map(key));
  const shared = new Set([...inA].filter((k) => inB.has(k)));
  return {
    a: a.filter((r) => shared.has(key(r))),
    b: b.filter((r) => shared.has(key(r))),
    sharedPairs: shared.size,
    fullOverlap: shared.size === inA.size && shared.size === inB.size,
  };
}
