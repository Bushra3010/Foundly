"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { sendEmail } from "@/lib/auth/mailer";
import { clearSessionCookie, requireCtx } from "@/lib/auth/session";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n";
import { revokeAllSessions } from "@/server/auth";
import { audit } from "@/server/context";
import { changeRole, inviteMember, removeMember, revokeInvite, transferOwnership } from "@/server/team";

const roleSchema = z.enum(["owner", "editor", "viewer"]);

export async function signOutEverywhereAction() {
  const ctx = await requireCtx();
  const db = await getDb();
  await revokeAllSessions(db, ctx.userId);
  await audit(db, ctx, "sessions.revoked_all");
  await clearSessionCookie();
  redirect("/login");
}

export async function setLanguageAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  (await cookies()).set(LOCALE_COOKIE, parseLocale(String(form.get("locale"))), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
  return { ok: true, message: "Language updated." };
}

async function origin() {
  const h = await headers();
  return process.env.APP_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

export async function inviteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z.object({ email: z.string().trim().toLowerCase().pipe(z.email()), role: roleSchema }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "Enter a valid email and choose a role." };
  try {
    const ctx = await requireCtx();
    const token = await inviteMember(await getDb(), ctx, parsed.data.email, parsed.data.role);
    const link = `${await origin()}/invite?token=${encodeURIComponent(token)}`;
    const { delivered } = await sendEmail({
      to: parsed.data.email,
      subject: "You've been invited to manage a business",
      text: `${ctx.user.email} invited you to join their workspace as ${parsed.data.role}.\n\nAccept within 7 days:\n${link}`,
    });
    revalidatePath("/app/settings");
    return delivered
      ? { ok: true, message: `Invitation sent to ${parsed.data.email}.` }
      : { ok: true, message: "Development only — no email provider, so share this link:", link, linkLabel: "Invitation link" };
  } catch (err) {
    return toActionError(err);
  }
}

export async function revokeInviteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await revokeInvite(await getDb(), await requireCtx(), String(form.get("inviteId")));
    revalidatePath("/app/settings");
    return { ok: true, message: "Invitation cancelled." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function changeRoleAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const role = roleSchema.safeParse(form.get("role"));
  if (!role.success) return { ok: false, message: "Choose a role." };
  try {
    await changeRole(await getDb(), await requireCtx(), String(form.get("userId")), role.data);
    revalidatePath("/app/settings");
    return { ok: true, message: "Role updated." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function removeMemberAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const ctx = await requireCtx();
    const userId = String(form.get("userId"));
    await removeMember(await getDb(), ctx, userId);
    if (userId === ctx.userId) redirect("/app/workspaces");
    revalidatePath("/app/settings");
    return { ok: true, message: "Removed from the team." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function transferOwnershipAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (form.get("confirm") !== "on") return { ok: false, message: "Tick the box to confirm the transfer." };
  try {
    await transferOwnership(await getDb(), await requireCtx(), String(form.get("userId")));
    revalidatePath("/app", "layout");
    return { ok: true, message: "Ownership transferred. You're now an editor." };
  } catch (err) {
    return toActionError(err);
  }
}
