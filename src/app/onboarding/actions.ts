"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { resubmitBusiness } from "@/server/indexnow";
import { getDb } from "@/db";
import { formValues, toActionError, type ActionState } from "@/lib/actions";
import { requireCtx } from "@/lib/auth/session";
import { basicsSchema, fieldErrors, websiteChoiceSchema } from "@/lib/validation";
import { completeOnboarding, confirmReview, getBusiness, publishProfile, saveBasics, saveWebsiteChoice } from "@/server/business";
import { checkWebsiteSoon } from "@/server/audit/service";
import { enabledAdapters } from "@/server/monitoring/registry";
import { parseKeywordList } from "@/lib/keywords";
import { addKeywords } from "@/server/keywords";
import { addCompetitor, createRun, executeRun, listCompetitors, listQuestions, manualRunKey } from "@/server/monitoring/service";
import { researchKeywords, suggestCompetitors } from "@/server/research";
import { IDEAS_COOKIE, RIVALS_COOKIE, setupCookie } from "./suggestions";

/**
 * Setup in four steps, like an AI-visibility tool's quick start:
 * the business (and its website), the prompts to track, the competitors to
 * compare with, then connect profiles and start. Every step saves as it goes,
 * so owners can leave and come back.
 */

/** Step 1: the business, and its website if it has one. Then AI suggests prompts. */
export async function saveBusinessStepAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  try {
    const ctx = await requireCtx();
    const basics = basicsSchema.safeParse({ name: values.name ?? "", category: values.category ?? "", city: values.city ?? "", phone: "", whatsapp: "", email: ctx.user.email });
    const errors = basics.success ? {} : fieldErrors(basics.error);
    const url = (values.websiteUrl ?? "").trim();
    const site = url ? websiteChoiceSchema.safeParse({ hasWebsite: "yes", websiteUrl: url }) : null;
    if (site && !site.success) Object.assign(errors, fieldErrors(site.error));
    if (!basics.success || (site && !site.success)) return { ok: false, fieldErrors: errors, values };

    const db = await getDb();
    const existing = await getBusiness(db, ctx);
    // Keep contact details the owner already gave; only fill the email for a new business.
    await saveBasics(db, ctx, existing ? { ...basics.data, phone: existing.phone, whatsapp: existing.whatsapp, email: existing.email } : basics.data);
    if (site?.success && "websiteUrl" in site.data) {
      await saveWebsiteChoice(db, ctx, true, site.data.websiteUrl ?? null);
      after(() => checkWebsiteSoon(db, ctx));
    } else if (!existing?.websiteUrl) {
      await saveWebsiteChoice(db, ctx, false, null);
    }
    const ideas = await researchKeywords(db, ctx).catch(() => null);
    if (ideas) (await cookies()).set(IDEAS_COOKIE, JSON.stringify({ items: ideas.ideas, source: ideas.source }), setupCookie);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=prompts");
}

/** Step 2: the prompts (keywords) to track. Then AI suggests competitors. */
export async function savePromptsStepAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    const keywords = parseKeywordList([...form.getAll("keyword").map(String), String(form.get("custom") ?? "")].join("\n"));
    const tracked = await listQuestions(db, ctx);
    if (keywords.length === 0 && tracked.length === 0) return { ok: false, fieldErrors: { custom: ["Pick or type at least one prompt"] }, values };
    if (keywords.length) await addKeywords(db, ctx, keywords);
    const rivals = await suggestCompetitors(db, ctx).catch(() => []);
    (await cookies()).set(RIVALS_COOKIE, JSON.stringify({ items: rivals, source: "ai" }), setupCookie);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=competitors");
}

/** Step 3: competitors to compare with, picked from AI's suggestions or typed. */
export async function saveCompetitorsStepAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form);
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    const names = parseKeywordList([...form.getAll("rival").map(String), String(form.get("custom") ?? "")].join("\n")).slice(0, 10);
    const known = new Set((await listCompetitors(db, ctx)).map((c) => c.name.toLowerCase()));
    for (const name of names) if (!known.has(name.toLowerCase())) await addCompetitor(db, ctx, name);
  } catch (err) {
    return toActionError(err, values);
  }
  redirect("/onboarding?step=social");
}

/**
 * Step 4: one button. Confirms the details, lists the business if the owner
 * agreed, and runs the first AI check when sources are switched on.
 */
export async function startTrackingAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let started = "1";
  try {
    const ctx = await requireCtx();
    const db = await getDb();
    if ((await listQuestions(db, ctx)).length === 0) return { ok: false, message: "Add at least one keyword first." };
    await confirmReview(db, ctx, false);
    if (form.get("publishProfile") === "on") {
      await publishProfile(db, ctx);
      after(() => resubmitBusiness(db, ctx));
    }
    await completeOnboarding(db, ctx);
    if (enabledAdapters().length > 0) {
      try {
        const run = await createRun(db, ctx, { trigger: "manual", idempotencyKey: manualRunKey(String(form.get("requestId") ?? randomUUID())) });
        after(() => executeRun(db, run.id).catch((err) => console.error("[monitoring] first run failed", run.id, err)));
      } catch (err) {
        // Tracking is on either way; the dashboard explains why the first check didn't start.
        console.error("[setup] first check not started", err);
        started = "later";
      }
    } else {
      started = "later";
    }
  } catch (err) {
    return toActionError(err);
  }
  redirect(`/app?started=${started}`);
}
