import { effectiveMention } from "@/server/monitoring/metrics";
import type { EvidenceFilters, ObservationWithMatches } from "@/server/monitoring/service";

export type EvidenceQuery = { days?: string; provider?: string; status?: string; metric?: string; run?: string; question?: string };

export function parseEvidence(sp: EvidenceQuery): { filters: EvidenceFilters; metric?: string; days: number } {
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const statuses = ["answered", "answered_uncited", "refusal", "partial", "timeout", "unavailable", "error"];
  const filters: EvidenceFilters = sp.run
    ? { runId: sp.run }
    : { from: new Date(Date.now() - days * 86_400_000), to: new Date(), provider: sp.provider || undefined, questionId: sp.question || undefined };
  if (sp.status && statuses.includes(sp.status)) filters.status = sp.status;
  return { filters, metric: sp.metric, days };
}

/** Applies the same rule the metric uses, so the list is exactly the numerator. */
export function applyMetric(rows: ObservationWithMatches[], metric?: string) {
  const self = (r: ObservationWithMatches) => r.matches.find((m) => m.brandKey === "self");
  if (metric === "mention") return rows.filter((r) => { const m = self(r); return !!m && effectiveMention(m); });
  if (metric === "citation") return rows.filter((r) => self(r)?.cited);
  if (metric === "ambiguous") return rows.filter((r) => { const m = self(r); return !!m && m.ambiguous && !m.correction; });
  return rows;
}
