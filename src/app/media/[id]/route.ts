import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { readAsset } from "@/server/assets";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const asset = await readAsset(await getDb(), (await params).id).catch(() => null);
  if (!asset) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(asset.bytes), {
    headers: {
      "Content-Type": asset.row.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
