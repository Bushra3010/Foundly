import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db";
import { isPlatformAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { getMedia } from "@/server/portfolio";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  let row = await getMedia(db, id, false);
  if (!row) {
    // Screenshots of unpublished projects are visible to admins previewing them.
    const user = await getCurrentUser();
    if (user && isPlatformAdmin(user.email)) row = await getMedia(db, id, true);
  }
  if (!row) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(row.bytes), {
    headers: {
      "Content-Type": row.contentType,
      "Cache-Control": row.published ? "public, max-age=600, s-maxage=3600" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
