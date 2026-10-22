import { headers } from "next/headers";
import { SiteRenderer } from "@/components/site/render";
import { jsonLdFromFacts, jsonLdScript } from "@/lib/profile";
import { loadLiveSite, siteUrl } from "../load";

export async function LiveSitePage({ slug, page }: { slug: string; page?: string }) {
  const site = await loadLiveSite(slug, page);
  const base = (await headers()).get("x-site-base") ?? `/s/${site.slug}`;
  const about = site.content.pages.flatMap((p) => p.blocks).find((b) => b.type === "about");
  const ld = jsonLdFromFacts(site.content.facts, siteUrl(site.slug), about?.type === "about" ? about.body.slice(0, 300) : undefined);
  return (
    <>
      {site.key === "home" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(ld) }} />}
      <SiteRenderer content={site.content} pageKey={site.key} basePath={base} siteSlug={site.slug} mode="live" />
    </>
  );
}
