import Link from "next/link";
import { Badge, Card, LinkButton, Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { can } from "@/server/context";
import { requireCurrentBusiness } from "@/server/current";
import { CONTACT_TEXT, latestWebsiteRequest, OPEN_STATUSES, STATUS_TEXT } from "@/server/website-requests";
import { CancelRequestForm, ChangeAddress, ConnectWebsiteForm, NoWebsiteForm, RequestWebsiteForm } from "./panels";

export const metadata = { title: "My Website" };

// The steps an owner sees while Foundly's team builds their website.
const STEPS = ["new", "contacted", "in_progress", "delivered"] as const;

export default async function WebsitePage({ searchParams }: { searchParams: Promise<{ connected?: string; changed?: string }> }) {
  const ctx = await requireCtx();
  const db = await getDb();
  const business = await requireCurrentBusiness(db, ctx);
  const { connected, changed } = await searchParams;
  const canEdit = can(ctx, "editor");

  if (business.hasWebsite) {
    const url = business.websiteUrl;
    return (
      <>
        <PageHeader icon="website" title="My Website" description="Your website, connected to Foundly. We never change it without your approval." />
        {changed && (
          <div className="mb-4">
            <Notice tone="ok" title="Website address updated">
              We&apos;re checking the new site now. Your score and fixes update in about a minute on <Link href="/app/improve" className="font-semibold underline">Improve My Business</Link>.
            </Notice>
          </div>
        )}
        {connected && (
          <div className="mb-4">
            <Notice tone="ok" title="Your website is connected">
              We&apos;re checking it now. See what AI assistants can read, and what to fix, on <Link href="/app/improve" className="font-semibold underline">Improve My Business</Link>.
            </Notice>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="font-semibold">Connected website</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="ok">Connected</Badge>
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="break-all font-semibold underline">{url}</a>
              ) : (
                <span className="text-sm text-muted">No address saved yet</span>
              )}
            </div>
            <p className="mt-3 text-sm text-muted">
              We read your public pages only. We never need your website login, and nothing on your site changes unless you approve it.
            </p>
            <ChangeAddress url={url} canEdit={canEdit}>
              {url && <LinkButton href="/app/improve">Check my website</LinkButton>}
            </ChangeAddress>
          </Card>
          <Card>
            <h2 className="font-semibold">Apply fixes to your site</h2>
            <p className="mt-2 text-sm text-muted">
              We list what to improve on your site, with ready-to-paste text for each fix. Nothing changes on your site unless you make the change.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <LinkButton href="/app/improve" variant="secondary">See improvements</LinkButton>
            </div>
          </Card>
        </div>
        {canEdit && (
          <div className="mt-6">
            <Card>
              <h2 className="font-semibold">Don&apos;t have this website any more?</h2>
              <p className="mt-1 mb-3 text-sm text-muted">Remove it and our team can build you a new one.</p>
              <NoWebsiteForm />
            </Card>
          </div>
        )}
      </>
    );
  }

  const request = await latestWebsiteRequest(db, ctx);
  const open = request && (OPEN_STATUSES as readonly string[]).includes(request.status) ? request : null;

  if (open) {
    const at = STEPS.indexOf(open.status as (typeof STEPS)[number]);
    return (
      <>
        <PageHeader icon="website" title="My Website" description="Our team is building your website." />
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Your website request</h2>
            <Badge tone="info">{STATUS_TEXT[open.status]}</Badge>
          </div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s} className={`rounded-lg border p-3 text-sm ${i <= at ? "border-text font-semibold" : "border-border text-muted"}`}>
                <span aria-hidden="true">{i < at ? "✓ " : `${i + 1}. `}</span>
                {STATUS_TEXT[s]}
                <span className="sr-only">{i < at ? " (done)" : i === at ? " (current)" : " (to do)"}</span>
              </li>
            ))}
          </ol>
          {open.teamNote && (
            <div className="mt-4">
              <Notice tone="info" title="Note from our team">{open.teamNote}</Notice>
            </div>
          )}
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">What it should do</dt>
              <dd className="whitespace-pre-line">{open.goal}</dd>
            </div>
            <div>
              <dt className="text-muted">We&apos;ll contact you by</dt>
              <dd>
                {CONTACT_TEXT[open.contactMethod]} · {open.contactValue}
                {open.contactTime && ` · ${open.contactTime}`}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted">
            When your website is ready, it connects to Foundly automatically, so we can check it and track how AI assistants mention you.
          </p>
          {canEdit && (
            <div className="mt-4">
              <CancelRequestForm />
            </div>
          )}
        </Card>
        {canEdit && (
          <Card className="mt-4">
            <h2 className="font-semibold">Already have a website?</h2>
            <p className="mt-1 mb-4 text-sm text-muted">Connect it instead. We&apos;ll cancel your request so our team doesn&apos;t build a second one.</p>
            <ConnectWebsiteForm />
          </Card>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader
        icon="website"
        title="My Website"
        description="Connect your website, or let our team build one designed around your business."
      />
      {canEdit && (
        <Card className="mb-4">
          <h2 className="font-semibold">Connect your website</h2>
          <p className="mt-1 mb-4 text-sm text-muted">Already have one? Enter its address. We only read your public pages and never need your login.</p>
          <ConnectWebsiteForm />
        </Card>
      )}
      <h2 className="mb-3 mt-6 text-lg font-semibold">No website yet? We&apos;ll build one for you</h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="font-semibold">Tell us about the website you need</h2>
          <p className="mt-1 mb-4 text-sm text-muted">Send a short brief. We&apos;ll contact you to plan it together, then build it for you.</p>
          {canEdit ? (
            <RequestWebsiteForm defaults={{ phone: business.whatsapp ?? business.phone ?? "", email: business.email ?? ctx.user.email }} />
          ) : (
            <p className="text-sm text-muted">Ask a workspace owner or editor to request your website.</p>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">How it works</h2>
          <ol className="mt-3 space-y-3 text-sm">
            <li><strong>1. Send your brief.</strong> It takes a minute.</li>
            <li><strong>2. We talk.</strong> By phone, WhatsApp or video call, when it suits you.</li>
            <li><strong>3. We build it.</strong> A professional website made for your business.</li>
            <li><strong>4. It connects to Foundly.</strong> We check it and track how AI assistants mention you.</li>
          </ol>
          {request?.status === "delivered" && request.deliveredUrl && (
            <p className="mt-4 text-sm text-muted">Your last website from us was {request.deliveredUrl}.</p>
          )}
        </Card>
      </div>
    </>
  );
}
