import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db";
import type { Lead } from "@/db/schema";
import { getCtxOrNull } from "@/lib/auth/session";
import { audit } from "@/server/context";
import { leadsToCsv, listLeads } from "@/server/leads";

const STATUSES = ["new", "contacted", "qualified", "closed"];

export async function GET(req: NextRequest) {
  const ctx = await getCtxOrNull();
  if (!ctx) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const db = await getDb();
  if (!ctx) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const q = req.nextUrl.searchParams.get("q")?.slice(0, 100) || undefined;
  const s = req.nextUrl.searchParams.get("status");
  const status = s && STATUSES.includes(s) ? (s as Lead["status"]) : undefined;
  const rows = await listLeads(db, ctx, { q, status });
  await audit(db, ctx, "leads.exported", undefined, { count: rows.length, q, status });

  return new NextResponse(leadsToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
