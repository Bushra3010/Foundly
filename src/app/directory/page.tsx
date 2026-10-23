import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Card, EmptyState } from "@/components/ui";
import { getDb } from "@/db";
import { listPublishedProfiles, searchDirectory } from "@/server/directory";
import { pluralCategory, slugify } from "@/lib/geo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Business directory",
  description: "Find local businesses by service and area, with details confirmed by the business owner.",
};

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
    const f = facets.get(href) ?? { href, label: `${pluralCategory(r.profile.category.trim())} in ${r.profile.city.trim()}`, count: 0 };
    facets.set(href, { ...f, count: f.count + 1 });
  }
  const browse = [...facets.values()].sort((a, b) => a.label.localeCompare(b.label));
  const filtered = Object.values(filters).some(Boolean);

  return (
    <>
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
      </main>
    </>
  );
}
