import { ActionForm } from "@/components/action-form";
import { Badge, Card, TextArea } from "@/components/ui";
import type { ownershipClaims } from "@/db/schema";
import { DNS_PREFIX, VERIFY_FILE_PATH } from "@/server/claims";
import { startClaimAction, verifyClaimAction } from "./actions";

type Claim = typeof ownershipClaims.$inferSelect;
const STATUS = { pending: ["warn", "Waiting"], verified: ["ok", "Verified"], rejected: ["err", "Rejected"], disputed: ["err", "Under review"] } as const;
const METHOD = { dns: "DNS record", file: "Website file", manual: "Manual review" } as Record<string, string>;

export function ClaimsCard({ claims, websiteUrl, isOwner }: { claims: Claim[]; websiteUrl: string | null; isOwner: boolean }) {
  const verified = claims.find((c) => c.status === "verified");
  const pending = claims.filter((c) => c.status === "pending" && c.method !== "manual");
  return (
    <Card>
      <h2 className="font-semibold">Prove you own this business</h2>
      <p className="mt-1 text-sm text-muted">
        Signing in proves you can use this account, not that you own the business. Verification shows customers how
        ownership was confirmed.
      </p>
      {verified && (
        <p className="mt-3">
          <Badge tone="ok">Verified by {METHOD[verified.method]}</Badge>
        </p>
      )}
      <ul className="mt-3 space-y-3">
        {claims.map((c) => (
          <li key={c.id} className="rounded-lg border border-border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{METHOD[c.method]}</span>
              <Badge tone={STATUS[c.status][0]}>{STATUS[c.status][1]}</Badge>
            </div>
            {c.status === "pending" && c.method === "dns" && (
              <p className="mt-2">
                Add a <strong>TXT</strong> record named <code className="break-all">{`${DNS_PREFIX}.${c.target}`}</code> with the value{" "}
                <code className="break-all">{c.verificationToken}</code>
              </p>
            )}
            {c.status === "pending" && c.method === "file" && (
              <p className="mt-2">
                Put a text file at <code className="break-all">{`https://${c.target}${VERIFY_FILE_PATH}`}</code> containing only{" "}
                <code className="break-all">{c.verificationToken}</code>
              </p>
            )}
            {c.status === "disputed" && <p className="mt-2">Another account claimed the same website. Our team will contact you.</p>}
          </li>
        ))}
      </ul>
      {isOwner && pending.map((c) => (
        <div key={c.id} className="mt-3">
          <ActionForm action={verifyClaimAction} submitLabel="Check now" variant="secondary" pendingLabel="Checking…">
            <input type="hidden" name="claimId" value={c.id} />
          </ActionForm>
        </div>
      ))}
      {isOwner && !verified && (
        <div className="mt-4 border-t border-border pt-4">
          <ActionForm action={startClaimAction} submitLabel="Start verification">
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">How would you like to verify?</legend>
              {websiteUrl && (
                <>
                  <label className="flex min-h-11 items-center gap-3">
                    <input type="radio" name="method" value="dns" defaultChecked className="size-5" /> Add a DNS record (recommended)
                  </label>
                  <label className="flex min-h-11 items-center gap-3">
                    <input type="radio" name="method" value="file" className="size-5" /> Upload a file to my website
                  </label>
                </>
              )}
              <label className="flex min-h-11 items-center gap-3">
                <input type="radio" name="method" value="manual" defaultChecked={!websiteUrl} className="size-5" /> Ask for a manual review
              </label>
            </fieldset>
            <TextArea label="Notes for manual review" name="note" optional hint="e.g. GST registration name, or how we can confirm you run this business" rows={2} />
          </ActionForm>
        </div>
      )}
    </Card>
  );
}
