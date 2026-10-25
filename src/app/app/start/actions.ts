"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { parseKeywordList } from "@/lib/keywords";
import { runAudit } from "@/server/audit/service";
import { saveWebsiteChoice } from "@/server/business";
import { getSite, publishSite } from "@/server/sites";
import { addKeywords } from "@/server/keywords";
import { addCompetitor, executeRun, listCompetitors, listQuestions } from "@/server/monitoring/service";
import { startMonitoring } from "@/server/setup";

/** Step 1: the keywords to track, plus up to three competitors to compare with. */
export async function saveKeywordsStepAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    const picked = form.getAll("suggested").map(String);
    const typed = parseKeywordList(String(form.get("custom") ?? ""));
    const keywords = parseKeywordList([...picked, ...typed].join("\n"));
    const existing = await listQuestions(db, ctx);
    if (keywords.length === 0 && existing.length === 0) return { ok: false, message: "Pick or type at least one keyword.", values };
    if (keywords.length) await addKeywords(db, ctx, keywords);

    const rivals = parseKeywordList(String(form.get("competitors") ?? "")).slice(0, 3);
    const known = new Set((await listCompetitors(db, ctx)).map((c) => c.name.toLowerCase()));
    for (const name of rivals) if (!known.has(name.toLowerCase())) await addCompetitor(db, ctx, name);
  } catch (err) {
    return toActionError(err, values);
  }
  revalidatePath("/app", "layout");
  redirect("/app/start?step=website");
}

/** Step 2, own website: its address is used to recognise the business in AI answers. */
export async function useOwnWebsiteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  const raw = String(form.get("url") ?? "").trim();
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!url.hostname.includes(".")) throw new Error("no dot");
  } catch {
    return { ok: false, message: "Enter your website address, like www.yourbusiness.in", values };
  }
  try {
    await saveWebsiteChoice(await getDb(), await requireCtx(), true, url.origin);
  } catch (err) {
    return toActionError(err, values);
  }
  revalidatePath("/app", "layout");
  redirect("/app/start?step=connections");
}

/** Step 2, Foundly website: publish the draft in one click so AI crawlers can read it. */
export async function publishFoundlySiteAction(): Promise<ActionState> {
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    const site = await getSite(db, ctx);
    if (!site) return { ok: false, message: "Create your website first." };
    if (!site.publishedVersionId) await publishSite(db, ctx, site.draftRevision);
  } catch (err) {
    return toActionError(err);
  }
  revalidatePath("/app", "layout");
  redirect("/app/start?step=connections");
}

/** Step 4: start the AI checks. The first one runs after the response. */
export async function startAction(): Promise<ActionState> {
  let note: string;
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    const r = await startMonitoring(db, ctx);
    note = r.note;
    if (r.runId) after(() => executeRun(db, r.runId!).catch((err) => console.error("[monitoring] first run failed", r.runId, err)));
    if (r.auditId) after(() => runAudit(db, r.auditId!).catch((err) => console.error("[audit]", r.auditId, err)));
  } catch (err) {
    return toActionError(err);
  }
  revalidatePath("/app", "layout");
  redirect(`/app?started=${note}`);
}
