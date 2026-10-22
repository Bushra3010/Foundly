import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site/render";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { pageKey } from "@/lib/site/content";
import { getSite } from "@/server/sites";

export const metadata = { title: "Private preview", robots: { index: false, follow: false } };

export default async function PreviewPage({ params }: { params: Promise<{ page?: string[] }> }) {
  const ctx = await requireCtx();
  const site = await getSite(await getDb(), ctx);
  if (!site) notFound();
  const [requested] = (await params).page ?? [];
  const key = requested ? pageKey.safeParse(requested) : { success: true as const, data: "home" as const };
  if (!key.success) notFound();
  return (
    <div className="-mx-4 -mt-6 sm:-mx-6">
      <p role="status" className="bg-warn-bg px-4 py-3 text-center text-sm font-semibold text-warn-fg">
        Private preview of your draft — not public. The enquiry form works after publishing.
      </p>
      <SiteRenderer content={site.draft} pageKey={key.data} basePath="/app/website/preview" siteSlug={site.slug} mode="preview" />
    </div>
  );
}
