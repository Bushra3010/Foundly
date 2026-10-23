import { ActionForm } from "@/components/action-form";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { listClaimsForReview } from "@/server/admin";
import { resolveClaimAction } from "../actions";

export default async function AdminClaims() {
  const rows = await listClaimsForReview(await getDb());
  return (
    <>
      <PageHeader icon="shield" title="Ownership claims" description="Disputed claims and manual-review requests. A duplicate claim never replaces an existing owner automatically." />
      {rows.length === 0 ? (
        <EmptyState title="Nothing to review" />
      ) : (
        <ul className="space-y-3">
          {rows.map(({ claim, business, city }) => (
            <li key={claim.id}>
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="font-semibold">{business}</span> · {city} · {claim.method} {claim.target && `· ${claim.target}`}
                  </span>
                  <Badge tone={claim.status === "disputed" ? "err" : "warn"}>{claim.status}</Badge>
                </div>
                {claim.reviewNote && <p className="mt-2 text-sm">Owner note: {claim.reviewNote}</p>}
                <p className="mt-1 text-xs text-muted">Workspace {claim.workspaceId} · {claim.createdAt.toLocaleString("en-IN")}</p>
                <div className="mt-3">
                  <ActionForm action={resolveClaimAction} submitLabel="Record decision" variant="secondary" inline>
                    <input type="hidden" name="claimId" value={claim.id} />
                    <select name="decision" aria-label="Decision" className="min-h-11 rounded-lg border border-border bg-surface px-2">
                      <option value="verified">Verify this claim</option>
                      <option value="rejected">Reject this claim</option>
                    </select>
                    <input name="reason" aria-label="Reason" placeholder="Evidence reviewed (required)" className="min-h-11 min-w-56 flex-1 rounded-lg border border-border bg-surface px-2" />
                  </ActionForm>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
