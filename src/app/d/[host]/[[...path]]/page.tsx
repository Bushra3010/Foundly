import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { siteSlugForHost } from "@/server/domains";
import { siteMetadata } from "@/app/s/load";
import { LiveSitePage } from "@/app/s/[slug]/site-page";

type Props = { params: Promise<{ host: string; path?: string[] }> };

async function resolve(params: Props["params"]) {
  const { host, path = [] } = await params;
  if (path.length > 1) notFound();
  const slug = await siteSlugForHost(await getDb(), decodeURIComponent(host));
  if (!slug) notFound();
  return { slug, page: path[0] };
}

export async function generateMetadata({ params }: Props) {
  const { slug, page } = await resolve(params);
  return siteMetadata(slug, page);
}

export default async function CustomDomainPage({ params }: Props) {
  const { slug, page } = await resolve(params);
  return <LiveSitePage slug={slug} page={page} />;
}
