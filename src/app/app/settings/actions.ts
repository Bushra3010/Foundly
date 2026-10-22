"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { clearSessionCookie, requireCtx } from "@/lib/auth/session";
import { revokeAllSessions } from "@/server/auth";
import { audit } from "@/server/context";

export async function signOutEverywhereAction() {
  const ctx = await requireCtx();
  const db = await getDb();
  await revokeAllSessions(db, ctx.userId);
  await audit(db, ctx, "sessions.revoked_all");
  await clearSessionCookie();
  redirect("/login");
}
