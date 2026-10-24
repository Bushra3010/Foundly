"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getDb } from "@/db";
import { toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { checkWebsiteSoon } from "@/server/audit/service";
import { checkCompetitorSoon, setCompetitorWebsite } from "@/server/compare";
import { addCompetitor } from "@/server/monitoring/service";

export async function addRivalAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let id: string | undefined;
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    const name = String(form.get("name") ?? "").trim();
    if (name.length < 2) return { ok: false, message: "Enter the competitor's business name." };
    const added = await addCompetitor(db, ctx, name, String(form.get("domain") ?? ""));
    id = added.id;
    // Check their website straight away, so the comparison has data.
    if (added.domains[0]) after(() => checkCompetitorSoon(db, ctx, added.id));
  } catch (err) {
    return toActionError(err);
  }
  revalidatePath("/app", "layout");
  redirect(id ? `/app/compare?c=${id}` : "/app/compare");
}

export async function rivalWebsiteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const id = String(form.get("competitorId") ?? "");
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    await setCompetitorWebsite(db, ctx, id, String(form.get("domain") ?? ""));
    after(() => checkCompetitorSoon(db, ctx, id));
  } catch (err) {
    return toActionError(err);
  }
  revalidatePath("/app/compare");
  return { ok: true, message: "Saved. We're checking their website now." };
}

export async function checkRivalAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    after(() => checkCompetitorSoon(db, ctx, String(form.get("competitorId") ?? "")));
  } catch (err) {
    return toActionError(err);
  }
  revalidatePath("/app/compare");
  return { ok: true, message: "Checking their website. This usually takes under a minute." };
}

export async function checkMineAction(): Promise<ActionState> {
  try {
    const [db, ctx] = await Promise.all([getDb(), requireCtx()]);
    after(() => checkWebsiteSoon(db, ctx));
  } catch (err) {
    return toActionError(err);
  }
  revalidatePath("/app/compare");
  return { ok: true, message: "Checking your website. This usually takes under a minute." };
}
