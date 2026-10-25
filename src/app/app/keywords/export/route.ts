import { getDb } from "@/db";
import { getCtxOrNull } from "@/lib/auth/session";
import { keywordsCsv, performanceFor } from "@/server/insights";

/** Keyword results as a CSV file. */
export async function GET(req: Request) {
  const ctx = await getCtxOrNull();
  if (!ctx) return new Response("Sign in first.", { status: 401 });
  const days = [7, 30, 90].includes(Number(new URL(req.url).searchParams.get("days"))) ? Number(new URL(req.url).searchParams.get("days")) : 30;
  const p = await performanceFor(await getDb(), ctx, days);
  return new Response(keywordsCsv(p), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="foundly-keywords-${days}d.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
