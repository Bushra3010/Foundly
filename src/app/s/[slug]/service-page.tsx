import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SiteRenderer } from "@/components/site/render";
import { businessGraph, entitySentence, factsFromSiteContent, serviceFaq, slugify } from "@/lib/geo";
import { jsonLdScript } from "@/lib/profile";
import type { Block } from "@/lib/site/content";
import { loadLiveSite, siteUrl } from "../load";

/**
 * One page per service. AI assistants answer "<service> in <city>" questions by
 * retrieving a page about exactly that, so each service gets its own
 * query-shaped page: title, quotable summary, answers, booking, structured data.
 */
const load = cache(async (slug: string, service: string) => {
  const site = await loadLiveSite(slug);
  const { services, faq: siteFaq, description } = factsFromSiteContent(site.content);
  const item = services.find((s) => slugify(s.name) === service);
  if (!item) notFound();
  return { site, item, services, siteFaq, description };
});

export async function serviceMetadata(slug: string, service: string): Promise<Metadata> {
  const { site, item } = await load(slug, service);
  const f = site.content.facts;
  const title = `${item.name} in ${f.city} | ${f.name}`.slice(0, 70);
  const description = `${f.name} offers ${item.name.toLowerCase()} in ${f.city}${f.serviceAreas.length ? `, serving ${f.serviceAreas.slice(0, 4).join(", ")}` : ""}.${item.description ? ` ${item.description}` : ""}`.slice(0, 170);
  const url = `${siteUrl(site.slug)}/services/${service}`;
  return { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { title, description, type: "website", url } };
}

export async function LiveServicePage({ slug, service, base }: { slug: string; service: string; base?: string }) {
  const { site, item, services, description } = await load(slug, service);
  const f = site.content.facts;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const homeUrl = siteUrl(site.slug);
  const pageUrl = `${homeUrl}/services/${service}`;
  const lower = item.name.toLowerCase();
  const areas = f.serviceAreas.length ? f.serviceAreas.slice(0, 5).join(", ") : f.city;
  const faq = serviceFaq(f, item);

  const blocks: Block[] = [
    {
      id: "service-hero",
      type: "hero",
      heading: `${item.name} in ${f.city}`,
      subheading: `${f.name} offers ${lower} in ${f.city}, serving ${areas}.${item.description ? ` ${item.description.trim().replace(/\.$/, "")}.` : ""}`.slice(0, 300),
      ctaLabel: f.bookingUrl ? "Book now" : "Get in touch",
    },
    {
      id: "service-about",
      type: "text",
      heading: `About our ${lower}`,
      body: [item.description?.trim(), entitySentence(f)].filter(Boolean).join("\n\n"),
    },
    { id: "service-faq", type: "faq", heading: `${item.name}: common questions`, items: faq },
    { id: "service-contact", type: "contact", heading: `Book ${lower}`, intro: `Get in touch with ${f.name} in ${f.city}.`, showForm: true },
  ];

  const ld = businessGraph(
    { ...f, services, description, url: homeUrl, profileUrl: site.profileSlug ? `${appUrl}/b/${site.profileSlug}` : undefined, sameAs: f.websiteUrl ? [f.websiteUrl] : [] },
    faq,
  );
  const graph = ld["@graph"] as Record<string, unknown>[];
  graph.push(
    {
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
      serviceType: item.name,
      provider: { "@id": `${homeUrl}#business` },
      areaServed: (f.serviceAreas.length ? f.serviceAreas : [f.city]).map((name) => ({ "@type": "Place", name })),
      url: pageUrl,
    },
    { "@type": "WebPage", "@id": `${pageUrl}#page`, url: pageUrl, name: `${item.name} in ${f.city}`, about: { "@id": `${pageUrl}#service` }, dateModified: site.publishedAt.toISOString(), isPartOf: { "@type": "WebSite", url: homeUrl, name: f.name } },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: f.name, item: homeUrl },
        { "@type": "ListItem", position: 2, name: "Services", item: `${homeUrl}/services` },
        { "@type": "ListItem", position: 3, name: item.name, item: pageUrl },
      ],
    },
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <SiteRenderer content={site.content} pageKey="services" basePath={base ?? `/s/${site.slug}`} siteSlug={site.slug} mode="live" publishedAt={site.publishedAt} page={{ title: item.name, blocks }} />
    </>
  );
}
