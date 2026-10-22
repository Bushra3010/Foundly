"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { splitList } from "@/lib/validation";
import {
  addCompetitor,
  approveQuestions,
  archiveQuestion,
  correctMatch,
  createRun,
  executeRun,
  manualRunKey,
  removeCompetitor,
  updateBrandTerms,
} from "@/server/monitoring/service";

const groups = z.enum(["service", "purchase", "comparison", "location", "branded"]);

export async function approveQuestionsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  // Suggestions arrive as "group|location|text"; custom questions as plain text lines.
  const picked = form.getAll("suggestion").map((v) => {
    const [group, location, ...rest] = String(v).split("|");
    return { group: groups.catch("service").parse(group), location: location || null, text: rest.join("|") };
  });
  const custom = String(form.get("custom") ?? "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text) => ({ group: groups.catch("service").parse(form.get("customGroup")), location: String(form.get("customLocation") ?? "") || null, text }));
  if (picked.length + custom.length === 0) return { ok: false, message: "Pick or write at least one question." };
  try {
    const n = await approveQuestions(await getDb(), await requireCtx(), [...picked, ...custom]);
    revalidatePath("/app/visibility");
    return { ok: true, message: n ? `${n} question${n === 1 ? "" : "s"} added to tracking.` : "Those questions are already tracked." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function archiveQuestionAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await archiveQuestion(await getDb(), await requireCtx(), String(form.get("questionId")));
    revalidatePath("/app/visibility");
    return { ok: true, message: "Stopped tracking. Past results are kept." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function saveBrandAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await updateBrandTerms(await getDb(), await requireCtx(), splitList(form.get("aliases")), splitList(form.get("domains")));
    revalidatePath("/app/visibility");
    return { ok: true, message: "Saved. New checks use these names and domains." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function addCompetitorAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await addCompetitor(await getDb(), await requireCtx(), String(form.get("name") ?? ""), String(form.get("domain") ?? ""));
    revalidatePath("/app/visibility");
    return { ok: true, message: "Competitor added." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function removeCompetitorAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await removeCompetitor(await getDb(), await requireCtx(), String(form.get("competitorId")));
    revalidatePath("/app/visibility");
    return { ok: true, message: "Removed." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function runCheckAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    const run = await createRun(db, ctx, {
      trigger: "manual",
      samples: Number(form.get("samples") ?? 1),
      idempotencyKey: manualRunKey(String(form.get("requestId") ?? "")),
    });
    // Runs after the response; if the process stops, the cron resumes the run.
    after(() => executeRun(db, run.id).catch((err) => console.error("[monitoring] run failed", run.id, err)));
    revalidatePath("/app/visibility");
    return { ok: true, message: "Check started. You can leave this page — results appear when it finishes." };
  } catch (err) {
    return toActionError(err);
  }
}

export async function correctMatchAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const raw = String(form.get("correction"));
  const correction = raw === "confirmed" || raw === "rejected" ? raw : null;
  try {
    await correctMatch(await getDb(), await requireCtx(), String(form.get("matchId")), correction, String(form.get("reason") ?? ""));
    revalidatePath("/app/visibility", "layout");
    return { ok: true, message: correction ? "Correction saved. The original answer is unchanged." : "Correction removed." };
  } catch (err) {
    return toActionError(err);
  }
}
