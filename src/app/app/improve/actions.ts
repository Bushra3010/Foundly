"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { applyAction, approveAction, editActionDraft, rejectAction, rollbackAction, runAudit, startAudit, verifyAction } from "@/server/audit/service";

function done(message: string): ActionState {
  revalidatePath("/app/improve");
  revalidatePath("/app/website");
  return { ok: true, message };
}

export async function startAuditAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const db = await getDb();
    const a = await startAudit(db, await requireCtx(), form.get("kind") === "hosted" ? "hosted" : "external");
    after(() => runAudit(db, a.id).catch((e) => console.error("[audit]", a.id, e)));
    return done("Audit started. This usually takes under a minute — refresh to see results.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function saveDraftAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await editActionDraft(await getDb(), await requireCtx(), String(form.get("actionId")), String(form.get("draft") ?? ""), Number(form.get("revision")));
    return done("Draft saved. Approve it when it's right.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function approveActionAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await approveAction(await getDb(), await requireCtx(), String(form.get("actionId")), Number(form.get("revision")));
    return done("Approved.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function rejectActionAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await rejectAction(await getDb(), await requireCtx(), String(form.get("actionId")));
    return done("Dismissed.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function applyActionAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const a = await applyAction(await getDb(), await requireCtx(), String(form.get("actionId")));
    if (a.status === "failed") return { ok: false, message: "Nothing could be applied from this draft. Edit it and try again." };
    return done(a.applyKind === "manual" ? "Marked as done. Select Check to confirm it's live." : "Added to your website draft. Publish your website, then select Check.");
  } catch (err) {
    return toActionError(err);
  }
}

export async function verifyActionAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const a = await verifyAction(await getDb(), await requireCtx(), String(form.get("actionId")));
    revalidatePath("/app/improve");
    return { ok: a.status === "verified", message: a.verificationNote ?? "" };
  } catch (err) {
    return toActionError(err);
  }
}

export async function rollbackActionAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await rollbackAction(await getDb(), await requireCtx(), String(form.get("actionId")));
    return done("Rolled back in your website draft. Publish to make the rollback live.");
  } catch (err) {
    return toActionError(err);
  }
}
