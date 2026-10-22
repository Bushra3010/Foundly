import { Card, LinkButton, Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { missingOptionalFacts } from "@/lib/site/generate";
import { requireBusiness } from "@/server/business";

export const metadata = { title: "Improve My Business" };

export default async function ImprovePage() {
  const ctx = await requireCtx();
  const business = await requireBusiness(await getDb(), ctx);
  const missing = missingOptionalFacts(business);
  return (
    <>
      <PageHeader title="Improve My Business" description="Small, practical changes that make your information clearer for customers." />
      <div className="mb-6">
        <Notice tone="info" title="Full website audits are coming soon">
          Automated checks and approval-based improvement drafts are part of a later release. These suggestions come
          from the details you&apos;ve given us so far. Improvements make your pages more useful; they can&apos;t
          guarantee that AI services will mention you.
        </Notice>
      </div>
      {missing.length === 0 ? (
        <Card>
          <p className="text-muted">You&apos;ve filled in every detail we currently use.</p>
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {missing.map((m) => (
            <li key={m.field}>
              <Card className="h-full">
                <h2 className="font-semibold">Add {m.label.toLowerCase()}</h2>
                <p className="mt-1 text-sm text-muted">{m.why}.</p>
                <LinkButton href="/app/business" variant="secondary" className="mt-3">
                  Add in My Business
                </LinkButton>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
