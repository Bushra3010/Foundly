"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { sendEmail } from "@/lib/auth/mailer";
import { clearSessionCookie, requireCtx } from "@/lib/auth/session";
import { SALE_PLANS } from "@/lib/plans";
import { revokeAllSessions, setPassword } from "@/server/auth";
import { audit } from "@/server/context";
import { changeRole, inviteMember, removeMember, revokeInvite, transferOwnership } from "@/server/team";
import { cancelSubscription, scheduleDowngrade, startCheckout } from "@/server/billing/service";
import { cancelDeletion, requestAccountDeletion } from "@/server/lifecycle";
import { setPrefs } from "@/server/notifications";

const roleSchema = z.enum(["owner", "editor", "viewer"]);

export async function signOutEverywhereAction() {
  const ctx = await requireCtx();
  const db = await getDb();
  await revokeAllSessions(db, ctx.userId);
  await audit(db, ctx, "sessions.revoked_all");
  await clearSessionCookie();
  redirect("/login");
}

export async function setPasswordAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const next = String(form.get("newPassword") ?? "");
  const confirm = String(form.get("confirmPassword") ?? "");
  const current = String(form.get("currentPassword") ?? "") || undefined;
  if (next.length < 8) return { ok: false, message: "Use at least 8 characters for your new password." };
  if (next !== confirm) return { ok: false, message: "The two new passwords don't match." };
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    await setPassword(db, ctx.userId, next, current);
    await audit(db, ctx, "account.password_set");
  } catch (err) {
    // Never echo password fields back to the page.
    return toActionError(err);
  }
  return { ok: true, message: "Password saved. Use it next time you log in." };
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
    if (userId === ctx.userId) redirect("/app");
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

export async function checkoutAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const plan = z.enum(SALE_PLANS).safeParse(form.get("plan"));
  if (!plan.success) return { ok: false, message: "Choose a plan." };
  let url: string;
  try {
    const ctx = await requireCtx();
    ({ url } = await startCheckout(await getDb(), ctx, plan.data, `${await origin()}/app/settings`));
  } catch (err) {
    return toActionError(err);
  }
  redirect(url);
}

export async function downgradeAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const plan = z.enum(["free", ...SALE_PLANS]).safeParse(form.get("plan"));
  if (!plan.success) return { ok: false, message: "Choose a plan." };
  try {
    await scheduleDowngrade(await getDb(), await requireCtx(), plan.data);
    revalidatePath("/app/settings");
    return { ok: true, message: "Scheduled. You keep your current plan until the end of the paid period." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function cancelPlanAction(): Promise<ActionState> {
  try {
    await cancelSubscription(await getDb(), await requireCtx());
    revalidatePath("/app/settings");
    return { ok: true, message: "Cancelled. Your plan stays active until the end of the paid period; your content is kept and exportable." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function savePrefsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await setPrefs(await getDb(), await requireCtx(), { weeklySummary: form.get("weeklySummary") === "on" });
    revalidatePath("/app/settings");
    return { ok: true, message: "Email preferences saved." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteAccountAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (form.get("confirm") !== "DELETE ACCOUNT") return { ok: false, message: "Type DELETE ACCOUNT to confirm." };
  try {
    await requestAccountDeletion(await getDb(), await requireCtx());
    await clearSessionCookie();
  } catch (err) {
    return toActionError(err);
  }
  redirect("/login?deleted=1");
}

export async function cancelDeletionAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await cancelDeletion(await getDb(), await requireCtx(), String(form.get("requestId")));
    revalidatePath("/app/settings");
    return { ok: true, message: "Deletion cancelled." };
  } catch (err) {
    return toActionError(err);
  }
}
