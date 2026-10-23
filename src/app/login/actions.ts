"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import type { ActionState } from "@/lib/actions";
import { toActionError } from "@/lib/actions";
import { safeNextPath, sendPasswordResetEmail } from "@/lib/auth/mailer";
import { clearSessionCookie, readSessionToken, setSessionCookie } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { fieldErrors, loginSchema, type FieldErrors } from "@/lib/validation";
import { accountExists, consumeLoginToken, contextForUser, createLoginToken, resetPasswordWithToken, revokeSession, signInWithPassword, signUpWithPassword } from "@/server/auth";
import { getBusiness } from "@/server/business";

export type SignInState = ActionState & { devLink?: string };

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

/** New accounts go to setup; returning owners go home, or to a safe `next` path. */
async function destinationFor(userId: string, nextRaw: FormDataEntryValue | null) {
  const db = await getDb();
  const ctx = await contextForUser(db, userId);
  const business = ctx ? await getBusiness(db, ctx) : null;
  const next = safeNextPath(String(nextRaw ?? ""));
  if (next) return next;
  return business?.onboardingCompletedAt ? "/app" : "/onboarding";
}

/** Only the email and next path are echoed back. Passwords never leave the server. */
function safeValues(form: FormData) {
  return { email: String(form.get("email") ?? ""), next: String(form.get("next") ?? "") };
}

export async function signUpAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = safeValues(form);
  const parsed = loginSchema.safeParse({ email: values.email });
  const password = String(form.get("password") ?? "");
  const errors: FieldErrors = parsed.success ? {} : fieldErrors(parsed.error);
  if (password.length < 8) errors.password = ["Use at least 8 characters"];
  else if (password.length > 128) errors.password = ["Use 128 characters or fewer"];
  if (!parsed.success || errors.password) return { ok: false, fieldErrors: errors, values };

  if (!rateLimit(`signup:ip:${await clientIp()}`, 10, 60 * 60_000)) {
    return { ok: false, message: "Too many new accounts from this connection. Try again in an hour.", values };
  }
  let destination: string;
  try {
    const { userId, sessionToken } = await signUpWithPassword(await getDb(), parsed.data.email, password);
    await setSessionCookie(sessionToken);
    destination = await destinationFor(userId, form.get("next"));
  } catch (err) {
    return toActionError(err, values);
  }
  redirect(destination);
}

export async function logInAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = safeValues(form);
  const parsed = loginSchema.safeParse({ email: values.email });
  const password = String(form.get("password") ?? "");
  const errors: FieldErrors = parsed.success ? {} : fieldErrors(parsed.error);
  if (!password) errors.password = ["Enter your password"];
  if (!parsed.success || errors.password) return { ok: false, fieldErrors: errors, values };

  const ip = await clientIp();
  if (!rateLimit(`pwlogin:ip:${ip}`, 20, 15 * 60_000) || !rateLimit(`pwlogin:email:${parsed.data.email}`, 8, 15 * 60_000)) {
    return { ok: false, message: "Too many attempts. Wait 15 minutes, or get a sign-in link by email.", values };
  }
  let destination: string;
  try {
    const { userId, sessionToken } = await signInWithPassword(await getDb(), parsed.data.email, password);
    await setSessionCookie(sessionToken);
    destination = await destinationFor(userId, form.get("next"));
  } catch (err) {
    return toActionError(err, values);
  }
  redirect(destination);
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

/**
 * Step 1 of a reset: email a single-use link. The reply is the same whether or
 * not the account exists, so the form can't be used to discover accounts.
 */
export async function requestPasswordResetAction(_prev: SignInState, form: FormData): Promise<SignInState> {
  const values = { email: String(form.get("email") ?? "") };
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values };
  const ip = await clientIp();
  if (!rateLimit(`reset:ip:${ip}`, 10, 15 * 60_000) || !rateLimit(`reset:email:${parsed.data.email}`, 3, 15 * 60_000)) {
    return { ok: false, message: "Too many reset requests. Wait 15 minutes and try again.", values };
  }
  const sent = { ok: true, message: `If ${parsed.data.email} has a Foundly account, a reset link is on its way. It works once and expires in 15 minutes.`, values };
  try {
    const db = await getDb();
    if (!(await accountExists(db, parsed.data.email))) return sent;
    const token = await createLoginToken(db, parsed.data.email);
    const h = await headers();
    const origin = process.env.APP_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    const link = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
    const { delivered } = await sendPasswordResetEmail({ to: parsed.data.email, link });
    return { ...sent, devLink: !delivered && process.env.NODE_ENV !== "production" ? link : undefined };
  } catch (err) {
    console.error(err);
    return { ok: false, message: "We couldn't send the email right now. Try again in a few minutes.", values };
  }
}

/** Step 2: the link's page posts the token with the new password. */
export async function resetPasswordAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 8) return { ok: false, fieldErrors: { password: ["Use at least 8 characters"] } };
  if (password !== confirm) return { ok: false, fieldErrors: { confirm: ["The two passwords don't match"] } };
  let destination: string;
  try {
    const { userId, sessionToken } = await resetPasswordWithToken(await getDb(), token, password);
    await setSessionCookie(sessionToken);
    destination = await destinationFor(userId, null);
  } catch (err) {
    return toActionError(err);
  }
  redirect(destination);
}
