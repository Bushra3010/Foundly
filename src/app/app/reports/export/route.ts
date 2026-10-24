import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { leads, sites, siteVersions, websiteRequests } from "@/db/schema";
import { getCtxOrNull } from "@/lib/auth/session";
import { getProfile, requireBusiness } from "@/server/business";
import { audit, can } from "@/server/context";

/** Portable export of everything the workspace owns. Owner only. */
export async function GET() {
  const ctx = await getCtxOrNull();
  if (!ctx) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const db = await getDb();
  if (!ctx || !can(ctx, "owner")) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const business = await requireBusiness(db, ctx);
  // Websites Foundly used to host, and their enquiries, stay exportable.
  const [site] = await db.select().from(sites).where(eq(sites.workspaceId, ctx.workspaceId));
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
    websiteRequests: await db.select().from(websiteRequests).where(eq(websiteRequests.workspaceId, ctx.workspaceId)),
    leads: await db.select().from(leads).where(eq(leads.workspaceId, ctx.workspaceId)).orderBy(desc(leads.createdAt)),
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
