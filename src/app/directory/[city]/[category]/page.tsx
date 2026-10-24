import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PublicHeader } from "@/components/public-header";
import { getDb } from "@/db";
import { pluralCategory, slugify, withArticle } from "@/lib/geo";
import { jsonLdScript } from "@/lib/profile";
import { listPublishedProfiles } from "@/server/directory";
import { ListingCard, listToText } from "../../listing";

// Built on the first visit, then served from the edge cache (see server/public-cache.ts).
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}
type Props = { params: Promise<{ city: string; category: string }> };

const load = cache(async (city: string, category: string) => {
  const all = await listPublishedProfiles(await getDb());
  const rows = all
    .filter((r) => slugify(r.profile.city) === city && slugify(r.profile.category) === category)
    .sort((a, b) => a.profile.name.localeCompare(b.profile.name));
  if (rows.length === 0) return null;
  return { rows, cityName: rows[0].profile.city.trim(), categoryName: rows[0].profile.category.trim() };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category } = await params;
  const data = await load(city, category);
  if (!data) return { title: "Not found", robots: { index: false } };
  const plural = pluralCategory(data.categoryName);
  return {
    title: `${plural} in ${data.cityName}`,
    description: `${data.rows.length} ${plural.toLowerCase()} in ${data.cityName} listed on Foundly, with services, areas served and contact details confirmed by each business.`.slice(0, 170),
    alternates: { canonical: `/directory/${city}/${category}` },
  };
}

export default async function CityCategoryPage({ params }: Props) {
  const { city, category } = await params;
  const data = await load(city, category);
  if (!data) notFound();
  const { rows, cityName, categoryName } = data;
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const plural = pluralCategory(categoryName);
  const names = rows.map((r) => r.profile.name);
  const services = Array.from(new Set(rows.flatMap((r) => r.profile.services.map((s) => s.name.trim())))).slice(0, 10);
  const areas = Array.from(new Set(rows.flatMap((r) => r.profile.serviceAreas.map((a) => a.trim())))).slice(0, 12);

  // Answers use only listed facts: who is listed, what they offer, where they work.
  const faq = [
    {
      question: `Which ${plural.toLowerCase()} are in ${cityName}?`,
      answer: `${listToText(names)} ${rows.length === 1 ? `is ${withArticle(categoryName.toLowerCase())}` : `are ${plural.toLowerCase()}`} in ${cityName} listed on Foundly.`,
    },
    ...(services.length
      ? [{ question: `What services do ${plural.toLowerCase()} in ${cityName} offer?`, answer: `Listed services include ${listToText(services.map((s) => s.toLowerCase()))}.` }]
      : []),
    ...(areas.length
      ? [{ question: `Which areas of ${cityName} do they serve?`, answer: `Between them they serve ${listToText(areas)}.` }]
      : []),
  ];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `${plural} in ${cityName}`,
        numberOfItems: rows.length,
        itemListElement: rows.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${base}/b/${r.slug}`,
          name: r.profile.name,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Directory", item: `${base}/directory` },
          { "@type": "ListItem", position: 2, name: cityName, item: `${base}/directory/${city}` },
          { "@type": "ListItem", position: 3, name: plural, item: `${base}/directory/${city}/${category}` },
        ],
      },
    ],
  };

  return (
    <>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <main id="main" className="mx-auto max-w-4xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/directory" className="underline">Directory</Link> / <Link href={`/directory/${city}`} className="underline">{cityName}</Link> / {plural}
        </nav>
        <h1 className="mt-3 text-3xl font-bold">{plural} in {cityName}</h1>
        <p className="mt-2 text-muted">
          {rows.length} {rows.length === 1 ? categoryName.toLowerCase() : plural.toLowerCase()} listed, sorted by name. Details are supplied and confirmed by each business. There are no paid placements or rankings.
        </p>
        <ul className="mt-6 grid gap-4">
          {rows.map((r) => <ListingCard key={r.slug} row={r} />)}
        </ul>
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Questions and answers</h2>
          <dl className="mt-4 grid gap-4">
            {faq.map((q) => (
              <div key={q.question} className="rounded-2xl border border-border bg-surface p-5">
                <dt className="font-semibold">{q.question}</dt>
                <dd className="mt-2 text-muted">{q.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
