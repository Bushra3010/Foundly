import { getDb } from "@/db";
import { businessLlmsText, factsFromSiteContent } from "@/lib/geo";
import { getPublishedSite } from "@/server/sites";
import { siteUrl } from "../../load";

export const dynamic = "force-dynamic";

/** Plain-text fact sheet for a published website, including its questions and answers. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const result = await getPublishedSite(await getDb(), (await params).slug);
  if (result.kind !== "site") return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const f = result.content.facts;
  const { services, faq, description } = factsFromSiteContent(result.content);
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const text = businessLlmsText(
    { ...f, services, description, updatedAt: result.publishedAt.toISOString() },
    { website: siteUrl(result.slug), profile: result.profileSlug ? `${base}/b/${result.profileSlug}` : undefined },
    faq,
  );
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
