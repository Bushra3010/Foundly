import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { getCtxOrNull } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { MAX_UPLOAD_BYTES, saveUpload } from "@/server/assets";
import { AppError } from "@/server/context";

export async function POST(req: Request) {
  const ctx = await getCtxOrNull();
  if (!ctx) return NextResponse.json({ error: "Sign in again to upload." }, { status: 401 });
  const db = await getDb();
  if (!ctx) return NextResponse.json({ error: "No workspace." }, { status: 403 });
  if (!rateLimit(`upload:${ctx.userId}`, 30, 60 * 60_000)) return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 64_000) {
    return NextResponse.json({ error: "Photos must be 5 MB or smaller." }, { status: 413 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  try {
    const row = await saveUpload(db, ctx, { bytes: Buffer.from(await file.arrayBuffer()), name: file.name }, form.get("rights") === "on");
    return NextResponse.json({ url: `/media/${row.id}` });
  } catch (err) {
    if (err instanceof AppError) return NextResponse.json({ error: err.message }, { status: err.code === "forbidden" ? 403 : 400 });
    throw err;
  }
}
