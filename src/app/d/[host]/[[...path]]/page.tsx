import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { siteSlugForHost } from "@/server/domains";
import { siteMetadata } from "@/app/s/load";
import { LiveSitePage } from "@/app/s/[slug]/site-page";
import { LiveServicePage, serviceMetadata } from "@/app/s/[slug]/service-page";

type Props = { params: Promise<{ host: string; path?: string[] }> };

// Built on the first visit, then served from the edge cache (see server/public-cache.ts).
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

async function resolve(params: Props["params"]) {
  const { host, path = [] } = await params;
  // "/", "/<page>" or "/services/<service>".
  const service = path.length === 2 && path[0] === "services" ? path[1] : undefined;
  if (path.length > 1 && !service) notFound();
  const slug = await siteSlugForHost(await getDb(), decodeURIComponent(host));
  if (!slug) notFound();
  return { slug, page: service ? undefined : path[0], service };
}

export async function generateMetadata({ params }: Props) {
  const { slug, page, service } = await resolve(params);
  return service ? serviceMetadata(slug, service) : siteMetadata(slug, page);
}

export default async function CustomDomainPage({ params }: Props) {
  const { slug, page, service } = await resolve(params);
  return service ? <LiveServicePage slug={slug} service={service} base="" /> : <LiveSitePage slug={slug} page={page} base="" />;
}
