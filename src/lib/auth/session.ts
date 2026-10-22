import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { contextForUser, SESSION_TTL_MS, userForSession, type SessionUser } from "@/server/auth";
import type { Ctx } from "@/server/context";

export const SESSION_COOKIE = "abgp_session";

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

/** Resolves the tenant context or redirects to sign in. */
export const requireCtx = cache(async (): Promise<Ctx & { user: SessionUser }> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const ctx = await contextForUser(await getDb(), user.id);
  if (!ctx) redirect("/login?error=no_workspace");
  return { ...ctx, user };
});
