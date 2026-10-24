import { siteMetadata } from "../../load";
import { LiveSitePage } from "../site-page";

// Built on the first visit, then served from the edge cache (see server/public-cache.ts).
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string; page: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, page } = await params;
  return siteMetadata(slug, page);
}

export default async function Page({ params }: Props) {
  const { slug, page } = await params;
  return <LiveSitePage slug={slug} page={page} />;
}
