"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { parseKeywordList } from "@/lib/keywords";
import { addKeywords, editKeyword } from "@/server/keywords";
import { addCompetitor, archiveQuestion, createRun, executeRun, manualRunKey, removeCompetitor } from "@/server/monitoring/service";

function refresh() {
  revalidatePath("/app", "layout");
}

export async function addKeywordsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  try {
    const keywords = parseKeywordList(String(form.get("keywords") ?? ""));
    if (keywords.length === 0) return { ok: false, message: "Type a keyword, like “dentist in Indore”.", values };
    const n = await addKeywords(await getDb(), await requireCtx(), keywords);
    refresh();
    return { ok: true, message: n === 0 ? "Those keywords are already tracked." : `Tracking ${n} new keyword${n === 1 ? "" : "s"}. They're included in the next check.` };
  } catch (err) {
    return toActionError(err, values);
  }
}

export async function editKeywordAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await editKeyword(await getDb(), await requireCtx(), String(form.get("id")), String(form.get("keyword") ?? ""));
    refresh();
    return { ok: true, message: "Keyword updated." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function removeKeywordAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await archiveQuestion(await getDb(), await requireCtx(), String(form.get("id")));
    refresh();
    return { ok: true, message: "Stopped tracking. Past results are kept." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function addRivalAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  try {
    await addCompetitor(await getDb(), await requireCtx(), String(form.get("name") ?? ""), String(form.get("domain") ?? "") || undefined);
    refresh();
    return { ok: true, message: "Competitor added. You'll see them compared from the next check." };
  } catch (err) {
    return toActionError(err, values);
  }
}

export async function removeRivalAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await removeCompetitor(await getDb(), await requireCtx(), String(form.get("id")));
    refresh();
    return { ok: true };
  } catch (err) {
    return toActionError(err);
  }
}

/** Runs a check now, on top of the schedule. Uses credits. */
export async function checkNowAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: manualRunKey(String(form.get("requestId") ?? crypto.randomUUID())) });
    after(() => executeRun(db, run.id).catch((err) => console.error("[monitoring] run failed", run.id, err)));
    refresh();
    return { ok: true, message: "Checking now. Results appear here in a few minutes." };
  } catch (err) {
    return toActionError(err);
  }
}
