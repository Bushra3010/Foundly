import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Card, EmptyState } from "@/components/ui";
import { getDb } from "@/db";
import { listPublishedProfiles, searchDirectory } from "@/server/directory";
import { displayCategory, displayCity, pluralCategory, slugify } from "@/lib/geo";
import { jsonLdScript } from "@/lib/profile";
import { breadcrumbLd, faqLd, graph, siteUrl } from "@/lib/site-schema";

const FAQ = [
  { q: "Is it free to list a business?", a: "Yes. Listing a business in the Foundly directory is free, and there are no paid placements or sponsored positions." },
  { q: "Who provides the business details?", a: "Each business supplies and confirms its own details, such as services, areas served and contact information, before the listing is published." },
  { q: "How are businesses ordered?", a: "By how well a listing matches your search, then by how complete it is. Foundly does not rank, rate or review the businesses listed." },
  { q: "How do I add my business?", a: "Create a free Foundly account, fill in your business details and publish your profile. It appears here and on its own page, with structured data that search engines and AI assistants can read." },
];

export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; city?: string }> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = [sp.q, sp.category, sp.city].some((v) => v?.trim());
  return {
    title: "Business directory",
    description: "Find local businesses by service and area, with details confirmed by the business owner.",
    alternates: { canonical: "/directory" },
    // Search result pages are thin duplicates; the city and category pages are the indexable versions.
    ...(filtered && { robots: { index: false, follow: true } }),
  };
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; city?: string }> }) {
  const sp = await searchParams;
  const clean = (v?: string) => v?.trim().slice(0, 80) || undefined;
  const filters = { q: clean(sp.q), category: clean(sp.category), city: clean(sp.city) };
  const db = await getDb();
  const [results, all] = await Promise.all([searchDirectory(db, filters), listPublishedProfiles(db)]);
  // City and category pages, linked here so people and AI crawlers can reach them.
  const facets = new Map<string, { href: string; label: string; count: number }>();
  for (const r of all) {
    const href = `/directory/${slugify(r.profile.city)}/${slugify(r.profile.category)}`;
    const f = facets.get(href) ?? { href, label: `${pluralCategory(displayCategory(r.profile.category))} in ${displayCity(r.profile.city)}`, count: 0 };
    facets.set(href, { ...f, count: f.count + 1 });
  }
  const browse = [...facets.values()].sort((a, b) => a.label.localeCompare(b.label));
  const filtered = Object.values(filters).some(Boolean);

  const ld = graph(
    {
      "@type": "CollectionPage",
      "@id": siteUrl("/directory"),
      url: siteUrl("/directory"),
      name: "Foundly business directory",
      description: "Local businesses by city and category, with details confirmed by each business.",
      isPartOf: { "@id": siteUrl("/#website") },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: all.length,
        itemListElement: all.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: siteUrl(`/b/${r.slug}`), name: r.profile.name })),
      },
    },
    faqLd(FAQ),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "Business directory", path: "/directory" }]),
  );

  return (
    <>
      {!filtered && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />}
      <PublicHeader />
      <main id="main" className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold">Business directory</h1>
        <p className="mt-1 text-muted">Details are supplied and confirmed by each business. Listing here is free and there are no paid placements.</p>
        <Card className="mt-6">
          <form role="search" className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            {[
              ["q", "Service or name", filters.q],
              ["category", "Category", filters.category],
              ["city", "City or area", filters.city],
            ].map(([name, label, value]) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-semibold">
                  {label}
                </label>
                <input id={name} name={name} defaultValue={value} className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3" />
              </div>
            ))}
            <button type="submit" className="min-h-11 rounded-lg bg-brand px-4 font-semibold text-brand-contrast">
              Search
            </button>
          </form>
        </Card>
        {browse.length > 0 && (
          <section className="mt-6" aria-labelledby="browse-title">
            <h2 id="browse-title" className="text-lg font-semibold">Browse by city and category</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {browse.map((f) => (
                <li key={f.href}>
                  <Link href={f.href} className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold hover:border-brand">
                    {f.label} ({f.count})
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <p className="mt-4 text-sm text-muted">Ordered by how well a listing matches your search, then by how complete it is.</p>
        {results.length === 0 ? (
          <div className="mt-4">
            <EmptyState title={filtered ? "No businesses match" : "No businesses listed yet"}>
              {filtered ? "Try a broader search." : "Be the first to add your business."}
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {results.map(({ slug, profile }) =>
              profile ? (
                <li key={slug}>
                  <Link href={`/b/${slug}`} className="block h-full rounded-xl border border-border bg-surface p-5 hover:border-brand">
                    <h2 className="text-lg font-semibold">{profile.name}</h2>
                    <p className="text-sm text-muted">
                      {profile.category} · {profile.city}
                    </p>
                    {profile.services.length > 0 && <p className="mt-2 line-clamp-2 text-sm">{profile.services.map((s) => s.name).join(" · ")}</p>}
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        )}
        {!filtered && (
          <section className="mt-10 border-t border-border pt-6" aria-labelledby="directory-faq">
            <h2 id="directory-faq" className="text-lg font-semibold">About the directory</h2>
            <p className="mt-2 text-sm text-muted">The Foundly directory lists local businesses with facts their owners have confirmed: what they do, where they work and how to reach them. Each listing has its own page with structured data, so search engines and AI assistants such as ChatGPT and Gemini can read the details accurately.</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {FAQ.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-1 text-sm text-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6">
              <Link href="/signup" className="inline-flex min-h-11 items-center rounded-lg bg-brand px-4 font-semibold text-brand-contrast">Add your business free</Link>
            </p>
          </section>
        )}
      </main>
    </>
  );
}
