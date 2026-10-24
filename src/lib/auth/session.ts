import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { SESSION_TTL_MS, sessionContext, userForSession, type SessionUser } from "@/server/auth";
import type { Ctx } from "@/server/context";

export const SESSION_COOKIE = "abgp_session";
export const WORKSPACE_COOKIE = "abgp_ws";

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Data Access Layer entry point: the verified user for this request, or null. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await readSessionToken();
  if (!token) return null;
  return userForSession(await getDb(), token);
});

/** The signed-in user and active workspace, read in one query. */
async function currentSession() {
  const token = await readSessionToken();
  if (!token) return null;
  const preferred = (await cookies()).get(WORKSPACE_COOKIE)?.value;
  return sessionContext(await getDb(), token, preferred);
}

/** Resolves the tenant context or redirects to sign in. */
export const requireCtx = cache(async (): Promise<Ctx & { user: SessionUser }> => {
  const session = await currentSession();
  if (!session) redirect("/login");
  if (!session.ctx) redirect("/login?error=no_workspace");
  return { ...session.ctx, user: session.user };
});

/** For route handlers: the tenant context or null (no redirects). */
export async function getCtxOrNull(): Promise<(Ctx & { user: SessionUser }) | null> {
  const session = await currentSession();
  return session?.ctx ? { ...session.ctx, user: session.user } : null;
}

export async function setWorkspaceCookie(workspaceId: string) {
  (await cookies()).set(WORKSPACE_COOKIE, workspaceId, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" });
}
