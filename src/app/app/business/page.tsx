import { listingStatus } from "@/lib/geo";
import { Badge, Card, DefinitionList, LinkButton, Notice, PageHeader } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { getProfile, requireBusiness } from "@/server/business";
import { can } from "@/server/context";
import { listClaims } from "@/server/claims";
import { ClaimsCard } from "./claims-card";
import { ConfirmContactForm, DetailsForm, ProfilePublishForm } from "./forms";

export const metadata = { title: "My Business" };

export default async function BusinessPage() {
  const ctx = await requireCtx();
  const db = await getDb();
  const b = await requireBusiness(db, ctx);
  const [profile, claims] = await Promise.all([getProfile(db, ctx), listClaims(db, ctx)]);
  const published = profile?.status === "published";

  return (
    <>
      <PageHeader icon="business"
        title="My Business"
        description="These facts are the single source for your website and public profile. Only what you confirm is shown publicly."
        actions={
          published && profile ? (
            <LinkButton href={`/b/${profile.slug}`} variant="secondary" target="_blank">
              View public profile
            </LinkButton>
          ) : undefined
        }
      />

      {!b.publicContactConfirmedAt && (
        <div className="mb-6">
          <Notice tone="warn" title="Confirm your public contact details">
            <p className="mb-3">
              We&apos;ll show: {[b.phone && `phone ${b.phone}`, b.whatsapp && `WhatsApp ${b.whatsapp}`, b.email && `email ${b.email}`, b.showAddress && b.address && `address ${b.address}`]
                .filter(Boolean)
                .join(", ") || "no contact details"}
              .
            </p>
            {can(ctx, "editor") && <ConfirmContactForm />}
          </Notice>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <DetailsForm
            disabled={!can(ctx, "editor")}
            initial={{
              expectedVersion: String(b.version),
              name: b.name,
              category: b.category,
              description: b.description ?? "",
              audience: b.audience ?? "",
              services: b.services.map((s) => (s.description ? `${s.name}: ${s.description}` : s.name)).join("\n"),
              serviceAreas: b.serviceAreas.join(", "),
              hours: b.hours.map((h) => `${h.days}: ${h.hours}`).join("\n"),
              city: b.city,
              region: b.region ?? "",
              address: b.address ?? "",
              showAddress: b.showAddress ? "on" : "",
              phone: b.phone ?? "",
              whatsapp: b.whatsapp ?? "",
              email: b.email ?? "",
              websiteUrl: b.websiteUrl ?? "",
              bookingUrl: b.bookingUrl ?? "",
              foundedYear: b.foundedYear ? String(b.foundedYear) : "",
              teamSize: b.teamSize ? String(b.teamSize) : "",
              projectsCompleted: b.projectsCompleted ? String(b.projectsCompleted) : "",
              credentials: b.credentials ?? "",
              listings: b.listings.join("\n"),
            }}
          />
        </Card>
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold">Directory profile</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {published ? <Badge tone="ok">Published</Badge> : <Badge tone="neutral">Not published</Badge>}
              <Badge tone={profile?.verification === "none" ? "neutral" : "ok"}>
                {profile?.verification === "none" ? "Ownership not verified" : "Ownership verified"}
              </Badge>
              {profile?.status === "disputed" && <Badge tone="err">Under review</Badge>}
            </div>
            {profile?.publishedAt && (
              <p className="mt-2 text-sm text-muted">
                Last updated {profile.publishedAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
            )}
            <p className="mt-3 text-sm text-muted">
              Your profile shows the details you confirmed. Publishing your website also updates it.
            </p>
            {can(ctx, "owner") && (
              <div className="mt-4">
                <ProfilePublishForm published={published} />
              </div>
            )}
          </Card>
          <Card>
            <h2 className="font-semibold">Get listed where AI looks</h2>
            <p className="mt-1 text-sm text-muted">
              AI assistants trust a business they see in several places with the same name, phone and address. Create these listings with exactly the details above, then paste each link under “Your other listings”.
            </p>
            <ul className="mt-3 space-y-2">
              {listingStatus(b.listings).map((l) => (
                <li key={l.key} className="flex items-start gap-3 text-sm">
                  <span className={`mt-0.5 inline-grid size-5 shrink-0 place-items-center rounded-full ${l.url ? "bg-ok-bg text-ok-fg" : "border border-border text-muted"}`} aria-hidden="true">
                    {l.url ? "✓" : ""}
                  </span>
                  <span className="min-w-0">
                    <span className="font-semibold">{l.label}</span>
                    {l.url ? (
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="ml-2 underline">View</a>
                    ) : (
                      <a href={l.create} target="_blank" rel="noopener noreferrer" className="ml-2 underline">Create</a>
                    )}
                    <span className="block text-muted">{l.why}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <ClaimsCard claims={claims} websiteUrl={b.websiteUrl} isOwner={can(ctx, "owner")} />
          <Card>
            <h2 className="font-semibold">Private details</h2>
            <DefinitionList items={[["Street address", b.showAddress ? "Shown publicly" : "Hidden"]]} />
          </Card>
        </div>
      </div>
    </>
  );
}
