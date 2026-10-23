import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { can } from "@/server/context";
import { METHOD_LABEL } from "@/server/monitoring/registry";
import { queryObservations } from "@/server/monitoring/service";
import type { CollectionMethod } from "@/server/monitoring/types";
import { correctMatchAction } from "../actions";
import { applyMetric, parseEvidence, type EvidenceQuery } from "./filters";

export const metadata = { title: "Evidence" };

const STATUS = {
  answered: ["ok", "Answered with sources"],
  answered_uncited: ["info", "Answered, no sources"],
  refusal: ["warn", "Declined to answer"],
  partial: ["warn", "Incomplete answer"],
  timeout: ["err", "Timed out"],
  unavailable: ["err", "Source unavailable"],
  error: ["err", "Error"],
} as const;

const METRIC_TITLE: Record<string, string> = {
  mention: "Answers that mention you",
  citation: "Answers that link to your website",
  ambiguous: "Uncertain matches to review",
};

export default async function EvidencePage({ searchParams }: { searchParams: Promise<EvidenceQuery> }) {
  const ctx = await requireCtx();
  const sp = await searchParams;
  const { filters, metric } = parseEvidence(sp);
  const all = await queryObservations(await getDb(), ctx, filters);
  const rows = applyMetric(all, metric);
  const canEdit = can(ctx, "editor");
  const exportHref = `/app/visibility/export?${new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][])}`;

  return (
    <>
      <PageHeader icon="visibility"
        title={metric ? METRIC_TITLE[metric] ?? "Saved answers" : "Saved answers"}
        description={`${rows.length} of ${all.length} saved attempts match these filters${filters.from ? ` (${filters.from.toLocaleDateString("en-IN")} – ${filters.to?.toLocaleDateString("en-IN")})` : ""}.`}
        actions={
          <>
            <Link href="/app/visibility" className="inline-flex min-h-11 items-center px-3 font-semibold underline">
              Back
            </Link>
            <a href={exportHref} className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 font-semibold">
              Export CSV
            </a>
          </>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="No saved answers match" />
      ) : (
        <ul className="space-y-4">
          {rows.map((o) => (
            <li key={o.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-semibold">{o.questionText}</h2>
                    <p className="text-sm text-muted">
                      {o.provider} · {o.model ?? "model not reported"} · {o.capturedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · sample {o.sample}
                    </p>
                    <p className="text-xs text-muted">
                      {METHOD_LABEL[o.sourceType as CollectionMethod] ?? o.sourceType} · location: {o.requestedLocale ?? "none"} ({o.appliedLocale.replace("_", " ")}) · analysis v{o.extractionVersion}
                    </p>
                  </div>
                  <Badge tone={STATUS[o.status][0]}>{STATUS[o.status][1]}</Badge>
                </div>
                {o.rawAnswer ? (
                  <details className="mt-3" open={rows.length <= 5}>
                    <summary className="cursor-pointer text-sm font-semibold">Full answer</summary>
                    <p className="mt-2 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-sm">{o.rawAnswer}</p>
                  </details>
                ) : (
                  <p className="mt-3 text-sm text-muted">{o.errorMessage ?? "No answer text was returned."}</p>
                )}
                {o.citations.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold">Sources cited ({o.citations.length})</h3>
                    <ul className="mt-1 space-y-1 text-sm">
                      {o.citations.map((c) => (
                        <li key={c.url} className="break-all">
                          <a href={c.url} rel="noopener nofollow noreferrer" target="_blank" className="underline">
                            {c.title || c.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {o.matches.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold">What we found</h3>
                    <ul className="mt-1 space-y-2 text-sm">
                      {o.matches
                        .filter((m) => m.mentioned || m.cited || m.correction)
                        .map((m) => (
                          <li key={m.id} className="rounded-lg border border-border p-2">
                            <span className="font-semibold">{m.brandKey === "self" ? `${m.brandName} (you)` : m.brandName}</span>
                            {": "}
                            {m.mentioned ? `mentioned as “${m.matchedText}”` : "not mentioned"}
                            {m.cited && " · your site cited"}
                            {m.listedPosition && ` · #${m.listedPosition} in a list`}
                            {m.ambiguous && !m.correction && <Badge tone="warn">Uncertain</Badge>}
                            {m.correction && (
                              <span className="block text-xs text-muted">
                                Corrected: {m.correction} — “{m.correctionReason}”
                              </span>
                            )}
                            {canEdit && m.brandKey === "self" && (
                              <div className="mt-2">
                                <ActionForm action={correctMatchAction} submitLabel="Save correction" variant="secondary" inline>
                                  <input type="hidden" name="matchId" value={m.id} />
                                  <select name="correction" defaultValue={m.correction ?? ""} aria-label="Correction" className="min-h-11 rounded-lg border border-border bg-surface px-2">
                                    <option value="">No correction</option>
                                    <option value="confirmed">This is my business</option>
                                    <option value="rejected">This is not my business</option>
                                  </select>
                                  <input name="reason" placeholder="Why?" aria-label="Reason" className="min-h-11 rounded-lg border border-border bg-surface px-2" />
                                </ActionForm>
                              </div>
                            )}
                          </li>
                        ))}
                      {!o.matches.some((m) => m.mentioned || m.cited) && <li className="text-muted">No tracked business was mentioned.</li>}
                    </ul>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
