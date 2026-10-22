"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { adjustCredits, grantSupportAccess, requireAdmin, resolveClaim, setProfileModeration } from "@/server/admin";
import { executeRun } from "@/server/monitoring/service";

async function admin() {
  return requireAdmin(await getCurrentUser());
}

export async function moderateAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const status = String(form.get("status"));
  if (status !== "suspended" && status !== "published" && status !== "unpublished") return { ok: false, message: "Bad status" };
  try {
    await setProfileModeration(await getDb(), await admin(), String(form.get("businessId")), status, String(form.get("reason") ?? ""));
    revalidatePath("/admin/businesses");
    return { ok: true, message: `Profile ${status}.` };
  } catch (err) {
    return toActionError(err);
  }
}

export async function resolveClaimAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const decision = form.get("decision") === "verified" ? "verified" : "rejected";
  try {
    await resolveClaim(await getDb(), await admin(), String(form.get("claimId")), decision, String(form.get("reason") ?? ""));
    revalidatePath("/admin/claims");
    return { ok: true, message: `Claim ${decision}. The owner should republish their profile.` };
  } catch (err) {
    return toActionError(err);
  }
}

export async function grantAccessAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const workspaceId = String(form.get("workspaceId"));
    await grantSupportAccess(await getDb(), await admin(), workspaceId, String(form.get("reason") ?? ""), Number(form.get("hours") ?? 2));
    revalidatePath(`/admin/support/${workspaceId}`);
    return { ok: true, message: "Access granted. It's recorded in the audit log and expires automatically." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function adjustCreditsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const workspaceId = String(form.get("workspaceId"));
    await adjustCredits(await getDb(), await admin(), workspaceId, Number(form.get("amount")), String(form.get("reason") ?? ""));
    revalidatePath(`/admin/support/${workspaceId}`);
    return { ok: true, message: "Credits adjusted." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function resumeRunAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await admin();
    const db = await getDb();
    const id = String(form.get("runId"));
    after(() => executeRun(db, id).catch((e) => console.error("[admin] resume failed", id, e)));
    return { ok: true, message: "Resuming. Captured answers are skipped, so nothing is charged twice." };
  } catch (err) {
    return toActionError(err);
  }
}
