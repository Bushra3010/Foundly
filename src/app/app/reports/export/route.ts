import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { websiteRequests } from "@/db/schema";
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
  const data = {
    exportedAt: new Date().toISOString(),
    format: "abgp-export/1",
    business,
    profile: await getProfile(db, ctx),
    websiteRequests: await db.select().from(websiteRequests).where(eq(websiteRequests.workspaceId, ctx.workspaceId)),
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
