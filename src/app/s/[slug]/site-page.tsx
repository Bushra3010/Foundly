import { headers } from "next/headers";
import { SiteRenderer } from "@/components/site/render";
import { businessGraph, factsFromSiteContent } from "@/lib/geo";
import { jsonLdScript } from "@/lib/profile";
import { loadLiveSite, siteUrl } from "../load";

export async function LiveSitePage({ slug, page }: { slug: string; page?: string }) {
  const site = await loadLiveSite(slug, page);
  const base = (await headers()).get("x-site-base") ?? `/s/${site.slug}`;
  const facts = site.content.facts;
  const { services, faq, description } = factsFromSiteContent(site.content);
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  // Every page carries the business graph so AI crawlers landing anywhere get the
  // full picture; the FAQ is attached where it is shown (the home page).
  const ld = businessGraph(
    {
      ...facts,
      services,
      description,
      url: siteUrl(site.slug),
      profileUrl: site.profileSlug ? `${appUrl}/b/${site.profileSlug}` : undefined,
      sameAs: facts.websiteUrl ? [facts.websiteUrl] : [],
      dateModified: site.publishedAt,
    },
    site.key === "home" ? faq : [],
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />
      <SiteRenderer content={site.content} pageKey={site.key} basePath={base} siteSlug={site.slug} mode="live" publishedAt={site.publishedAt} />
    </>
  );
}
