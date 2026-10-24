import { LiveServicePage, serviceMetadata } from "../../service-page";

type Props = { params: Promise<{ slug: string; service: string }> };

// Built on the first visit, then served from the edge cache (see server/public-cache.ts).
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props) {
  const { slug, service } = await params;
  return serviceMetadata(slug, service);
}

export default async function ServicePage({ params }: Props) {
  const { slug, service } = await params;
  return <LiveServicePage slug={slug} service={service} />;
}
