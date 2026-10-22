import { Badge, Card, Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { METHOD_LABEL, PROVIDERS } from "@/lib/providers";
import { GROUP_LABEL, suggestQuestions } from "@/lib/questions";
import { requireBusiness } from "@/server/business";

export const metadata = { title: "AI Visibility" };

export default async function VisibilityPage() {
  const ctx = await requireCtx();
  const business = await requireBusiness(await getDb(), ctx);
  const enabled = PROVIDERS.filter((p) => p.enabled);

  return (
    <>
      <PageHeader
        title="AI Visibility"
        description="See whether supported AI answers mention or cite your business, for a set of questions you choose."
      />
      {enabled.length === 0 && (
        <div className="mb-6">
          <Notice tone="info" title="No AI sources are connected yet">
            We only turn on a source after checking that we can collect its answers accurately. Until then we show no
            scores — never estimates or sample data.
          </Notice>
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold">Sources</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {PROVIDERS.map((p) => (
          <li key={p.key}>
            <Card>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{p.label}</h3>
                {p.enabled ? <Badge tone="ok">Connected</Badge> : <Badge tone="neutral">Not connected</Badge>}
              </div>
              <p className="mt-2 text-sm text-muted">{p.method ? METHOD_LABEL[p.method] : p.note}</p>
              <p className="mt-1 text-sm text-muted">Last successful check: none</p>
            </Card>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 mb-1 text-lg font-semibold">Questions we&apos;d suggest tracking</h2>
      <p className="mb-3 text-sm text-muted">
        Based on your services and areas. You&apos;ll approve the final list before any checks run. Questions with your
        business name are kept separate because they make a mention more likely.
      </p>
      <Card>
        <ul className="divide-y divide-border">
          {suggestQuestions(business).map((q) => (
            <li key={q.text} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span>{q.text}</span>
              <Badge tone={q.group === "branded" ? "warn" : "neutral"}>{GROUP_LABEL[q.group]}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="mt-8 mb-3 text-lg font-semibold">How we&apos;ll measure</h2>
      <Card>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-semibold">Mention rate</dt>
            <dd className="text-muted">Valid answers that mention your business ÷ all valid answers checked. Failed checks are excluded and shown separately.</dd>
          </div>
          <div>
            <dt className="font-semibold">Citation rate</dt>
            <dd className="text-muted">Valid answers that link to your website ÷ all valid answers checked.</dd>
          </div>
          <div>
            <dt className="font-semibold">Evidence</dt>
            <dd className="text-muted">Every number opens the saved answers behind it, with the question, source, time and links.</dd>
          </div>
        </dl>
      </Card>
    </>
  );
}
