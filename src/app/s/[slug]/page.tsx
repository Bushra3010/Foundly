import { siteMetadata } from "../load";
import { LiveSitePage } from "./site-page";

// Built on the first visit, then served from the edge cache (see server/public-cache.ts).
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return siteMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <LiveSitePage slug={(await params).slug} />;
}
