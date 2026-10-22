"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import type { ActionState } from "@/lib/actions";
import { toActionError } from "@/lib/actions";
import { safeNextPath, sendSignInEmail } from "@/lib/auth/mailer";
import { clearSessionCookie, readSessionToken, setSessionCookie } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { fieldErrors, loginSchema } from "@/lib/validation";
import { consumeLoginToken, contextForUser, createLoginToken, revokeSession } from "@/server/auth";
import { getBusiness } from "@/server/business";

export type SignInState = ActionState & { devLink?: string };

export async function requestSignIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const values = { email: String(form.get("email") ?? "") };
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`login:ip:${ip}`, 10, 15 * 60_000) || !rateLimit(`login:email:${parsed.data.email}`, 5, 15 * 60_000)) {
    return { ok: false, message: "Too many sign-in requests. Wait 15 minutes and try again.", values };
  }

  try {
    const token = await createLoginToken(await getDb(), parsed.data.email);
    const origin = process.env.APP_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    const next = safeNextPath(String(form.get("next") ?? ""));
    const link = `${origin}/auth/verify?token=${encodeURIComponent(token)}${next ? `&next=${encodeURIComponent(next)}` : ""}`;
    const { delivered } = await sendSignInEmail({ to: parsed.data.email, link });
    return {
      ok: true,
      message: `We sent a sign-in link to ${parsed.data.email}. It works once and expires in 15 minutes.`,
      // Only shown when no mail provider is configured in development.
      devLink: !delivered && process.env.NODE_ENV !== "production" ? link : undefined,
      values,
    };
  } catch (err) {
    return toActionError(err, values);
  }
}

export async function completeSignIn(_prev: ActionState, form: FormData): Promise<ActionState> {
  const token = String(form.get("token") ?? "");
  let destination = "/app";
  try {
    const db = await getDb();
    const { userId, sessionToken } = await consumeLoginToken(db, token);
    await setSessionCookie(sessionToken);
    const ctx = await contextForUser(db, userId);
    const business = ctx ? await getBusiness(db, ctx) : null;
    if (!business?.onboardingCompletedAt) destination = "/onboarding";
    const next = safeNextPath(String(form.get("next") ?? ""));
    if (next) destination = next;
  } catch (err) {
    return toActionError(err);
  }
  redirect(destination);
}

export async function signOut() {
  const token = await readSessionToken();
  if (token) await revokeSession(await getDb(), token);
  await clearSessionCookie();
  redirect("/login");
}
