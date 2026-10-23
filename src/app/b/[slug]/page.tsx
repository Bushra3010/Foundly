import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PublicHeader } from "@/components/public-header";
import { Badge, Card } from "@/components/ui";
import { getDb } from "@/db";
import { jsonLdScript, phoneDigits } from "@/lib/profile";
import { businessGraph } from "@/lib/geo";
import { getPublicProfile } from "@/server/directory";

type Props = { params: Promise<{ slug: string }> };

const load = cache(async (slug: string) => getPublicProfile(await getDb(), slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await load((await params).slug);
  if (!row) return { title: "Business not found", robots: { index: false } };
  const p = row.profile;
  return {
    title: `${p.name} — ${p.category} in ${p.city}`,
    description: (p.description ?? `${p.name}: ${p.category} in ${p.city}. ${p.services.map((s) => s.name).join(", ")}`).slice(0, 170),
    alternates: { canonical: `/b/${row.slug}` },
  };
}

const VERIFICATION_TEXT: Record<string, string> = {
  none: "Ownership not yet verified",
  dns: "Verified by website DNS",
  file: "Verified by website file",
  email: "Verified by business email",
  manual: "Verified by manual review",
};

export default async function ProfilePage({ params }: Props) {
  const row = await load((await params).slug);
  if (!row) notFound();
  const p = row.profile;
  const btn = "inline-flex min-h-11 items-center rounded-lg px-4 font-semibold";
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const ld = businessGraph({
    ...p,
    url: row.siteSlug ? `${appUrl}/s/${row.siteSlug}` : p.websiteUrl,
    profileUrl: `${appUrl}/b/${row.slug}`,
    sameAs: p.websiteUrl ? [p.websiteUrl] : [],
  });

  return (
    <>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <main id="main" className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold">{p.name}</h1>
        <p className="mt-1 text-lg text-muted">
          {p.category} · {p.address ? `${p.address}, ` : ""}
          {p.city}
          {p.region ? `, ${p.region}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={row.verification === "none" ? "neutral" : "ok"}>{VERIFICATION_TEXT[row.verification] ?? "Ownership not yet verified"}</Badge>
          <Badge tone="neutral">Updated {new Date(p.updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</Badge>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {p.phone && (
            <a href={`tel:+${phoneDigits(p.phone, p.country)}`} className={`${btn} bg-brand text-brand-contrast`}>
              Call
            </a>
          )}
          {p.whatsapp && (
            <a href={`https://wa.me/${phoneDigits(p.whatsapp, p.country)}`} rel="noopener" className={`${btn} border border-border bg-surface`}>
              WhatsApp
            </a>
          )}
          {row.siteSlug ? (
            <a href={`/s/${row.siteSlug}`} className={`${btn} border border-border bg-surface`}>
              Visit website
            </a>
          ) : (
            p.websiteUrl && (
              <a href={p.websiteUrl} rel="noopener nofollow" className={`${btn} border border-border bg-surface`}>
                Visit website
              </a>
            )
          )}
          {row.siteSlug && (
            <a href={`/s/${row.siteSlug}/contact`} className={`${btn} border border-border bg-surface`}>
              Send enquiry
            </a>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} className={`${btn} border border-border bg-surface`}>
              Email
            </a>
          )}
        </div>

        {p.description && (
          <Card className="mt-6">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 whitespace-pre-line">{p.description}</p>
          </Card>
        )}
        <Card className="mt-4">
          <h2 className="text-lg font-semibold">Services</h2>
          <ul className="mt-2 space-y-2">
            {p.services.map((s) => (
              <li key={s.name}>
                <span className="font-semibold">{s.name}</span>
                {s.description && <span className="block text-muted">{s.description}</span>}
              </li>
            ))}
          </ul>
        </Card>
        {(p.serviceAreas.length > 0 || p.hours.length > 0) && (
          <Card className="mt-4 grid gap-4 sm:grid-cols-2">
            {p.serviceAreas.length > 0 && (
              <div>
                <h2 className="font-semibold">Areas served</h2>
                <p className="mt-1 text-muted">{p.serviceAreas.join(", ")}</p>
              </div>
            )}
            {p.hours.length > 0 && (
              <div>
                <h2 className="font-semibold">Opening hours</h2>
                <ul className="mt-1 text-muted">
                  {p.hours.map((h) => (
                    <li key={h.days}>
                      {h.days}: {h.hours}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
        <p className="mt-6 text-sm text-muted">
          These details are provided by the business. Listing here doesn&apos;t mean we vouch for the quality of its services.
        </p>
      </main>
    </>
  );
}
