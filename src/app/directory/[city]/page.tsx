import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PublicHeader } from "@/components/public-header";
import { getDb } from "@/db";
import { displayCategory, displayCity, pluralCategory, slugify } from "@/lib/geo";
import { jsonLdScript } from "@/lib/profile";
import { listPublishedProfiles } from "@/server/directory";
import { ListingCard } from "../listing";

// Built on the first visit, then served from the edge cache (see server/public-cache.ts).
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}
type Props = { params: Promise<{ city: string }> };

const load = cache(async (city: string) => {
  const all = await listPublishedProfiles(await getDb());
  const rows = all.filter((r) => slugify(r.profile.city) === city).sort((a, b) => a.profile.name.localeCompare(b.profile.name));
  if (rows.length === 0) return null;
  const categories = new Map<string, { name: string; count: number }>();
  for (const r of rows) {
    const key = slugify(r.profile.category);
    const c = categories.get(key) ?? { name: displayCategory(r.profile.category), count: 0 };
    categories.set(key, { ...c, count: c.count + 1 });
  }
  return { rows, cityName: displayCity(rows[0].profile.city), categories: [...categories.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name)) };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const data = await load(city);
  if (!data) return { title: "Not found", robots: { index: false } };
  return {
    title: `Local businesses in ${data.cityName}`,
    description: `Businesses in ${data.cityName} listed on Foundly: ${data.categories.map(([, c]) => pluralCategory(c.name).toLowerCase()).slice(0, 6).join(", ")}.`.slice(0, 170),
    alternates: { canonical: `/directory/${city}` },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const data = await load(city);
  if (!data) notFound();
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Local businesses in ${data.cityName}`,
    numberOfItems: data.rows.length,
    itemListElement: data.rows.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: `${base}/b/${r.slug}`, name: r.profile.name })),
  };
  return (
    <>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <main id="main" className="mx-auto max-w-4xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/directory" className="underline">Directory</Link> / {data.cityName}
        </nav>
        <h1 className="mt-3 text-3xl font-bold">Local businesses in {data.cityName}</h1>
        <p className="mt-2 text-muted">Listed by their owners on Foundly, sorted by name. No paid placements or rankings.</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {data.categories.map(([key, c]) => (
            <li key={key}>
              <Link href={`/directory/${city}/${key}`} className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 font-semibold hover:border-brand">
                {pluralCategory(c.name)} ({c.count})
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-6 grid gap-4">
          {data.rows.map((r) => <ListingCard key={r.slug} row={r} />)}
        </ul>
      </main>
    </>
  );
}
