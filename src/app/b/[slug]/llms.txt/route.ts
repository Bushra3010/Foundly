import { getDb } from "@/db";
import { businessLlmsText } from "@/lib/geo";
import { getPublicProfile } from "@/server/directory";

export const dynamic = "force-dynamic";

/** Plain-text fact sheet for one business profile, for AI assistants. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const row = await getPublicProfile(await getDb(), (await params).slug);
  if (!row) return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const text = businessLlmsText(row.profile, {
    website: row.profile.websiteUrl,
    profile: `${base}/b/${row.slug}`,
  });
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
