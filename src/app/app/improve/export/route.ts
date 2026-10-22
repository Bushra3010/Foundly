import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { getCtxOrNull } from "@/lib/auth/session";
import { exportableActions, actionsToText } from "@/server/audit/service";
import { requireBusiness } from "@/server/business";

export async function GET() {
  const ctx = await getCtxOrNull();
  if (!ctx) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const db = await getDb();
  const b = await requireBusiness(db, ctx);
  return new NextResponse(actionsToText(await exportableActions(db, ctx), b.name), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="website-improvements-${new Date().toISOString().slice(0, 10)}.txt"`,
      "Cache-Control": "private, no-store",
    },
  });
}
