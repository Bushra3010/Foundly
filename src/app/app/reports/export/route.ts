import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { siteVersions } from "@/db/schema";
import { getCtxOrNull } from "@/lib/auth/session";
import { getProfile, requireBusiness } from "@/server/business";
import { audit, can } from "@/server/context";
import { listLeads } from "@/server/leads";
import { getSite } from "@/server/sites";

/** Portable export of everything the workspace owns. Owner only. */
export async function GET() {
  const ctx = await getCtxOrNull();
  if (!ctx) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const db = await getDb();
  if (!ctx || !can(ctx, "owner")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const business = await requireBusiness(db, ctx);
  const site = await getSite(db, ctx);
  const data = {
    exportedAt: new Date().toISOString(),
    format: "abgp-export/1",
    business,
    profile: await getProfile(db, ctx),
    site: site && {
      slug: site.slug,
      draft: site.draft,
      publishedVersionId: site.publishedVersionId,
      versions: await db.select().from(siteVersions).where(eq(siteVersions.siteId, site.id)),
    },
    leads: await listLeads(db, ctx),
  };
  await audit(db, ctx, "workspace.exported");
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="business-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
