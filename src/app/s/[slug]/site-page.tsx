import { SiteRenderer } from "@/components/site/render";
import { businessGraph, factsFromSiteContent } from "@/lib/geo";
import { jsonLdScript } from "@/lib/profile";
import { loadLiveSite, siteUrl } from "../load";

/** `base` is the link prefix: `/s/<slug>` on the app domain, "" on the site's own domain. */
export async function LiveSitePage({ slug, page, base }: { slug: string; page?: string; base?: string }) {
  const site = await loadLiveSite(slug, page);
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
      <SiteRenderer content={site.content} pageKey={site.key} basePath={base ?? `/s/${site.slug}`} siteSlug={site.slug} mode="live" publishedAt={site.publishedAt} />
    </>
  );
}
