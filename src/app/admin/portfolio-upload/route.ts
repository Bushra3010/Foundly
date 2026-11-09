import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/db";
import { isPlatformAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { AppError } from "@/server/context";
import { addMedia, MAX_MEDIA_BYTES } from "@/server/portfolio";

// Screenshot uploads go through a route handler rather than a server action, so images up to 2.5 MB
// fit without raising the app-wide server-action body limit.
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) return new NextResponse("Forbidden", { status: 403 });
  const user = await getCurrentUser();
  if (!user || !isPlatformAdmin(user.email)) return new NextResponse("Not found", { status: 404 });

  const form = await req.formData();
  const projectId = String(form.get("projectId") ?? "");
  const back = new URL(`/admin/portfolio/${encodeURIComponent(projectId)}`, req.nextUrl.origin);
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!/^[0-9a-f-]{36}$/i.test(projectId) || files.length === 0) {
    back.searchParams.set("upload", "Choose at least one image.");
    return NextResponse.redirect(back, 303);
  }

  const db = await getDb();
  const admin = { email: user.email, userId: user.id };
  let added = 0;
  for (const f of files.slice(0, 10)) {
    try {
      if (f.size > MAX_MEDIA_BYTES) throw new AppError("invalid", `${f.name} is over 2.5 MB.`);
      await addMedia(db, admin, projectId, { type: f.type, bytes: Buffer.from(await f.arrayBuffer()) }, String(form.get("caption") ?? ""));
      added++;
    } catch (err) {
      back.searchParams.set("upload", err instanceof AppError ? err.message : "One of the images could not be saved.");
      break;
    }
  }
  revalidatePath(`/admin/portfolio/${projectId}`);
  revalidatePath("/work", "layout");
  if (added) back.searchParams.set("added", String(added));
  return NextResponse.redirect(back, 303);
}
