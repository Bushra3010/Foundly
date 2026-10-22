import { ActionForm } from "@/components/action-form";
import { Badge, Card, TextField } from "@/components/ui";
import type { customDomains } from "@/db/schema";
import { cnameTarget, DOMAIN_TXT_PREFIX } from "@/server/domains";
import { addDomainAction, removeDomainAction, verifyDomainAction } from "./actions";

type Domain = typeof customDomains.$inferSelect;
const STATUS = { pending: ["warn", "Waiting for DNS"], verified: ["ok", "DNS verified"], failed: ["err", "DNS not correct yet"], removed: ["neutral", "Removed"] } as const;

export function DomainsCard({ domains, isOwner }: { domains: Domain[]; isOwner: boolean }) {
  return (
    <Card>
      <h2 className="font-semibold">Your own domain</h2>
      <p className="mt-1 text-sm text-muted">
        Connect a domain you already own. We don&apos;t sell or renew domains, and we never take ownership of yours.
      </p>
      <ul className="mt-3 space-y-3">
        {domains.map((d) => (
          <li key={d.id} className="rounded-lg border border-border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold break-all">{d.hostname}</span>
              <Badge tone={STATUS[d.status][0]}>{STATUS[d.status][1]}</Badge>
            </div>
            <table className="mt-2 w-full table-fixed text-left text-xs">
              <thead>
                <tr className="text-muted">
                  <th className="w-16">Type</th>
                  <th>Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody className="break-all font-mono">
                <tr>
                  <td>TXT</td>
                  <td>{`${DOMAIN_TXT_PREFIX}.${d.hostname}`}</td>
                  <td>{d.verificationToken}</td>
                </tr>
                <tr>
                  <td>CNAME</td>
                  <td>{d.hostname}</td>
                  <td>{cnameTarget()}</td>
                </tr>
              </tbody>
            </table>
            {d.lastError && <p className="mt-2 text-err-fg">{d.lastError}</p>}
            {d.lastCheckedAt && <p className="mt-1 text-muted">Last checked {d.lastCheckedAt.toLocaleString("en-IN")}</p>}
            {d.status === "verified" && (
              <p className="mt-1 text-muted">Security certificate: issued automatically by your host after DNS verifies. Check the address loads with https before sharing it.</p>
            )}
            {isOwner && (
              <div className="mt-2 flex flex-wrap gap-2">
                <ActionForm action={verifyDomainAction} submitLabel="Check DNS" variant="secondary" pendingLabel="Checking…" inline>
                  <input type="hidden" name="domainId" value={d.id} />
                </ActionForm>
                <ActionForm action={removeDomainAction} submitLabel="Disconnect" variant="ghost" inline>
                  <input type="hidden" name="domainId" value={d.id} />
                </ActionForm>
              </div>
            )}
          </li>
        ))}
      </ul>
      {isOwner && domains.length === 0 && (
        <div className="mt-3">
          <ActionForm action={addDomainAction} submitLabel="Connect domain">
            <TextField label="Domain" name="hostname" placeholder="www.example.com" autoCapitalize="none" spellCheck={false} />
          </ActionForm>
        </div>
      )}
    </Card>
  );
}
